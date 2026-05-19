import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { IconShell, SurfaceCard } from "../../components/BrandSystem";
import { BrandIllustratedEmptyState, BrandOrganicPlaceholder, BrandRadialDivider, BrandTextureSkeleton, BrandWatermarkPanel } from "../../components/BrandMicro";
import { getCorridorBySlug, type ClimateCorridorWithLinks } from "../../lib/api";
import { getOptimizedCover } from "../../lib/imageOptimization";

function ItemLink({ kind, refId }: { kind: string; refId: string }) {
    // Map kind to appropriate URL and label prefix
    let url = "#";
    let icon = "🔗";
    let label = refId;
    let typeLabel = kind;

    switch (kind) {
        case "station":
            url = `/dados?station=${refId}`;
            icon = "📡";
            typeLabel = "Estação de Monitoramento";
            break;
        case "acervo":
            url = `/acervo/item/${refId}`;
            icon = "📚";
            typeLabel = "Item do Acervo";
            break;
        case "blog":
            url = `/blog/${refId}`;
            icon = "📝";
            typeLabel = "Postagem";
            break;
        case "event":
            url = "/agenda";
            icon = "📅";
            typeLabel = "Agenda";
            break;
        default:
            break;
    }

    return (
        <Link
            to={url}
            className="portal-demo-card group"
        >
            <div className="mb-2 text-2xl">{icon}</div>
            <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-brand-primary/70">
                {typeLabel}
            </div>
            <div className="font-semibold text-text-primary group-hover:text-brand-primary line-clamp-2">
                {label}
            </div>
        </Link>
    );
}

