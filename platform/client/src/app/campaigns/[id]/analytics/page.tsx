"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import { InlineAlert, PageHeader, SectionCard, StatCard } from "@/components/ui";

type Stats = {
  sent: number;
  failed: number;
  opens: number;
  unique_opens: number;
  bounces: number;
  hard_bounces?: number;
  soft_bounces?: number;
  unsubscribes: number;
  open_rate: number;
  bounce_rate: number;
  hard_bounce_rate?: number;
  soft_bounce_rate?: number;
  unsubscribe_rate: number;
  view?: string;
};

type Recipient = {
  dispatch_id: string;
  contact_id: string;
  email: string;
  name: string;
  status: string;
  opened: boolean;
  bounced: boolean;
  bounce_type?: string | null;
  bounce_reason?: string | null;
  unsubscribed: boolean;
  sources?: string[];
};

export default function CampaignAnalyticsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  const [stats, setStats] = useState<Stats | null>(null);
  const [campaign, setCampaign] = useState<any | null>(null);
  const [sources, setSources] = useState<Record<string, number>>({});
  const [bounceBreakdown, setBounceBreakdown] = useState<any[]>([]);
  const [clicksHeatmap, setClicksHeatmap] = useState<{ x: number | null; y: number | null; url?: string | null }[]>([]);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !id) return;
    const headers = { Authorization: `Bearer ${token}` };

    const load = async () => {
      setLoading(true);
      try {
        const [sRes, rRes] = await Promise.all([
          fetch(`${API_BASE}/analytics/campaigns/${id}`, { headers }),
          fetch(`${API_BASE}/analytics/campaigns/${id}/recipients`, { headers }),
        ]);
        if (!sRes.ok) throw new Error((await sRes.json()).detail || "Failed to load stats");
        if (!rRes.ok) throw new Error((await rRes.json()).detail || "Failed to load recipients");

        const sJson = await sRes.json();
        const rJson = await rRes.json();
        setStats(sJson.stats);
        setCampaign(sJson.campaign || null);
        setSources(sJson.sources || {});
        setBounceBreakdown(sJson.bounce_breakdown || []);
        setClicksHeatmap(sJson.clicks_heatmap || []);
        setRecipients(rJson.recipients || []);
        setError("");
      } catch (e: any) {
        setError(e.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token, id, API_BASE]);

  const statCards = stats
    ? [
      { title: "Sent", value: stats.sent.toLocaleString(), change: `${stats.failed} failed`, changeType: stats.failed > 0 ? "negative" as const : "neutral" as const },
      { title: "Unique opens", value: stats.unique_opens.toLocaleString(), change: `${stats.open_rate}% rate`, changeType: "positive" as const },
      { title: "Total opens", value: stats.opens.toLocaleString(), change: stats.view || "Campaign view", changeType: "neutral" as const },
      { 
        title: "Bounce rate", 
        value: `${stats.bounce_rate}%`, 
        change: stats.hard_bounces !== undefined 
          ? `Hard: ${stats.hard_bounces} | Soft: ${stats.soft_bounces}` 
          : `${stats.bounces} bounces`, 
        changeType: stats.bounces > 0 ? "negative" as const : "neutral" as const 
      },
      { title: "Unsubscribes", value: stats.unsubscribes.toLocaleString(), change: `${stats.unsubscribe_rate}% rate`, changeType: stats.unsubscribes > 0 ? "negative" as const : "neutral" as const },
    ]
    : [];

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6">
      <PageHeader
        title="Campaign analytics"
        subtitle="Monitor delivery, engagement, and recipient-level signals for this campaign."
        action={(
          <button
            onClick={() => router.back()}
            className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-hover)]"
          >
            Back
          </button>
        )}
      />

      {error && (
        <InlineAlert
          variant="danger"
          title="Analytics couldn’t be loaded"
          description={error}
        />
      )}

      {loading && (
        <SectionCard>
          <p className="text-sm text-[var(--text-muted)]">Loading analytics…</p>
        </SectionCard>
      )}

      {!loading && stats && (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {statCards.map((stat) => (
              <StatCard
                key={stat.title}
                label={stat.title}
                value={stat.value}
                trend={stat.changeType === "positive" ? 1 : stat.changeType === "negative" ? -1 : 0}
                trendLabel={stat.change}
              />
            ))}
          </div>

          <SectionCard
            title="Proxy and scanner signals"
            description="Signals detected during campaign activity, grouped by source type."
          >
            <div className="flex flex-wrap gap-3">
              {Object.keys(sources).length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">No signal data yet.</p>
              ) : (
                Object.entries(sources).map(([key, value]) => (
                  <div
                    key={key}
                    className="rounded-full border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-2 text-sm text-[var(--text-primary)]"
                  >
                    <span className="mr-2 text-[var(--text-muted)]">{key.replace("_", " ")}</span>
                    <strong>{value}</strong>
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          {stats.bounces > 0 && bounceBreakdown.length > 0 && (
            <SectionCard
              title="Bounce reasons breakdown"
              description="Detailed diagnostic reasons and types for bounces detected during delivery."
            >
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0 text-sm">
                  <thead>
                    <tr className="bg-[var(--bg-hover)] text-left text-[var(--text-muted)]">
                      <th className="border-b border-[var(--border)] px-4 py-2 font-medium">Diagnostic Reason</th>
                      <th className="border-b border-[var(--border)] px-4 py-2 font-medium">Type</th>
                      <th className="border-b border-[var(--border)] px-4 py-2 font-medium text-right">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bounceBreakdown.map((item, idx) => (
                      <tr key={idx} className="border-t border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-hover)]/30">
                        <td className="border-b border-[var(--border)] px-4 py-3 text-[var(--text-primary)] font-mono text-xs max-w-lg break-words">
                          {item.reason}
                        </td>
                        <td className="border-b border-[var(--border)] px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                            item.type === 'hard'
                              ? 'bg-[var(--danger-bg)] text-[var(--danger)] border-[var(--danger-border)]/50'
                              : 'bg-[var(--warning-bg)] text-[var(--warning)] border-[var(--warning-border)]/50'
                          }`}>
                            {item.type === 'hard' ? 'Hard Bounce' : 'Soft Bounce'}
                          </span>
                        </td>
                        <td className="border-b border-[var(--border)] px-4 py-3 text-right text-[var(--text-primary)] font-semibold font-mono">
                          {item.count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          )}

          {campaign?.body_html && (
            <SectionCard
              title="Email click heatmap"
              description="Visual overlay of recipient click coordinates. Red zones indicate high interaction density."
              action={
                clicksHeatmap.length > 0 && (
                  <button
                    onClick={() => setShowHeatmap(!showHeatmap)}
                    className={`rounded-[var(--radius)] border px-3 py-1.5 text-xs font-medium transition-colors ${
                      showHeatmap
                        ? 'border-[var(--accent)] bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90'
                        : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                    }`}
                  >
                    {showHeatmap ? 'Hide Overlay' : 'Show Heatmap'}
                  </button>
                )
              }
            >
              <div className="space-y-4">
                {clicksHeatmap.length === 0 && (
                  <div className="rounded-[var(--radius)] border border-dashed border-[var(--border)] bg-[var(--bg-hover)]/30 p-4 text-center text-sm text-[var(--text-muted)]">
                    No click coordinates recorded for this campaign yet. Showing template preview.
                  </div>
                )}
                <HeatmapOverlay 
                  html={campaign.body_html || ""} 
                  clicks={clicksHeatmap} 
                  show={showHeatmap && clicksHeatmap.length > 0} 
                />
              </div>
            </SectionCard>
          )}

          <SectionCard
            title="Recipient activity"
            description="Recipient-level outcomes and engagement signals for the current campaign."
            noPadding
          >
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0 text-sm">
                <thead>
                  <tr className="bg-[var(--bg-hover)] text-left text-[var(--text-muted)]">
                    {["Email", "Name", "Status", "Opened", "Bounced", "Unsubscribed", "Signals"].map((label) => (
                      <th key={label} className="border-b border-[var(--border)] px-4 py-3 font-medium">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recipients.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-[var(--text-muted)]">
                        No recipient activity yet.
                      </td>
                    </tr>
                  ) : (
                    recipients.map((recipient) => (
                      <tr key={recipient.dispatch_id} className="border-t border-[var(--border)]">
                        <td className="border-b border-[var(--border)] px-4 py-3 text-[var(--text-primary)]">{recipient.email}</td>
                        <td className="border-b border-[var(--border)] px-4 py-3 text-[var(--text-muted)]">{recipient.name || "—"}</td>
                        <td className="border-b border-[var(--border)] px-4 py-3 capitalize text-[var(--text-muted)]">{recipient.status}</td>
                        <td className={`border-b border-[var(--border)] px-4 py-3 ${recipient.opened ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'}`}>
                          {recipient.opened ? "Yes" : "No"}
                        </td>
                        <td className={`border-b border-[var(--border)] px-4 py-3 ${recipient.bounced ? 'text-[var(--danger)]' : 'text-[var(--text-muted)]'}`}>
                          {recipient.bounced ? (
                            <div className="flex flex-col">
                              <span className="font-semibold capitalize text-xs">
                                {recipient.bounce_type === "soft" ? "Soft" : "Hard"}
                              </span>
                              {recipient.bounce_reason && (
                                <span className="text-[10px] text-[var(--text-muted)] max-w-xs truncate animate-fade-in" title={recipient.bounce_reason}>
                                  {recipient.bounce_reason}
                                </span>
                              )}
                            </div>
                          ) : "No"}
                        </td>
                        <td className={`border-b border-[var(--border)] px-4 py-3 ${recipient.unsubscribed ? 'text-[var(--warning)]' : 'text-[var(--text-muted)]'}`}>
                          {recipient.unsubscribed ? "Yes" : "No"}
                        </td>
                        <td className="border-b border-[var(--border)] px-4 py-3 text-[var(--text-muted)]">
                          {(recipient.sources || ["—"]).join(", ")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </>
      )}
    </div>
  );
}

interface HeatmapOverlayProps {
  html: string;
  clicks: { x: number | null; y: number | null; url?: string | null }[];
  show: boolean;
}

function HeatmapOverlay({ html, clicks, show }: HeatmapOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    const canvas = canvasRef.current;
    if (!iframe || !canvas || !show) return;

    const handleLoad = () => {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.body.style.margin = '0';
        doc.body.style.overflow = 'hidden';
        
        setTimeout(() => {
          const height = doc.documentElement.scrollHeight || doc.body.scrollHeight;
          iframe.style.height = `${height}px`;
          canvas.height = height;
          canvas.width = 600;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');

            if (tempCtx) {
              clicks.forEach((click) => {
                let x = click.x;
                let y = click.y;

                if ((x === null || y === null) && click.url) {
                  const aTags = Array.from(doc.querySelectorAll('a'));
                  const matchingTag = aTags.find(a => {
                    const href = a.getAttribute('href');
                    if (!href) return false;
                    try {
                      const normHref = href.toLowerCase().replace(/https?:\/\/(www\.)?/, '').replace(/\/$/, '');
                      const normClick = click.url!.toLowerCase().replace(/https?:\/\/(www\.)?/, '').replace(/\/$/, '');
                      return normHref === normClick || normHref.includes(normClick) || normClick.includes(normHref);
                    } catch {
                      return href === click.url;
                    }
                  });

                  if (matchingTag) {
                    const rect = matchingTag.getBoundingClientRect();
                    x = rect.left + rect.width / 2;
                    y = rect.top + rect.height / 2;
                  }
                }

                if (x === null || y === null || isNaN(x) || isNaN(y)) return;

                const radius = 25;
                const grad = tempCtx.createRadialGradient(x, y, 1, x, y, radius);
                grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
                grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

                tempCtx.beginPath();
                tempCtx.arc(x, y, radius, 0, 2 * Math.PI);
                tempCtx.fillStyle = grad;
                tempCtx.fill();
              });

              const imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
              const pix = imgData.data;

              // Color gradient palette
              const palette = createPalette();

              for (let i = 0, len = pix.length; i < len; i += 4) {
                const alpha = pix[i + 3];
                if (alpha > 0) {
                  const offset = alpha * 4;
                  pix[i]     = palette[offset];
                  pix[i + 1] = palette[offset + 1];
                  pix[i + 2] = palette[offset + 2];
                  pix[i + 3] = alpha * 0.8;
                }
              }

              ctx.putImageData(imgData, 0, 0);
            }
          }
        }, 100);
      }
    };

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc && doc.readyState === 'complete') {
      handleLoad();
    } else {
      iframe.addEventListener('load', handleLoad);
    }

    return () => {
      iframe.removeEventListener('load', handleLoad);
    };
  }, [html, clicks, show]);

  const createPalette = () => {
    const paletteCanvas = document.createElement('canvas');
    paletteCanvas.width = 256;
    paletteCanvas.height = 1;
    const paletteCtx = paletteCanvas.getContext('2d');
    if (!paletteCtx) return new Uint8ClampedArray(256 * 4);

    const grad = paletteCtx.createLinearGradient(0, 0, 256, 0);
    grad.addColorStop(0.0, 'blue');
    grad.addColorStop(0.25, 'cyan');
    grad.addColorStop(0.5, 'green');
    grad.addColorStop(0.75, 'yellow');
    grad.addColorStop(1.0, 'red');

    paletteCtx.fillStyle = grad;
    paletteCtx.fillRect(0, 0, 256, 1);

    return paletteCtx.getImageData(0, 0, 256, 1).data;
  };

  return (
    <div 
      ref={containerRef} 
      className="relative mx-auto rounded-[var(--radius)] border border-[var(--border)] bg-white overflow-hidden"
      style={{ width: '600px' }}
    >
      <iframe
        ref={iframeRef}
        srcDoc={html}
        title="Email Heatmap Preview"
        className="w-full border-0 block"
        style={{ height: '500px', pointerEvents: show ? 'none' : 'auto' }}
      />
      {show && (
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none mix-blend-multiply"
        />
      )}
    </div>
  );
}
