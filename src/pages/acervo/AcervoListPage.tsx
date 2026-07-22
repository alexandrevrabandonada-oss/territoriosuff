import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "../../styles/acervo.css";

import { IconShell, SurfaceCard } from "../../components/BrandSystem";
import { BrandIllustratedEmptyState, BrandTextureSkeleton } from "../../components/BrandMicro";
import { listAcervoItems, type AcervoItem, type AcervoKind } from "../../lib/api";
import { ACERVO_KIND_LABELS, type AcervoArea, AREA_KINDS } from "../../lib/acervo";
import { usePageMetadata } from "../../hooks/usePageMetadata";

const AREA_ORDER: AcervoArea[] = ["artigos", "noticias", "midias", "documentos"];

const AREA_META: Record<AcervoArea, { label: string; shortLabel: string; eyebrow: string; emoji: string; description: string; detail: string; tone: "brand" | "seed" | "lab" | "warm"; accent: string; gradient: string }> = {
  artigos: {
    label: "Artigos científicos",
    shortLabel: "Artigos",
    eyebrow: "Pesquisa aberta",
    emoji: "📄",
    description: "Papers, estudos e publicações acadêmicas do Acervo SEMEAR.",
    detail: "Produção científica organizada para leitura pública, referência técnica e uso em ações de educação ambiental.",
    tone: "brand",
    accent: "from-brand-primary to-accent-lab",
    gradient: "from-brand-primary/14 via-surface-1 to-accent-lab/10"
  },
  noticias: {
    label: "Notícias e matérias",
    shortLabel: "Notícias",
    eyebrow: "Memória pública",
    emoji: "📰",
    description: "Cobertura jornalística, matérias históricas e clipping sobre qualidade do ar e meio ambiente.",
    detail: "Registros editoriais que ajudam a contextualizar território, saúde, ambiente e participação social.",
    tone: "seed",
    accent: "from-accent-seed to-brand-primary",
    gradient: "from-accent-seed/14 via-surface-1 to-brand-primary/10"
  },
  midias: {
    label: "Mídias",
    shortLabel: "Mídias",
    eyebrow: "Registro audiovisual",
    emoji: "🎬",
    description: "Fotos, vídeos, galerias e materiais audiovisuais do Acervo.",
    detail: "Narrativas visuais e sonoras para aproximar dados, pessoas e territórios.",
    tone: "lab",
    accent: "from-accent-lab to-brand-primary",
    gradient: "from-accent-lab/14 via-surface-1 to-brand-primary/10"
  },
  documentos: {
    label: "Documentos e relatórios",
    shortLabel: "Documentos",
    eyebrow: "Base documental",
    emoji: "🏛️",
    description: "Documentos históricos, relatórios técnicos, boletins e registros institucionais.",
    detail: "Materiais de referência para auditoria pública, memória institucional e acompanhamento técnico.",
    tone: "warm",
    accent: "from-accent-brown to-brand-primary",
    gradient: "from-accent-yellow/18 via-surface-1 to-brand-primary/10"
  }
};

const SOURCE_TYPE_LABELS: Record<string, string> = {
  cientifico: "Científico",
  imprensa: "Imprensa",
  institucional: "Institucional",
  pessoal: "Pessoal",
  academic_journal: "Revista acadêmica",
  book: "Livro",
  book_chapter: "Capítulo de livro",
  thesis: "Tese/dissertação",
  audiovisual: "Audiovisual",
  historico: "Histórico"
};

function isAcervoArea(value: string | undefined): value is AcervoArea {
  return value === "artigos" || value === "noticias" || value === "midias" || value === "documentos";
}

