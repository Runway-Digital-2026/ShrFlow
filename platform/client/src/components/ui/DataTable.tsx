'use client';

import { ReactNode, useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from './Button';
import { EmptyState } from './EmptyState';
import { LoadingSpinner } from './LoadingSpinner';

interface Column<T> {
    key: string;
    header: string;
    render?: (row: T) => ReactNode;
    width?: string;
    sortable?: boolean;
}

interface DataTableProps<T extends Record<string, unknown>> {
    columns: Column<T>[];
    data: T[];
    isLoading?: boolean;
    searchable?: boolean;
    searchPlaceholder?: string;
    searchKeys?: (keyof T)[];    // which fields to search across
    emptyTitle?: string;
    emptyDescription?: string;
    emptyAction?: ReactNode;
    pageSize?: number;
    actions?: ReactNode;         // buttons above the table (e.g. Import, Delete Selected)
    className?: string;
}

function DataTable<T extends Record<string, unknown>>({
    columns,
    data,
    isLoading = false,
    searchable = true,
    searchPlaceholder = 'Search...',
    searchKeys = [],
    emptyTitle = 'No results found',
    emptyDescription = 'Try adjusting your search or filters.',
    emptyAction,
    pageSize = 20,
    actions,
    className = '',
}: DataTableProps<T>) {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    // Filter by search
    const filtered = useMemo(() => {
        if (!search.trim() || searchKeys.length === 0) return data;
        const q = search.toLowerCase();
        return data.filter(row =>
            searchKeys.some(key => {
                const val = row[key];
                return typeof val === 'string' && val.toLowerCase().includes(q);
            })
        );
    }, [data, search, searchKeys]);

    // Sort
    const sorted = useMemo(() => {
        if (!sortKey) return filtered;
        return [...filtered].sort((a, b) => {
            const av = a[sortKey] ?? '';
            const bv = b[sortKey] ?? '';
            const cmp = String(av).localeCompare(String(bv));
            return sortDir === 'asc' ? cmp : -cmp;
        });
    }, [filtered, sortKey, sortDir]);

    // Paginate
    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

    function handleSort(key: string) {
        if (sortKey === key) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    }

    function handleSearch(value: string) {
        setSearch(value);
        setPage(1);
    }

    return (
        <div className={`flex flex-col gap-3 ${className}`}>
            {/* Toolbar */}
            {(searchable || actions) && (
                <div className="flex items-center gap-3 flex-wrap">
                    {searchable && (
                        <div className="relative flex-1 min-w-[220px]">
                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]"
                                aria-hidden="true"
                            />
                            <input
                                type="search"
                                value={search}
                                onChange={e => handleSearch(e.target.value)}
                                placeholder={searchPlaceholder}
                                aria-label={searchPlaceholder}
                                className="
                                    w-full pl-9 pr-4 h-9 rounded-[var(--radius)]
                                    bg-[var(--bg-card)] border border-[var(--border)]
                                    text-sm text-[var(--text-primary)]
                                    placeholder:text-[var(--text-muted)]
                                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]
                                "
                            />
                        </div>
                    )}
                    {actions && (
                        <div className="flex items-center gap-2">{actions}</div>
                    )}
                </div>
            )}

            {/* Table */}
            <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)]">
                {isLoading && (
                    <div className="absolute inset-0 bg-[var(--bg-primary)]/70 flex items-center justify-center z-10">
                        <LoadingSpinner size="lg" />
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse" role="grid">
                        <caption className="sr-only">{emptyTitle || "Data grid showing audience contacts and marketing records"}</caption>
                        <thead>
                            <tr className="border-b border-[var(--border)] bg-[var(--bg-card)]">
                                {columns.map(col => (
                                    <th
                                        key={col.key}
                                        scope="col"
                                        style={{ width: col.width }}
                                        className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide whitespace-nowrap"
                                        aria-sort={
                                            col.sortable
                                                ? sortKey === col.key
                                                    ? sortDir === 'asc' ? 'ascending' : 'descending'
                                                    : 'none'
                                                : undefined
                                        }
                                    >
                                        {col.sortable ? (
                                            <button
                                                type="button"
                                                onClick={() => handleSort(col.key)}
                                                className="flex items-center gap-1 hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:underline focus-visible:text-[var(--text-primary)] transition-colors uppercase tracking-wide font-semibold text-xs text-[var(--text-muted)]"
                                                aria-label={`Sort by ${col.header} in ${sortKey === col.key && sortDir === 'asc' ? 'descending' : 'ascending'} order`}
                                            >
                                                <span>{col.header}</span>
                                                {sortKey === col.key ? (
                                                    <span aria-hidden="true">{sortDir === 'asc' ? '↑' : '↓'}</span>
                                                ) : (
                                                    <span className="opacity-40 hover:opacity-100" aria-hidden="true">↕</span>
                                                )}
                                            </button>
                                        ) : (
                                            <span>{col.header}</span>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.length === 0 && !isLoading ? (
                                <tr>
                                    <td colSpan={columns.length} className="p-0">
                                        <EmptyState
                                            title={emptyTitle}
                                            description={emptyDescription}
                                            action={emptyAction}
                                            className="rounded-none border-none"
                                        />
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((row, rowIdx) => (
                                    <tr
                                        key={rowIdx}
                                        className="
                                            border-b border-[var(--border)] last:border-0
                                            bg-[var(--bg-primary)] hover:bg-[var(--bg-card)]
                                            transition-colors duration-100
                                        "
                                    >
                                        {columns.map((col, colIdx) => {
                                            const cellContent = col.render ? col.render(row) : String(row[col.key] ?? '—');
                                            if (colIdx === 0) {
                                                return (
                                                    <th key={col.key} scope="row" className="px-4 py-3 text-left text-sm font-medium text-[var(--text-primary)] whitespace-nowrap">
                                                        {cellContent}
                                                    </th>
                                                );
                                            }
                                            return (
                                                <td key={col.key} className="px-4 py-3 text-[var(--text-primary)]">
                                                    {cellContent}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between gap-4 text-sm text-[var(--text-muted)]">
                    <span>
                        {sorted.length} result{sorted.length !== 1 ? 's' : ''}
                        {search && ` for "${search}"`}
                    </span>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setPage(1)} disabled={page === 1} aria-label="First page">
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setPage(p => p - 1)} disabled={page === 1} aria-label="Previous page">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="px-2 text-xs">Page {page} of {totalPages}</span>
                        <Button variant="ghost" size="icon" onClick={() => setPage(p => p + 1)} disabled={page === totalPages} aria-label="Next page">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setPage(totalPages)} disabled={page === totalPages} aria-label="Last page">
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

export { DataTable };
export type { Column, DataTableProps };
