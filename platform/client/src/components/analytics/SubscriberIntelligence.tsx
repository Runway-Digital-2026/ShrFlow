'use client';

import { useEffect, useState } from 'react';
import { Users, UserCheck, UserMinus, UserX, Loader2 } from 'lucide-react';
import { SectionCard, Badge } from '@/components/ui';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

interface Segment {
    id: string;
    name: string;
    count: number;
    percentage: number;
}

const segmentIcons: Record<string, React.ReactNode> = {
    'Highly Engaged': <UserCheck className="h-4 w-4 text-[var(--success)]" />,
    'Moderately Engaged': <Users className="h-4 w-4 text-[var(--warning)]" />,
    'Inactive': <UserX className="h-4 w-4 text-[var(--danger)]" />,
};

const segmentColors: Record<string, string> = {
    'Highly Engaged': 'var(--success)',
    'Moderately Engaged': 'var(--warning)',
    'Inactive': 'var(--danger)',
};

export function SubscriberIntelligence({ token }: { token: string | null }) {
    const [segments, setSegments] = useState<Segment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/analytics/subscriber-intelligence`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setSegments(data.segments || []);
                }
            } catch (err) {
                console.error('Failed to load subscriber intelligence', err);
            } finally {
                setLoading(false);
            }
        })();
    }, [token]);

    const totalSubscribers = segments.reduce((sum, s) => sum + s.count, 0);

    return (
        <SectionCard
            title="Subscriber Intelligence"
            description="Audience segmentation based on engagement."
            action={
                <Badge variant="default">
                    <Users className="h-3 w-3 mr-1" />
                    {totalSubscribers.toLocaleString()} total
                </Badge>
            }
        >
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-[var(--text-muted)]" />
                    <span className="ml-2 text-sm text-[var(--text-muted)]">Segmenting audience…</span>
                </div>
            ) : segments.length === 0 ? (
                <div className="py-6 text-center text-sm text-[var(--text-muted)]">
                    No subscriber data available yet.
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Stacked bar */}
                    <div className="flex h-3 w-full overflow-hidden rounded-full bg-[var(--bg-muted)]">
                        {segments.map((seg) => (
                            <div
                                key={seg.id}
                                className="h-full transition-all duration-700 ease-out first:rounded-l-full last:rounded-r-full"
                                style={{
                                    width: `${seg.percentage}%`,
                                    backgroundColor: segmentColors[seg.name] || 'var(--accent)',
                                }}
                                title={`${seg.name}: ${seg.percentage}%`}
                            />
                        ))}
                    </div>

                    {/* Segment details */}
                    <div className="space-y-3">
                        {segments.map((seg) => (
                            <div
                                key={seg.id}
                                className="flex items-center justify-between rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3 transition-colors hover:bg-[var(--bg-hover)]"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--bg-muted)]">
                                        {segmentIcons[seg.name] || <Users className="h-4 w-4 text-[var(--text-muted)]" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-[var(--text-primary)]">{seg.name}</p>
                                        <p className="text-xs text-[var(--text-muted)]">{seg.count.toLocaleString()} subscribers</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-lg font-bold text-[var(--text-primary)]">{seg.percentage}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </SectionCard>
    );
}
