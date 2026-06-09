import { useEffect, useState, useRef, useMemo } from "react";
import { Link, useParams } from "react-router-dom";

import { getAcervoBySlug, listCollectionsForItem, getRelatedItemsByCollections, type AcervoItem, type AcervoCollection } from "../../lib/api";
import { ACERVO_KIND_LABELS } from "../../lib/acervo";
import { trackShare } from "../../lib/observability";
import { IconShell, SurfaceCard } from "../../components/BrandSystem";
import { SafeMarkdown } from "../../components/SafeMarkdown";
import { TextToSpeechButton } from "../../components/TextToSpeechButton";
import { usePageMetadata } from "../../hooks/usePageMetadata";

const SOURCE_TYPE_LABELS: Record<string, string> = {
    cientifico: "Científico",
    imprensa: "Imprensa",
    institucional: "Institucional",
    pessoal: "Pessoal"
};

type SourceCaptureMeta = {
    url?: string;
    title?: string;
    source_name?: string;
    published_at?: string | null;
    excerpt?: string;
    content_format?: string;
    word_count?: number;
    domain?: string;
    captured_at?: string;
    snapshot_url?: string;
    snapshot_path?: string;
    snapshot_mime_type?: string;
    snapshot_size_bytes?: number;
    replaced_live_copy?: boolean;
};

type SourceCaptureHistoryEntry = SourceCaptureMeta;

function getSourceCapture(meta: Record<string, unknown> | null | undefined): SourceCaptureMeta | null {
    if (!meta || typeof meta !== "object" || Array.isArray(meta)) return null;
    const candidate = (meta as Record<string, unknown>).source_capture;
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return null;
    return candidate as SourceCaptureMeta;
}

function getEditorialContext(meta: Record<string, unknown> | null | undefined) {
    if (!meta || typeof meta !== "object" || Array.isArray(meta)) return "";
    const value = (meta as Record<string, unknown>).editorial_context;
    return typeof value === "string" ? value.trim() : "";
}

function getSourceCaptureHistory(meta: Record<string, unknown> | null | undefined): SourceCaptureHistoryEntry[] {
    if (!meta || typeof meta !== "object" || Array.isArray(meta)) return [];
    const value = (meta as Record<string, unknown>).source_capture_history;
    return Array.isArray(value) ? (value as SourceCaptureHistoryEntry[]) : [];
}

function SimpleMarkdown({ text }: { text: string }) {
    return <SafeMarkdown text={text} className="text-sm leading-relaxed text-text-primary" />;
}

function slugify(text: string) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
}

interface HeadingItem {
    id: string;
    text: string;
    level: number;
}

function renderInline(text: string) {
    const pattern = /(\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
    const nodes: any[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text))) {
        if (match.index > lastIndex) {
            nodes.push(text.slice(lastIndex, match.index));
        }

        if (match[2]) {
            nodes.push(<strong key={`strong-${match.index}`}>{match[2]}</strong>);
        } else if (match[3]) {
            nodes.push(<em key={`em-${match.index}`}>{match[3]}</em>);
        }

        lastIndex = pattern.lastIndex;
    }

    if (lastIndex < text.length) {
        nodes.push(text.slice(lastIndex));
    }

    return nodes.length > 0 ? nodes : text;
}

