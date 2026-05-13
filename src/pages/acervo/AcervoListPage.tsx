import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { IconShell, SectionHeader, SurfaceCard } from "../../components/BrandSystem";
import { BrandIllustratedEmptyState, BrandTextureSkeleton } from "../../components/BrandMicro";
import { DocumentalCard } from "../../components/CardFamilies";
import { listAcervoItems, type AcervoItem, type AcervoKind } from "../../lib/api";
import { ACERVO_KIND_LABELS, type AcervoArea, AREA_KINDS } from "../../lib/acervo";

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

const SOURCE_TYPE_LABELS: Record<string, string> = {
  cientifico: "Científico",
  imprensa: "Imprensa",
  institucional: "Institucional",
  pessoal: "Pessoal"
};

function isAcervoArea(value: string | undefined): value is AcervoArea {
  return value === "artigos" || value === "noticias" || value === "midias";
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
        Área inválida. Use /acervo/artigos, /acervo/noticias ou /acervo/midias.
      </p>
    );
  }

  const meta = AREA_META[area];

  return (
    <section className="space-y-10 md:space-y-12">
      <SurfaceCard className="signature-shell document-placeholder p-6 md:p-8">
        <SectionHeader
          eyebrow={`Acervo / ${meta.label}`}
          title={`${meta.emoji} ${meta.label}`}
          description={meta.description}
        />
      </SurfaceCard>

      <SurfaceCard className="p-5 md:p-6">
        <div className="grid gap-4 md:grid-cols-4">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Busca</span>
            <input
              className="motion-focus w-full rounded-full border border-border-subtle bg-surface-1 px-3 py-2 text-base text-text-primary outline-none"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Título, autor ou resumo..."
              type="search"
              value={search}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Tag</span>
            <select
              className="motion-focus w-full rounded-full border border-border-subtle bg-surface-1 px-3 py-2 text-base text-text-primary outline-none"
              onChange={(e) => setTagFilter(e.target.value)}
              value={tagFilter}
            >
              <option value="">Todas</option>
              {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Fonte</span>
            <select
              className="motion-focus w-full rounded-full border border-border-subtle bg-surface-1 px-3 py-2 text-base text-text-primary outline-none"
              onChange={(e) => setSourceTypeFilter(e.target.value)}
              value={sourceTypeFilter}
            >
              <option value="">Todas</option>
              {allSourceTypes.map((t) => <option key={t} value={t}>{SOURCE_TYPE_LABELS[t] || t}</option>)}
            </select>
          </label>
          <div className="flex flex-col justify-end">
            <label className="flex cursor-pointer items-center gap-2">
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
        {(search || tagFilter || yearFilter || sourceTypeFilter || featuredOnly) && (
          <button
            className="mt-3 text-sm font-semibold text-brand-primary underline hover:text-brand-primary/80"
            onClick={() => { setSearch(""); setTagFilter(""); setYearFilter(""); setSourceTypeFilter(""); setFeaturedOnly(false); }}
            type="button"
          >
            Limpar filtros
          </button>
        )}
      </SurfaceCard>

      <SurfaceCard className="p-6">
        {loading ? (
          <div className="grid gap-5 lg:grid-cols-2" aria-live="polite" aria-busy="true">
            <BrandTextureSkeleton className="h-56 rounded-[1.6rem]" lines={4} />
            <BrandTextureSkeleton className="h-56 rounded-[1.6rem]" lines={4} />
          </div>
        ) : error ? (
          <p aria-live="assertive" className="rounded-md border border-error bg-error/10 p-3 text-base text-error" role="alert">{error}</p>
        ) : filtered.length === 0 ? (
          <BrandIllustratedEmptyState
            title={items.length === 0 ? `Nenhum item publicado em ${meta.label} ainda.` : "Nenhum resultado para os filtros aplicados."}
            description="Ajuste os filtros ou volte depois para acompanhar novas entradas da biblioteca viva do SEMEAR."
            icon={<span className="text-2xl" aria-hidden="true">📭</span>}
          />
        ) : (
          <ul className="grid gap-4 lg:grid-cols-2">
            {filtered.map((item) => {
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
                    <DocumentalCard
                      variant="compact"
                      kindLabel={ACERVO_KIND_LABELS[item.kind]}
                      date={dateStr}
                      title={item.title}
                      summary={summary}
                      tags={item.tags}
                      featured={item.featured}
                      onTagClick={(t) => setTagFilter(t)}
                      cta="Abrir item"
                    />
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
