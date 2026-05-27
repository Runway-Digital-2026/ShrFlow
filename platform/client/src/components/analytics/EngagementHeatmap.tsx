'use client';

import { useEffect, useState } from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import { SectionCard, Badge } from '@/components/ui';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

interface HeatmapCell {
    day: number;
    hour: number;
    value: number;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, i) => {
    if (i === 0) return '12 AM';
    if (i === 12) return '12 PM';
    return i < 12 ? `${i} AM` : `${i - 12} PM`;
});

export function EngagementHeatmap({ token }: { token: string | null }) {
    const [data, setData] = useState<HeatmapCell[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/analytics/heatmap`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const json = await res.json();
                    setData(json.heatmap || []);
                }
            } catch (err) {
                console.error('Failed to load heatmap data', err);
            } finally {
                setLoading(false);
            }
        })();
    }, [token]);

    const maxValue = data.length > 0 ? Math.max(...data.map((d) => d.value)) : 0;

    // Helper to get color intensity based on value relative to max
    const getIntensityClass = (value: number) => {
        if (value === 0) return 'bg-[var(--bg-muted)] border border-[var(--border)] opacity-30';
        if (maxValue === 0) return 'bg-[var(--accent)]/10';
        
        const ratio = value / maxValue;
        if (ratio <= 0.25) return 'bg-[var(--accent)]/20 hover:scale-110';
        if (ratio <= 0.5) return 'bg-[var(--accent)]/45 hover:scale-110';
        if (ratio <= 0.75) return 'bg-[var(--accent)]/75 hover:scale-110 text-white';
        return 'bg-[var(--accent)] hover:scale-110 text-white shadow-sm ring-1 ring-[var(--accent-border)]';
    };

    // Group cells by day for rendering rows
    const rows = Array.from({ length: 7 }, (_, dayIndex) => {
        return HOURS.map((_, hourIndex) => {
            const cell = data.find((d) => d.day === dayIndex && d.hour === hourIndex);
            return cell || { day: dayIndex, hour: hourIndex, value: 0 };
        });
    });

    return (
        <SectionCard
            title="Subscriber Engagement Heatmap"
            description="Visual distribution of opens and clicks across days of the week and hours of the day."
            action={
                <Badge variant="default">
                    <Calendar className="h-3 w-3 mr-1" />
                    Optimal Send Windows
                </Badge>
            }
        >
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-[var(--text-muted)]" />
                    <span className="ml-2 text-sm text-[var(--text-muted)]">Generating heatmap…</span>
                </div>
            ) : data.length === 0 ? (
                <div className="py-12 text-center text-sm text-[var(--text-muted)]">
                    No engagement data available to build a heatmap. Send campaigns and track clicks/opens first!
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Grid Wrapper */}
                    <div className="overflow-x-auto pb-2 scrollbar-thin">
                        <div className="min-w-[760px] space-y-2">
                            {/* Header Hour Labels */}
                            <div className="flex items-center text-[10px] font-semibold text-[var(--text-muted)]">
                                <div className="w-12 flex-shrink-0 font-medium" /> {/* Spacer for day labels */}
                                <div 
                                    className="flex-1 gap-1 text-center"
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(24, minmax(0, 1fr))'
                                    }}
                                >
                                    {HOURS.map((hour, i) => (
                                        <div key={hour} className="truncate" title={hour}>
                                            {i % 2 === 0 ? hour.replace(' ', '') : ''}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Rows */}
                            {rows.map((row, dayIndex) => (
                                <div key={dayIndex} className="flex items-center">
                                    {/* Day label */}
                                    <div className="w-12 flex-shrink-0 text-xs font-semibold text-[var(--text-muted)]">
                                        {DAYS[dayIndex]}
                                    </div>
                                    {/* Hour cells */}
                                    <div 
                                        className="flex-1 gap-1"
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(24, minmax(0, 1fr))'
                                        }}
                                    >
                                        {row.map((cell) => (
                                            <div
                                                key={`${cell.day}-${cell.hour}`}
                                                className={`relative aspect-square rounded-sm cursor-pointer transition-all duration-150 ${getIntensityClass(cell.value)}`}
                                                title={`${DAYS[cell.day]} ${HOURS[cell.hour]}: ${cell.value} activity events`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-between border-t border-[var(--border)] pt-4 text-xs text-[var(--text-muted)]">
                        <div className="flex items-center gap-2">
                            <span>Less active</span>
                            <div className="h-3 w-3 rounded-sm bg-[var(--bg-muted)] opacity-30 border border-[var(--border)]" />
                            <div className="h-3 w-3 rounded-sm bg-[var(--accent)]/20" />
                            <div className="h-3 w-3 rounded-sm bg-[var(--accent)]/45" />
                            <div className="h-3 w-3 rounded-sm bg-[var(--accent)]/75" />
                            <div className="h-3 w-3 rounded-sm bg-[var(--accent)]" />
                            <span>Highly active</span>
                        </div>
                        <div>
                            <span>Timestamps normalized to local UTC offset.</span>
                        </div>
                    </div>
                </div>
            )}
        </SectionCard>
    );
}