function EnhancedMarkdown({ text, fontSize }: { text: string; fontSize: number }) {
    const lines = text.split(/\r?\n/);
    const counts: Record<string, number> = {};

    return (
        <div style={{ fontSize: `${fontSize}px` }} className="space-y-5 leading-relaxed font-serif">
            {lines.map((line, index) => {
                const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
                if (headingMatch) {
                    const level = headingMatch[1].length;
                    const content = headingMatch[2].trim();
                    let id = slugify(content);
                    if (counts[id] !== undefined) {
                        counts[id]++;
                        id = `${id}-${counts[id]}`;
                    } else {
                        counts[id] = 0;
                    }

                    const classes = 
                        level === 1 ? "text-3xl font-black mt-8 mb-4 border-b pb-2 font-sans" :
                        level === 2 ? "text-2xl font-black mt-6 mb-3 border-b pb-1 font-sans" :
                        level === 3 ? "text-xl font-bold mt-5 mb-2 font-sans" :
                        "text-lg font-bold mt-4 mb-2 font-sans";

                    const Tag = `h${level}` as keyof JSX.IntrinsicElements;
                    return (
                        <Tag key={index} id={id} className={classes}>
                            {content}
                        </Tag>
                    );
                }

                const listMatch = line.match(/^[*-]\s+(.*)$/);
                if (listMatch) {
                    return (
                        <ul key={index} className="list-disc pl-6 space-y-1 my-2">
                            <li>{renderInline(listMatch[1])}</li>
                        </ul>
                    );
                }

                if (!line.trim()) return <div key={index} className="h-2" />;

                if (line.startsWith(">")) {
                    return (
                        <blockquote key={index} className="border-l-4 border-brand-primary bg-brand-primary/5 px-4 py-3 italic my-4 rounded-r-lg">
                            {renderInline(line.substring(1).trim())}
                        </blockquote>
                    );
                }

                return (
                    <p key={index} className="text-justify my-3 leading-relaxed">
                        {renderInline(line)}
                    </p>
                );
            })}
        </div>
    );
}

