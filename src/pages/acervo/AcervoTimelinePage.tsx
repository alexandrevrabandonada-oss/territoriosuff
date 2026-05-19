import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { getAcervoByYear, getAcervoYearIndex, type AcervoItem, type AcervoYearIndex } from "../../lib/api";
import { ACERVO_KIND_LABELS, type AcervoArea, AREA_KINDS } from "../../lib/acervo";
import { getOptimizedCover } from "../../lib/imageOptimization";
import { Chip, EditorialCard, EditorialCardActions, EditorialCardBody, EditorialCardExcerpt, EditorialCardMeta, EditorialCardTitle, IconShell, SurfaceCard } from "../../components/BrandSystem";
import { AxisEyebrow } from "../../components/AxisSystem";

const AREA_META: Record<AcervoArea, { label: string; emoji: string; description: string; color: string }> = {
  artigos: {
    label: "Artigos",
    emoji: "📄",
    description: "Publicações científicas, relatórios técnicos e papers acadêmicos.",
    color: "border-ciano/60"
  },
  noticias: {
    label: "Notícias",
    emoji: "📰",
    description: "Cobertura jornalística e links sobre qualidade do ar e meio ambiente.",
    color: "border-acento/60"
  },
  midias: {
    label: "Mídias",
    emoji: "🎬",
    description: "Vídeos, fotorreportagens e materiais audiovisuais.",
    color: "border-primaria/60"
  }
};

function isAcervoArea(value: string | undefined): value is AcervoArea {
  return value === "artigos" || value === "noticias" || value === "midias";
}

function TypeBadge({ kind }: { kind: string }) {
  return <span className="ui-chip">{ACERVO_KIND_LABELS[kind as keyof typeof ACERVO_KIND_LABELS] || "Link"}</span>;
}

