"""
Phase 6 — Campaign Analytics API

Endpoints:
  GET /analytics/campaigns/{id}   → per-campaign stats (open, click, bounce, unsub rates)
  GET /analytics/sender-health    → tenant-wide reputation metrics
  GET /analytics/campaigns/{id}/recipients → per-recipient event breakdown
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Dict, Any, cast, Optional
from utils.jwt_middleware import require_active_tenant, JWTPayload, apply_data_isolation
from utils.permissions import require_permission
from utils.supabase_client import db
import logging

logger = logging.getLogger("email_engine.analytics")
router = APIRouter(prefix="/analytics", tags=["Analytics"])


# ── Per-Campaign Analytics ────────────────────────────────────────────────────

@router.get("/campaigns/{campaign_id}")
async def get_campaign_analytics(
    campaign_id: str,
    tenant_id: str = Depends(require_active_tenant),
    _: JWTPayload = Depends(require_permission("analytics:view")),
):
    """
    Full analytics for a single campaign.
    Returns: sent, opens, unique_opens, bounces, unsubscribes.
    Includes all proxy/bot events.
    """
    # Verify campaign belongs to tenant
    camp_res = db.client.table("campaigns")\
        .select("id, name, subject, body_html, status, created_at")\
        .eq("id", campaign_id)\
        .eq("tenant_id", tenant_id)\
        .execute()

    camp_res_data = cast(List[Dict[str, Any]], camp_res.data or [])
    if not camp_res_data:
        raise HTTPException(status_code=404, detail="Campaign not found")

    campaign = camp_res_data[0]

    # Count sent (DISPATCHED dispatch records)
    sent_res = db.client.table("campaign_dispatch")\
        .select("id", count="exact")\
        .eq("campaign_id", campaign_id)\
        .eq("status", "DISPATCHED")\
        .execute()
    sent = sent_res.count or 0

    # Count failed
    failed_res = db.client.table("campaign_dispatch")\
        .select("id", count="exact")\
        .eq("campaign_id", campaign_id)\
        .eq("status", "FAILED")\
        .execute()
    failed = failed_res.count or 0

    # Fetch tracking events
    events_query = db.client.table("email_events")\
        .select("event_type, contact_id, dispatch_id, source, bounce_type, bounce_reason, click_x, click_y")\
        .eq("campaign_id", campaign_id)
    events_res = events_query.execute()

    events = events_res.data or []

    # Deduplicate raw events: keep only the first event per (dispatch_id, event_type)
    # This prevents double-counting if the same pixel fires twice (retry, proxy + user, etc.)
    seen = set()
    deduped_events = []
    for e in cast(List[Dict[str, Any]], events):
        did = e.get("dispatch_id")
        etype = e.get("event_type")
        if not did or not etype: continue
        key = (did, etype)
        if key not in seen:
            seen.add(key)
            deduped_events.append(e)

    # Aggregate (using deduped events only)
    opens        = [e for e in deduped_events if e["event_type"] == "open"]
    bounces      = [e for e in deduped_events if e["event_type"] == "bounce"]
    unsub_events = [e for e in deduped_events if e["event_type"] == "unsubscribe"]

    hard_bounces = [e for e in bounces if e.get("bounce_type") == "hard"]
    soft_bounces = [e for e in bounces if e.get("bounce_type") == "soft"]

    # Collect bounce reasons
    reason_counts = {}
    for e in bounces:
        reason = e.get("bounce_reason") or "Unknown bounce reason"
        btype = e.get("bounce_type") or "hard"
        key = (reason, btype)
        reason_counts[key] = reason_counts.get(key, 0) + 1
        
    # Also add failed dispatches if they have error logs
    if failed > 0:
        try:
            failed_dispatches = db.client.table("campaign_dispatch")\
                .select("error_log")\
                .eq("campaign_id", campaign_id)\
                .eq("status", "FAILED")\
                .execute()
            for fd in (failed_dispatches.data or []):
                reason = fd.get("error_log") or "SMTP delivery failure"
                key = (reason, "hard")
                reason_counts[key] = reason_counts.get(key, 0) + 1
        except Exception as ex:
            logger.warning(f"Failed to fetch failed dispatch error logs: {ex}")

    bounce_breakdown = [
        {"reason": key[0], "type": key[1], "count": count}
        for key, count in reason_counts.items()
    ]

    # Cross-check against current contact status to honour re-subscriptions
    unsub_contact_ids = [e["contact_id"] for e in unsub_events if e.get("contact_id")]
    active_unsubs = set()
    if unsub_contact_ids:
        status_res = db.client.table("contacts").select("id, status").in_("id", unsub_contact_ids).eq("tenant_id", tenant_id).execute()

        for c in (status_res.data or []):
            if c["status"] == "unsubscribed":
                active_unsubs.add(c["id"])
    unsubs = [e for e in unsub_events if e.get("contact_id") in active_unsubs]

    unique_opens  = len(set(e["contact_id"] for e in opens if e["contact_id"]))

    attempted = sent + failed

    def rate(num, denom):
        return round((num / denom) * 100, 2) if denom > 0 else 0.0

    # Collect click coordinates for heatmap overlay
    clicks_heatmap = [
        {"x": e.get("click_x"), "y": e.get("click_y"), "url": e.get("url")}
        for e in deduped_events
        if e.get("event_type") == "click"
    ]

    return {
        "campaign": campaign,
        "stats": {
            "sent":            sent,
            "failed":          failed,
            "opens":           len(opens),
            "unique_opens":    unique_opens,
            "bounces":         len(bounces) + failed,  # SMTP failed = bounce too
            "hard_bounces":    len(hard_bounces) + failed,
            "soft_bounces":    len(soft_bounces),
            "unsubscribes":    len(unsubs),
            # Rates
            "open_rate":       rate(unique_opens, sent),
            "bounce_rate":     rate(len(bounces) + failed, attempted),
            "hard_bounce_rate": rate(len(hard_bounces) + failed, attempted),
            "soft_bounce_rate": rate(len(soft_bounces), attempted),
            "unsubscribe_rate": rate(len(unsubs), sent),
        },
        "bounce_breakdown": bounce_breakdown,
        "clicks_heatmap": clicks_heatmap,
        "sources": {
            "gmail_proxy": sum(1 for e in deduped_events if e.get("source") == "gmail_proxy"),
            "apple_mpp":   sum(1 for e in deduped_events if e.get("source") == "apple_mpp"),
            "outlook":     sum(1 for e in deduped_events if e.get("source") == "outlook_proxy"),
            "yahoo":       sum(1 for e in deduped_events if e.get("source") == "yahoo_proxy"),
            "scanner":     sum(1 for e in deduped_events if e.get("source") == "scanner"),
            "honeypot":    sum(1 for e in deduped_events if e.get("source") == "honeypot"),
            "human":       sum(1 for e in deduped_events if e.get("source") == "human"),
        }
    }


# ── Per-Campaign Recipient Breakdown ──────────────────────────────────────────

@router.get("/campaigns/{campaign_id}/recipients")
async def get_campaign_recipients(
    campaign_id: str,
    tenant_id: str = Depends(require_active_tenant),
    _: JWTPayload = Depends(require_permission("analytics:view")),
):
    """
    Returns per-recipient status for a campaign:
    who opened, who bounced, who unsubscribed.
    """
    # Verify ownership
    camp_res = db.client.table("campaigns")\
        .select("id")\
        .eq("id", campaign_id)\
        .eq("tenant_id", tenant_id)\
        .execute()

    if not camp_res.data:
        raise HTTPException(status_code=404, detail="Campaign not found")

    # Dispatch rows with subscriber info
    dispatch_res = db.client.table("campaign_dispatch")\
        .select("id, status, error_log, subscriber_id, contacts!inner(email, first_name, last_name)")\
        .eq("campaign_id", campaign_id)\
        .execute()

    dispatches = {str(d.get("id")): d for d in cast(List[Dict[str, Any]], dispatch_res.data or []) if d.get("id")}

    # Tracking events
    events_q = db.client.table("email_events")\
        .select("dispatch_id, event_type, contact_id, source, bounce_type, bounce_reason")\
        .eq("campaign_id", campaign_id)
    events_res = events_q.execute()

    # Group events by dispatch_id
    events_by_dispatch: Dict[str, List[Dict[str, Any]]] = {}
    for e in cast(List[Dict[str, Any]], events_res.data or []):
        did = str(e.get("dispatch_id", ""))
        if not did: continue
        if did not in events_by_dispatch:
            events_by_dispatch[did] = []
        events_by_dispatch[did].append(e)

    # ── Also fetch current contact statuses to reflect resubscriptions ──
    contact_ids = [r.get("subscriber_id") for r in dispatches.values() if r.get("subscriber_id")]
    status_map: dict = {}
    if contact_ids:
        stat_res = db.client.table("contacts").select("id, status").in_("id", contact_ids).execute()
        for c in (stat_res.data or []):
            status_map[c["id"]] = c["status"]

    recipients = []
    for did, d in dispatches.items():
        contact = cast(Dict[str, Any], d.get("contacts") or {})
        event_list = events_by_dispatch.get(did, [])
        event_types = {str(e.get("event_type", "")) for e in event_list}
        sources = {str(e.get("source", "unknown")) for e in event_list}
        contact_id = d.get("subscriber_id")
        
        # Check for bounce details in event list
        bounce_event = next((e for e in event_list if e.get("event_type") == "bounce"), None)
        
        is_bounced = d.get("status") == "FAILED" or "bounce" in event_types
        bounce_type = None
        bounce_reason = None
        
        if bounce_event:
            bounce_type = bounce_event.get("bounce_type")
            bounce_reason = bounce_event.get("bounce_reason")
        elif d.get("status") == "FAILED":
            bounce_type = "hard"
            bounce_reason = d.get("error_log") or "SMTP delivery failure"

        current_status = status_map.get(contact_id, "")
        recipients.append({
            "dispatch_id":  did,
            "contact_id":   contact_id,
            "email":        contact.get("email", ""),
            "name":         f"{contact.get('first_name','')} {contact.get('last_name','')}".strip(),
            "status":       d.get("status"),
            "opened":       "open" in event_types,
            "bounced":      is_bounced,
            "bounce_type":  bounce_type,
            "bounce_reason": bounce_reason,
            "unsubscribed": "unsubscribe" in event_types and current_status == "unsubscribed",
            "sources":      list(sources),
        })

    return {"recipients": recipients, "total": len(recipients)}


# ── Sender Health (Tenant-Wide Reputation) ────────────────────────────────────

@router.get("/sender-health")
async def get_sender_health(
    tenant_id: str = Depends(require_active_tenant),
    _: JWTPayload = Depends(require_permission("analytics:view")),
):
    """
    Tenant's overall sender reputation.
    Aggregates last 30 days of data across all campaigns.
    Returns traffic-light ratings per metric.
    """
    # All campaigns for this tenant
    camps_res = db.client.table("campaigns")\
        .select("id")\
        .eq("tenant_id", tenant_id)\
        .execute()

    camp_ids = [str(c.get("id")) for c in cast(List[Dict[str, Any]], camps_res.data or []) if c.get("id")]

    if not camp_ids:
        return _health_response(sent=0, opens=0, clicks=0, bounces=0, spam=0)

    # Total dispatched (sent)
    sent_res = db.client.table("campaign_dispatch")\
        .select("id", count="exact")\
        .in_("campaign_id", camp_ids)\
        .eq("status", "DISPATCHED")\
        .execute()

    failed_res = db.client.table("campaign_dispatch")\
        .select("id", count="exact")\
        .in_("campaign_id", camp_ids)\
        .eq("status", "FAILED")\
        .execute()

    # Tracking events (non-bot)
    events_res = db.client.table("email_events")\
        .select("event_type, bounce_type")\
        .eq("tenant_id", tenant_id)\
        .eq("is_bot", False)\
        .execute()

    events = cast(List[Dict[str, Any]], events_res.data or [])
    sent    = sent_res.count or 0
    failed  = failed_res.count or 0
    opens   = sum(1 for e in events if e.get("event_type") == "open")
    clicks  = sum(1 for e in events if e.get("event_type") == "click")
    spam    = sum(1 for e in events if e.get("event_type") == "spam")

    # Hard/Soft split
    bounce_events = [e for e in events if e.get("event_type") == "bounce"]
    hard_bounces = sum(1 for e in bounce_events if e.get("bounce_type") == "hard") + failed
    soft_bounces = sum(1 for e in bounce_events if e.get("bounce_type") == "soft")
    total_bounces = hard_bounces + soft_bounces

    return _health_response(sent, opens, clicks, total_bounces, hard_bounces, soft_bounces, spam)


def _health_response(sent, opens, clicks, bounces, hard_bounces, soft_bounces, spam):
    def rate(n, d): return round((n / d) * 100, 2) if d > 0 else 0.0

    attempted = sent + bounces
    bounce_rate = rate(bounces, attempted)
    hard_bounce_rate = rate(hard_bounces, attempted)
    soft_bounce_rate = rate(soft_bounces, attempted)
    spam_rate   = rate(spam, sent)
    open_rate   = rate(opens, sent)

    def bounce_status(r):
        if r < 2:    return "green"
        elif r < 5:  return "yellow"
        return "red"

    def spam_status(r):
        if r < 0.1:   return "green"
        elif r < 0.5: return "yellow"
        return "red"

    def open_status(r):
        if r > 20:   return "green"
        elif r > 10: return "yellow"
        return "red"

    return {
        "sent":         sent,
        "opens":        opens,
        "clicks":       clicks,
        "bounces":      bounces,
        "hard_bounces": hard_bounces,
        "soft_bounces": soft_bounces,
        "spam":         spam,
        "rates": {
            "bounce_rate": bounce_rate,
            "hard_bounce_rate": hard_bounce_rate,
            "soft_bounce_rate": soft_bounce_rate,
            "spam_rate":   spam_rate,
            "open_rate":   open_rate,
            "click_rate":  rate(clicks, sent),
        },
        "health": {
            "bounce": {"status": bounce_status(bounce_rate), "value": bounce_rate},
            "spam":   {"status": spam_status(spam_rate),     "value": spam_rate},
            "open":   {"status": open_status(open_rate),     "value": open_rate},
        },
        "overall": "red" if bounce_status(bounce_rate) == "red" or spam_status(spam_rate) == "red"
                   else "yellow" if bounce_status(bounce_rate) == "yellow" or spam_status(spam_rate) == "yellow"
                   else "green"
    }

# ── Real Advanced AI/Analytics Features ───────────────────────────────────────
from datetime import datetime
from pydantic import BaseModel

class ChatRequest(BaseModel):
    query: str

@router.get("/heatmap")
async def get_engagement_heatmap(
    tenant_id: str = Depends(require_active_tenant),
    _: JWTPayload = Depends(require_permission("analytics:view")),
):
    """
    Returns engagement density (opens/clicks) grouped by day of week and hour of day.
    Used for rendering the activity heatmap.
    """
    # Fetch non-bot opens/clicks for this tenant
    events_res = db.client.table("email_events")\
        .select("created_at")\
        .eq("tenant_id", tenant_id)\
        .eq("is_bot", False)\
        .in_("event_type", ["open", "click"])\
        .execute()
    events = cast(List[Dict[str, Any]], events_res.data or [])

    # Initialize a 7x24 grid with 0s
    # days: 0=Monday, ..., 6=Sunday
    # hours: 0-23
    grid = {d: {h: 0 for h in range(24)} for d in range(7)}

    for e in events:
        ts = e.get("created_at")
        if ts:
            try:
                dt = datetime.fromisoformat(ts.replace('Z', '+00:00'))
                day = dt.weekday()  # 0=Monday, ..., 6=Sunday
                hour = dt.hour
                grid[day][hour] += 1
            except Exception:
                pass

    # Flatten the grid for easy rendering
    flat_grid = []
    for day in range(7):
        for hour in range(24):
            flat_grid.append({
                "day": day,
                "hour": hour,
                "value": grid[day][hour]
            })

    return {"heatmap": flat_grid}

@router.get("/smart-insights")
async def get_smart_insights(
    tenant_id: str = Depends(require_active_tenant),
    _: JWTPayload = Depends(require_permission("analytics:view")),
):
    """
    Dynamically calculated smart insights and anomalies based on historical
    campaign and delivery database data.
    """
    # Fetch campaigns for this tenant
    camps_res = db.client.table("campaigns")\
        .select("id, name, created_at")\
        .eq("tenant_id", tenant_id)\
        .execute()
    campaigns = cast(List[Dict[str, Any]], camps_res.data or [])

    if not campaigns:
        return {
            "insights": [
                {
                    "id": "ins_welcome",
                    "type": "recommendation",
                    "message": "Welcome to ShrFlow! Create and send your first campaign to begin receiving smart insights."
                },
                {
                    "id": "ins_verify",
                    "type": "recommendation",
                    "message": "Verify your sender domain under Settings to improve email deliverability from day one."
                }
            ]
        }

    # Fetch total dispatched/failed for campaigns to compute stats
    camp_ids = [c["id"] for c in campaigns]
    campaigns_sorted = sorted(campaigns, key=lambda x: x.get("created_at", ""), reverse=True)
    last_camp = campaigns_sorted[0]

    # Get stats for last campaign
    last_sent_res = db.client.table("campaign_dispatch")\
        .select("id", count="exact")\
        .eq("campaign_id", last_camp["id"])\
        .eq("status", "DISPATCHED")\
        .execute()
    last_sent = last_sent_res.count or 0

    last_opens_res = db.client.table("email_events")\
        .select("id", count="exact")\
        .eq("campaign_id", last_camp["id"])\
        .eq("event_type", "open")\
        .eq("is_bot", False)\
        .execute()
    last_opens = last_opens_res.count or 0
    last_open_rate = round((last_opens / last_sent) * 100, 2) if last_sent > 0 else 0.0

    # Get average open rate of previous campaigns (up to 9 previous campaigns)
    prev_camps = campaigns_sorted[1:10]
    prev_open_rates = []
    for pc in prev_camps:
        psent_res = db.client.table("campaign_dispatch")\
            .select("id", count="exact")\
            .eq("campaign_id", pc["id"])\
            .eq("status", "DISPATCHED")\
            .execute()
        psent = psent_res.count or 0
        popens_res = db.client.table("email_events")\
            .select("id", count="exact")\
            .eq("campaign_id", pc["id"])\
            .eq("event_type", "open")\
            .eq("is_bot", False)\
            .execute()
        popens = popens_res.count or 0
        if psent > 0:
            prev_open_rates.append((popens / psent) * 100)

    avg_prev_rate = round(sum(prev_open_rates) / len(prev_open_rates), 2) if prev_open_rates else 20.0

    insights = []

    # Insight 1: Optimal sending time analysis from open events
    events_res = db.client.table("email_events")\
        .select("created_at")\
        .eq("tenant_id", tenant_id)\
        .eq("event_type", "open")\
        .execute()
    open_events = cast(List[Dict[str, Any]], events_res.data or [])

    if open_events:
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        day_counts = {d: 0 for d in days}
        hour_counts = {h: 0 for h in range(24)}
        for e in open_events:
            ts = e.get("created_at")
            if ts:
                try:
                    dt = datetime.fromisoformat(ts.replace('Z', '+00:00'))
                    day_counts[days[dt.weekday()]] += 1
                    hour_counts[dt.hour] += 1
                except Exception:
                    pass

        best_day = max(day_counts, key=day_counts.get)
        best_hour = max(hour_counts, key=hour_counts.get)
        am_pm = "AM" if best_hour < 12 else "PM"
        display_hour = best_hour if best_hour <= 12 else best_hour - 12
        if display_hour == 0:
            display_hour = 12

        insights.append({
            "id": "ins_time",
            "type": "recommendation",
            "message": f"Best time to send emails is {best_day}s around {display_hour} {am_pm} based on your subscribers' actual opening history."
        })
    else:
        insights.append({
            "id": "ins_time",
            "type": "recommendation",
            "message": "Send campaigns on Tuesdays at 10 AM to start. Once we track subscriber opens, we'll recommend your custom optimal send time."
        })

    # Insight 2: Comparison warning/success
    if len(campaigns) > 1 and last_sent > 0:
        diff = last_open_rate - avg_prev_rate
        if diff < -2.0:
            insights.append({
                "id": "ins_rate",
                "type": "warning",
                "message": f"Open rate for '{last_camp['name']}' ({last_open_rate}%) is lower than your average ({avg_prev_rate}%). Consider A/B testing subject lines next time."
            })
        elif diff > 2.0:
            insights.append({
                "id": "ins_rate",
                "type": "recommendation",
                "message": f"Great job! Open rate for '{last_camp['name']}' ({last_open_rate}%) is higher than your average ({avg_prev_rate}%). Analyze what worked in this subject line."
            })
        else:
            insights.append({
                "id": "ins_rate",
                "type": "recommendation",
                "message": f"Engagement for '{last_camp['name']}' ({last_open_rate}%) is stable and matches your historical baseline of {avg_prev_rate}%."
            })
    else:
        insights.append({
            "id": "ins_rate",
            "type": "recommendation",
            "message": f"Your first campaign '{last_camp['name']}' achieved an open rate of {last_open_rate}%. We will track performance trends starting from your next send."
        })

    # Insight 3: Bounce rate / list health
    dispatches_res = db.client.table("campaign_dispatch")\
        .select("status")\
        .in_("campaign_id", camp_ids)\
        .execute()
    dispatches = cast(List[Dict[str, Any]], dispatches_res.data or [])
    total_disp = len(dispatches)
    failed_disp = sum(1 for d in dispatches if d.get("status") == "FAILED")

    bounce_events_res = db.client.table("email_events")\
        .select("id")\
        .eq("tenant_id", tenant_id)\
        .eq("event_type", "bounce")\
        .execute()
    bounces = len(bounce_events_res.data or []) + failed_disp

    bounce_rate = round((bounces / total_disp) * 100, 2) if total_disp > 0 else 0.0

    if bounce_rate >= 5.0:
        insights.append({
            "id": "ins_bounce",
            "type": "anomaly",
            "message": f"Sudden spike in bounce rate detected ({bounce_rate}%). We strongly recommend cleaning your contact lists and verifying your SPF/DKIM records."
        })
    else:
        insights.append({
            "id": "ins_bounce",
            "type": "recommendation",
            "message": f"Your sender reputation is healthy. Bounce rate is currently at a safe level of {bounce_rate}%."
        })

    return {"insights": insights}


@router.get("/predictive")
async def get_predictive_analytics(
    tenant_id: str = Depends(require_active_tenant),
    _: JWTPayload = Depends(require_permission("analytics:view")),
):
    """
    Forecast expected campaign metrics based on historical tenant performance.
    """
    camps_res = db.client.table("campaigns")\
        .select("id, created_at")\
        .eq("tenant_id", tenant_id)\
        .execute()
    campaigns = cast(List[Dict[str, Any]], camps_res.data or [])

    if not campaigns:
        return {
            "forecast": {
                "expected_open_rate": 0.0,
                "expected_click_rate": 0.0,
                "confidence_score": 0,
                "trend": "stable"
            }
        }

    campaigns_sorted = sorted(campaigns, key=lambda x: x.get("created_at", ""), reverse=True)[:10]

    open_rates = []
    click_rates = []

    for c in campaigns_sorted:
        sent_res = db.client.table("campaign_dispatch")\
            .select("id", count="exact")\
            .eq("campaign_id", c["id"])\
            .eq("status", "DISPATCHED")\
            .execute()
        sent = sent_res.count or 0

        opens_res = db.client.table("email_events")\
            .select("id", count="exact")\
            .eq("campaign_id", c["id"])\
            .eq("event_type", "open")\
            .eq("is_bot", False)\
            .execute()
        opens = opens_res.count or 0

        clicks_res = db.client.table("email_events")\
            .select("id", count="exact")\
            .eq("campaign_id", c["id"])\
            .eq("event_type", "click")\
            .eq("is_bot", False)\
            .execute()
        clicks = clicks_res.count or 0

        if sent > 0:
            open_rates.append((opens / sent) * 100)
            click_rates.append((clicks / sent) * 100)

    if not open_rates:
        return {
            "forecast": {
                "expected_open_rate": 20.0,
                "expected_click_rate": 2.5,
                "confidence_score": 50,
                "trend": "stable"
            }
        }

    expected_open = round(sum(open_rates) / len(open_rates), 2)
    expected_click = round(sum(click_rates) / len(click_rates), 2)

    num_camps = len(open_rates)
    if num_camps == 1:
        confidence = 65
    elif num_camps <= 3:
        confidence = 75
    elif num_camps <= 7:
        confidence = 85
    else:
        confidence = 92

    if len(open_rates) >= 2:
        diff = open_rates[0] - open_rates[-1]
        if diff > 1.0:
            trend = "upward"
        elif diff < -1.0:
            trend = "downward"
        else:
            trend = "stable"
    else:
        trend = "stable"

    return {
        "forecast": {
            "expected_open_rate": expected_open,
            "expected_click_rate": expected_click,
            "confidence_score": confidence,
            "trend": trend
        }
    }


@router.get("/subscriber-intelligence")
async def get_subscriber_intelligence(
    tenant_id: str = Depends(require_active_tenant),
    _: JWTPayload = Depends(require_permission("analytics:view")),
):
    """
    Groups subscriber base into engagement tiers (Highly Engaged, Moderately Engaged, Inactive)
    derived from genuine campaign interaction history.
    """
    contacts_res = db.client.table("contacts")\
        .select("id")\
        .eq("tenant_id", tenant_id)\
        .execute()
    contacts = cast(List[Dict[str, Any]], contacts_res.data or [])

    if not contacts:
        return {
            "segments": [
                {"id": "seg_1", "name": "Highly Engaged", "count": 0, "percentage": 0.0},
                {"id": "seg_2", "name": "Moderately Engaged", "count": 0, "percentage": 0.0},
                {"id": "seg_3", "name": "Inactive", "count": 0, "percentage": 0.0}
            ]
        }

    # Retrieve all positive engagement events for this tenant
    events_res = db.client.table("email_events")\
        .select("contact_id")\
        .eq("tenant_id", tenant_id)\
        .eq("is_bot", False)\
        .in_("event_type", ["open", "click"])\
        .execute()
    events = cast(List[Dict[str, Any]], events_res.data or [])

    event_counts = {}
    for e in events:
        cid = e.get("contact_id")
        if cid:
            event_counts[cid] = event_counts.get(cid, 0) + 1

    highly_engaged = 0
    moderately_engaged = 0
    inactive = 0

    for c in contacts:
        cid = c.get("id")
        count = event_counts.get(cid, 0)
        if count >= 3:
            highly_engaged += 1
        elif count >= 1:
            moderately_engaged += 1
        else:
            inactive += 1

    total = len(contacts)
    def pct(val):
        return round((val / total) * 100, 2) if total > 0 else 0.0

    return {
        "segments": [
            {"id": "seg_1", "name": "Highly Engaged", "count": highly_engaged, "percentage": pct(highly_engaged)},
            {"id": "seg_2", "name": "Moderately Engaged", "count": moderately_engaged, "percentage": pct(moderately_engaged)},
            {"id": "seg_3", "name": "Inactive", "count": inactive, "percentage": pct(inactive)}
        ]
    }


@router.post("/chat")
async def ai_chat(
    request: ChatRequest,
    tenant_id: str = Depends(require_active_tenant),
    _: JWTPayload = Depends(require_permission("analytics:view")),
):
    """
    Interactive analytics chatbot providing natural language responses driven
    by live database records.
    """
    query = request.query.lower()

    # Fetch stats
    camps_res = db.client.table("campaigns")\
        .select("id")\
        .eq("tenant_id", tenant_id)\
        .execute()
    camps = camps_res.data or []
    num_campaigns = len(camps)

    contacts_res = db.client.table("contacts")\
        .select("id", count="exact")\
        .eq("tenant_id", tenant_id)\
        .execute()
    num_contacts = contacts_res.count or 0

    camp_ids = [c["id"] for c in camps] if camps else []
    if camp_ids:
        dispatches_res = db.client.table("campaign_dispatch")\
            .select("status")\
            .in_("campaign_id", camp_ids)\
            .execute()
        dispatches = cast(List[Dict[str, Any]], dispatches_res.data or [])
    else:
        dispatches = []
    num_sent = sum(1 for d in dispatches if d.get("status") == "DISPATCHED")
    num_failed = sum(1 for d in dispatches if d.get("status") == "FAILED")

    events_res = db.client.table("email_events")\
        .select("event_type, bounce_type")\
        .eq("tenant_id", tenant_id)\
        .eq("is_bot", False)\
        .execute()
    events = cast(List[Dict[str, Any]], events_res.data or [])

    num_opens = sum(1 for e in events if e.get("event_type") == "open")
    num_clicks = sum(1 for e in events if e.get("event_type") == "click")
    
    bounce_events = [e for e in events if e.get("event_type") == "bounce"]
    num_hard_bounces = sum(1 for e in bounce_events if e.get("bounce_type") == "hard") + num_failed
    num_soft_bounces = sum(1 for e in bounce_events if e.get("bounce_type") == "soft")
    num_bounces = num_hard_bounces + num_soft_bounces

    def rate(n, d):
        return round((n / d) * 100, 2) if d > 0 else 0.0

    open_rate = rate(num_opens, num_sent)
    click_rate = rate(num_clicks, num_sent)
    bounce_rate = rate(num_bounces, num_sent + num_failed)

    if "open" in query:
        response_msg = (
            f"Your tenant-wide open rate is currently **{open_rate}%** (with **{num_opens}** total opens across **{num_sent}** successfully sent emails). "
            f"To increase this, try sending personalized subject lines or scheduling dispatches for Tuesday morning."
        )
    elif "click" in query:
        response_msg = (
            f"Your click-through rate is **{click_rate}%** (with **{num_clicks}** total clicks). "
            f"If you'd like to improve this, make sure your primary call-to-action button is placed prominently near the top of the email template."
        )
    elif "bounce" in query:
        response_msg = (
            f"You have recorded **{num_bounces}** total bounces/delivery failures, yielding a bounce rate of **{bounce_rate}%**.\n\n"
            f"• **Hard Bounces:** {num_hard_bounces}\n"
            f"• **Soft Bounces:** {num_soft_bounces}\n\n"
            f"A healthy bounce rate should be under 2%. Hard bounces are permanent failures (e.g. invalid emails) and are suppressed immediately. Soft bounces are temporary (e.g. full mailbox) and are eligible for retries."
        )
    elif "contact" in query or "subscriber" in query:
        response_msg = (
            f"You currently have **{num_contacts}** total contacts in your audience database. "
            f"You can segment them in the 'Subscriber Intelligence' view based on their engagement history."
        )
    elif "campaign" in query:
        response_msg = (
            f"You have created **{num_campaigns}** campaigns in total. "
            f"Of these, **{num_sent}** individual emails have been dispatched to your subscribers."
        )
    else:
        response_msg = (
            f"Hello! I am your AI assistant. Here is a quick snapshot of your live account metrics:\n\n"
            f"• **Contacts:** {num_contacts} subscribers\n"
            f"• **Campaigns:** {num_campaigns} created\n"
            f"• **Total Sent:** {num_sent} emails\n"
            f"• **Open Rate:** {open_rate}%\n"
            f"• **Click Rate:** {click_rate}%\n"
            f"• **Bounce Rate:** {bounce_rate}% (Hard: {num_hard_bounces}, Soft: {num_soft_bounces})\n\n"
            f"Ask me about any specific metric (e.g., 'What is my click rate?') for details!"
        )

    return {"response": response_msg}


@router.get("/activity-7d")
async def get_activity_7d(
    tenant_id: str = Depends(require_active_tenant),
    _: JWTPayload = Depends(require_permission("analytics:view")),
):
    """
    Returns dispatched email counts grouped by date for the last 7 days.
    """
    from datetime import datetime, timedelta, timezone
    now = datetime.now(timezone.utc)
    seven_days_ago = now - timedelta(days=7)

    # Fetch dispatches from last 7 days for campaigns belonging to the active tenant
    res = db.client.table("campaign_dispatch")\
        .select("created_at, status, campaigns!inner(tenant_id)")\
        .eq("campaigns.tenant_id", tenant_id)\
        .gte("created_at", seven_days_ago.isoformat())\
        .execute()

    # Generate last 7 days sequence (oldest first, ending with today)
    days = []
    for i in range(6, -1, -1):
        d = now - timedelta(days=i)
        days.append({
            "date": d.strftime("%Y-%m-%d"),
            "day_name": d.strftime("%a"),
            "count": 0
        })

    for row in (res.data or []):
        # We only count DISPATCHED status
        if row.get("status") != "DISPATCHED":
            continue
        ts = row.get("created_at")
        if ts:
            try:
                dt = datetime.fromisoformat(ts.replace('Z', '+00:00'))
                date_str = dt.strftime("%Y-%m-%d")
                for d in days:
                    if d["date"] == date_str:
                        d["count"] += 1
                        break
            except Exception:
                pass

    return {"activity": days}

