"use client";

import { LayoutTemplate, Trash2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui";

interface ApplyTemplateModalProps {
    isOpen: boolean;
    templateName: string;
    onReplace: () => void;
    onInsert: () => void;
    onCancel: () => void;
}

/**
 * Shown when the user picks a template while intro or outro already has content.
 * Forces an explicit choice — never silently overwrites.
 */
export default function ApplyTemplateModal({
    isOpen,
    templateName,
    onReplace,
    onInsert,
    onCancel,
}: ApplyTemplateModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div
                className="w-full max-w-md rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--bg-card)] shadow-2xl animate-slide-up"
                role="dialog"
                aria-modal="true"
                aria-labelledby="apply-template-title"
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-[var(--border)]">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[var(--radius)] border border-[var(--accent-border)] bg-[var(--accent-glow)]">
                            <LayoutTemplate className="h-5 w-5 text-[var(--accent)]" />
                        </div>
                        <div>
                            <h2 id="apply-template-title" className="text-base font-semibold text-[var(--text-primary)]">
                                Apply Template?
                            </h2>
                            <p className="mt-0.5 text-sm text-[var(--text-muted)]">
                                You already have content. How should{" "}
                                <span className="font-semibold text-[var(--text-secondary)]">{templateName}</span>{" "}
                                be applied?
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onCancel}
                        className="mt-0.5 rounded-[var(--radius)] p-1.5 text-[var(--text-muted)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                        aria-label="Cancel"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Options */}
                <div className="flex flex-col gap-2.5 px-6 py-5">
                    {/* Option 1: Replace */}
                    <button
                        onClick={onReplace}
                        className="group flex items-start gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-4 text-left transition-all hover:border-[var(--danger-border)] hover:bg-[var(--danger-bg)]/30"
                    >
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[var(--radius)] border border-[var(--danger-border)] bg-[var(--danger-bg)]/40 transition-colors group-hover:bg-[var(--danger-bg)]/70">
                            <Trash2 className="h-4 w-4 text-[var(--danger)]" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-[var(--text-primary)]">
                                Replace Content
                            </p>
                            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                                Clears your intro & outro, then applies the template as the full email body.
                            </p>
                        </div>
                    </button>

                    {/* Option 2: Insert */}
                    <button
                        onClick={onInsert}
                        className="group flex items-start gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-4 text-left transition-all hover:border-[var(--accent-border)] hover:bg-[var(--accent)]/5"
                    >
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[var(--radius)] border border-[var(--accent-border)] bg-[var(--accent-glow)] transition-colors group-hover:bg-[var(--accent)]/15">
                            <Plus className="h-4 w-4 text-[var(--accent)]" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-[var(--text-primary)]">
                                Insert Template
                            </p>
                            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                                Keeps your intro & outro. The template will sit between them as a middle layer.
                            </p>
                        </div>
                    </button>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end px-6 pb-5">
                    <Button variant="ghost" size="sm" onClick={onCancel}>
                        Cancel — keep current content
                    </Button>
                </div>
            </div>
        </div>
    );
}