export function AcervoTimelinePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryYear = searchParams.get("year");
  const selectedYear = queryYear ? parseInt(queryYear, 10) : null;

  const [index, setIndex] = useState<AcervoYearIndex[]>([]);
  const [items, setItems] = useState<AcervoItem[]>([]);
  const [isLoadingIndex, setIsLoadingIndex] = useState(true);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const area = useMemo(() => {
    const first = AREA_KINDS.artigos ? "artigos" : undefined;
    return isAcervoArea(first) ? first : "artigos";
  }, []);

  const handleSelectYear = (year: number) => {
    setSearchParams({ year: String(year) }, { replace: true });
  };

  useEffect(() => {
    async function loadIndex() {
      try {
        setIsLoadingIndex(true);
        const data = await getAcervoYearIndex();
        setIndex(data);
        if (data.length > 0 && !queryYear) {
          setSearchParams({ year: String(data[0].year) }, { replace: true });
        }
      } catch (err: any) {
        setError(err.message || "Erro ao carregar a linha do tempo.");
      } finally {
        setIsLoadingIndex(false);
      }
    }
    void loadIndex();
  }, [queryYear, setSearchParams]);

  useEffect(() => {
    async function loadItems() {
      if (!selectedYear) return;
      try {
        setIsLoadingItems(true);
        const data = await getAcervoByYear(selectedYear);
        setItems(data);
      } catch (err: any) {
        setError(err.message || "Erro ao consultar ano.");
      } finally {
        setIsLoadingItems(false);
      }
    }
    void loadItems();
  }, [selectedYear]);

  if (!isAcervoArea(area)) {
    return (
      <p aria-live="polite" className="rounded-md border border-error bg-error/10 p-3 text-base text-error" role="alert">
        Área inválida. Use /acervo/artigos, /acervo/noticias ou /acervo/midias.
      </p>
    );
  }

  const meta = AREA_META[area];

  return (
    <section className="portal-stage timeline-stage space-y-8 md:space-y-10">
      <SurfaceCard className="portal-stage-hero portal-stage-hero-documental overflow-hidden p-0">
        <div className="portal-stage-hero-inner">
          <div className="portal-stage-copy">
            <IconShell tone="warm" className="portal-stage-icon"><span aria-hidden="true">{meta.emoji}</span></IconShell>
            <h1>Linha do tempo do acervo</h1>
            <p>{meta.description} Navegue por ano para acompanhar a memória pública preservada pelo SEMEAR.</p>
          </div>
          <div className="portal-stage-stat"><span>{selectedYear ?? "—"}</span><small>ano selecionado</small></div>
        </div>
      </SurfaceCard>

      <div className="grid gap-6 md:grid-cols-[minmax(240px,280px)_minmax(0,1fr)]">
        <aside className="space-y-4 md:sticky md:top-24 md:self-start">
          <SurfaceCard className="p-5">
            <AxisEyebrow axis="timeline">Linha do tempo</AxisEyebrow>
            <p className="mt-2 text-sm text-text-secondary">Navegue pelo acervo histórico por ano de publicação.</p>
          </SurfaceCard>
          <SurfaceCard className="p-4">
            {isLoadingIndex ? (
              <p className="text-sm text-text-secondary motion-pop">Calculando períodos...</p>
            ) : (
              <div className="grid gap-2">
                {index.map((entry) => (
                  <button
                    key={entry.year}
                    onClick={() => handleSelectYear(entry.year)}
                    className={`motion-control motion-focus flex items-center justify-between rounded-2xl border px-4 py-3 text-left ${selectedYear === entry.year
                      ? "border-accent-brown/20 bg-accent-yellow/15 text-accent-brown"
                      : "border-border-subtle bg-surface-1 text-text-secondary hover:border-accent-brown/15 hover:bg-accent-yellow/10 hover:text-accent-brown"
                    }`}
                  >
                    <span className="font-mono text-lg font-black">{entry.year}</span>
                    <span className="ml-4 text-[10px] font-bold uppercase tracking-widest opacity-60">
                      {entry.total} {entry.total === 1 ? "item" : "itens"}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </SurfaceCard>
        </aside>

        <main className="space-y-6">
          {error && (
            <div className="rounded-md border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          {selectedYear && (
            <SurfaceCard className="axis-section-header-timeline p-5 md:p-6">
              <div className="flex items-end gap-3 border-b border-accent-brown/15 pb-4">
                <h2 className="axis-heading-timeline text-4xl">{selectedYear}</h2>
                <span className="mb-1 text-xs font-bold uppercase tracking-widest text-accent-brown">Documentos preservados</span>
              </div>
            </SurfaceCard>
          )}

          <SurfaceCard className="signature-surface p-5 md:p-6">
            {isLoadingItems ? (
              <p className="text-sm text-text-secondary motion-pop">Restaurando arquivos...</p>
            ) : items.length === 0 && !isLoadingIndex ? (
              <div className="seed-placeholder py-8 text-center">
                <p className="text-4xl">📭</p>
                <p className="mt-3 text-base font-semibold text-text-secondary">Nenhum item encontrado para este ano.</p>
              </div>
            ) : (
              <div className="grid gap-5 lg:grid-cols-2">
                {items.map((item) => (
                  <Link key={item.slug} to={`/acervo/item/${item.slug}`} className="group motion-list-item block h-full">
                    <EditorialCard variant={getOptimizedCover(item, "thumb") ? "media" : "compact"} tone="timeline">
                      {getOptimizedCover(item, "thumb") ? (
                        <div className="h-32 w-full overflow-hidden bg-surface-2 md:h-36">
                          <img
                            src={getOptimizedCover(item, "thumb")!}
                            alt={item.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="axis-placeholder-timeline flex h-32 w-full flex-col justify-between p-4">
                          <AxisEyebrow axis="timeline" className="w-fit">SEMEAR</AxisEyebrow>
                          <span className="text-xs font-black uppercase leading-tight text-text-primary">Item do acervo</span>
                        </div>
                      )}

                      <EditorialCardBody className="gap-2">
                        <EditorialCardMeta className="justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <TypeBadge kind={item.kind} />
                            {item.year && <Chip tone="active">{item.year}</Chip>}
                            {item.source_name && <Chip tone="default">{item.source_name}</Chip>}
                          </div>
                          {item.published_at && <span className="shrink-0 text-sm text-text-secondary">{new Date(item.published_at).toLocaleDateString("pt-BR")}</span>}
                        </EditorialCardMeta>
                        <EditorialCardTitle className="line-clamp-2 text-lg md:text-xl">{item.title}</EditorialCardTitle>
                        {item.curator_note ? (
                          <div className="rounded-2xl border border-accent-brown/15 bg-accent-brown/5 p-3 italic text-text-primary">
                            <span className="mb-1 block text-[9px] font-black uppercase tracking-widest text-accent-brown">Nota do curador</span>
                            <p className="text-xs">{item.curator_note}</p>
                          </div>
                        ) : item.excerpt ? (
                          <EditorialCardExcerpt className="line-clamp-2 text-sm">{item.excerpt}</EditorialCardExcerpt>
                        ) : null}
                        <EditorialCardActions className="pt-1">
                          <span className="inline-flex items-center gap-2 text-sm font-bold text-brand-primary">
                            Abrir item
                            <span aria-hidden="true">→</span>
                          </span>
                        </EditorialCardActions>
                      </EditorialCardBody>
                    </EditorialCard>
                  </Link>
                ))}
              </div>
            )}
          </SurfaceCard>
        </main>
      </div>
    </section>
  );
}