export function CorredoresDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const [corridor, setCorridor] = useState<ClimateCorridorWithLinks | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;
        async function load() {
            try {
                const data = await getCorridorBySlug(slug as string);
                if (!data) {
                    setError("Corredor Climático não encontrado");
                    return;
                }
                setCorridor(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Falha ao carregar Corredor");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [slug]);

    if (loading) {
        return (
            <BrandTextureSkeleton className="mx-auto max-w-5xl rounded-[1.75rem]" lines={5} />
        );
    }

    if (error || !corridor) {
        return (
            <BrandIllustratedEmptyState
                title={error || "Página não encontrada"}
                description="Não foi possível abrir este corredor climático no momento."
                icon={<span className="text-2xl" aria-hidden="true">🧭</span>}
                action={<Link to="/corredores" className="ui-btn-secondary">Voltar para Corredores</Link>}
            />
        );
    }

    const stations = corridor.links.filter((l) => l.item_kind === "station");
    const acervoItems = corridor.links.filter((l) => l.item_kind === "acervo");
    const blogPosts = corridor.links.filter((l) => l.item_kind === "blog");
    const events = corridor.links.filter((l) => l.item_kind === "event");

    return (
        <main className="portal-stage mx-auto max-w-6xl space-y-8 md:space-y-10">
            <Link
                to="/corredores"
                className="mb-8 inline-flex items-center text-xs font-bold uppercase tracking-widest text-text-secondary transition-colors hover:text-text-primary"
            >
                ← Voltar aos Corredores
            </Link>

            <SurfaceCard className="portal-detail-article p-5 md:p-8">
                <BrandWatermarkPanel>
                <div className="mb-5 flex items-center gap-3">
                    <IconShell tone="lab" className="h-12 w-12 rounded-2xl"><span aria-hidden="true">🧭</span></IconShell>
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-brand-primary">Corredor climático</span>
                </div>
                {corridor.featured && (
                    <span className="mb-4 inline-block rounded-full border border-brand-primary/30 bg-brand-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-brand-primary">
                        Destaque Editorial
                    </span>
                )}
                <h1 className="mb-5 text-3xl font-black leading-tight tracking-tight text-brand-primary md:mb-6 md:text-6xl">
                    {corridor.title}
                </h1>
                {corridor.excerpt && (
                    <p className="border-l-4 border-brand-primary/30 pl-4 text-lg italic leading-relaxed text-text-secondary md:pl-6 md:text-xl">
                        {corridor.excerpt}
                    </p>
                )}
                </BrandWatermarkPanel>
            </SurfaceCard>

            {/* Cover Image */}
            {corridor.cover_url && (
                <section className="overflow-hidden rounded-[2rem] border border-brand-primary/10 shadow-[0_24px_70px_rgba(17,38,59,0.12)]">
                    <img
                        src={getOptimizedCover(corridor, "cover") || corridor.cover_url}
                        alt={corridor.title}
                        className="h-auto w-full object-cover"
                    />
                </section>
            )}

            <BrandRadialDivider className="radial-divider-subtle mb-8 md:mb-10" />

            {/* Editorial Note - "O que observar aqui" */}
            {corridor.note_md && (
                <SurfaceCard className="portal-list-panel p-6 md:p-8">
                    <h2 className="mb-4 flex items-center gap-3 text-xl font-black uppercase tracking-tight text-brand-primary md:text-2xl">
                        <span className="text-3xl">👁️</span>
                        O que observar aqui
                    </h2>
                    <div className="prose prose-lg max-w-none text-text-primary">
                        <p className="whitespace-pre-wrap leading-relaxed">{corridor.note_md}</p>
                    </div>
                </SurfaceCard>
            )}

            {/* Geometry / Map Placeholder */}
            {corridor.geometry_json ? (
                <SurfaceCard className="portal-list-panel overflow-hidden p-0">
                    <div className="p-6 md:p-8">
                        <h3 className="mb-4 text-lg font-black uppercase tracking-tight text-text-primary md:text-xl">
                            Geometria do Corredor
                        </h3>
                        <details className="cursor-pointer">
                            <summary className="mb-2 text-sm font-bold text-brand-primary hover:underline">
                                Ver dados GeoJSON
                            </summary>
                            <pre className="max-h-96 overflow-auto rounded-xl bg-bg-surface p-4 text-xs text-text-secondary">
                                {JSON.stringify(corridor.geometry_json, null, 2)}
                            </pre>
                        </details>
                        <p className="mt-4 text-sm italic text-text-secondary">
                            Visualização interativa em desenvolvimento.
                        </p>
                    </div>
                </SurfaceCard>
            ) : (
                <SurfaceCard className="portal-list-panel overflow-hidden p-0">
                    <BrandOrganicPlaceholder className="h-56 md:h-96" label="Corredores" subtitle="Mapa em breve" />
                </SurfaceCard>
            )}

            {/* Connected Content - Organized by Type */}
            <div className="space-y-12 md:space-y-16">
                {/* Stations */}
                {stations.length > 0 && (
                    <section>
                        <h2 className="mb-6 text-xl font-black uppercase tracking-tight text-text-primary md:mb-8 md:text-2xl">
                            📡 Estações Relacionadas
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                            {stations.map((link) => (
                                <ItemLink key={`${link.item_kind}-${link.item_ref}`} kind={link.item_kind} refId={link.item_ref} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Acervo Items */}
                {acervoItems.length > 0 && (
                    <section>
                        <h2 className="mb-6 text-xl font-black uppercase tracking-tight text-text-primary md:mb-8 md:text-2xl">
                            📚 Itens do Acervo Relacionados
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                            {acervoItems.map((link) => (
                                <ItemLink key={`${link.item_kind}-${link.item_ref}`} kind={link.item_kind} refId={link.item_ref} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Blog Posts */}
                {blogPosts.length > 0 && (
                    <section>
                        <h2 className="mb-6 text-xl font-black uppercase tracking-tight text-text-primary md:mb-8 md:text-2xl">
                            📝 Posts do Blog Relacionados
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                            {blogPosts.map((link) => (
                                <ItemLink key={`${link.item_kind}-${link.item_ref}`} kind={link.item_kind} refId={link.item_ref} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Events */}
                {events.length > 0 && (
                    <section>
                        <h2 className="mb-6 text-xl font-black uppercase tracking-tight text-text-primary md:mb-8 md:text-2xl">
                            📅 Eventos Relacionados
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                            {events.map((link) => (
                                <ItemLink key={`${link.item_kind}-${link.item_ref}`} kind={link.item_kind} refId={link.item_ref} />
                            ))}
                        </div>
                    </section>
                )}

                {stations.length === 0 && acervoItems.length === 0 && blogPosts.length === 0 && events.length === 0 && (
                    <BrandIllustratedEmptyState
                        title="Sem conteúdos relacionados"
                        description="Este corredor ainda não possui vínculos com estações, acervo, blog ou eventos."
                        icon={<span className="text-2xl" aria-hidden="true">🗂️</span>}
                    />
                )}
            </div>
        </main>
    );
}
