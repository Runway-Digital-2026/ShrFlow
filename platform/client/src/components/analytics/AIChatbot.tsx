'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Loader2, Bot, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export function AIChatbot({ token }: { token: string | null }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: 'Hi! I\'m your analytics assistant. Ask me anything about your email metrics — for example, "Why is my click rate low?" or "What\'s my bounce rate trend?"',
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const sendMessage = async () => {
        if (!input.trim() || sending || !token) return;

        const userMsg: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setSending(true);

        try {
            const res = await fetch(`${API_BASE}/analytics/chat`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: userMsg.content }),
            });

            if (res.ok) {
                const data = await res.json();
                const assistantMsg: Message = {
                    id: `assistant-${Date.now()}`,
                    role: 'assistant',
                    content: data.response || 'I could not process that query.',
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, assistantMsg]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    { id: `err-${Date.now()}`, role: 'assistant', content: 'Something went wrong. Please try again.', timestamp: new Date() },
                ]);
            }
        } catch {
            setMessages((prev) => [
                ...prev,
                { id: `err-${Date.now()}`, role: 'assistant', content: 'Failed to connect. Please check your network.', timestamp: new Date() },
            ]);
        } finally {
            setSending(false);
        }
    };

    const suggestions = [
        'Why is my click rate low?',
        'What\'s my open rate?',
        'How to reduce bounces?',
    ];

    return (
        <>
            {/* Floating trigger button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
                style={{
                    background: 'linear-gradient(135deg, var(--accent), var(--ai-accent, var(--accent)))',
                }}
                aria-label={isOpen ? 'Close AI Chat' : 'Open AI Chat'}
            >
                {isOpen ? (
                    <X className="h-6 w-6 text-white" />
                ) : (
                    <MessageCircle className="h-6 w-6 text-white" />
                )}
            </button>

            {/* Chat panel */}
            <div
                className={`fixed bottom-24 right-6 z-50 flex w-[380px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-2xl transition-all duration-300 ${
                    isOpen ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-4 scale-95 opacity-0'
                }`}
                style={{ height: '520px' }}
            >
                {/* Header */}
                <div
                    className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-4"
                    style={{ background: 'linear-gradient(135deg, var(--accent)/10, var(--ai-accent, var(--accent))/5)' }}
                >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)]/15">
                        <Sparkles className="h-5 w-5 text-[var(--accent)]" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-[var(--text-primary)]">AI Analytics Assistant</h3>
                        <p className="text-xs text-[var(--text-muted)]">Ask about your email performance</p>
                    </div>
                </div>

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            <div
                                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${
                                    msg.role === 'assistant'
                                        ? 'bg-[var(--accent)]/15 text-[var(--accent)]'
                                        : 'bg-[var(--bg-muted)] text-[var(--text-muted)]'
                                }`}
                            >
                                {msg.role === 'assistant' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                            </div>
                            <div
                                className={`max-w-[75%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                                    msg.role === 'user'
                                        ? 'bg-[var(--accent)] text-white'
                                        : 'border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)]'
                                }`}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))}

                    {sending && (
                        <div className="flex gap-2.5">
                            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/15 text-[var(--accent)]">
                                <Bot className="h-4 w-4" />
                            </div>
                            <div className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-3.5 py-2.5">
                                <div className="h-2 w-2 animate-bounce rounded-full bg-[var(--text-muted)]" style={{ animationDelay: '0ms' }} />
                                <div className="h-2 w-2 animate-bounce rounded-full bg-[var(--text-muted)]" style={{ animationDelay: '150ms' }} />
                                <div className="h-2 w-2 animate-bounce rounded-full bg-[var(--text-muted)]" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick suggestions — only show when few messages */}
                {messages.length <= 1 && (
                    <div className="flex gap-2 overflow-x-auto border-t border-[var(--border)] px-4 py-2.5">
                        {suggestions.map((s) => (
                            <button
                                key={s}
                                onClick={() => { setInput(s); inputRef.current?.focus(); }}
                                className="flex-shrink-0 rounded-full border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-1.5 text-xs text-[var(--text-muted)] transition-colors hover:border-[var(--accent-border)] hover:text-[var(--accent)]"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input */}
                <div className="border-t border-[var(--border)] px-4 py-3">
                    <form
                        onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                        className="flex items-center gap-2"
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about your metrics…"
                            disabled={sending}
                            className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || sending}
                            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-colors disabled:opacity-40"
                            style={{ background: 'var(--accent)', color: 'white' }}
                        >
                            {sending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
