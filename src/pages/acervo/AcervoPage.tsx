import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    Chip,
    EditorialCard,
    EditorialCardActions,
    EditorialCardBody,
    EditorialCardExcerpt,
    EditorialCardMeta,
    EditorialCardTitle,
    IconShell,
    SurfaceCard,
} from "../../components/BrandSystem";
import { BrandRadialDivider, BrandTextureSkeleton } from "../../components/BrandMicro";
import { AxisEyebrow } from "../../components/AxisSystem";
import { listFeaturedAcervo, type AcervoItem } from "../../lib/api";
import { ACERVO_KIND_LABELS } from "../../lib/acervo";

const areas = [
    {
        href: "/acervo/artigos",
        label: "Artigos científicos",
        kicker: "Biblioteca científica",
        emoji: "📄",
        description:
            "Papers, estudos, textos acadêmicos e publicações científicas produzidas ou referenciadas pelo projeto SEMEAR.",
        tone: "brand" as const,
    },
    {
        href: "/acervo/noticias",
        label: "Notícias e matérias",
        kicker: "Registro editorial",
        emoji: "📰",
        description:
            "Cobertura jornalística, matérias históricas, clipping e registros editoriais sobre qualidade do ar e meio ambiente.",
        tone: "seed" as const,
    },
    {
        href: "/acervo/midias",
        label: "Mídias",
        kicker: "Memória audiovisual",
        emoji: "🎬",
        description:
            "Vídeos, fotorreportagens, podcasts e materiais audiovisuais de memória pública e comunicação ambiental.",
        tone: "lab" as const,
    },
    {
        href: "/acervo/documentos",
        label: "Documentos e relatórios",
        kicker: "Base institucional",
        emoji: "🏛️",
        description:
            "Atas, documentos históricos, relatórios técnicos, boletins e materiais institucionais de referência.",
        tone: "warm" as const,
    },
];

export function AcervoPage() {
    const [featured, setFeatured] = useState<AcervoItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await listFeaturedAcervo(6);
                setFeatured(data);
            } catch (err) {
                console.error("Erro ao carregar destaques:", err);
            } finally {
                setLoading(false);
            }
        }
        void load();
    }, []);

    return (
        <section className="acervo-hub space-y-8 md:space-y-10">
            <SurfaceCard className="acervo-hub-hero overflow-hidden p-0">
                <div className="acervo-hub-hero-grid">
                    <div className="acervo-hub-copy">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <AxisEyebrow axis="acervo">Acervo vivo</AxisEyebrow>
                            <span className="semear-core-disc h-6 w-6" aria-hidden="true" />
                        </div>
                        <h1>Curadoria de conteúdo para ciência aberta e memória pública.</h1>
                        <p>
                            O Acervo SEMEAR organiza artigos, matérias, mídias e documentos em uma experiência de consulta
                            mais clara para educação ambiental, transparência e engajamento comunitário.
                        </p>
                        <div className="acervo-hub-metrics" aria-label="Resumo do acervo">
                            <div>
                                <span>4</span>
                                <small>frentes curatoriais</small>
                            </div>
                            <div>
                                <span>{loading ? "..." : featured.length}</span>
                                <small>destaques públicos</small>
                            </div>
                            <div>
                                <span>histórico</span>
                                <small>linha do tempo</small>
                            </div>
                        </div>
                    </div>

                    <Link to="/acervo/linha" className="acervo-timeline-brief group">
                        <IconShell tone="warm" className="h-14 w-14 shrink-0 rounded-full">
                            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </IconShell>
                        <div>
                            <AxisEyebrow axis="timeline">Linha do Tempo</AxisEyebrow>
                            <h2>Navegue pelo acervo histórico</h2>
                            <p>
                                Toda a história documentada do projeto, ano a ano, do presente ao passado.
                            </p>
                        </div>
                        <span>Explorar história →</span>
                    </Link>
                </div>
            </SurfaceCard>

            {/* Áreas do acervo */}
            <div className="acervo-area-grid">
                {areas.map((area) => (
                    <Link key={area.href} to={area.href} className="group motion-list-item block h-full">
                        <article className="acervo-area-card">
                            <div className="flex items-start gap-4">
                                <IconShell tone={area.tone} className="h-12 w-12 shrink-0 rounded-2xl">
                                    <span className="text-xl leading-none" role="img" aria-label={area.label}>
                                        {area.emoji}
                                    </span>
                                </IconShell>
                                <div className="min-w-0 flex-1">
                                    <span>{area.kicker}</span>
                                    <h2>{area.label}</h2>
                                    <p>{area.description}</p>
                                </div>
                            </div>
                            <strong>
                                Explorar {area.label.toLowerCase()}
                                <span aria-hidden="true">→</span>
                            </strong>
                        </article>
                    </Link>
                ))}
            </div>

            {/* Destaques */}
            {(loading || featured.length > 0) && (
                <SurfaceCard className="acervo-featured-panel p-5 md:p-6">
                    <div className="mb-2 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                      <div className="space-y-2">
                        <AxisEyebrow axis="acervo">Destaques</AxisEyebrow>
                        <h2 className="axis-heading-acervo text-xl md:text-2xl">Em destaque no acervo</h2>
                      </div>
                      <Link to="/acervo/linha" className="ui-btn-ghost w-fit">Ver linha do tempo →</Link>
                    </div>
                    {loading ? (
                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                            <BrandTextureSkeleton className="h-36 rounded-[1.5rem]" lines={3} />
                            <BrandTextureSkeleton className="h-36 rounded-[1.5rem]" lines={3} />
                            <BrandTextureSkeleton className="h-36 rounded-[1.5rem]" lines={3} />
                            <BrandTextureSkeleton className="h-36 rounded-[1.5rem]" lines={3} />
                        </div>
                    ) : (
                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                            {featured.map((item) => (
                                <Link
                                    key={item.id}
                                    to={`/acervo/item/${item.slug}`}
                                    className="group motion-list-item block h-full"
                                >
                                    <EditorialCard variant="compact" tone="acervo">
                                        <EditorialCardBody className="justify-between">
                                            <div className="space-y-2">
                                                <EditorialCardMeta className="justify-between">
                                                    <Chip tone="active">{ACERVO_KIND_LABELS[item.kind] ?? item.kind}</Chip>
                                                    {item.year ? <span>{item.year}</span> : null}
                                                </EditorialCardMeta>
                                                <EditorialCardTitle className="line-clamp-2 text-base md:text-lg">
                                                    {item.title}
                                                </EditorialCardTitle>
                                                {item.excerpt ? (
                                                    <EditorialCardExcerpt className="line-clamp-2 text-sm">
                                                        {item.excerpt}
                                                    </EditorialCardExcerpt>
                                                ) : null}
                                            </div>
                                            <EditorialCardActions className="pt-1">
                                                <span className="inline-flex items-center gap-2 text-sm font-bold text-brand-primary">
                                                    Ler mais
                                                    <span aria-hidden="true">→</span>
                                                </span>
                                            </EditorialCardActions>
                                        </EditorialCardBody>
                                    </EditorialCard>
                                </Link>
                            ))}
                        </div>
                    )}
                    <BrandRadialDivider className="mt-5" />
                </SurfaceCard>
            )}
        </section>
    );
}
