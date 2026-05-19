import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";

import { getAcervoBySlug, listCollectionsForItem, getRelatedItemsByCollections, type AcervoItem, type AcervoCollection } from "../../lib/api";
import { ACERVO_KIND_LABELS } from "../../lib/acervo";
import { trackShare } from "../../lib/observability";
import { IconShell, SurfaceCard } from "../../components/BrandSystem";
import { SafeMarkdown } from "../../components/SafeMarkdown";
import { TextToSpeechButton } from "../../components/TextToSpeechButton";

const SOURCE_TYPE_LABELS: Record<string, string> = {
    cientifico: "Científico",
    imprensa: "Imprensa",
    institucional: "Institucional",
    pessoal: "Pessoal"
};

function SimpleMarkdown({ text }: { text: string }) {
    return <SafeMarkdown text={text} className="text-sm leading-relaxed text-text-primary" />;
}

export function AcervoItemPage() {
    const { slug } = useParams<{ slug: string }>();
    const [item, setItem] = useState<AcervoItem | null>(null);
    const [collections, setCollections] = useState<AcervoCollection[]>([]);
    const [related, setRelated] = useState<AcervoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal State
    const [activeMedia, setActiveMedia] = useState<{ url: string; type: string; title?: string } | null>(null);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const modalCloseButtonRef = useRef<HTMLButtonElement>(null);
    const previousActiveElementRef = useRef<HTMLElement | null>(null);

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
