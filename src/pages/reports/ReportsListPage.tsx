import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Chip, SurfaceCard } from "../../components/BrandSystem";
import { BrandIllustratedEmptyState, BrandTextureSkeleton } from "../../components/BrandMicro";
import { AxisEyebrow } from "../../components/AxisSystem";
import { DocumentalCard } from "../../components/CardFamilies";
import { PortalSectionHeader } from "../../components/portal";
import { getOptimizedCover } from "../../lib/imageOptimization";
import type { ReportDocument, ReportKind } from "../../lib/api";

const KIND_LABEL: Record<ReportKind, string> = {
  relatorio: "Relatório",
  "nota-tecnica": "Nota Técnica",
  boletim: "Boletim",
  anexo: "Anexo"
};

export function ReportsListPage() {
  const [allReports, setAllReports] = useState<ReportDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [year, setYear] = useState<string>("all");
  const [kind, setKind] = useState<"all" | ReportKind>("all");
  const [tag, setTag] = useState<string>("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadAll() {
      try {
        setLoading(true);
        setError(null);
        const { listReports } = await import("../../lib/api/content");
        const data = await listReports({ limit: 500 });
        if (cancelled) return;
        setAllReports(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Falha ao carregar relatórios.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadAll();
    return () => {
      cancelled = true;
    };
  }, []);

  const reports = useMemo(() => {
    const term = q.trim().toLocaleLowerCase("pt-BR");
    return allReports.filter((item) => {
      if (year !== "all" && item.year !== Number(year)) return false;
      if (kind !== "all" && item.kind !== kind) return false;
      if (tag !== "all" && !item.tags.includes(tag)) return false;
      if (!term) return true;
      return `${item.title} ${item.summary ?? ""}`.toLocaleLowerCase("pt-BR").includes(term);
    });
  }, [allReports, kind, q, tag, year]);

  const yearOptions = useMemo(() => {
    const years = Array.from(new Set(allReports.map((item) => item.year).filter((v): v is number => typeof v === "number")));
    return years.sort((a, b) => b - a);
  }, [allReports]);

  const tagOptions = useMemo(() => {
    const tags = new Set<string>();
    allReports.forEach((item) => item.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [allReports]);

  const featuredReports = useMemo(() => reports.filter((item) => item.featured).slice(0, 3), [reports]);
  const featuredIds = useMemo(() => new Set(featuredReports.map((item) => item.id)), [featuredReports]);
  const regularReports = useMemo(() => reports.filter((item) => !featuredIds.has(item.id)), [featuredIds, reports]);
  const catalogIsEmpty = !loading && !error && allReports.length === 0;

  return (
    <>
      {!loading && !error && !catalogIsEmpty ? <SurfaceCard className="portal-filter-panel p-5 md:p-6">
        <PortalSectionHeader
          eyebrow={<span className="badge-dados-abertos">Catálogo público de evidências</span>}
          title="Filtrar por ano, tipo, tema e busca"
          subtitle="Use os filtros para transformar a biblioteca de PDFs em uma central de leitura e consulta pública mais direta."
        />
        <div className="grid gap-5 md:grid-cols-4">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Ano</span>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="motion-focus w-full rounded-full border border-border-subtle bg-surface-1 px-3 py-2 text-sm"
            >
              <option value="all">Todos</option>
              {yearOptions.map((value) => (
                <option key={value} value={String(value)}>{value}</option>
              ))}
            </select>
          </label>

          <div className="block md:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Tipo</span>
            <div className="flex flex-wrap gap-2">
              {(["all", "relatorio", "nota-tecnica", "boletim", "anexo"] as const).map((value) => {
                const isActive = kind === value;
                const label = value === "all" ? "Todos" : KIND_LABEL[value];
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setKind(value)}
                    className={`ui-segment-tab ${isActive ? "ui-segment-tab-active" : ""}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Tag</span>
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="motion-focus w-full rounded-full border border-border-subtle bg-surface-1 px-3 py-2 text-sm"
            >
              <option value="all">Todas</option>
              {tagOptions.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>

          <label className="block md:col-span-4">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Busca</span>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Título ou resumo..."
              className="motion-focus w-full rounded-full border border-border-subtle bg-surface-1 px-3 py-2 text-sm"
            />
          </label>
        </div>
      </SurfaceCard> : null}

      {!loading && !error && featuredReports.length > 0 ? (
        <SurfaceCard className="signature-shell border-brand-primary/15 bg-gradient-to-br from-brand-primary-soft/60 via-surface-1 to-surface-1 p-6">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div className="space-y-2">
              <AxisEyebrow axis="relatorio">Destaques</AxisEyebrow>
              <h2 className="axis-heading-relatorio text-xl md:text-2xl">Relatórios editoriais em evidência</h2>
            </div>
            <Chip tone="active">{featuredReports.length} selecionado(s)</Chip>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {featuredReports.map((item) => {
              const thumbUrl = getOptimizedCover(item, "thumb");
              const dateStr = item.published_at
                ? new Date(item.published_at).toLocaleDateString("pt-BR")
                : item.year ? String(item.year) : undefined;
              return (
                <Link
                  key={item.id}
                  to={`/relatorios/${item.slug}`}
                  className="group motion-list-item block h-full"
                >
                  <DocumentalCard
                    variant="featured"
                    thumbUrl={thumbUrl}
                    thumbAlt={`Capa de ${item.title}`}
                    kindLabel={KIND_LABEL[item.kind]}
                    date={dateStr}
                    title={item.title}
                    summary={item.summary}
                    tags={item.tags}
                    featured={true}
                    onTagClick={(t) => setTag(t)}
                    cta="Abrir PDF"
                  />
                </Link>
              );
            })}
          </div>
        </SurfaceCard>
      ) : null}

      <SurfaceCard className="p-6">
        {!loading && !error && reports.length > 0 ? (
          <PortalSectionHeader
            eyebrow={<span className="badge-metodologia">Leitura editorial</span>}
            title="Relatórios e evidências disponíveis"
            subtitle="Coleção pública de relatórios, notas técnicas, boletins e anexos com leitura, memória e controle social."
          />
        ) : null}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2" aria-live="polite" aria-busy="true">
            {Array.from({ length: 4 }).map((_, index) => (
              <BrandTextureSkeleton key={index} className="h-52 rounded-[1.5rem]" lines={4} />
            ))}
          </div>
        ) : error ? (
          <p aria-live="assertive" className="rounded-md border border-error bg-error/10 p-3 text-base text-error" role="alert">
            {error}
          </p>
        ) : catalogIsEmpty ? (
          <div className="space-y-5">
            <BrandIllustratedEmptyState
              title="A biblioteca oficial está sendo preparada"
              description="Ainda não há relatórios publicados neste catálogo. Enquanto a curadoria documental avança, consulte os dados abertos, a metodologia e a transparência do projeto."
              icon={<span className="text-2xl" aria-hidden="true">📄</span>}
            />
            <nav className="flex flex-wrap justify-center gap-3" aria-label="Outras fontes públicas do SEMEAR">
              <Link className="cta-primary" to="/dados">Explorar dados abertos</Link>
              <Link className="cta-secondary" to="/qualidade-ar/inea?modo=metodologia">Consultar metodologia</Link>
              <Link className="cta-secondary" to="/transparencia">Ver transparência</Link>
            </nav>
          </div>
        ) : reports.length === 0 ? (
          <BrandIllustratedEmptyState
            title="Nenhum documento corresponde aos filtros"
            description="Limpe a busca ou ajuste ano, tipo e tag para voltar ao catálogo completo."
            icon={<span className="text-2xl" aria-hidden="true">🔎</span>}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {regularReports.map((item) => {
              const dateStr = item.published_at
                ? new Date(item.published_at).toLocaleDateString("pt-BR")
                : item.year ? String(item.year) : undefined;
              return (
                <Link
                  key={item.id}
                  to={`/relatorios/${item.slug}`}
                  className="group motion-list-item block h-full"
                >
                  <DocumentalCard
                    variant="compact"
                    kindLabel={KIND_LABEL[item.kind]}
                    date={dateStr}
                    title={item.title}
                    summary={item.summary}
                    tags={item.tags}
                    onTagClick={(t) => setTag(t)}
                    cta="Abrir PDF"
                  />
                </Link>
              );
            })}
          </div>
        )}
      </SurfaceCard>
    </>
  );
}
