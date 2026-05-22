"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
    LayoutTemplate,
    AtSign,
    Paperclip,
    Eye,
    X,
    Check,
    ChevronDown,
    Loader2,
    Search,
    ShieldCheck,
    AlertTriangle,
    RefreshCw,
    Unlock,
    Lock,
    Sparkles,
    Plus,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui";
import ApplyTemplateModal from "../ApplyTemplateModal";

// ─── Types ────────────────────────────────────────────────────────────────────

type ActivePanel = "template" | "personalize" | "attach" | "preview" | null;
type PreviewState = "ideal" | "partial" | "missing";

interface EmailLayer {
    intro: string;
    templateId: string;
    templateName: string;
    templateSnapshot: string;
    outro: string;
}

interface Step3Props {
    data: any;
    updateData: (patch: any) => void;
    onNext: () => void;
    onBack: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PERSONALIZATION_TAGS = [
    { label: "First Name",  macro: '{{first_name || "there"}}',         shortLabel: "first_name"  },
    { label: "Full Name",   macro: '{{full_name || "Valued Customer"}}', shortLabel: "full_name"   },
    { label: "Last Name",   macro: '{{last_name || "Customer"}}',        shortLabel: "last_name"   },
    { label: "Email",       macro: '{{email || "Subscriber"}}',          shortLabel: "email"       },
    { label: "Company",     macro: '{{company || "your company"}}',      shortLabel: "company"     },
];

const MOCK_CONTACTS = {
    ideal:   { first_name: "Rahul",  last_name: "Sharma",  full_name: "Rahul Sharma",  email: "rahul@example.com",  company: "Acme Inc" },
    partial: { first_name: null,     last_name: null,      full_name: "Rahul Sharma",  email: "rahul@example.com",  company: null       },
    missing: { first_name: null,     last_name: null,      full_name: null,            email: null,                 company: null       },
} as const;

// ─── Pure helpers (unchanged logic) ──────────────────────────────────────────

function deriveMode(intro: string, templateId: string, outro: string) {
    if (!templateId) return "compose";
    if (!intro.trim() && !outro.trim()) return "template";
    return "hybrid";
}

function wrapText(text: string): string {
    if (!text.trim()) return "";
    // color:#111 is intentional — this HTML is sent to email clients (always-light)
    return `<div style="font-family:sans-serif;font-size:14px;line-height:1.75;color:#111;">${text.replace(/\n/g, "<br/>")}</div>`;
}

function buildFinalHTML(layer: EmailLayer): string {
    const parts: string[] = [];
    if (layer.intro.trim())            parts.push(wrapText(layer.intro));
    if (layer.templateSnapshot.trim()) parts.push(layer.templateSnapshot);
    if (layer.outro.trim())            parts.push(wrapText(layer.outro));
    return parts.join("\n");
}

function resolveTag(inner: string, state: PreviewState): string {
    const clean = inner.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (!clean) return "";
    const [dynamicPart, fallback = ""] = clean.split("||", 2);
    const keys = dynamicPart.split("|").map((c) => c.trim().toLowerCase());
    const contact = MOCK_CONTACTS[state] as Record<string, string | null>;
    for (const k of keys) { if (contact[k]) return contact[k]!; }
    return fallback.trim().replace(/^["']|["']$/g, "") || `[Missing ${keys[0]}]`;
}

function renderForPreview(text: string, state: PreviewState): string {
    return text.replace(/\{\{(.*?)\}\}/g, (_, inner) => resolveTag(inner, state));
}

function isTagSafe(text: string): boolean {
    return [...text.matchAll(/\{\{(.*?)\}\}/g)].every((m) => m[1].includes("||"));
}

// Insert a macro at the cursor of a textarea
function insertAtCursor(
    el: HTMLTextAreaElement,
    text: string,
    macro: string
): string {
    const s = el.selectionStart ?? text.length;
    const e = el.selectionEnd   ?? text.length;
    return text.slice(0, s) + macro + text.slice(e);
}

// ─── Expandable Panel Wrapper ─────────────────────────────────────────────────

function Panel({ open, children }: { open: boolean; children: React.ReactNode }) {
    return (
        <div
            className="overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ maxHeight: open ? "1200px" : "0px", opacity: open ? 1 : 0 }}
        >
            <div className="pt-2 pb-1">{children}</div>
        </div>
    );
}

// ─── Toolbar Action Button ─────────────────────────────────────────────────────

function ToolbarBtn({
    icon: Icon,
    label,
    active,
    badge,
    onClick,
}: {
    icon: React.ElementType;
    label: string;
    active: boolean;
    badge?: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`group flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-150 active:scale-95 ${
                active
                    ? "bg-[var(--accent)] text-white shadow-sm shadow-[var(--accent)]/30"
                    : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
            }`}
        >
            <Icon className={`h-3.5 w-3.5 transition-transform duration-150 ${active ? "" : "group-hover:scale-110"}`} />
            <span className="hidden sm:inline">{label}</span>
            {badge && (
                <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wide ${
                    active ? "bg-white/20 text-white" : "bg-[var(--accent)]/10 text-[var(--accent)]"
                }`}>
                    {badge}
                </span>
            )}
        </button>
    );
}

// ─── Template Thumbnail ───────────────────────────────────────────────────────

function TemplateThumbnail({ html, name }: { html: string; name: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [scale, setScale]   = useState(0.3);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (!ref.current) return;
        const update = () => { const w = ref.current?.offsetWidth || 200; setScale(w / 600); };
        update();
        const obs = new ResizeObserver(update);
        obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);

    return (
        <div ref={ref} className="relative h-full w-full overflow-hidden"
            style={{ opacity: loaded ? 1 : 0.6, transition: "opacity 0.4s ease" }}>
            {html ? (
                <div style={{
                    width: 600, height: ref.current ? `${ref.current.offsetHeight / scale}px` : "400px",
                    transform: `scale(${scale})`, transformOrigin: "top left",
                    pointerEvents: "none", position: "absolute", top: 0, left: 0,
                }}>
                    <iframe srcDoc={html} title={`Preview ${name}`} onLoad={() => setLoaded(true)}
                        style={{ width: "100%", height: "100%", border: "none" }} />
                </div>
            ) : (
                <div className="flex h-full w-full items-center justify-center bg-[var(--bg-secondary)]">
                    <LayoutTemplate className="h-8 w-8 text-[var(--text-muted)] opacity-20" />
                </div>
            )}
        </div>
    );
}

// ─── Personalization Panel ────────────────────────────────────────────────────

function PersonalizePanel({ onInsert }: { onInsert: (macro: string) => void }) {
    return (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-sm)]">
            <p className="mb-3 text-xs font-semibold text-[var(--text-muted)]">
                Click a tag to insert it at your cursor position. All tags include a safe fallback.
            </p>
            <div className="flex flex-wrap gap-2">
                {PERSONALIZATION_TAGS.map((tag) => (
                    <button
                        key={tag.label}
                        type="button"
                        onClick={() => onInsert(tag.macro)}
                        className="group flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-left transition-all duration-150 hover:border-[var(--accent-border)] hover:bg-[var(--accent)]/5 hover:shadow-sm active:scale-95"
                    >
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--accent)]/10">
                            <Plus className="h-3 w-3 text-[var(--accent)]" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-[var(--text-primary)]">{tag.label}</p>
                            <p className="font-mono text-[9px] text-[var(--text-muted)]">{`{{${tag.shortLabel} || …}}`}</p>
                        </div>
                    </button>
                ))}
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[var(--text-muted)]">
                <ShieldCheck className="h-3.5 w-3.5 text-[var(--success)]" />
                <p className="text-[11px] text-[var(--text-muted)]">
                    Every tag has a <code className="font-mono text-[var(--accent)]">||</code> fallback — safe to send even with missing contact data.
                </p>
            </div>
        </div>
    );
}

// ─── Template Panel ───────────────────────────────────────────────────────────

function TemplatePanel({
    templateId, templateName, templateSnapshot, templateUnlocked,
    templates, loading, search,
    onSearch, onSelect, onUnlock, onChangeSnapshot, onRemove,
}: {
    templateId: string;
    templateName: string;
    templateSnapshot: string;
    templateUnlocked: boolean;
    templates: any[];
    loading: boolean;
    search: string;
    onSearch: (v: string) => void;
    onSelect: (t: any) => void;
    onUnlock: () => void;
    onChangeSnapshot: (html: string) => void;
    onRemove: () => void;
}) {
    const filtered = templates.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));

    if (templateId) {
        return (
            <div className="rounded-2xl border border-[var(--accent-border)] bg-[var(--bg-card)] overflow-hidden shadow-[0_2px_16px_rgba(37,88,217,0.08)]">
                {/* Selected template header */}
                <div className="flex items-center gap-3 border-b border-[var(--accent-border)]/50 bg-[var(--accent)]/[0.04] px-4 py-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent)]/[0.12]">
                        <LayoutTemplate className="h-3.5 w-3.5 text-[var(--accent)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{templateName}</p>
                        <p className="text-[10px] text-[var(--accent)]/70">Snapshot · frozen to this campaign</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                            type="button" onClick={onUnlock}
                            className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
                                templateUnlocked
                                    ? "border-[var(--warning-border)] bg-[var(--warning-bg)]/50 text-[var(--warning)]"
                                    : "border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                            }`}
                        >
                            {templateUnlocked ? <><Unlock className="h-3 w-3" /> Editing</> : <><Lock className="h-3 w-3" /> Edit</>}
                        </button>
                        <button
                            type="button" onClick={onRemove}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--danger-border)] hover:bg-[var(--danger-bg)]/40 hover:text-[var(--danger)] transition-all"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                {templateUnlocked ? (
                    <div className="p-4">
                        <div className="mb-2 flex items-center gap-1.5 rounded-xl border border-[var(--warning-border)] bg-[var(--warning-bg)]/40 px-3 py-2">
                            <AlertTriangle className="h-3 w-3 text-[var(--warning)]" />
                            <p className="text-[11px] text-[var(--warning)]">Editing snapshot — changes are local to this campaign only.</p>
                        </div>
                        <textarea
                            value={templateSnapshot} onChange={(e) => onChangeSnapshot(e.target.value)}
                            rows={10}
                            className="w-full resize-y rounded-xl border border-[var(--warning-border)] bg-[var(--bg-input)] px-4 py-3 font-mono text-xs leading-relaxed outline-none transition-all focus:ring-2 focus:ring-[var(--warning)]/20"
                            placeholder="<html>...</html>"
                        />
                    </div>
                ) : (
                    <div className="h-[180px]">
                        <TemplateThumbnail html={templateSnapshot} name={templateName} />
                    </div>
                )}
            </div>
        );
    }

    // No template — show library browser
    return (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden shadow-[var(--shadow-sm)]">
            <div className="p-4">
                {/* Search */}
                <div className="relative mb-3">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                        type="text" placeholder="Search templates…" value={search}
                        onChange={(e) => onSearch(e.target.value)}
                        className="h-9 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-input)] pl-9 pr-4 text-sm placeholder:text-[var(--text-muted)] outline-none transition-all focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15"
                    />
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-8 gap-2 text-[var(--text-muted)]">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-xs">Loading…</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-8 text-center">
                        <LayoutTemplate className="mx-auto mb-2 h-7 w-7 text-[var(--text-muted)] opacity-30" />
                        <p className="text-sm text-[var(--text-secondary)]">No templates found</p>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">Build one in <strong>Templates → Editor</strong></p>
                    </div>
                ) : (
                    <div className="grid max-h-[280px] grid-cols-3 gap-2.5 overflow-y-auto">
                        {filtered.map((t) => (
                            <button
                                key={t.id} type="button" onClick={() => onSelect(t)}
                                className="group relative overflow-hidden rounded-xl border border-[var(--border)] text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-border)] hover:shadow-md"
                            >
                                <div className="relative aspect-[4/3] overflow-hidden bg-[var(--bg-secondary)]">
                                    <TemplateThumbnail html={t.compiled_html} name={t.name} />
                                    <div className="absolute inset-0 flex items-center justify-center bg-[var(--accent)]/10 opacity-0 transition-opacity group-hover:opacity-100">
                                        <div className="rounded-full bg-[var(--accent)] px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
                                            Use this
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-[var(--bg-card)] px-2.5 py-2">
                                    <p className="truncate text-xs font-semibold text-[var(--text-primary)]">{t.name}</p>
                                    <p className="truncate text-[10px] text-[var(--text-muted)]">
                                        {new Date(t.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Attach Panel ─────────────────────────────────────────────────────────────

function AttachPanel({ attachments, fileRef, onPick, onRemove }: {
    attachments: File[];
    fileRef: React.RefObject<HTMLInputElement | null>;
    onPick: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove: (i: number) => void;
}) {
    return (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-sm)]">
            <div
                onClick={() => fileRef.current?.click()}
                className="group flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[var(--border)] px-4 py-3.5 transition-all hover:border-[var(--accent-border)] hover:bg-[var(--accent)]/[0.03]"
            >
                <Paperclip className="h-4 w-4 text-[var(--text-muted)] transition-colors duration-150 group-hover:text-[var(--accent)]" />
                <div>
                    <p className="text-sm font-medium text-[var(--text-secondary)] transition-colors duration-150 group-hover:text-[var(--text-primary)]">
                        Click to attach files
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">PDF, PNG, JPG, DOCX — up to 5 files</p>
                </div>
                <input ref={fileRef} type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.docx,.xlsx,.csv" onChange={onPick} className="hidden" />
            </div>

            {attachments.length > 0 && (
                <div className="mt-3 flex flex-col gap-1.5">
                    {attachments.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-3.5 py-2.5">
                            <div className="flex items-center gap-2.5">
                                <Paperclip className="h-3.5 w-3.5 text-[var(--accent)]" />
                                <span className="text-sm font-medium text-[var(--text-primary)]">{file.name}</span>
                                <span className="text-xs text-[var(--text-muted)]">{(file.size / 1024).toFixed(0)} KB</span>
                            </div>
                            <button type="button" onClick={() => onRemove(idx)} className="p-1 text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors">
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Preview Panel ────────────────────────────────────────────────────────────
//
// Uses an iframe with a full HTML document for two reasons:
//   1. Template snapshots may be complete <html>…</html> documents — injecting them
//      inline via dangerouslySetInnerHTML breaks the outer DOM.
//   2. Email preview should always appear on a white background regardless of the
//      app's light/dark mode — an isolated iframe guarantees this.

interface PreviewPanelProps {
    intro: string;
    templateSnapshot: string;
    outro: string;
}

/** Extract body content from a full HTML document or return the fragment as-is. */
function extractBodyContent(html: string): string {
    if (!html.includes("<html")) return html;
    const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    return match ? match[1] : html;
}

/** Build a self-contained HTML document for the preview iframe. */
function buildPreviewDoc(intro: string, templateSnapshot: string, outro: string, state: PreviewState): string {
    const TEXT_STYLE = "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.75;color:#111111;margin:0 0 16px;";

    const parts: string[] = [];

    if (intro.trim()) {
        const substituted = renderForPreview(intro, state).replace(/\n/g, "<br/>");
        parts.push(`<div style="${TEXT_STYLE}">${substituted}</div>`);
    }

    if (templateSnapshot.trim()) {
        // Template snapshots may include full <html> docs — extract just the body
        parts.push(extractBodyContent(templateSnapshot));
    }

    if (outro.trim()) {
        const substituted = renderForPreview(outro, state).replace(/\n/g, "<br/>");
        parts.push(`<div style="${TEXT_STYLE}margin-top:16px;">${substituted}</div>`);
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #ffffff; }
    body { padding: 28px 32px 36px; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>${parts.join("\n")}</body>
</html>`;
}

function PreviewPanel({ intro, templateSnapshot, outro }: PreviewPanelProps) {
    const [state, setState] = useState<PreviewState>("ideal");
    // Iframe ref — we update srcDoc via the ref to avoid React re-mounting the iframe
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const [iframeHeight, setIframeHeight] = useState(200);
    const hasContent = intro.trim() || templateSnapshot.trim() || outro.trim();

    const TABS: { id: PreviewState; label: string; danger?: boolean }[] = [
        { id: "ideal",   label: "Ideal data"    },
        { id: "partial", label: "Partial data"  },
        { id: "missing", label: "Missing data", danger: true },
    ];

    // Rebuild doc whenever inputs or preview-state changes
    const previewDoc = hasContent ? buildPreviewDoc(intro, templateSnapshot, outro, state) : "";

    // Write to iframe document directly (no src change = no flicker)
    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) return;
        doc.open();
        doc.write(previewDoc);
        doc.close();
        // Measure content height after paint
        const onLoad = () => {
            const body = iframe.contentDocument?.body;
            if (body) setIframeHeight(Math.max(160, body.scrollHeight + 4));
        };
        iframe.addEventListener("load", onLoad, { once: true });
        // Fallback: measure after 400 ms (for templates with async resources)
        const t = setTimeout(() => {
            const body = iframe.contentDocument?.body;
            if (body) setIframeHeight(Math.max(160, body.scrollHeight + 4));
        }, 400);
        return () => clearTimeout(t);
    }, [previewDoc]);

    return (
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]">
            {/* Email client chrome */}
            <div className="flex items-center gap-3 border-b border-[var(--border)] bg-[var(--bg-secondary)] px-5 py-3">
                <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                    <div className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                    <div className="h-2.5 w-2.5 rounded-full bg-[#28c940]" />
                </div>
                <span className="ml-1 flex-1 text-center text-[10px] font-medium text-[var(--text-muted)] opacity-60">
                    {state === "ideal" ? "All contact data available" : state === "partial" ? "Some fields missing" : "No contact data"}
                </span>
                {/* Tab switcher */}
                <div className="flex items-center gap-0.5 rounded-full border border-[var(--border)] bg-[var(--bg-primary)] p-0.5">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id} onClick={() => setState(tab.id)}
                            className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-all duration-150 ${
                                state === tab.id
                                    ? tab.danger ? "bg-[var(--danger)] text-white shadow-sm" : "bg-[var(--accent)] text-white shadow-sm"
                                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Email body — always white regardless of app theme */}
            {hasContent ? (
                <div className="bg-white" style={{ height: iframeHeight }}>
                    <iframe
                        ref={iframeRef}
                        title="Email Preview"
                        sandbox="allow-same-origin"
                        style={{ width: "100%", height: "100%", border: "none", display: "block" }}
                    />
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center bg-[var(--bg-secondary)] py-10 text-center">
                    <Sparkles className="mb-2 h-6 w-6 text-[var(--text-muted)] opacity-25" />
                    <p className="text-sm text-[var(--text-muted)] opacity-60">Write something to see the preview…</p>
                </div>
            )}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Step3Content({ data, updateData, onNext, onBack }: Step3Props) {
    const { token } = useAuth();

    // ── State ─────────────────────────────────────────────────────────────────
    const [intro,            setIntroRaw]         = useState<string>(data.intro            || "");
    const [outro,            setOutroRaw]         = useState<string>(data.outro            || "");
    const [templateId,       setTemplateId]       = useState<string>(data.templateId       || "");
    const [templateName,     setTemplateName]     = useState<string>(data.templateName     || "");
    const [templateSnapshot, setTemplateSnapshot] = useState<string>(data.templateSnapshot || "");
    const [templateUnlocked, setTemplateUnlocked] = useState(false);

    const [templates,        setTemplates]        = useState<any[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const [search,           setSearch]           = useState("");

    const [attachments,      setAttachments]      = useState<File[]>(data.attachments || []);
    const fileRef = useRef<HTMLInputElement>(null);

    const [pendingTemplate,  setPendingTemplate]  = useState<any | null>(null);

    // ONE active panel at a time
    const [activePanel, setActivePanel]           = useState<ActivePanel>(null);

    // Outro reveal
    const [showOutro,        setShowOutro]        = useState(!!data.outro);

    // Refs
    const mainTextareaRef = useRef<HTMLTextAreaElement | null>(null);
    const outroRef        = useRef<HTMLTextAreaElement | null>(null);

    // ── Derived ───────────────────────────────────────────────────────────────
    const layer: EmailLayer = { intro, templateId, templateName, templateSnapshot, outro };
    const finalHTML   = buildFinalHTML(layer);
    const canProceed  = finalHTML.trim().length > 0;
    const allTagsSafe = isTagSafe(intro) && isTagSafe(outro);
    const mode        = deriveMode(intro, templateId, outro);

    // ── Panel toggle — only one open at a time ────────────────────────────────
    const togglePanel = (panel: ActivePanel) => {
        setActivePanel((cur) => (cur === panel ? null : panel));
    };

    // ── Template library fetch (lazy) ─────────────────────────────────────────
    useEffect(() => {
        if (activePanel !== "template" || !token || templates.length > 0) return;
        setLoadingTemplates(true);
        const API_BASE = process.env.NEXT_PUBLIC_API_URL;
        fetch(`${API_BASE}/templates?page=1&limit=50`, { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => (r.ok ? r.json() : { data: [] }))
            .then((json) => {
                setTemplates(Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : []);
            })
            .catch(() => setTemplates([]))
            .finally(() => setLoadingTemplates(false));
    }, [activePanel, token, templates.length]);

    // ── Tag insertion — always targets the focused textarea ───────────────────
    const insertTag = (macro: string) => {
        // Prefer whichever textarea had focus last
        const el = outroRef.current && document.activeElement === outroRef.current
            ? outroRef.current
            : mainTextareaRef.current;

        if (!el) {
            setIntroRaw((v) => v + macro);
            return;
        }

        const isOutro = el === outroRef.current;
        const currentText = isOutro ? outro : intro;
        const next = insertAtCursor(el, currentText, macro);

        if (isOutro) setOutroRaw(next);
        else         setIntroRaw(next);

        requestAnimationFrame(() => {
            el.focus();
            const pos = (el.selectionStart ?? currentText.length) + macro.length;
            el.setSelectionRange(pos, pos);
        });
    };

    // ── Template apply logic ──────────────────────────────────────────────────
    const hasContent = intro.trim() !== "" || outro.trim() !== "";

    const applyTemplate = (t: any, applyMode: "replace" | "insert") => {
        if (applyMode === "replace") { setIntroRaw(""); setOutroRaw(""); }
        setTemplateId(t.id);
        setTemplateName(t.name);
        setTemplateSnapshot(t.compiled_html || "");
        setTemplateUnlocked(false);
        setPendingTemplate(null);
        setActivePanel("template"); // keep template panel open to show result
    };

    const handleTemplateSelect = (t: any) => {
        if (hasContent) setPendingTemplate(t);
        else applyTemplate(t, "insert");
    };

    const handleRemoveTemplate = () => {
        setTemplateId(""); setTemplateName(""); setTemplateSnapshot(""); setTemplateUnlocked(false);
    };

    // ── Attachments ───────────────────────────────────────────────────────────
    const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setAttachments((prev) => [...prev, ...files].slice(0, 5));
    };
    const removeFile = (idx: number) => setAttachments((prev) => prev.filter((_, i) => i !== idx));

    // ── Auto-expand textarea ──────────────────────────────────────────────────
    const autoResize = (el: HTMLTextAreaElement | null) => {
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
    };

    useEffect(() => { autoResize(mainTextareaRef.current); }, [intro]);
    useEffect(() => { autoResize(outroRef.current); }, [outro]);

    // ── Debounced parent sync ─────────────────────────────────────────────────
    const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const syncToParent = useCallback(() => {
        if (syncTimer.current) clearTimeout(syncTimer.current);
        syncTimer.current = setTimeout(() => {
            updateData({
                intro, outro, templateId, templateName, templateSnapshot,
                htmlContent: buildFinalHTML({ intro, templateId, templateName, templateSnapshot, outro }),
                attachments,
            });
        }, 300);
    }, [intro, outro, templateId, templateName, templateSnapshot, attachments, updateData]);

    useEffect(() => {
        syncToParent();
        return () => { if (syncTimer.current) clearTimeout(syncTimer.current); };
    }, [syncToParent]);

    // ─── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            <ApplyTemplateModal
                isOpen={!!pendingTemplate}
                templateName={pendingTemplate?.name || ""}
                onReplace={() => pendingTemplate && applyTemplate(pendingTemplate, "replace")}
                onInsert={()  => pendingTemplate && applyTemplate(pendingTemplate, "insert")}
                onCancel={() => setPendingTemplate(null)}
            />

            <div className="flex flex-col">

                {/* ── Compact header ──────────────────────────────────────── */}
                <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-8 py-5">
                    <div>
                        <h2 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">Write your email</h2>
                        <p className="mt-0.5 text-sm text-[var(--text-muted)]">
                            Write your message below. Use the toolbar to add templates, tags, or attachments.
                        </p>
                    </div>
                    {/* Subtle mode dot — no jargon */}
                    {templateId && (
                        <div className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-[var(--accent-border)] bg-[var(--accent)]/8 px-3 py-1.5">
                            <LayoutTemplate className="h-3 w-3 text-[var(--accent)]" />
                            <span className="text-[11px] font-semibold text-[var(--accent)] truncate max-w-[120px]">{templateName}</span>
                        </div>
                    )}
                </div>

                {/* ── Hero writing area ────────────────────────────────────── */}
                <div className="px-8 pt-6 pb-3">
                    <textarea
                        ref={mainTextareaRef}
                        value={intro}
                        onChange={(e) => { setIntroRaw(e.target.value); autoResize(e.target); }}
                        placeholder={`Hi {{first_name || "there"}},\n\nWrite your message here…`}
                        rows={8}
                        className="block w-full resize-none rounded-2xl border-0 bg-[var(--bg-secondary)]/50 px-5 py-5 text-[15px] leading-[1.8] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50 outline-none ring-0 transition-all duration-200 hover:bg-[var(--bg-secondary)]/80 focus:bg-[var(--bg-input)] focus:shadow-[0_0_0_2px_var(--accent-glow),0_4px_20px_rgba(0,0,0,0.06)]"
                        style={{ minHeight: "200px" }}
                    />

                    {/* Tag safety indicator — only shows when tags are present */}
                    {intro.match(/\{\{/) && (
                        <div className={`mt-2 flex items-center gap-1.5 px-1 ${allTagsSafe ? "text-[var(--success)]" : "text-[var(--warning)]"}`}>
                            {allTagsSafe
                                ? <><ShieldCheck className="h-3.5 w-3.5" /><span className="text-xs font-semibold">All tags have fallbacks · safe to send</span></>
                                : <><AlertTriangle className="h-3.5 w-3.5" /><span className="text-xs font-semibold">Some tags are missing fallbacks — contacts may see blank values</span></>
                            }
                        </div>
                    )}
                </div>

                {/* ── Template insertion point ─────────────────────────────── */}
                {templateId && !templateUnlocked && (
                    <div className="px-8 py-1">
                        <div className="flex items-center gap-3">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--accent-border)] to-transparent" />
                            <div className="flex items-center gap-2 rounded-full border border-[var(--accent-border)] bg-[var(--accent)]/6 px-3 py-1">
                                <LayoutTemplate className="h-3 w-3 text-[var(--accent)]" />
                                <span className="text-[11px] font-semibold text-[var(--accent)]">{templateName}</span>
                                <button type="button" onClick={handleRemoveTemplate} className="ml-1 text-[var(--accent)]/50 hover:text-[var(--danger)] transition-colors">
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[var(--accent-border)] to-transparent" />
                        </div>
                    </div>
                )}

                {/* ── Outro — hidden by default, expands when user adds one ── */}
                {showOutro ? (
                    <div className="px-8 py-2">
                        <div className="relative">
                            <textarea
                                ref={outroRef}
                                value={outro}
                                onChange={(e) => { setOutroRaw(e.target.value); autoResize(e.target); }}
                                placeholder={"Best regards,\nYour Team"}
                                rows={3}
                                className="block w-full resize-none rounded-2xl border-0 bg-[var(--bg-secondary)]/50 px-5 py-4 text-[15px] leading-[1.8] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50 outline-none transition-all duration-200 hover:bg-[var(--bg-secondary)]/80 focus:bg-[var(--bg-input)] focus:shadow-[0_0_0_2px_var(--accent-glow),0_4px_20px_rgba(0,0,0,0.06)]"
                            />
                            {/* Remove outro */}
                            {!outro.trim() && (
                                <button
                                    type="button"
                                    onClick={() => setShowOutro(false)}
                                    className="absolute right-3 top-3 rounded-lg p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
                                    aria-label="Remove closing"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="px-8 py-1">
                        <button
                            type="button"
                            onClick={() => setShowOutro(true)}
                            className="group flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-xs text-[var(--text-muted)] transition-all hover:text-[var(--text-secondary)]"
                        >
                            <Plus className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                            Add a closing
                        </button>
                    </div>
                )}

                {/* ── Toolbar ──────────────────────────────────────────────── */}
                <div className="mx-8 my-4 flex items-center gap-1 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-1.5 shadow-[var(--shadow-sm)]">
                    <ToolbarBtn
                        icon={LayoutTemplate}
                        label="Template"
                        active={activePanel === "template"}
                        badge={templateId ? "1" : undefined}
                        onClick={() => togglePanel("template")}
                    />
                    <ToolbarBtn
                        icon={AtSign}
                        label="Personalize"
                        active={activePanel === "personalize"}
                        onClick={() => togglePanel("personalize")}
                    />
                    <ToolbarBtn
                        icon={Paperclip}
                        label="Attach"
                        active={activePanel === "attach"}
                        badge={attachments.length > 0 ? String(attachments.length) : undefined}
                        onClick={() => togglePanel("attach")}
                    />
                    <ToolbarBtn
                        icon={Eye}
                        label="Preview"
                        active={activePanel === "preview"}
                        onClick={() => togglePanel("preview")}
                    />

                    {/* Right: character count / word count */}
                    <div className="ml-auto flex items-center gap-2 px-2">
                        {intro.trim() && (
                            <span className="text-[11px] text-[var(--text-muted)]">
                                {intro.trim().split(/\s+/).length} words
                            </span>
                        )}
                        {!canProceed && (
                            <span className="text-[11px] text-[var(--text-muted)] opacity-60">
                                Write to continue
                            </span>
                        )}
                    </div>
                </div>

                {/* ── Expandable Panels (one at a time) ───────────────────── */}
                <div className="px-8">
                    {/* Template */}
                    <Panel open={activePanel === "template"}>
                        <TemplatePanel
                            templateId={templateId}
                            templateName={templateName}
                            templateSnapshot={templateSnapshot}
                            templateUnlocked={templateUnlocked}
                            templates={templates}
                            loading={loadingTemplates}
                            search={search}
                            onSearch={setSearch}
                            onSelect={handleTemplateSelect}
                            onUnlock={() => setTemplateUnlocked((u) => !u)}
                            onChangeSnapshot={setTemplateSnapshot}
                            onRemove={handleRemoveTemplate}
                        />
                    </Panel>

                    {/* Personalize */}
                    <Panel open={activePanel === "personalize"}>
                        <PersonalizePanel onInsert={insertTag} />
                    </Panel>

                    {/* Attach */}
                    <Panel open={activePanel === "attach"}>
                        <AttachPanel
                            attachments={attachments}
                            fileRef={fileRef}
                            onPick={handleFilePick}
                            onRemove={removeFile}
                        />
                    </Panel>

                    {/* Preview */}
                    <Panel open={activePanel === "preview"}>
                        <PreviewPanel
                            intro={intro}
                            templateSnapshot={templateSnapshot}
                            outro={outro}
                        />
                    </Panel>
                </div>

                {/* Spacer */}
                <div className="h-4" />

                {/* ── Footer nav ───────────────────────────────────────────── */}
                <div className="flex items-center justify-between border-t border-[var(--border)] px-8 py-5">
                    <Button onClick={onBack} variant="ghost">← Back</Button>
                    <div className="flex items-center gap-3">
                        {!allTagsSafe && intro.match(/\{\{/) && (
                            <div className="flex items-center gap-1.5 rounded-full border border-[var(--warning-border)] bg-[var(--warning-bg)]/40 px-3 py-1.5">
                                <AlertTriangle className="h-3 w-3 text-[var(--warning)]" />
                                <span className="text-[11px] font-semibold text-[var(--warning)]">Review tag fallbacks</span>
                            </div>
                        )}
                        <Button onClick={onNext} disabled={!canProceed}>
                            Next Step →
                        </Button>
                    </div>
                </div>

            </div>
        </>
    );
}
