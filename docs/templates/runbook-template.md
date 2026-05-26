# Runbook & Incident Playbook: {Service/Component}

## Purpose
Provide immediate runbook steps and playbooks for common incidents affecting this service.

## Audience / Prereqs
- On-call engineer or SRE with permissions to access logs, monitoring, and remediation tools.

## Severity Levels
- Define severity (P0, P1, P2) and typical SLA/response times.

## First Response Checklist
1. Acknowledge the alert and record timeline.
2. Gather context: recent deploys, logs, metrics.

## Diagnostics Commands
- Tail logs:
```bash
kubectl -n myns logs -l app=myapp --tail=200
```
- Check pods:
```bash
kubectl -n myns get pods
```

## Mitigation Steps (examples)
- Service down: restart pods, scale replicas, or route traffic away.
- DB issues: set DB to read-only, failover to replica if available.

## Escalation
- When to escalate to the owning team or on-call lead and contact details.

## Runbook Playbooks
- Playbook: High error rate — steps to identify bad deploy, roll back, and monitor.

## Postmortem Template
- Impact summary, timeline, root cause, action items, owners, and follow-up.

## Owner & Last Updated
- Owner: <team or person>
- Last updated: YYYY-MM-DD
