import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { SkeletonCard } from "../components/SkeletonCard";
import { SurfaceCard } from "../components/BrandSystem";
import { PortalHero, PortalPageShell, PortalSectionHeader } from "../components/portal";
import {
  getTransparencySummary,
  listLiveTransparencyReports,
  listExpenses,
  listConversations,
  listTransparencyLinks,
  type Conversation,
  type Expense,
  type LiveTransparencyMonthlyReport,
  type TransparencyLink,
  type TransparencySummary
} from "../lib/api";
import { trackCsvDownload } from "../lib/observability";

import { INSTITUTIONAL_FUNDING } from "../content/institucional";
import { LIVE_TRANSPARENCIA_REPORTS } from "../content/transparencyLive";

function formatBRL(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(cents / 100);
}

function toCsvCell(value: unknown) {
  const text = String(value ?? "");
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function getMonthYear(dateStr: string): { month: string; year: string } {
  const date = new Date(dateStr);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  return { month, year };
}

function normalizeMonthParam(value: string | null): string {
  if (!value) return "all";
  if (value === "all") return value;
  const month = Number.parseInt(value, 10);
  if (!Number.isFinite(month) || month < 1 || month > 12) return "all";
  return String(month).padStart(2, "0");
}

function isActivity(item: Conversation) {
  return item.meta?.kind === "activity";
}

function formatDateLabel(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value);
}