function highlightText(text: string, highlight: string) {
  if (!highlight.trim()) return <span>{text}</span>;
  const parts = text.split(new RegExp(`(${highlight.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark key={i} className="bg-amber-100 text-amber-950 px-0.5 rounded font-semibold">{part}</mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export function AcervoListPage() {
  const { area } = useParams<{ area: string }>();
  const [items, setItems] = useState<AcervoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [sourceTypeFilter, setSourceTypeFilter] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const areaMetadata = isAcervoArea(area) ? AREA_META[area] : null;

  usePageMetadata({
    title: areaMetadata?.label,
    description: areaMetadata?.description
  });

  useEffect(() => {
    if (!isAcervoArea(area)) return;
    let cancelled = false;

    const kinds = AREA_KINDS[area];

    async function run() {
      try {
        setLoading(true);
        setError(null);
        setSearch("");
        setTagFilter("");
        setYearFilter("");
        setSourceTypeFilter("");
        setFeaturedOnly(false);
        const results = await Promise.all(kinds.map((k) => listAcervoItems({ kind: k as AcervoKind, limit: 100 })));
        const merged = results.flat().sort((a, b) => {
          const ta = a.published_at ?? "";
          const tb = b.published_at ?? "";
          return tb.localeCompare(ta);
        });
        if (!cancelled) setItems(merged);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Falha ao carregar itens do acervo.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void run();
    return () => { cancelled = true; };
  }, [area]);

  const allTags = useMemo(() => Array.from(new Set(items.flatMap((i) => i.tags))).sort(), [items]);
  const allYears = useMemo(
    () => Array.from(new Set(items.map((i) => i.year).filter((y): y is number => y !== null))).sort((a, b) => b - a).map(String),
    [items]
  );
  const allSourceTypes = useMemo(() => Array.from(new Set(items.map((i) => i.source_type).filter((t): t is string => t !== null))).sort(), [items]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter((item) => {
      const matchSearch = !q || item.title.toLowerCase().includes(q) || (item.excerpt ?? "").toLowerCase().includes(q) || (item.authors ?? "").toLowerCase().includes(q);
      const matchTag = !tagFilter || item.tags.includes(tagFilter);
      const matchYear = !yearFilter || String(item.year ?? "") === yearFilter;
      const matchSourceType = !sourceTypeFilter || item.source_type === sourceTypeFilter;
      const matchFeatured = !featuredOnly || item.featured;
      return matchSearch && matchTag && matchYear && matchSourceType && matchFeatured;
    });
  }, [items, search, tagFilter, yearFilter, sourceTypeFilter, featuredOnly]);

  if (!isAcervoArea(area)) {
    return (
      <p aria-live="polite" className="rounded-md border border-error bg-error/10 p-3 text-base text-error" role="alert">
        Área inválida. Use /acervo/artigos, /acervo/noticias, /acervo/midias ou /acervo/documentos.
      </p>
    );
  }

  const meta = AREA_META[area];
  const activeFilterCount = [search, tagFilter, yearFilter, sourceTypeFilter, featuredOnly ? "featured" : ""].filter(Boolean).length;
  const latestYear = allYears[0] ?? "Atual";

  return (
    <section className="space-y-7 md:space-y-9">
      <SurfaceCard className={`signature-shell overflow-hidden bg-gradient-to-br ${meta.gradient} p-0`}>
        <div className="relative grid gap-6 p-5 md:grid-cols-[1fr_auto] md:p-8">
          <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-white/45 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute bottom-0 right-10 hidden h-36 w-36 rounded-full border border-brand-primary/10 bg-[radial-gradient(circle,rgba(0,93,170,0.12)_1px,transparent_1.5px)] bg-[length:13px_13px] md:block" aria-hidden="true" />

          <div className="relative min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <span className="section-badge">Acervo / {meta.eyebrow}</span>
              <span className="ui-seal">{filtered.length} de {items.length} itens</span>
            </div>
            <div className="mt-6 flex flex-col gap-5 md:flex-row md:items-end">
              <IconShell tone={meta.tone} className="h-16 w-16 rounded-[1.35rem] text-2xl shadow-[0_18px_40px_rgba(17,38,59,0.10)]">
                <span aria-hidden="true">{meta.emoji}</span>
              </IconShell>
              <div className="min-w-0">
                <h1 className="max-w-4xl text-4xl font-black leading-[0.95] tracking-[-0.045em] text-text-primary md:text-6xl">
                  {meta.label}
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-relaxed text-text-secondary md:text-lg">
                  {meta.description} {meta.detail}
                </p>
              </div>
            </div>
          </div>

          <div className="relative grid min-w-[14rem] gap-3 rounded-[1.75rem] border border-white/70 bg-white/72 p-4 shadow-[0_20px_55px_rgba(17,38,59,0.10)] backdrop-blur md:self-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-text-secondary">Coleção</p>
              <p className="mt-1 text-3xl font-black text-text-primary">{items.length}</p>
              <p className="text-xs font-semibold text-text-secondary">publicações indexadas</p>
            </div>
            <div className={`h-1.5 rounded-full bg-gradient-to-r ${meta.accent}`} aria-hidden="true" />
            <div className="grid grid-cols-2 gap-2 text-xs font-bold text-text-secondary">
              <span className="rounded-2xl border border-border-subtle bg-surface-1 px-3 py-2">Ano {latestYear}</span>
              <span className="rounded-2xl border border-border-subtle bg-surface-1 px-3 py-2">{allTags.length} tags</span>
            </div>
          </div>
        </div>
      </SurfaceCard>

      <div className="grid gap-3 md:grid-cols-4">
        {AREA_ORDER.map((areaKey) => {
          const areaMeta = AREA_META[areaKey];
          const isActive = areaKey === area;
          return (
            <Link
              key={areaKey}
              to={`/acervo/${areaKey}`}
              className={`group relative overflow-hidden rounded-[1.35rem] border p-4 transition-all duration-200 ${isActive ? "border-brand-primary/25 bg-white shadow-[0_18px_42px_rgba(0,93,170,0.12)]" : "border-border-subtle bg-white/70 hover:-translate-y-0.5 hover:border-brand-primary/20 hover:bg-white hover:shadow-[0_16px_36px_rgba(17,38,59,0.08)]"}`}
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${areaMeta.accent} ${isActive ? "opacity-100" : "opacity-35 group-hover:opacity-80"}`} aria-hidden="true" />
              <div className="flex items-center gap-3">
                <IconShell tone={areaMeta.tone} className="h-11 w-11 rounded-2xl text-lg">
                  <span aria-hidden="true">{areaMeta.emoji}</span>
                </IconShell>
                <div className="min-w-0">
                  <p className="text-sm font-black text-text-primary">{areaMeta.shortLabel}</p>
                  <p className="truncate text-xs font-semibold text-text-secondary">{areaMeta.eyebrow}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <SurfaceCard className="p-4 md:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-primary-dark">Refinar acervo</p>
            <p className="text-sm text-text-secondary">Busque por conteúdo, recorte temporal, fonte e destaques.</p>
          </div>
          {activeFilterCount > 0 && (
            <button
              className="ui-btn-ghost"
              onClick={() => { setSearch(""); setTagFilter(""); setYearFilter(""); setSourceTypeFilter(""); setFeaturedOnly(false); }}
              type="button"
            >
              Limpar {activeFilterCount} filtro{activeFilterCount > 1 ? "s" : ""}
            </button>
          )}
        </div>
        <div className="grid gap-3 md:grid-cols-[1.35fr_0.8fr_0.8fr_0.8fr_auto]">
          <label className="block">
            <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.18em] text-text-secondary">Busca</span>
            <input
              className="motion-focus min-h-[3rem] w-full rounded-2xl border border-border-subtle bg-surface-1 px-4 text-base text-text-primary outline-none"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Título, autor ou resumo..."
              type="search"
              value={search}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.18em] text-text-secondary">Tag</span>
            <select
              className="motion-focus min-h-[3rem] w-full rounded-2xl border border-border-subtle bg-surface-1 px-4 text-base text-text-primary outline-none"
              onChange={(e) => setTagFilter(e.target.value)}
              value={tagFilter}
            >
              <option value="">Todas</option>
              {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.18em] text-text-secondary">Ano</span>
            <select
              className="motion-focus min-h-[3rem] w-full rounded-2xl border border-border-subtle bg-surface-1 px-4 text-base text-text-primary outline-none"
              onChange={(e) => setYearFilter(e.target.value)}
              value={yearFilter}
            >
              <option value="">Todos</option>
              {allYears.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.18em] text-text-secondary">Fonte</span>
            <select
              className="motion-focus min-h-[3rem] w-full rounded-2xl border border-border-subtle bg-surface-1 px-4 text-base text-text-primary outline-none"
              onChange={(e) => setSourceTypeFilter(e.target.value)}
              value={sourceTypeFilter}
            >
              <option value="">Todas</option>
              {allSourceTypes.map((t) => <option key={t} value={t}>{SOURCE_TYPE_LABELS[t] || t}</option>)}
            </select>
          </label>
          <div className="flex flex-col justify-end">
            <label className="flex min-h-[3rem] cursor-pointer items-center gap-2 rounded-2xl border border-border-subtle bg-surface-1 px-4">
              <input
                checked={featuredOnly}
                className="size-4 rounded border-border-subtle bg-white text-brand-primary focus:ring-brand-primary"
                onChange={(e) => setFeaturedOnly(e.target.checked)}
                type="checkbox"
              />
              <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Apenas destaques</span>
            </label>
          </div>
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t border-border-subtle pt-4 mt-4">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-text-secondary">Tags Populares:</span>
            <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto">
              {allTags.slice(0, 15).map((tag) => {
                const isActive = tagFilter === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setTagFilter(isActive ? "" : tag)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold border transition-all ${
                      isActive
                        ? "border-brand-primary bg-brand-primary text-white shadow-md shadow-brand-primary/10"
                        : "border-border-subtle bg-surface-2 text-text-secondary hover:border-brand-primary/30 hover:text-text-primary"
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </SurfaceCard>

      <SurfaceCard className="overflow-hidden p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle bg-gradient-to-r from-surface-1 to-brand-primary-soft/35 px-5 py-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-text-secondary">Resultados</p>
            <h2 className="text-xl font-black tracking-tight text-text-primary">
              {filtered.length} {filtered.length === 1 ? "publicação encontrada" : "publicações encontradas"}
            </h2>
          </div>
          <span className="ui-seal">{meta.shortLabel}</span>
        </div>
        {loading ? (
          <div className="grid gap-5 p-5 lg:grid-cols-2" aria-live="polite" aria-busy="true">
            <BrandTextureSkeleton className="h-56 rounded-[1.6rem]" lines={4} />
            <BrandTextureSkeleton className="h-56 rounded-[1.6rem]" lines={4} />
          </div>
        ) : error ? (
          <p aria-live="assertive" className="m-5 rounded-md border border-error bg-error/10 p-3 text-base text-error" role="alert">{error}</p>
        ) : filtered.length === 0 ? (
          <div className="p-5">
            <BrandIllustratedEmptyState
              title={items.length === 0 ? `Nenhum item publicado em ${meta.label} ainda.` : "Nenhum resultado para os filtros aplicados."}
              description="Ajuste os filtros ou volte depois para acompanhar novas entradas da biblioteca viva do SEMEAR."
              icon={<span className="text-2xl" aria-hidden="true">📭</span>}
            />
          </div>
        ) : (
          <ul className="grid gap-4 p-5 lg:grid-cols-2">
            {filtered.map((item, index) => {
              const dateStr = item.published_at
                ? new Date(item.published_at).toLocaleDateString("pt-BR")
                : item.year ? String(item.year) : undefined;
              const summary = [
                item.authors ? `Por: ${item.authors}` : null,
                item.excerpt,
                item.source_name ? `Fonte: ${item.source_name}` : null,
              ].filter(Boolean).join(" · ") || undefined;
              return (
                <li key={item.slug}>
                  <Link
                    className="group motion-list-item block h-full"
                    to={`/acervo/item/${item.slug}`}
                  >
                    <article className="relative flex h-full min-h-[17rem] overflow-hidden rounded-[1.65rem] border border-border-subtle bg-white shadow-[0_12px_30px_rgba(17,38,59,0.06)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-brand-primary/25 group-hover:shadow-[0_24px_55px_rgba(17,38,59,0.12)]">
                      <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${meta.accent}`} aria-hidden="true" />
                      <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-brand-primary-soft/70 transition-transform duration-500 group-hover:scale-125" aria-hidden="true" />
                      <div className="absolute bottom-4 right-4 text-7xl font-black leading-none text-brand-primary/[0.035]" aria-hidden="true">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div className="relative flex flex-1 flex-col gap-4 p-5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className={`inline-flex items-center rounded-full border border-brand-primary/15 bg-gradient-to-r ${meta.gradient} px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-brand-primary-dark`}>
                            {ACERVO_KIND_LABELS[item.kind]}
                          </span>
                          <div className="flex items-center gap-2">
                            {item.featured && (
                              <span className="rounded-full border border-accent-yellow/35 bg-accent-yellow/15 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-warning">
                                Destaque
                              </span>
                            )}
                            {dateStr && <span className="text-[11px] font-bold tabular-nums text-text-secondary">{dateStr}</span>}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h3 className="line-clamp-3 text-xl font-black leading-[1.05] tracking-[-0.025em] text-text-primary transition-colors group-hover:text-brand-primary-dark">
                            {highlightText(item.title, search)}
                          </h3>
                          {summary && (
                            <p className="line-clamp-3 text-sm leading-relaxed text-text-secondary">
                              {highlightText(summary, search)}
                            </p>
                          )}
                        </div>

                        {item.tags.length > 0 && (
                          <div className="mt-auto flex flex-wrap gap-1.5">
                            {item.tags.slice(0, 5).map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                className="rounded-full border border-border-subtle bg-surface-2 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-text-secondary transition-colors hover:border-brand-primary/25 hover:bg-brand-primary-soft hover:text-brand-primary-dark"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setTagFilter(tag); }}
                                aria-label={`Filtrar por ${tag}`}
                              >
                                #{tag}
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-3 border-t border-border-subtle pt-4">
                          <span className="text-xs font-black uppercase tracking-[0.16em] text-brand-primary-dark">Abrir item</span>
                          <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-primary text-white shadow-[0_12px_24px_rgba(0,93,170,0.22)] transition-transform group-hover:translate-x-1" aria-hidden="true">
                            →
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </SurfaceCard>
    </section>
  );
}
