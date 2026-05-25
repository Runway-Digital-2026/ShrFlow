'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Minus, Loader2, Brain } from 'lucide-react';
import { SectionCard, Badge } from '@/components/ui';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

interface Forecast {
    expected_open_rate: number;
    expected_click_rate: number;
    confidence_score: number;
    trend: 'upward' | 'downward' | 'stable';
}

const trendConfig = {
    upward: { icon: <ArrowUpRight className="h-4 w-4" />, color: 'text-[var(--success)]', label: 'Trending Up' },
    downward: { icon: <ArrowDownRight className="h-4 w-4" />, color: 'text-[var(--danger)]', label: 'Trending Down' },
    stable: { icon: <Minus className="h-4 w-4" />, color: 'text-[var(--text-muted)]', label: 'Stable' },
};

function ProgressRing({ value, label, sublabel }: { value: number; label: string; sublabel: string }) {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const progress = (value / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative h-24 w-24">
                <svg className="h-24 w-24 -rotate-90" viewBox="0 0 80 80">
                    <circle
                        cx="40" cy="40" r={radius}
                        fill="none"
                        stroke="var(--border)"
                        strokeWidth="6"
                    />
                    <circle
                        cx="40" cy="40" r={radius}
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={`${progress} ${circumference}`}
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-[var(--text-primary)]">{value}%</span>
                </div>
            </div>
            <div className="text-center">
                <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
                <p className="text-xs text-[var(--text-muted)]">{sublabel}</p>
            </div>
        </div>
    );
}

export function PredictiveAnalytics({ token }: { token: string | null }) {
    const [forecast, setForecast] = useState<Forecast | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/analytics/predictive`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setForecast(data.forecast || null);
                }
            } catch (err) {
                console.error('Failed to load predictive analytics', err);
            } finally {
                setLoading(false);
            }
        })();
    }, [token]);

    const trend = forecast ? trendConfig[forecast.trend] || trendConfig.stable : trendConfig.stable;

    return (
        <SectionCard
            title="Predictive Analytics"
            description="Forecasted performance for your next campaign."
            action={
                <Badge variant="default">
                    <Brain className="h-3 w-3 mr-1" />
                    Forecast
                </Badge>
            }
        >
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-[var(--text-muted)]" />
                    <span className="ml-2 text-sm text-[var(--text-muted)]">Building forecast…</span>
                </div>
            ) : !forecast ? (
                <div className="py-6 text-center text-sm text-[var(--text-muted)]">
                    Insufficient data for predictions. Send more campaigns.
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Progress rings */}
                    <div className="flex items-center justify-around py-2">
                        <ProgressRing value={forecast.expected_open_rate} label="Open Rate" sublabel="Expected" />
                        <ProgressRing value={forecast.expected_click_rate} label="Click Rate" sublabel="Expected" />
                        <ProgressRing value={forecast.confidence_score} label="Confidence" sublabel="Model score" />
                    </div>

                    {/* Trend indicator */}
                    <div className="flex items-center justify-center gap-2 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3">
                        <span className={trend.color}>{trend.icon}</span>
                        <span className="text-sm font-medium text-[var(--text-primary)]">{trend.label}</span>
                        <span className="text-sm text-[var(--text-muted)]">— Your engagement metrics are {forecast.trend === 'upward' ? 'improving' : forecast.trend === 'downward' ? 'declining' : 'holding steady'}.</span>
                    </div>
                </div>
            )}
        </SectionCard>
    );
}
