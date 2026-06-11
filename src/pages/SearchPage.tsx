import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { SurfaceCard } from "../components/BrandSystem";
import { PortalHero, PortalPageShell, PortalSectionHeader } from "../components/portal";
import { SkeletonCard } from "../components/SkeletonCard";
import {
  searchAcervo,
  searchAll,
  searchBlog,
  searchEvents,
  searchReports,
  searchTransparency,
  type AcervoItem,
  type BlogPost,
  type Event,
  type ReportDocument,
  type SearchResultItem,
  type TransparencySearchResult
} from "../lib/api";

type SearchType = "todos" | "acervo" | "blog" | "relatorios" | "transparencia" | "agenda";

type SearchResults = {
  acervo: AcervoItem[];
  blog: BlogPost[];
  reports: ReportDocument[];
  transparency: TransparencySearchResult[];
  events: Event[];
  mixed: SearchResultItem[];
};

const EMPTY_RESULTS: SearchResults = {
  acervo: [],
  blog: [],
  reports: [],
  transparency: [],
  events: [],
  mixed: []
};

const TYPE_LABEL: Record<SearchType, string> = {
  todos: "Todos",
  acervo: "Acervo",
  blog: "Blog",
  relatorios: "Relatórios",
  transparencia: "Transparência",
  agenda: "Agenda"
};

const REPORT_KIND_LABEL: Record<ReportDocument["kind"], string> = {
  relatorio: "Relatório",
  "nota-tecnica": "Nota Técnica",
  boletim: "Boletim",
  anexo: "Anexo"
};

function reportToSearchResult(report: ReportDocument): SearchResultItem {
  return {
    kind: "report",
    title: report.title,
    slug: report.slug,
    excerpt: report.summary ?? "",
    score: 0,
    url: `/relatorios/${report.slug}`
  };
}


