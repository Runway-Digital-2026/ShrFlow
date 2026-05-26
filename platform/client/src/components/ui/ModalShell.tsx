'use client';

import { HTMLAttributes, ReactNode, useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

interface ModalShellProps extends HTMLAttributes<HTMLDivElement> {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    maxWidthClass?: string;
    headerAction?: ReactNode;
    children?: ReactNode;
    className?: string;
}

function ModalShell({
    isOpen,
    onClose,
    title,
    description,
    maxWidthClass = 'max-w-lg',
    headerAction,
    className = '',
    children,
    ...props
}: ModalShellProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLElement | null>(null);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
            return;
        }

        if (e.key === 'Tab' && modalRef.current) {
            const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusableElements.length === 0) return;
            
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        }
    }, [onClose]);

    // Handle keyboard listener
    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, handleKeyDown]);

    // Handle modal lifecycle (overflow and initial focus)
    useEffect(() => {
        if (isOpen) {
            triggerRef.current = document.activeElement as HTMLElement | null;
            document.body.style.overflow = 'hidden';
            
            const timeoutId = setTimeout(() => {
                const firstInteractive = modalRef.current?.querySelector<HTMLElement>(
                    'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
                );
                if (firstInteractive) {
                    firstInteractive.focus();
                }
            }, 10);
            return () => {
                clearTimeout(timeoutId);
                document.body.style.overflow = '';
                // Restore focus
                if (triggerRef.current) {
                    triggerRef.current.focus();
                }
            };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in" 
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Container */}
            <div 
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-shell-title"
                aria-describedby={description ? "modal-shell-description" : undefined}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
                <div
                    ref={modalRef}
                    className={`w-full ${maxWidthClass} max-h-[80vh] overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] shadow-2xl animate-fade-in ${className}`}
                    onClick={e => e.stopPropagation()}
                    {...props}
                >
                    <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-6 py-5">
                        <div>
                            <h2 id="modal-shell-title" className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
                            {description && <p id="modal-shell-description" className="mt-1 text-sm text-[var(--text-muted)]">{description}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                            {headerAction}
                            <button
                                onClick={onClose}
                                className="rounded-[var(--radius)] p-1 text-[var(--text-muted)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                                aria-label="Close dialog"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                    <div className="px-6 py-5">
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
}

export { ModalShell };
