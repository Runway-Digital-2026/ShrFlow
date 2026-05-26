interface HealthDotProps {
    status: 'good' | 'warning' | 'danger' | 'unknown';
    label?: string;
    size?: 'sm' | 'md';
    pulse?: boolean;
}

const statusColors: Record<HealthDotProps['status'], string> = {
    good: 'bg-[var(--success)]',
    warning: 'bg-[var(--warning)]',
    danger: 'bg-[var(--danger)]',
    unknown: 'bg-[var(--text-muted)]',
};

const statusShapes: Record<HealthDotProps['status'], string> = {
    good: 'rounded-full',                 // Circle
    warning: 'rotate-45 scale-[0.8] rounded-[1px]', // Diamond
    danger: 'rounded-none scale-95',      // Square
    unknown: 'rounded-full opacity-60',   // Translucent circle
};

function HealthDot({ status, label, size = 'md', pulse = false }: HealthDotProps) {
    const dotSize = size === 'sm' ? 'h-2 w-2' : 'h-2.5 w-2.5';

    return (
        <span className="inline-flex items-center gap-1.5" role="status" aria-label={label ? `${label} (${status})` : status}>
            <span
                className={`
                    inline-block flex-shrink-0 transition-all duration-200
                    ${dotSize}
                    ${statusShapes[status]}
                    ${statusColors[status]}
                    ${pulse ? 'animate-pulse' : ''}
                `}
                aria-hidden="true"
            />
            {label && (
                <span className="text-xs text-[var(--text-muted)]">{label}</span>
            )}
        </span>
    );
}

export { HealthDot };
export type { HealthDotProps };