export function TransparenciaPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [summary, setSummary] = useState<TransparencySummary | null>(null);
  const [links, setLinks] = useState<TransparencyLink[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [monthlyReports, setMonthlyReports] = useState<LiveTransparencyMonthlyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewerExpense, setViewerExpense] = useState<Expense | null>(null);

  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [vendorQuery, setVendorQuery] = useState("");
  const [filtersHydrated, setFiltersHydrated] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const month = normalizeMonthParam(searchParams.get("month"));
    const year = searchParams.get("year") || "all";
    const category = searchParams.get("category") || "all";
    const q = searchParams.get("q") || "";

    setSelectedMonth((current) => (current === month ? current : month));
    setSelectedYear((current) => (current === year ? current : year));
    setSelectedCategory((current) => (current === category ? current : category));
    setVendorQuery((current) => (current === q ? current : q));
    setFiltersHydrated(true);
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        setLoading(true);
        const [sumData, linkData, expData, conversationData, monthlyData] = await Promise.all([
          getTransparencySummary(),
          listTransparencyLinks(),
          listExpenses(2000),
          listConversations(),
          listLiveTransparencyReports().catch(() => LIVE_TRANSPARENCIA_REPORTS)
        ]);
        if (!cancelled) {
          setSummary(sumData);
          setLinks(linkData);
          setExpenses(expData);
          setConversations(conversationData);
          setMonthlyReports(monthlyData.length > 0 ? monthlyData : LIVE_TRANSPARENCIA_REPORTS);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Falha ao carregar dados.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (viewerExpense) {
      previousActiveElementRef.current = document.activeElement as HTMLElement;
      window.setTimeout(() => closeButtonRef.current?.focus(), 50);
    } else if (previousActiveElementRef.current) {
      previousActiveElementRef.current.focus();
    }

    const onKeyDown = (ev: KeyboardEvent) => {
      if (!viewerExpense) return;
      if (ev.key === "Escape") {
        setViewerExpense(null);
        return;
      }
      if (ev.key === "Tab" && modalRef.current) {
        const focusable = Array.from(
          modalRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])')
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (ev.shiftKey && active === first) {
          ev.preventDefault();
          last.focus();
        } else if (!ev.shiftKey && active === last) {
          ev.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [viewerExpense]);

  useEffect(() => {
    if (!filtersHydrated) return;

    const nextParams = new URLSearchParams();
    if (selectedMonth !== "all") nextParams.set("month", selectedMonth);
    if (selectedYear !== "all") nextParams.set("year", selectedYear);
    if (selectedCategory !== "all") nextParams.set("category", selectedCategory);
    if (vendorQuery.trim()) nextParams.set("q", vendorQuery.trim());

    const current = searchParams.toString();
    const next = nextParams.toString();
    if (current !== next) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [filtersHydrated, selectedMonth, selectedYear, selectedCategory, vendorQuery, searchParams, setSearchParams]);

  const monthOptions = useMemo(() => {
    const values = new Set<string>();
    expenses.forEach((exp) => values.add(getMonthYear(exp.occurred_on).month));
    if (selectedMonth !== "all") values.add(selectedMonth);
    return Array.from(values).sort((a, b) => Number(a) - Number(b));
  }, [expenses, selectedMonth]);

  const yearOptions = useMemo(() => {
    const values = new Set<string>();
    expenses.forEach((exp) => values.add(getMonthYear(exp.occurred_on).year));
    if (selectedYear !== "all") values.add(selectedYear);
    return Array.from(values).sort((a, b) => Number(b) - Number(a));
  }, [expenses, selectedYear]);

  const categoryOptions = useMemo(() => {
    const values = new Set(expenses.map((exp) => exp.category));
    if (selectedCategory !== "all") values.add(selectedCategory);
    return Array.from(values).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [expenses, selectedCategory]);

  const filteredExpenses = useMemo(() => {
    const vendorTerm = vendorQuery.trim().toLowerCase();
    return expenses
      .filter((exp) => {
        const { month, year } = getMonthYear(exp.occurred_on);
        if (selectedMonth !== "all" && month !== selectedMonth) return false;
        if (selectedYear !== "all" && year !== selectedYear) return false;
        if (selectedCategory !== "all" && exp.category !== selectedCategory) return false;
        if (vendorTerm && !exp.vendor.toLowerCase().includes(vendorTerm)) return false;
        return true;
      })
      .sort((a, b) => new Date(b.occurred_on).getTime() - new Date(a.occurred_on).getTime());
  }, [expenses, selectedMonth, selectedYear, selectedCategory, vendorQuery]);

  const periodKpis = useMemo(() => {
    const total = filteredExpenses.reduce((acc, exp) => acc + exp.amount_cents, 0);

    const byCategory = filteredExpenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] ?? 0) + exp.amount_cents;
      return acc;
    }, {} as Record<string, number>);

    const byVendor = filteredExpenses.reduce((acc, exp) => {
      acc[exp.vendor] = (acc[exp.vendor] ?? 0) + exp.amount_cents;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      topCategories: Object.entries(byCategory).sort((a, b) => b[1] - a[1]).slice(0, 5),
      topVendors: Object.entries(byVendor).sort((a, b) => b[1] - a[1]).slice(0, 5),
      count: filteredExpenses.length
    };
  }, [filteredExpenses]);

  const liveTransparency = useMemo(() => {
    const activities = conversations.filter(isActivity);
    const hearingTopics = conversations.filter((item) => !isActivity(item));
    const recentCutoff = new Date();
    recentCutoff.setDate(recentCutoff.getDate() - 30);

    const recentItems = conversations.filter((item) => new Date(item.created_at).getTime() >= recentCutoff.getTime());
    const recentActivities = recentItems.filter(isActivity);
    const recentHearings = recentItems.filter((item) => !isActivity(item));
    const territories = new Set(
      conversations
        .map((item) => (typeof item.meta?.location === "string" ? item.meta.location.trim() : ""))
        .filter(Boolean)
    );
    const publishedResults = conversations.filter((item) => Boolean(item.excerpt?.trim() || item.body_md?.trim()));
    const itemsWithInstagram = activities.filter((item) => Boolean(item.meta?.instagram_url));

    return {
      activities,
      hearingTopics,
      recentItems,
      recentActivities,
      recentHearings,
      territories: Array.from(territories).sort((a, b) => a.localeCompare(b, "pt-BR")),
      publishedResults,
      itemsWithInstagram,
      latestItems: [...conversations].slice(0, 4)
    };
  }, [conversations]);

  const monthlyTransparency = useMemo(() => {
    const reports = [...(monthlyReports.length > 0 ? monthlyReports : LIVE_TRANSPARENCIA_REPORTS)].sort((a, b) =>
      b.month_key.localeCompare(a.month_key)
    );
    const latest = reports[0] ?? null;
    const previous = reports[1] ?? null;
    const hearingsDelta = latest && previous ? latest.hearings_count - previous.hearings_count : null;
    const actionsDelta = latest && previous ? latest.actions_count - previous.actions_count : null;
    const coverageDelta = latest && previous ? latest.territorial_coverage_pct - previous.territorial_coverage_pct : null;

    return {
      reports,
      latest,
      previous,
      hearingsDelta,
      actionsDelta,
      coverageDelta
    };
  }, [monthlyReports]);

  const handleDownloadExpensesCsv = () => {
    const header = ["occurred_on", "vendor", "category", "amount", "description", "document_url"];
    const rows = filteredExpenses.map((exp) => [
      exp.occurred_on,
      exp.vendor,
      exp.category,
      (exp.amount_cents / 100).toFixed(2),
      exp.description,
      exp.document_url ?? ""
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => toCsvCell(cell)).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gastos_transparencia_${selectedYear}_${selectedMonth}_${selectedCategory}_${new Date().toISOString().slice(0, 10)}.csv`;
    trackCsvDownload("transparencia", filteredExpenses.length);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        description={error}
        action={
          <button
            onClick={() => window.location.reload()}
            className="ui-btn-primary motion-focus motion-action px-5"
          >
            Tentar novamente
          </button>
        }
      />
    );
  }

  return (
    <PortalPageShell className="transparency-stage">
      <PortalHero
        badge={<span className="badge-metodologia">Prestação de contas</span>}
        title="Transparência e prestação de contas"
        subtitle="Acompanhamento financeiro público, auditável e exportável do projeto SEMEAR, com filtros por período, categoria e fornecedor."
        tone="lab"
        metrics={
          <>
          <div className="portal-kpi-card portal-kpi-card-lab">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Total histórico</p>
            <p className="mt-2 text-3xl font-black text-success">{summary ? formatBRL(summary.total_cents) : "R$ 0,00"}</p>
            <p className="mt-1 text-sm text-text-secondary">publicado e auditável</p>
          </div>
          <div className="portal-kpi-card">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Período filtrado</p>
            <p className="mt-2 text-3xl font-black text-brand-primary">{formatBRL(periodKpis.total)}</p>
            <p className="mt-1 text-sm text-text-secondary">{periodKpis.count} lançamento(s)</p>
          </div>
          </>
        }
      />

      <SurfaceCard className="portal-list-panel p-5 md:p-6">
          <p className="text-sm font-semibold text-accent-lab">{INSTITUTIONAL_FUNDING} · todos os recursos são públicos</p>
          <p className="mt-1 text-sm text-text-secondary">Prestação de contas permanente e acessível à população</p>
      </SurfaceCard>

      <SurfaceCard className="portal-filter-panel p-6 md:p-8">
        <PortalSectionHeader
          eyebrow="Transparência viva"
          title="Escutas e atividades publicadas em fluxo contínuo"
          subtitle="Acompanhamento público das ações territoriais já registradas no portal, com atualização a partir das publicações e memórias de campo do SEMEAR."
        />
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="portal-kpi-card portal-kpi-card-lab">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Últimos 30 dias</p>
            <p className="mt-2 text-3xl font-black text-brand-primary">{liveTransparency.recentItems.length}</p>
            <p className="mt-1 text-sm text-text-secondary">registros públicos entre escutas e atividades</p>
          </div>
          <div className="portal-kpi-card">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Atividades de campo</p>
            <p className="mt-2 text-3xl font-black text-success">{liveTransparency.activities.length}</p>
            <p className="mt-1 text-sm text-text-secondary">{liveTransparency.itemsWithInstagram.length} com publicação vinculada</p>
          </div>
          <div className="portal-kpi-card">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Escuta pública</p>
            <p className="mt-2 text-3xl font-black text-brand-primary">{liveTransparency.hearingTopics.length}</p>
            <p className="mt-1 text-sm text-text-secondary">{liveTransparency.recentHearings.length} atualização(ões) no ciclo recente</p>
          </div>
          <div className="portal-kpi-card">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Territórios citados</p>
            <p className="mt-2 text-3xl font-black text-success">{liveTransparency.territories.length}</p>
            <p className="mt-1 text-sm text-text-secondary">{liveTransparency.publishedResults.length} registros com devolutiva publicada</p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <div className="rounded-[1.5rem] border border-base/40 bg-fundo/70 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Feed recente</p>
                <h3 className="mt-2 text-xl font-black text-text-primary">O que já foi devolvido ao público</h3>
              </div>
              <Link to="/conversar" className="ui-btn-ghost motion-focus motion-action px-4">
                Abrir conversas
              </Link>
            </div>
            <div className="mt-5 space-y-3">
              {liveTransparency.latestItems.length === 0 ? (
                <EmptyState
                  title="Sem escutas publicadas ainda"
                  description="Assim que as atividades e rodas de conversa forem publicadas, esta área passa a refletir o movimento territorial em tempo quase real."
                />
              ) : (
                liveTransparency.latestItems.map((item) => {
                  const activity = isActivity(item);
                  const location = typeof item.meta?.location === "string" ? item.meta.location.trim() : "";
                  return (
                    <article key={item.id} className="rounded-[1.25rem] border border-base/40 bg-white/80 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ${activity ? "bg-emerald-100 text-emerald-800" : "bg-cyan-100 text-cyan-800"}`}>
                          {activity ? "Atividade" : "Escuta"}
                        </span>
                        <span className="text-xs font-semibold text-text-secondary">{formatDateLabel(item.created_at)}</span>
                        {location ? <span className="text-xs font-semibold text-text-secondary">{location}</span> : null}
                      </div>
                      <h4 className="mt-3 text-lg font-black text-text-primary">{item.title}</h4>
                      {item.excerpt ? <p className="mt-2 text-sm leading-relaxed text-text-secondary">{item.excerpt}</p> : null}
                      {!item.excerpt && item.body_md ? <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-text-secondary">{item.body_md}</p> : null}
                    </article>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-base/40 bg-fundo/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Sinais do território</p>
            <h3 className="mt-2 text-xl font-black text-text-primary">Leitura operacional das escutas</h3>
            <div className="mt-5 space-y-4">
              <div className="rounded-[1.25rem] border border-base/40 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Atividade recente</p>
                <p className="mt-2 text-base font-black text-text-primary">{liveTransparency.recentActivities.length} registro(s) de campo nos últimos 30 dias</p>
              </div>
              <div className="rounded-[1.25rem] border border-base/40 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Territórios mencionados</p>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {liveTransparency.territories.slice(0, 6).join(" • ") || "Sem localização publicada ainda."}
                </p>
              </div>
              <div className="rounded-[1.25rem] border border-base/40 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Devolutiva publicada</p>
                <p className="mt-2 text-base font-black text-text-primary">{liveTransparency.publishedResults.length} registro(s) com texto editorial ou síntese pública</p>
              </div>
            </div>
          </div>
        </div>
      </SurfaceCard>

      {monthlyTransparency.latest ? (
        <SurfaceCard className="portal-filter-panel p-6 md:p-8">
          <PortalSectionHeader
            eyebrow="Leitura mensal"
            title="Resumo público das escutas consolidadas"
            subtitle="Camada editorial baseada nos relatórios mensais interpretativos do SEMEAR Territórios, separando o fluxo diário da leitura consolidada de escutas, coberturas e encaminhamentos."
          />

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="portal-kpi-card portal-kpi-card-lab">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Mês consolidado</p>
              <p className="mt-2 text-2xl font-black text-brand-primary">{monthlyTransparency.latest.month_label}</p>
              <p className="mt-1 text-sm text-text-secondary">{monthlyTransparency.latest.source_label}</p>
            </div>
            <div className="portal-kpi-card">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Escutas no mês</p>
              <p className="mt-2 text-3xl font-black text-success">{monthlyTransparency.latest.hearings_count}</p>
              <p className="mt-1 text-sm text-text-secondary">
                {monthlyTransparency.hearingsDelta === null
                  ? "sem base anterior publicada"
                  : `${monthlyTransparency.hearingsDelta >= 0 ? "+" : ""}${monthlyTransparency.hearingsDelta} em relação ao mês anterior`}
              </p>
            </div>
            <div className="portal-kpi-card">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Ações no mês</p>
              <p className="mt-2 text-3xl font-black text-brand-primary">{monthlyTransparency.latest.actions_count}</p>
              <p className="mt-1 text-sm text-text-secondary">
                {monthlyTransparency.actionsDelta === null
                  ? "sem base anterior publicada"
                  : `${monthlyTransparency.actionsDelta >= 0 ? "+" : ""}${monthlyTransparency.actionsDelta} em relação ao mês anterior`}
              </p>
            </div>
            <div className="portal-kpi-card">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Cobertura territorial</p>
              <p className="mt-2 text-3xl font-black text-success">{formatPercent(monthlyTransparency.latest.territorial_coverage_pct)}%</p>
              <p className="mt-1 text-sm text-text-secondary">
                status {monthlyTransparency.latest.territorial_status === "critica" ? "crítico" : monthlyTransparency.latest.territorial_status === "adequada" ? "adequado" : "atenção"}
                {monthlyTransparency.coverageDelta === null ? "" : ` · ${monthlyTransparency.coverageDelta >= 0 ? "+" : ""}${formatPercent(monthlyTransparency.coverageDelta)} p.p.`}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
            <div className="rounded-[1.5rem] border border-base/40 bg-fundo/70 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Fechamento do mês</p>
                  <h3 className="mt-2 text-2xl font-black text-text-primary">{monthlyTransparency.latest.month_label}</h3>
                </div>
                <a
                  href={monthlyTransparency.latest.source_url || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="ui-btn-ghost motion-focus motion-action px-4"
                >
                  Abrir relatório
                </a>
              </div>

              <div className="mt-5 space-y-4">
                <div className="rounded-[1.25rem] border border-base/40 bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Leitura executiva</p>
                  <p className="mt-2 text-sm leading-relaxed text-text-primary">{monthlyTransparency.latest.executive_summary}</p>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className={`rounded-[1.25rem] border p-4 ${
                    monthlyTransparency.latest.territorial_status === "critica"
                      ? "border-rose-200 bg-rose-50"
                      : monthlyTransparency.latest.territorial_status === "adequada"
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-amber-200 bg-amber-50"
                  }`}>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Alerta metodológico</p>
                    <p className="mt-2 text-sm leading-relaxed text-text-primary">{monthlyTransparency.latest.methodological_alert}</p>
                  </div>
                  <div className="rounded-[1.25rem] border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Recomendação operacional</p>
                    <p className="mt-2 text-sm leading-relaxed text-text-primary">{monthlyTransparency.latest.operational_recommendation}</p>
                  </div>
                </div>

                <div className="rounded-[1.25rem] border border-base/40 bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Temas dominantes</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {monthlyTransparency.latest.dominant_themes.map((theme) => (
                      <span key={theme} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-emerald-800">
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[1.25rem] border border-base/40 bg-white/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Prioridades mais citadas</p>
                    <div className="mt-3 space-y-2">
                      {monthlyTransparency.latest.grouped_priorities.map((priority) => (
                        <div key={priority.label} className="flex items-center justify-between gap-3 text-sm">
                          <span className="text-text-secondary">{priority.label}</span>
                          <span className="font-black text-text-primary">{priority.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-[1.25rem] border border-base/40 bg-white/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Sinais qualitativos</p>
                    <div className="mt-3 space-y-2">
                      {monthlyTransparency.latest.qualitative_signals.map((signal) => (
                        <div key={signal.label} className="flex items-center justify-between gap-3 text-sm">
                          <span className="text-text-secondary">{signal.label}</span>
                          <span className="font-black text-text-primary">{signal.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.25rem] border border-base/40 bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Encaminhamentos recomendados</p>
                  <div className="mt-3 grid gap-2">
                    {monthlyTransparency.latest.recommended_next_steps.map((step) => (
                      <div key={step} className="rounded-2xl border border-base/40 bg-fundo/70 px-3 py-2 text-sm text-text-secondary">
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-base/40 bg-fundo/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Linha do tempo interpretativa</p>
              <h3 className="mt-2 text-xl font-black text-text-primary">Relatórios que já viraram devolutiva</h3>
              <div className="mt-5 space-y-4">
                {monthlyTransparency.reports.map((report) => (
                  <article key={report.id} className="rounded-[1.25rem] border border-base/40 bg-white/80 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">{report.month_label}</p>
                        <h4 className="mt-2 text-lg font-black text-text-primary">
                          {report.actions_count} ações · {report.hearings_count} escutas
                        </h4>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ${
                        report.territorial_status === "critica"
                          ? "bg-rose-100 text-rose-800"
                          : report.territorial_status === "adequada"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                      }`}>
                        {report.territorial_status === "critica" ? "Cobertura crítica" : report.territorial_status === "adequada" ? "Cobertura adequada" : "Cobertura parcial"}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-text-secondary">{report.executive_summary}</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-base/40 bg-fundo/70 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">Territórios da ação</p>
                        <p className="mt-2 text-sm text-text-primary">{report.action_territories.join(" • ")}</p>
                      </div>
                      <div className="rounded-2xl border border-base/40 bg-fundo/70 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">Escuta territorial</p>
                        <p className="mt-2 text-sm text-text-primary">{report.hearing_territories.join(" • ")}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {report.dominant_themes.slice(0, 4).map((theme) => (
                        <span key={theme} className="rounded-full border border-base/40 bg-fundo/70 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-text-secondary">
                          {theme}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <a href={report.source_url || "#"} target="_blank" rel="noreferrer" className="text-sm font-black text-brand-primary hover:underline">
                        Ler relatório completo
                      </a>
                      <span className="text-sm text-text-secondary">{report.review_pending}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </SurfaceCard>
      ) : null}

      <section className="grid gap-6 md:grid-cols-3">
        <div className="portal-kpi-card portal-kpi-card-lab">
          <p className="text-sm font-semibold uppercase tracking-wider text-text-secondary">Total histórico</p>
          <p className="mt-2 text-3xl font-black text-success">{summary ? formatBRL(summary.total_cents) : "R$ 0,00"}</p>
          <p className="mt-1 text-xs text-text-secondary">{INSTITUTIONAL_FUNDING}</p>
        </div>

        <div className="portal-kpi-card">
          <p className="text-sm font-semibold uppercase tracking-wider text-text-secondary">Total no período filtrado</p>
          <p className="mt-2 text-3xl font-black text-brand-primary">{formatBRL(periodKpis.total)}</p>
          <p className="mt-1 text-xs text-text-secondary">{periodKpis.count} lançamento(s)</p>
        </div>

        <div className="portal-kpi-card">
          <p className="text-sm font-semibold uppercase tracking-wider text-text-secondary">Top categorias (período)</p>
          <div className="mt-2 space-y-1">
            {periodKpis.topCategories.slice(0, 3).map(([cat, amount]) => (
              <div key={cat} className="flex justify-between text-xs">
                <span className="text-text-secondary">{cat}</span>
                <span className="font-bold text-text-primary">{formatBRL(amount)}</span>
              </div>
            ))}
            {periodKpis.topCategories.length === 0 && <p className="text-xs text-text-secondary">Sem dados no filtro.</p>}
          </div>
        </div>
      </section>

      <SurfaceCard className="portal-filter-panel p-6 md:p-8">
        <PortalSectionHeader
          eyebrow="Filtro ativo"
          title="Filtrar lançamentos"
          subtitle="Refine a prestação de contas por período, categoria ou fornecedor sem alterar a base publicada."
        />
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <div>
            <label htmlFor="filtro-mes" className="mb-1 block text-xs font-bold uppercase tracking-wide text-text-secondary">Mês</label>
            <select id="filtro-mes" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="motion-input motion-focus w-full rounded-md px-3 py-2 text-sm">
              <option value="all">Todos</option>
              {monthOptions.map((month) => <option key={month} value={month}>{month}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="filtro-ano" className="mb-1 block text-xs font-bold uppercase tracking-wide text-text-secondary">Ano</label>
            <select id="filtro-ano" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="motion-input motion-focus w-full rounded-md px-3 py-2 text-sm">
              <option value="all">Todos</option>
              {yearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="filtro-categoria" className="mb-1 block text-xs font-bold uppercase tracking-wide text-text-secondary">Categoria</label>
            <select id="filtro-categoria" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="motion-input motion-focus w-full rounded-md px-3 py-2 text-sm">
              <option value="all">Todas</option>
              {categoryOptions.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="filtro-fornecedor" className="mb-1 block text-xs font-bold uppercase tracking-wide text-text-secondary">Fornecedor (busca)</label>
            <input id="filtro-fornecedor" type="search" value={vendorQuery} onChange={(e) => setVendorQuery(e.target.value)} placeholder="Digite o nome" className="motion-input motion-focus w-full rounded-md px-3 py-2 text-sm" />
          </div>
        </div>
      </SurfaceCard>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="portal-list-panel rounded-[1.75rem] p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">Top categorias (filtro ativo)</h3>
          <div className="mt-3 space-y-2">
            {periodKpis.topCategories.map(([cat, amount]) => (
              <div key={cat} className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">{cat}</span>
                <span className="font-bold text-text-primary">{formatBRL(amount)}</span>
              </div>
            ))}
            {periodKpis.topCategories.length === 0 && <p className="text-sm text-text-secondary">Sem dados.</p>}
          </div>
        </div>

        <div className="portal-list-panel rounded-[1.75rem] p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">Top fornecedores (filtro ativo)</h3>
          <div className="mt-3 space-y-2">
            {periodKpis.topVendors.map(([vendor, amount]) => (
              <div key={vendor} className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">{vendor}</span>
                <span className="font-bold text-text-primary">{formatBRL(amount)}</span>
              </div>
            ))}
            {periodKpis.topVendors.length === 0 && <p className="text-sm text-text-secondary">Sem dados.</p>}
          </div>
        </div>
      </section>

      <SurfaceCard className="portal-list-panel p-6 md:p-8">
        <PortalSectionHeader
          eyebrow="Base aberta"
          title="Despesas lançadas"
          subtitle="Tabela pública com documentos associados quando disponíveis."
        />
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="mt-1 text-xs text-text-secondary">Documentos são publicados quando disponíveis.</p>
          </div>
          <button type="button" onClick={handleDownloadExpensesCsv} className="ui-btn-secondary motion-focus motion-action px-4">
            Baixar CSV do filtro
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border-subtle" aria-label="Tabela de despesas filtradas">
          <table className="w-full border-collapse text-left text-base" aria-describedby="caption-despesas">
            <caption id="caption-despesas" className="sr-only">Tabela de despesas com filtros por mês, ano, categoria e fornecedor. Ordenada por data decrescente.</caption>
            <thead>
              <tr className="border-b border-border-subtle bg-bg-surface">
                <th className="px-4 py-3 text-sm font-bold uppercase tracking-wider text-text-secondary">Data</th>
                <th className="px-4 py-3 text-sm font-bold uppercase tracking-wider text-text-secondary">Favorecido</th>
                <th className="hidden px-4 py-3 text-sm font-bold uppercase tracking-wider text-text-secondary md:table-cell">Categoria</th>
                <th className="px-4 py-3 text-sm font-bold uppercase tracking-wider text-text-secondary">Descrição</th>
                <th className="px-4 py-3 text-right text-sm font-bold uppercase tracking-wider text-text-secondary">Valor</th>
                <th className="px-4 py-3 text-right text-sm font-bold uppercase tracking-wider text-text-secondary">Documento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="motion-control hover:bg-bg-surface">
                  <td className="whitespace-nowrap px-4 py-4 font-mono text-sm text-text-secondary">{new Date(exp.occurred_on).toLocaleDateString("pt-BR")}</td>
                  <td className="px-4 py-4 font-semibold text-text-primary">{exp.vendor}</td>
                  <td className="hidden px-4 py-4 md:table-cell"><span className="inline-block rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-primary">{exp.category}</span></td>
                  <td className="max-w-[220px] px-4 py-4 text-sm text-text-secondary line-clamp-1">{exp.description}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-right text-base font-bold text-success">{formatBRL(exp.amount_cents)}</td>
                  <td className="px-4 py-4 text-right">
                    {exp.document_url ? (
                      <button
                        type="button"
                        onClick={() => setViewerExpense(exp)}
                        className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-brand-primary hover:underline"
                      >
                        Abrir documento
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </button>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-bg-surface px-2 py-1 text-xs font-semibold text-text-secondary">Sem documento</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12"><EmptyState title="Nenhum lançamento para os filtros selecionados" description="Ajuste mês, ano, categoria ou fornecedor para localizar outro lançamento." /></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SurfaceCard>

      <SurfaceCard className="portal-list-panel p-6 md:p-8">
        <PortalSectionHeader
          eyebrow="Controle externo"
          title="Links oficiais de controle"
          subtitle="Atalhos públicos para referências institucionais e acompanhamento complementar."
        />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {links.map((link) => (
            <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="group motion-list-item flex flex-col gap-2 rounded-xl border border-border-subtle bg-bg-surface p-4 motion-surface motion-surface-hover">
              <span className="inline-block rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-primary">{link.kind}</span>
              <span className="text-base font-bold text-text-primary group-hover:text-brand-primary">{link.title}</span>
              <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-text-secondary">Acessar link externo</span>
            </a>
          ))}
          {links.length === 0 && (
            <div className="col-span-full"><EmptyState title="Nenhum link oficial disponível no momento" description="Os links oficiais aparecerão aqui quando forem publicados." /></div>
          )}
        </div>
      </SurfaceCard>

      {viewerExpense?.document_url && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center motion-overlay p-4 motion-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="transparencia-viewer-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewerExpense(null);
          }}
        >
          <h2 id="transparencia-viewer-title" className="sr-only">Visualizador de documento</h2>
          <div ref={modalRef} className="motion-dialog-panel motion-dialog w-full max-w-5xl">
            <div className="mb-3 flex w-full justify-end gap-2">
              <a
                href={viewerExpense.document_url}
                target="_blank"
                rel="noopener noreferrer"
                className="motion-action inline-flex min-h-[44px] items-center rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
              >
                Abrir documento
              </a>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setViewerExpense(null)}
                className="motion-action inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-error px-3 text-white hover:bg-error/90"
                aria-label="Fechar visualizador de documento (ESC)"
              >
                ✕
              </button>
            </div>
            <iframe
              src={viewerExpense.document_url}
              title={`Documento de ${viewerExpense.vendor}`}
              className="motion-pop h-[80vh] w-full rounded-xl border border-white/20 bg-white"
            />
          </div>
        </div>
      )}
    </PortalPageShell>
  );
}