export function AcervoItemPage() {
    const { slug } = useParams<{ slug: string }>();
    const [item, setItem] = useState<AcervoItem | null>(null);
    const [collections, setCollections] = useState<AcervoCollection[]>([]);
    const [related, setRelated] = useState<AcervoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    usePageMetadata({
        title: item?.title,
        description: item?.excerpt || undefined,
        image: item?.cover_thumb_url || item?.cover_url || undefined,
        url: item ? `${window.location.origin}/s/acervo/${item.slug}` : undefined,
        type: "article",
    });

    // Modal State
    const [activeMedia, setActiveMedia] = useState<{ url: string; type: string; title?: string } | null>(null);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const modalCloseButtonRef = useRef<HTMLButtonElement>(null);
    const previousActiveElementRef = useRef<HTMLElement | null>(null);

    // Reader Mode State
    const [readerMode, setReaderMode] = useState(false);
    const [readerTheme, setReaderTheme] = useState<"claro" | "sepia" | "escuro">("claro");
    const [fontSize, setFontSize] = useState(18); // Default 18px
    const [scrollProgress, setScrollProgress] = useState(0);
    const [activeHeadingId, setActiveHeadingId] = useState<string>("");
    const sourceCapture = useMemo(() => getSourceCapture(item?.meta), [item?.meta]);
    const editorialContext = useMemo(() => getEditorialContext(item?.meta), [item?.meta]);
    const sourceCaptureHistory = useMemo(() => getSourceCaptureHistory(item?.meta), [item?.meta]);

    useEffect(() => {
        if (readerMode) {
            document.body.classList.add("reader-mode-active");
            window.scrollTo(0, 0);
        } else {
            document.body.classList.remove("reader-mode-active");
        }
        return () => {
            document.body.classList.remove("reader-mode-active");
        };
    }, [readerMode]);

    useEffect(() => {
        if (!readerMode) return;
        const handleScroll = () => {
            const total = document.documentElement.scrollHeight - window.innerHeight;
            if (total <= 0) {
                setScrollProgress(0);
                return;
            }
            const progress = (window.scrollY / total) * 100;
            setScrollProgress(progress);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [readerMode]);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    // Close Modal on ESC and manage focus
    useEffect(() => {
        if (activeMedia) {
            // Save previously focused element
            previousActiveElementRef.current = document.activeElement as HTMLElement;
            // Focus close button when modal opens
            setTimeout(() => modalCloseButtonRef.current?.focus(), 100);
        } else if (previousActiveElementRef.current) {
            // Restore focus when modal closes
            previousActiveElementRef.current.focus();
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && activeMedia) {
                setActiveMedia(null);
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [activeMedia]);

    useEffect(() => {
        if (!slug) return;
        let cancelled = false;

        async function run() {
            try {
                setLoading(true);
                setError(null);
                const [data, cols] = await Promise.all([
                    getAcervoBySlug(slug as string),
                    listCollectionsForItem(slug as string)
                ]);
                let relatedItems: AcervoItem[] = [];
                if (data && data.id) {
                    relatedItems = await getRelatedItemsByCollections(data.id, 6);
                }
                if (!cancelled) {
                    setItem(data);
                    setCollections(cols);
                    setRelated(relatedItems);
                }
            } catch (err) {
                if (!cancelled)
                    setError(err instanceof Error ? err.message : "Falha ao carregar item do acervo.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void run();
        return () => { cancelled = true; };
    }, [slug]);

    const headings = useMemo(() => {
        if (!item?.content_md) return [];
        const list: HeadingItem[] = [];
        const counts: Record<string, number> = {};
        const lines = item.content_md.split(/\r?\n/);
        lines.forEach((line) => {
            const match = line.match(/^(#{1,6})\s+(.*)$/);
            if (match) {
                const level = match[1].length;
                const text = match[2].trim();
                let id = slugify(text);
                if (counts[id] !== undefined) {
                    counts[id]++;
                    id = `${id}-${counts[id]}`;
                } else {
                    counts[id] = 0;
                }
                list.push({ id, text, level });
            }
        });
        return list;
    }, [item?.content_md]);

    useEffect(() => {
        if (!readerMode || headings.length === 0) return;
        const handleScroll = () => {
            let currentActive = headings[0]?.id || "";
            for (const heading of headings) {
                const el = document.getElementById(heading.id);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    if (rect.top <= 120) {
                        currentActive = heading.id;
                    } else {
                        break;
                    }
                }
            }
            setActiveHeadingId(currentActive);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [readerMode, headings]);

    const themeClasses = {
        claro: "bg-[#fcfbf9] text-zinc-900",
        sepia: "bg-[#f5ebd6] text-[#4a3621]",
        escuro: "bg-[#18181b] text-zinc-100"
    };

    const borderClasses = {
        claro: "border-zinc-200",
        sepia: "border-[#e6d8bc]",
        escuro: "border-zinc-800"
    };

    const textSecondaryClasses = {
        claro: "text-zinc-600",
        sepia: "text-[#70583d]",
        escuro: "text-zinc-400"
    };

    if (readerMode && item) {
        return (
            <div className={`min-h-screen transition-colors duration-300 ${themeClasses[readerTheme]} p-4 md:p-6 rounded-2xl border ${borderClasses[readerTheme]}`}>
                {/* Top progress bar */}
                <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-brand-primary/20">
                    <div 
                        className="h-full bg-brand-primary transition-all duration-100" 
                        style={{ width: `${scrollProgress}%` }}
                    />
                </div>

                {/* Sticky Reader Toolbar */}
                <header className={`sticky top-0 z-40 border-b backdrop-blur-md bg-opacity-95 ${themeClasses[readerTheme]} ${borderClasses[readerTheme]} -mx-4 md:-mx-6 -mt-4 md:-mt-6 mb-8 px-4 py-3 shadow-sm flex flex-wrap items-center justify-between gap-4`}>
                    <button
                        onClick={() => setReaderMode(false)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-semibold transition-colors ${
                            readerTheme === "escuro"
                                ? "border-zinc-800 hover:bg-zinc-800 hover:text-white"
                                : "border-zinc-200 hover:bg-zinc-100 hover:text-zinc-950"
                        }`}
                    >
                        ← Sair do Modo Leitura
                    </button>

                    <div className="flex flex-wrap items-center gap-5">
                        {/* Font Size Adjusters */}
                        <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-black uppercase tracking-wider ${textSecondaryClasses[readerTheme]}`}>Fonte</span>
                            <button
                                onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                                disabled={fontSize <= 14}
                                className={`h-8 w-8 rounded-full border text-xs font-bold transition-all flex items-center justify-center ${
                                    readerTheme === "escuro"
                                        ? "border-zinc-800 hover:bg-zinc-800 disabled:opacity-30"
                                        : "border-zinc-200 hover:bg-zinc-100 disabled:opacity-30"
                                }`}
                                aria-label="Diminuir fonte"
                            >
                                -
                            </button>
                            <span className="text-xs font-semibold tabular-nums px-1">{fontSize}px</span>
                            <button
                                onClick={() => setFontSize(Math.min(28, fontSize + 2))}
                                disabled={fontSize >= 28}
                                className={`h-8 w-8 rounded-full border text-xs font-bold transition-all flex items-center justify-center ${
                                    readerTheme === "escuro"
                                        ? "border-zinc-800 hover:bg-zinc-800 disabled:opacity-30"
                                        : "border-zinc-200 hover:bg-zinc-100 disabled:opacity-30"
                                }`}
                                aria-label="Aumentar fonte"
                            >
                                +
                            </button>
                        </div>

                        {/* Theme Selectors */}
                        <div className={`flex items-center gap-1 border-l pl-5 ${borderClasses[readerTheme]}`}>
                            {(["claro", "sepia", "escuro"] as const).map((t) => {
                                const active = readerTheme === t;
                                const labels = { claro: "Claro", sepia: "Sepia", escuro: "Escuro" };
                                return (
                                    <button
                                        key={t}
                                        onClick={() => setReaderTheme(t)}
                                        className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all border ${
                                            active
                                                ? "border-brand-primary bg-brand-primary text-white shadow-sm"
                                                : readerTheme === "escuro"
                                                    ? "border-zinc-800 hover:bg-zinc-800 text-zinc-300"
                                                    : "border-zinc-200 hover:bg-zinc-100 text-zinc-700"
                                        }`}
                                    >
                                        {labels[t]}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
                    {/* Sidebar TOC */}
                    <aside className="hidden lg:block">
                        <div className={`sticky top-24 max-h-[calc(100vh-140px)] overflow-y-auto pr-4 py-2 border-r ${borderClasses[readerTheme]}`}>
                            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${textSecondaryClasses[readerTheme]}`}>Sumário</p>
                            {headings.length === 0 ? (
                                <p className={`text-xs italic ${textSecondaryClasses[readerTheme]}`}>Nenhum cabeçalho encontrado.</p>
                            ) : (
                                <nav className="space-y-1.5">
                                    {headings.map((h, i) => {
                                        const isActive = activeHeadingId === h.id;
                                        return (
                                            <a
                                                key={i}
                                                href={`#${h.id}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth" });
                                                    setActiveHeadingId(h.id);
                                                }}
                                                className={`block text-sm transition-colors py-0.5 leading-snug ${
                                                    h.level === 1 ? "font-bold text-base" : h.level === 2 ? "pl-3 text-sm font-semibold" : "pl-6 text-xs"
                                                } ${
                                                    isActive 
                                                        ? "text-brand-primary font-bold border-l-2 border-brand-primary pl-2 -ml-2" 
                                                        : readerTheme === "escuro"
                                                            ? "text-zinc-400 hover:text-white"
                                                            : "text-zinc-600 hover:text-zinc-950"
                                                }`}
                                            >
                                                {h.text}
                                            </a>
                                        );
                                    })}
                                </nav>
                            )}
                        </div>
                    </aside>

                    {/* Article Body */}
                    <article className="mx-auto max-w-3xl lg:mx-0 w-full">
                        {/* Kind badges */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="inline-block rounded-full bg-brand-primary/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-brand-primary">
                                {ACERVO_KIND_LABELS[item.kind as keyof typeof ACERVO_KIND_LABELS] ?? item.kind}
                            </span>
                            {item.source_type && (
                                <span className={`inline-block rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                                    readerTheme === "escuro" ? "bg-zinc-800 text-zinc-300" : "bg-zinc-200 text-zinc-700"
                                }`}>
                                    {SOURCE_TYPE_LABELS[item.source_type] || item.source_type}
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl font-black tracking-tight leading-tight md:text-4xl lg:text-5xl font-sans">
                            {item.title}
                        </h1>

                        {item.authors && (
                            <p className={`mt-3 text-base italic font-medium ${textSecondaryClasses[readerTheme]}`}>
                                Por: {item.authors}
                            </p>
                        )}

                        {/* Metadata details */}
                        <div className={`mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs border-y py-3 ${borderClasses[readerTheme]} ${textSecondaryClasses[readerTheme]}`}>
                            {item.source_name && (
                                <span>
                                    <span className="font-semibold uppercase tracking-wider">Fonte:</span> {item.source_name}
                                </span>
                            )}
                            {item.published_at && (
                                <span>
                                    <span className="font-semibold uppercase tracking-wider">Data:</span> {new Date(item.published_at).toLocaleDateString("pt-BR")}
                                </span>
                            )}
                            {item.doi && (
                                <span>
                                    <span className="font-semibold uppercase tracking-wider">DOI:</span> {item.doi}
                                </span>
                            )}
                        </div>

                        {/* Audio reader */}
                        <div className="my-6">
                            <TextToSpeechButton
                                label="Ouvir item"
                                title={item.title}
                                text={[item.excerpt, item.curator_note, item.content_md].filter(Boolean).join("\n\n")}
                            />
                        </div>

                        {/* Curator Note inside Reader */}
                        {item.curator_note && (
                            <div className={`my-6 rounded-xl border p-5 italic ${
                                readerTheme === "escuro" 
                                    ? "bg-zinc-900 border-zinc-800" 
                                    : readerTheme === "sepia" 
                                        ? "bg-[#ecdcb9] border-[#dfcb9a]" 
                                        : "bg-zinc-50 border-zinc-150"
                            }`}>
                                <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-brand-primary">Nota da Curadoria</span>
                                <p className="text-sm">"{item.curator_note}"</p>
                            </div>
                        )}

                        {/* Excerpt */}
                        {item.excerpt && (
                            <p className="my-6 text-xl font-bold leading-relaxed text-justify font-sans">
                                {item.excerpt}
                            </p>
                        )}

                        {/* Body content */}
                        <div className="mt-8">
                            {item.content_md ? (
                                <EnhancedMarkdown text={item.content_md} fontSize={fontSize} />
                            ) : (
                                <p className="italic">Nenhum conteúdo em Markdown disponível para este item.</p>
                            )}
                        </div>
                    </article>
                </div>
            </div>
        );
    }

    return (
        <section className="portal-stage acervo-detail-stage space-y-8 md:space-y-10">
            <Link
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary/70 hover:text-brand-primary"
                to="/acervo"
            >
                ← Voltar ao Acervo
            </Link>

            {loading ? (
                <p aria-live="polite" className="text-sm text-text-secondary" role="status">Carregando item...</p>
            ) : error ? (
                <p aria-live="assertive" className="rounded-md border border-error/30 bg-error/10 p-3 text-sm text-error" role="alert">
                    {error}
                </p>
            ) : !item ? (
                <div className="rounded-2xl border border-border-subtle bg-white p-10 text-center">
                    <p className="text-4xl">🔍</p>
                    <p aria-live="polite" className="mt-3 text-sm font-semibold text-text-secondary" role="status">
                        Item não encontrado. Verifique o link ou volte ao acervo.
                    </p>
                </div>
            ) : (
                <SurfaceCard className="portal-detail-article p-5 md:p-8">
                    <div className="mb-5 flex items-center gap-3">
                        <IconShell tone="brand" className="h-12 w-12 rounded-2xl"><span aria-hidden="true">🗂️</span></IconShell>
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-brand-primary">Item do acervo</span>
                    </div>
                    {/* Kind badges */}
                    <div className="flex flex-wrap gap-2">
                        <span className="inline-block rounded-full bg-brand-primary/10 px-3 py-0.5 text-xs font-bold uppercase tracking-widest text-brand-primary">
                            {ACERVO_KIND_LABELS[item.kind as keyof typeof ACERVO_KIND_LABELS] ?? item.kind}
                        </span>
                        {item.source_type && (
                            <span className="inline-block rounded-full bg-accent-green/10 px-3 py-0.5 text-xs font-bold uppercase tracking-widest text-accent-green">
                                {SOURCE_TYPE_LABELS[item.source_type] || item.source_type}
                            </span>
                        )}
                        {item.featured && (
                            <span className="inline-block rounded-full bg-brand-primary/10 px-3 py-0.5 text-xs font-bold uppercase tracking-widest text-brand-primary">
                                ⭐ Destaque
                            </span>
                        )}
                        <button
                            className="inline-flex items-center gap-1 rounded-full bg-brand-primary/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-brand-primary hover:bg-brand-primary/20"
                            onClick={() => setReaderMode(true)}
                            type="button"
                        >
                            📖 Modo Leitura
                        </button>
                        <button
                            className="inline-flex items-center gap-1 rounded-full bg-brand-primary/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-brand-primary hover:bg-brand-primary/20"
                            onClick={() => {
                                const url = `${window.location.origin}/s/acervo/${item.slug}`;
                                trackShare("acervo", item.slug, "item");
                                if (navigator.share) {
                                    void navigator.share({
                                        title: item.title,
                                        text: item.excerpt || undefined,
                                        url
                                    });
                                } else {
                                    trackShare("acervo", item.slug, "item-copy");
                                    void navigator.clipboard.writeText(url);
                                    alert("Link de compartilhamento copiado!");
                                }
                            }}
                            type="button"
                        >
                            🔗 Compartilhar
                        </button>
                        {item.year && (
                            <Link
                                to={`/acervo/linha?year=${item.year}`}
                                className="inline-flex items-center gap-1 rounded-full bg-accent-green/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-accent-green hover:bg-accent-green/20 transition-colors"
                            >
                                ⏳ Ver na linha do tempo
                            </Link>
                        )}
                    </div>

                    <h1 className="mt-4 text-2xl font-black leading-tight text-brand-primary md:text-3xl">
                        {item.title}
                    </h1>

                    {item.authors && (
                        <p className="mt-2 text-sm font-semibold text-text-secondary italic">Por: {item.authors}</p>
                    )}

                    {/* Meta row */}
                    <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-text-secondary">
                        {item.source_name && (
                            <span>
                                <span className="font-semibold uppercase tracking-wide">Fonte:</span>{" "}
                                {item.source_url ? (
                                    <a
                                        className="text-brand-primary hover:underline"
                                        href={item.source_url}
                                        rel="noopener noreferrer"
                                        target="_blank"
                                    >
                                        {item.source_name}
                                    </a>
                                ) : item.source_name}
                            </span>
                        )}
                        {item.published_at && (
                            <span>
                                <span className="font-semibold uppercase tracking-wide">Data:</span>{" "}
                                {new Date(item.published_at).toLocaleDateString("pt-BR")}
                            </span>
                        )}
                        {item.doi && (
                            <span>
                                <span className="font-semibold uppercase tracking-wide">DOI:</span> {item.doi}
                            </span>
                        )}
                        {item.city && (
                            <span>
                                <span className="font-semibold uppercase tracking-wide">Cidade:</span>{" "}
                                {item.city}
                            </span>
                        )}
                    </div>

                    {/* Tags */}
                    {item.tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1">
                            {item.tags.map((tag) => (
                                <span
                                    className="rounded-full border border-brand-primary/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-primary/80"
                                    key={tag}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Associated Collections (Chips) */}
                    {collections.length > 0 && (
                        <div className="mt-8 rounded-xl border border-brand-primary/20 bg-brand-primary/5 p-5">
                            <span className="block mb-3 text-xs font-bold uppercase tracking-widest text-brand-primary">
                                📚 Este item está nos dossiês:
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {collections.map(col => (
                                    <Link
                                        key={col.id}
                                        to={`/dossies/${col.slug}`}
                                        className="rounded-full bg-brand-primary/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-primary hover:bg-brand-primary/20 transition-colors"
                                    >
                                        → {col.title}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    <hr className="my-8 border-border-subtle" />

                    {/* Curator Note */}
                    {item.curator_note && (
                        <div className="mb-8 rounded-xl border border-brand-primary/20 bg-brand-primary/5 p-5 italic text-text-primary">
                            <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-brand-primary">Nota da Curadoria</span>
                            <p className="text-sm">"{item.curator_note}"</p>
                        </div>
                    )}

                    {editorialContext && (
                        <div className="mb-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-text-primary">
                            <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Contexto editorial</span>
                            <p className="text-sm leading-relaxed text-slate-700">{editorialContext}</p>
                        </div>
                    )}

                    {/* Excerpt */}
                    {item.excerpt && (
                        <p className="mb-6 text-base font-semibold leading-relaxed text-text-primary">{item.excerpt}</p>
                    )}

                    <div className="mb-6">
                        <TextToSpeechButton
                            label="Ouvir item"
                            title={item.title}
                            text={[item.excerpt, item.curator_note, item.content_md].filter(Boolean).join("\n\n")}
                        />
                    </div>

                    {sourceCapture && item.content_md && (
                        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div>
                                    <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Cópia preservada</span>
                                    <h3 className="mt-2 text-lg font-black text-emerald-950">Esta matéria foi preservada no portal</h3>
                                    <p className="mt-2 text-sm font-medium leading-relaxed text-emerald-900/80">
                                        Capturada em {sourceCapture.captured_at ? new Date(sourceCapture.captured_at).toLocaleString("pt-BR") : "data não informada"} para manter acesso público mesmo se o link original sair do ar.
                                    </p>
                                </div>
                                {item.source_url && (
                                    <div className="flex flex-wrap gap-2">
                                        <a
                                            className="inline-flex items-center justify-center rounded-xl border border-emerald-300 bg-white px-4 py-2 text-xs font-black uppercase tracking-wide text-emerald-800 transition hover:bg-emerald-100"
                                            href={item.source_url}
                                            rel="noopener noreferrer"
                                            target="_blank"
                                        >
                                            Abrir fonte original
                                        </a>
                                        {sourceCapture.snapshot_url && (
                                            <a
                                                className="inline-flex items-center justify-center rounded-xl border border-emerald-300 bg-emerald-900 px-4 py-2 text-xs font-black uppercase tracking-wide text-white transition hover:bg-emerald-800"
                                                href={sourceCapture.snapshot_url}
                                                rel="noopener noreferrer"
                                                target="_blank"
                                            >
                                                Abrir snapshot HTML
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {sourceCaptureHistory.length > 1 && (
                        <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                            <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Rastro de preservação</span>
                            <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700">
                                Este item registra {sourceCaptureHistory.length} capturas arquivadas da matéria. A versão exibida acima é a cópia ativa mais recente.
                            </p>
                        </div>
                    )}

                    {/* Body */}
                    {item.content_md ? <SimpleMarkdown text={item.content_md} /> : null}

                    {/* Media Gallery / PDF Viewer Buttons */}
                    {item.media && item.media.length > 0 && (
                        <div className="mt-8 mb-8 flex flex-wrap gap-4">
                            {item.media.map((m, idx) => {
                                const isPdf = m.type.toLowerCase().includes("pdf") || m.url.toLowerCase().endsWith(".pdf");
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveMedia(m)}
                                        className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-5 py-3 text-sm font-black uppercase tracking-wide text-white transition-colors hover:bg-brand-primary/90"
                                        type="button"
                                        aria-label={`${isPdf ? "Abrir PDF" : "Ver imagem"}${m.title ? `: ${m.title}` : ""}`}
                                    >
                                        <span className="text-xl" aria-hidden="true">{isPdf ? "📄" : "🖼️"}</span>
                                        {m.title || (isPdf ? "Abrir PDF" : "Ver Imagem")}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* External link CTA */}
                    {item.source_url && !item.content_md && (!item.media || item.media.length === 0) && (
                        <a
                            className="mt-8 mb-8 inline-flex items-center gap-2 rounded-lg bg-brand-primary px-6 py-4 text-sm font-black uppercase tracking-wide text-white transition-colors hover:bg-brand-primary/90"
                            href={item.source_url}
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            Acessar fonte completa →
                        </a>
                    )}

                    {/* Related Items */}
                    {related.length > 0 && (
                        <div className="mt-10 border-t border-border-subtle pt-8">
                            <h3 className="mb-6 text-sm font-black uppercase tracking-widest text-brand-primary">
                                Relacionados neste dossiê
                            </h3>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {related.map(rel => (
                                    <Link
                                        key={rel.id}
                                        to={`/acervo/item/${rel.slug}`}
                                        className="group flex flex-col rounded-xl border border-border-subtle bg-bg-surface p-4 transition-all hover:border-brand-primary/30 hover:shadow-md"
                                    >
                                        <span className="mb-2 inline-block self-start rounded-full bg-brand-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-brand-primary group-hover:bg-brand-primary/20 transition-colors">
                                            {ACERVO_KIND_LABELS[rel.kind as keyof typeof ACERVO_KIND_LABELS] ?? rel.kind}
                                        </span>
                                        <h4 className="text-sm font-bold text-text-primary group-hover:text-brand-primary line-clamp-2 leading-snug">
                                            {rel.title}
                                        </h4>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </SurfaceCard>
            )}

            {/* Media Viewer Modal */}
            {activeMedia && (
                <div
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="media-modal-title"
                    aria-describedby="media-modal-description"
                    onClick={(e) => {
                        // Close when clicking backdrop
                        if (e.target === e.currentTarget) setActiveMedia(null);
                    }}
                >
                    <div className="absolute top-4 right-4 flex items-center gap-4 z-10">
                        <a
                            href={activeMedia.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-[44px] items-center rounded-lg border-2 border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition-all hover:bg-white/20"
                        >
                            Abrir em nova aba
                            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                        <button
                            ref={modalCloseButtonRef}
                            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-error px-3 py-2 text-white transition-all hover:bg-error/90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
                            onClick={() => setActiveMedia(null)}
                            aria-label="Fechar visualizador de mídia (pressione ESC)"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex h-full w-full max-w-5xl flex-col items-center justify-center pt-16 pb-4">
                        <h2 id="media-modal-title" className="sr-only">Visualizador de Mídia do Acervo</h2>
                        <p id="media-modal-description" className="sr-only">
                            Use ESC para fechar, clique no botão fechar ou clique fora da imagem. {activeMedia.title ? `Visualizando: ${activeMedia.title}` : ''}
                        </p>

                        {isOffline && (
                            <div className="mb-4 w-full rounded-lg border-2 border-warning bg-warning/20 p-4 text-center" role="alert">
                                <p className="text-base font-bold text-white">Você está offline</p>
                                <p className="text-sm text-white/90 mt-1">Se você já carregou este arquivo antes, ele pode reabrir usando o cache do dispositivo.</p>
                            </div>
                        )}

                        {activeMedia.type.toLowerCase().includes("pdf") || activeMedia.url.toLowerCase().endsWith(".pdf") ? (
                            <iframe
                                src={activeMedia.url}
                                className="h-full w-full rounded-xl border-2 border-white/20 bg-white shadow-2xl"
                                title={activeMedia.title || "Documento PDF do acervo"}
                                aria-label={activeMedia.title ? `PDF: ${activeMedia.title}` : "Visualizador de PDF"}
                            />
                        ) : (
                            <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl border-2 border-white/20 bg-black/50 shadow-2xl">
                                <img
                                    src={activeMedia.url}
                                    alt={activeMedia.title || "Imagem do acervo"}
                                    className="max-h-full max-w-full object-contain"
                                />
                            </div>
                        )}
                        {activeMedia.title && (
                            <p className="mt-4 max-w-3xl text-center text-base font-semibold text-white">{activeMedia.title}</p>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
