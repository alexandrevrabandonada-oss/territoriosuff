import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCollectionBySlug, type CollectionWithItems } from "../../lib/api";
import { ACERVO_KIND_LABELS } from "../../lib/acervo";
import { getOptimizedCover } from "../../lib/imageOptimization";
import { trackShare } from "../../lib/observability";
import { IconShell, SurfaceCard } from "../../components/BrandSystem";

export function CollectionDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const [collection, setCollection] = useState<CollectionWithItems | null>(null);
    const [selectedTag, setSelectedTag] = useState<string>("");
    const [selectedYear, setSelectedYear] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            if (!slug) return;
            try {
                setLoading(true);
                const data = await getCollectionBySlug(slug);
                setCollection(data);
            } catch (err) {
                console.error("Erro ao carregar detalhes do dossiê:", err);
                setError("Coleção não encontrada ou erro na conexão.");
            } finally {
                setLoading(false);
            }
        }
        void load();
    }, [slug]);

    const allTags = useMemo(() => {
        if (!collection) return [];
        const tags = new Set<string>();
        collection.items.forEach(item => item.tags.forEach(t => tags.add(t)));
        return Array.from(tags).sort();
    }, [collection]);

    const allYears = useMemo(() => {
        if (!collection) return [];
        const years = new Set<string>();
        collection.items.forEach(item => {
            if (item.published_at) {
                years.add(new Date(item.published_at).getFullYear().toString());
            }
        });
        return Array.from(years).sort((a, b) => b.localeCompare(a));
    }, [collection]);

    const filteredItems = useMemo(() => {
        if (!collection) return [];
        return collection.items.filter(item => {
            if (selectedTag && !item.tags.includes(selectedTag)) return false;
            if (selectedYear) {
                if (!item.published_at) return false;
                const year = new Date(item.published_at).getFullYear().toString();
                if (year !== selectedYear) return false;
            }
            return true;
        });
    }, [collection, selectedTag, selectedYear]);

    if (loading) return <p className="text-sm text-texto/70" aria-live="polite" aria-busy="true">Carregando detalhes do dossiê...</p>;
    if (error || !collection) return <p className="text-sm text-acento" aria-live="assertive">{error || "Coleção não encontrada."}</p>;

    return (
        <section className="portal-stage dossie-detail-stage space-y-8 md:space-y-10">
            <SurfaceCard className="portal-detail-article p-5 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
                {collection.cover_url && (
                    <div className="w-full md:w-1/3">
                        <img
                            src={getOptimizedCover(collection, 'small') || ''}
                            alt={collection.title}
                            loading="lazy"
                            className="rounded-2xl border border-ciano/30 shadow-lg"
                        />
                    </div>
                )}
                <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                        <Link to="/dossies" className="text-xs font-bold uppercase tracking-widest text-ciano hover:underline">
                            ← Voltar para todos os dossiês
                        </Link>
                        <button
                            type="button"
                            onClick={() => {
                                const url = `${window.location.origin}/s/dossies/${collection.slug}`;
                                trackShare("dossies", collection.slug, "detail");
                                if (navigator.share) {
                                    void navigator.share({
                                        title: collection.title,
                                        text: collection.excerpt || undefined,
                                        url
                                    });
                                } else {
                                    trackShare("dossies", collection.slug, "detail-copy");
                                    void navigator.clipboard.writeText(url);
                                    alert("Link de compartilhamento copiado!");
                                }
                            }}
                            className="inline-flex items-center gap-1 rounded-full bg-ciano/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-ciano hover:bg-ciano/20 transition-colors"
                        >
                            🔗 Compartilhar
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <IconShell tone="warm" className="h-12 w-12 rounded-2xl"><span aria-hidden="true">📚</span></IconShell>
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-brand-primary">Dossiê curado</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-[-0.045em] text-text-primary md:text-5xl">{collection.title}</h1>
                    <p className="text-base text-texto/90 leading-relaxed md:text-lg">{collection.excerpt}</p>
                    <div className="flex flex-wrap gap-2">
                        {collection.tags.map((tag) => (
                            <span key={tag} className="rounded-full bg-cta/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cta">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
            </SurfaceCard>

            <SurfaceCard className="portal-list-panel space-y-4 p-5 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-end justify-between border-b border-ciano/20 pb-4">
                    <h2 className="text-xl font-black uppercase tracking-wide text-cta">Itens desta Coleção</h2>
                    <div className="flex flex-wrap gap-2">
                        {allTags.length > 0 && (
                            <select
                                className="rounded-lg border border-ciano/30 bg-fundo/80 px-3 py-2 text-sm text-texto outline-none focus:border-ciano transition-colors"
                                value={selectedTag}
                                onChange={(e) => setSelectedTag(e.target.value)}
                                aria-label="Filtrar por tag"
                            >
                                <option value="">Todas as Tags</option>
                                {allTags.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        )}
                        {allYears.length > 0 && (
                            <select
                                className="rounded-lg border border-ciano/30 bg-fundo/80 px-3 py-2 text-sm text-texto outline-none focus:border-ciano transition-colors"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                aria-label="Filtrar por ano"
                            >
                                <option value="">Todos os Anos</option>
                                {allYears.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        )}
                    </div>
                </div>

                {filteredItems.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-ciano/30 py-10 text-center">
                        <p className="text-sm text-texto/60 italic" aria-live="polite">Nenhum item encontrado com estes filtros.</p>
                        {(selectedTag || selectedYear) && (
                            <button
                                onClick={() => { setSelectedTag(""); setSelectedYear(""); }}
                                className="mt-4 text-xs font-bold uppercase tracking-widest text-ciano hover:underline"
                            >
                                Limpar Filtros
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" aria-live="polite">
                        {filteredItems.map((item) => (
                            <Link
                                key={item.id}
                                to={`/acervo/item/${item.slug}`}
                                className="group flex flex-col gap-2 rounded-xl border border-ciano/20 bg-fundo/70 p-5 transition-all hover:border-ciano hover:bg-base/20 shadow-sm"
                            >
                                <span className="inline-block self-start rounded-full bg-ciano/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-ciano transition-colors group-hover:bg-ciano/20">
                                    {ACERVO_KIND_LABELS[item.kind as keyof typeof ACERVO_KIND_LABELS] ?? item.kind}
                                </span>
                                <h3 className="line-clamp-3 text-sm font-bold text-texto leading-snug group-hover:text-ciano">{item.title}</h3>
                                {item.published_at && (
                                    <p className="mt-auto pt-2 text-xs font-semibold text-texto/50">
                                        {new Date(item.published_at).getFullYear()}
                                    </p>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </SurfaceCard>
        </section>
    );
}
