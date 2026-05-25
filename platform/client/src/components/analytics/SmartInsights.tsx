'use client';

import { useEffect, useState } from 'react';
import { Sparkles, TrendingDown, AlertTriangle, Lightbulb, Loader2 } from 'lucide-react';
import { SectionCard, Badge, InlineAlert } from '@/components/ui';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

interface Insight {
    id: string;
    type: 'recommendation' | 'warning' | 'anomaly';
    message: string;
}

const typeConfig: Record<Insight['type'], { variant: 'info' | 'warning' | 'danger'; icon: React.ReactNode; label: string }> = {
    recommendation: { variant: 'info', icon: <Lightbulb className="h-4 w-4" />, label: 'Recommendation' },
    warning: { variant: 'warning', icon: <TrendingDown className="h-4 w-4" />, label: 'Warning' },
    anomaly: { variant: 'danger', icon: <AlertTriangle className="h-4 w-4" />, label: 'Anomaly Detected' },
};

export function SmartInsights({ token }: { token: string | null }) {
    const [insights, setInsights] = useState<Insight[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/analytics/smart-insights`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setInsights(data.insights || []);
                }
            } catch (err) {
                console.error('Failed to load smart insights', err);
            } finally {
                setLoading(false);
            }
        })();
    }, [token]);

    return (
        <SectionCard
            title="Smart Insights"
            description="AI-powered recommendations and anomaly alerts."
            action={
                <Badge variant="info">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI
                </Badge>
            }
        >
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-[var(--text-muted)]" />
                    <span className="ml-2 text-sm text-[var(--text-muted)]">Analyzing data…</span>
                </div>
            ) : insights.length === 0 ? (
                <div className="py-6 text-center text-sm text-[var(--text-muted)]">
                    No insights available yet. Send more campaigns to generate data.
                </div>
            ) : (
                <div className="space-y-3">
                    {insights.map((insight, index) => {
                        const config = typeConfig[insight.type];
                        return (
                            <div
                                key={insight.id}
                                className="animate-in fade-in slide-in-from-bottom-2"
                                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
                            >
                                <InlineAlert
                                    variant={config.variant}
                                    title={config.label}
                                    description={insight.message}
                                    icon={config.icon}
                                />
                            </div>
                        );
                    })}
                </div>
            )}
        </SectionCard>
    );
}