export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const tipo = (searchParams.get("tipo") as SearchType) || "todos";

  const [results, setResults] = useState<SearchResults>(EMPTY_RESULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults(EMPTY_RESULTS);
      return;
    }

    async function performSearch() {
      try {
        setLoading(true);
        setError(null);

        if (query.trim().length >= 2) {
          const [mixedRes, reportsRes, transRes, eventsRes] = await Promise.all([
            searchAll(query, 30),
            searchReports(query, 10),
            searchTransparency(query, 5),
            searchEvents(query, 5)
          ]);
          const mixedWithReports = [...mixedRes];
          reportsRes.forEach((report) => {
            const reportResult = reportToSearchResult(report);
            if (!mixedWithReports.some((item) => item.url === reportResult.url)) {
              mixedWithReports.push(reportResult);
            }
          });

          const isAll = tipo === "todos";
          const isAcervo = tipo === "acervo";
          const isBlog = tipo === "blog";
          const isReports = tipo === "relatorios";

          setResults({
            acervo: isAcervo ? (mixedRes.filter((r) => r.kind === "acervo") as unknown as AcervoItem[]) : [],
            blog: isBlog ? (mixedRes.filter((r) => r.kind === "blog") as unknown as BlogPost[]) : [],
            reports: isAll || isReports ? reportsRes : [],
            transparency: isAll || tipo === "transparencia" ? transRes : [],
            events: isAll || tipo === "agenda" ? eventsRes : [],
            mixed: isAll ? mixedWithReports : []
          });
        } else {
          const [acervoRes, blogRes, reportsRes, transRes, eventsRes] = await Promise.all([
            tipo === "todos" || tipo === "acervo" ? searchAcervo(query, 10) : Promise.resolve([] as AcervoItem[]),
            tipo === "todos" || tipo === "blog" ? searchBlog(query, 10) : Promise.resolve([] as BlogPost[]),
            tipo === "todos" || tipo === "relatorios" ? searchReports(query, 10) : Promise.resolve([] as ReportDocument[]),
            tipo === "todos" || tipo === "transparencia" ? searchTransparency(query, 10) : Promise.resolve([] as TransparencySearchResult[]),
            tipo === "todos" || tipo === "agenda" ? searchEvents(query, 10) : Promise.resolve([] as Event[])
          ]);

          setResults({
            acervo: acervoRes,
            blog: blogRes,
            reports: reportsRes,
            transparency: transRes,
            events: eventsRes,
            mixed: []
          });
        }
      } catch (err) {
        console.error("Erro na busca:", err);
        setError("Ocorreu um erro ao realizar a busca.");
      } finally {
        setLoading(false);
      }
    }

    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [query, tipo]);

  const handleTipoChange = (newTipo: SearchType) => {
    setSearchParams({ q: query, tipo: newTipo });
  };

  const totalResults =
    results.acervo.length +
    results.blog.length +
    results.reports.length +
    results.transparency.length +
    results.events.length +
    results.mixed.length;

  const countByType: Record<SearchType, number> = {
    todos: totalResults,
    acervo: results.acervo.length,
    blog: results.blog.length,
    relatorios: results.reports.length,
    transparencia: results.transparency.length,
    agenda: results.events.length
  };

  const formatCurrency = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  return (
    <PortalPageShell className="search-stage animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PortalHero
        badge={<span className="badge-dados-abertos">Navegação transversal</span>}
        title="Busca no Portal"
        subtitle="Encontre dados, acervo, blog, relatórios, transparência e agenda em uma busca única e acessível."
        metrics={
          <>
          <div className="portal-kpi-card">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Escopo</p>
            <p className="mt-2 text-3xl font-black text-brand-primary">6</p>
            <p className="mt-1 text-sm text-text-secondary">frentes pesquisáveis</p>
          </div>
          <div className="portal-kpi-card">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Modo</p>
            <p className="mt-2 text-2xl font-black text-text-primary">Busca única</p>
            <p className="mt-1 text-sm text-text-secondary">conteúdo editorial, dados e documentos</p>
          </div>
          </>
        }
      />

      <SurfaceCard className="portal-search-hero p-5 md:p-7">
        <div className="relative group">
          <label htmlFor="global-search" className="sr-only">Buscar no portal SEMEAR</label>
          <input
            id="global-search"
            type="search"
            placeholder="Busque por tema, título, estação ou documento"
            value={query}
            onChange={(e) => setSearchParams({ q: e.target.value, tipo })}
            className="motion-input motion-focus w-full rounded-[1.35rem] border border-brand-primary/15 bg-white/[0.9] p-5 pr-14 text-base font-semibold text-text-primary shadow-[0_18px_45px_rgba(17,38,59,0.08)] placeholder:text-text-secondary/60"
          />
        </div>

        <div role="group" aria-label="Filtros de busca" className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Refine a busca</p>
          <div className="flex flex-wrap gap-2">
            {(["todos", "acervo", "blog", "relatorios", "transparencia", "agenda"] as SearchType[]).map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => handleTipoChange(t)}
                className={`ui-segment-tab motion-chip-action inline-flex min-h-[40px] items-center gap-2 px-3.5 py-2 ${
                  tipo === t ? "ui-segment-tab-active" : ""
                }`}
                aria-pressed={tipo === t}
              >
                <span>{TYPE_LABEL[t]}</span>
                {query.trim().length >= 2 && !loading && (
                  <span
                    className={`inline-flex min-h-5 items-center justify-center rounded-full px-2 text-[10px] font-semibold leading-none ${
                      tipo === t ? "bg-white/20 text-white" : "bg-brand-primary/10 text-brand-primary"
                    }`}
                    aria-label={`${countByType[t]} resultados`}
                  >
                    {countByType[t]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </SurfaceCard>

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
          <ErrorState
          description={error}
          action={
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="ui-btn-primary motion-focus motion-action px-5"
            >
              Tentar novamente
            </button>
          }
        />
      ) : query && totalResults === 0 ? (
        <EmptyState
          title="Nenhum resultado encontrado"
          description="Tente uma palavra mais ampla, outro tipo de conteúdo ou remova o filtro atual."
        />
      ) : !query ? (
        <EmptyState
          title="Busque no portal"
          description="Digite acima para pesquisar conteúdo editorial, dados, documentos e agenda."
        />
      ) : (
        <div className="portal-results space-y-12 pb-20">
          {results.mixed.length > 0 && (
            <section aria-labelledby="main-results-heading">
              <PortalSectionHeader
                eyebrow="Leitura inicial"
                title="Resultados principais"
                subtitle="Abertura editorial da busca, com os itens mais relevantes para começar a leitura."
              />
              <h2 id="main-results-heading" className="sr-only">Resultados principais</h2>
              <div className="mb-4 flex items-center gap-2 text-base font-black uppercase tracking-wider text-brand-primary">
                <span>Itens encontrados</span>
                <span className="rounded-full bg-brand-primary/10 px-2 py-1 text-xs text-brand-primary">{results.mixed.length}</span>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                {results.mixed.map((item) => {
                  const matchedReport = item.kind === "report"
                    ? results.reports.find((report) => report.slug === item.slug)
                    : null;
                  return (
                  <Link
                    key={item.url}
                    to={item.url}
                    className="group motion-list-item flex flex-col rounded-[1.35rem] border border-border-subtle bg-surface-1 p-5 motion-surface motion-surface-hover"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-full px-3 py-1 text-xs font-semibold bg-brand-primary/10 text-brand-primary">
                        {item.kind === "blog" ? "Blog" : item.kind === "report" ? (matchedReport ? REPORT_KIND_LABEL[matchedReport.kind] : "Relatório") : "Acervo"}
                      </span>
                      <span className="text-xs text-text-secondary">Relevância: {item.score.toFixed(2)}</span>
                    </div>
                    <h3 className="mt-2 text-base font-bold text-text-primary group-hover:text-brand-primary">{item.title}</h3>
                    {item.excerpt && <p className="mt-2 text-sm text-text-secondary line-clamp-2">{item.excerpt}</p>}
                  </Link>
                  );
                })}
              </div>
            </section>
          )}

          {results.reports.length > 0 && (
            <div className="space-y-4">
              <PortalSectionHeader
                eyebrow="Biblioteca pública"
                title="Relatórios"
                subtitle="Notas técnicas, relatórios e boletins relacionados ao termo pesquisado."
              />
              <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-cta">
                Relatórios <span className="rounded-full bg-cta/10 px-2 py-0.5 text-[10px] text-cta">{results.reports.length}</span>
              </h2>
              <div className="grid gap-5 md:grid-cols-2">
                {results.reports.map((report) => (
                  <Link
                    key={report.id}
                    to={`/relatorios/${report.slug}`}
                    className="group motion-list-item flex flex-col rounded-[1.35rem] border border-brand-primary/25 bg-fundo/60 p-5 motion-surface motion-surface-hover"
                  >
                    <span className="w-fit rounded-full bg-brand-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-primary">{REPORT_KIND_LABEL[report.kind]}</span>
                    <h3 className="mt-2 font-bold text-texto group-hover:text-ciano">{report.title}</h3>
                    {report.summary && <p className="mt-2 line-clamp-2 text-xs text-texto/60">{report.summary}</p>}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.acervo.length > 0 && (
            <div className="space-y-4">
              <PortalSectionHeader
                eyebrow="Memória"
                title="Acervo"
                subtitle="Itens históricos, documentos e registros relacionados ao tema."
              />
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-cta">Acervo</h2>
              <div className="grid gap-5 md:grid-cols-2">
                {results.acervo.map((item) => (
                  <Link key={item.id} to={`/acervo/item/${item.slug}`} className="group motion-list-item flex flex-col rounded-[1.35rem] border border-ciano/20 bg-fundo/60 p-5 motion-surface motion-surface-hover">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-ciano">{item.kind}</span>
                    <h3 className="mt-1 font-bold text-texto group-hover:text-ciano">{item.title}</h3>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.blog.length > 0 && (
            <div className="space-y-4">
              <PortalSectionHeader
                eyebrow="Leitura pública"
                title="Blog"
                subtitle="Textos editoriais e publicações recentes associados à busca."
              />
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-cta">Blog</h2>
              <div className="grid gap-5 md:grid-cols-2">
                {results.blog.map((post) => (
                  <Link key={post.id} to={`/blog/${post.slug}`} className="group motion-list-item flex flex-col rounded-[1.35rem] border border-primaria/20 bg-fundo/60 p-5 motion-surface motion-surface-hover">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primaria">Boletim</span>
                    <h3 className="mt-1 font-bold text-texto group-hover:text-ciano">{post.title}</h3>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.events.length > 0 && (
            <div className="space-y-4">
              <PortalSectionHeader
                eyebrow="Mobilização"
                title="Agenda"
                subtitle="Eventos, encontros e atividades públicas relacionados ao tema."
              />
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-cta">Agenda</h2>
              <div className="grid gap-5 md:grid-cols-2">
                {results.events.map((event) => (
                  <Link key={event.id} to="/agenda" className="group motion-list-item flex flex-col rounded-[1.35rem] border border-acento/20 bg-fundo/60 p-5 motion-surface motion-surface-hover">
                    <h3 className="mt-1 font-bold text-texto group-hover:text-cta">{event.title}</h3>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.transparency.length > 0 && (
            <div className="space-y-4">
              <PortalSectionHeader
                eyebrow="Prestação de contas"
                title="Transparência"
                subtitle="Lançamentos financeiros e registros públicos associados ao termo pesquisado."
              />
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-cta">Transparência</h2>
              <div className="grid gap-5 md:grid-cols-2">
                {results.transparency.map((expense) => (
                  <Link key={expense.id} to="/transparencia" className="group motion-list-item flex flex-col rounded-[1.35rem] border border-base/40 bg-fundo/60 p-5 motion-surface motion-surface-hover">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-texto/40">{expense.category}</span>
                      <span className="text-sm font-black text-primaria">{formatCurrency(expense.amount_cents ?? 0)}</span>
                    </div>
                    <h3 className="mt-1 font-bold text-texto group-hover:text-ciano">{expense.vendor}</h3>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </PortalPageShell>
  );
}


