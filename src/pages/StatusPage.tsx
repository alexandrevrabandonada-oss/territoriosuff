import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  EditorialCard,
  EditorialCardActions,
  EditorialCardBody,
  EditorialCardExcerpt,
  EditorialCardMeta,
  EditorialCardTitle,
  SurfaceCard
} from "../components/BrandSystem";
import { PortalHero, PortalPageShell, PortalSectionHeader } from "../components/portal";
import { getOpsKpisMonth, getSystemStatus, type OpsKPI, type SystemStatus } from "../lib/api";
import { getContrastAuditResults } from "../lib/contrastAudit";
import { getObservabilityErrorSummaryLast24h, trackCsvDownload, trackShare } from "../lib/observability";

const MONTH_OPTIONS = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Marco" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" }
];

const EMPTY_OPS_KPI: OpsKPI = {
  total_measurements: 0,
  inserted_count: 0,
  duplicated_count: 0,
  total_push_alerts: 0,
  published_events_count: 0,
  published_acervo_items_count: 0,
  published_blog_posts_count: 0,
  published_content_items_count: 0,
  scheduled_acervo_items_count: 0,
  scheduled_blog_posts_count: 0,
  scheduled_content_items_count: 0
};

function buildMonthlyBulletinText(monthLabel: string, year: number, kpis: OpsKPI) {
  const duplicateRate = kpis.inserted_count > 0
    ? ((kpis.duplicated_count / Math.max(kpis.inserted_count + kpis.duplicated_count, 1)) * 100).toFixed(1)
    : "0.0";

  return [
    `Boletim operacional de ${monthLabel} de ${year}.`,
    `${kpis.total_measurements.toLocaleString("pt-BR")} medicoes foram registradas no periodo.`,
    `A rotina de ingestao consolidou ${kpis.inserted_count.toLocaleString("pt-BR")} insercoes novas e barrou ${kpis.duplicated_count.toLocaleString("pt-BR")} duplicidades (${duplicateRate}% do fluxo observado).`,
    `${kpis.total_push_alerts.toLocaleString("pt-BR")} alertas automaticos foram disparados.`,
    `${kpis.published_events_count.toLocaleString("pt-BR")} eventos e ${kpis.published_content_items_count.toLocaleString("pt-BR")} itens editoriais foram publicados, sendo ${kpis.published_blog_posts_count.toLocaleString("pt-BR")} do blog e ${kpis.published_acervo_items_count.toLocaleString("pt-BR")} do acervo.`,
    `Ao final da leitura, ${kpis.scheduled_content_items_count.toLocaleString("pt-BR")} publicacoes seguiam agendadas.`
  ].join(" ");
}

export function StatusPage() {
  const now = new Date();
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOpsHelp, setShowOpsHelp] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [monthlyOps, setMonthlyOps] = useState<OpsKPI>(EMPTY_OPS_KPI);
  const [monthlyLoading, setMonthlyLoading] = useState(true);
  const [monthlyError, setMonthlyError] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [filtersHydrated, setFiltersHydrated] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getSystemStatus();
        setStatus(data);
      } catch (err) {
        console.error("Erro ao carregar status do sistema:", err);
        setError("Nao foi possivel carregar as informacoes de status.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  useEffect(() => {
    const yearParam = Number.parseInt(searchParams.get("year") || "", 10);
    const monthParam = Number.parseInt(searchParams.get("month") || "", 10);

    if (Number.isFinite(yearParam)) {
      setSelectedYear(yearParam);
    }
    if (Number.isFinite(monthParam) && monthParam >= 1 && monthParam <= 12) {
      setSelectedMonth(monthParam);
    }

    setFiltersHydrated(true);
  }, [searchParams]);

  useEffect(() => {
    if (!filtersHydrated) return;

    const nextParams = new URLSearchParams();
    nextParams.set("year", String(selectedYear));
    nextParams.set("month", String(selectedMonth));

    if (searchParams.toString() !== nextParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [filtersHydrated, searchParams, selectedMonth, selectedYear, setSearchParams]);

  useEffect(() => {
    let cancelled = false;

    async function loadMonthly() {
      try {
        setMonthlyLoading(true);
        setMonthlyError(null);
        const data = await getOpsKpisMonth(selectedYear, selectedMonth);
        if (!cancelled) {
          setMonthlyOps(data);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Erro ao carregar boletim mensal:", err);
          setMonthlyError("Nao foi possivel carregar os KPIs do mes selecionado.");
          setMonthlyOps(EMPTY_OPS_KPI);
        }
      } finally {
        if (!cancelled) setMonthlyLoading(false);
      }
    }

    void loadMonthly();
    return () => {
      cancelled = true;
    };
  }, [selectedMonth, selectedYear]);

  const formatCurrency = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const formatNumber = (value: number) => value.toLocaleString("pt-BR");
  const totalAboveThreshold24h = (status?.operations?.station_metrics ?? []).reduce((sum, station) => sum + (station.above_threshold_24h || 0), 0);
  const socialLabels: Record<string, string> = {
    dados: "Dados",
    agenda: "Agenda",
    blog: "Blog",
    acervo: "Acervo",
    dossies: "Dossies",
    relatorios: "Relatorios",
    boletim: "Boletim"
  };
  const socialKindsOrder = ["dados", "agenda", "blog", "acervo", "dossies", "relatorios", "boletim"];
  const socialByKind = status?.social?.by_kind ?? {};
  const isDevAccessibilityVisible = import.meta.env.MODE !== "production";
  const contrastAudit = getContrastAuditResults();
  const contrastFailures = contrastAudit.filter((item) => !item.passes);
  const observabilityErrors = getObservabilityErrorSummaryLast24h();
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 4 }, (_, idx) => currentYear - idx);
  }, []);
  const monthLabel = MONTH_OPTIONS.find((month) => month.value === selectedMonth)?.label ?? String(selectedMonth);
  const monthlyBulletin = useMemo(
    () => buildMonthlyBulletinText(monthLabel, selectedYear, monthlyOps),
    [monthLabel, selectedYear, monthlyOps]
  );

  const handleDownloadMonthlyCsv = () => {
    const rows = [
      ["year", selectedYear],
      ["month", selectedMonth],
      ["month_label", monthLabel],
      ["total_measurements", monthlyOps.total_measurements],
      ["inserted_count", monthlyOps.inserted_count],
      ["duplicated_count", monthlyOps.duplicated_count],
      ["total_push_alerts", monthlyOps.total_push_alerts],
      ["published_events_count", monthlyOps.published_events_count],
      ["published_acervo_items_count", monthlyOps.published_acervo_items_count],
      ["published_blog_posts_count", monthlyOps.published_blog_posts_count],
      ["published_content_items_count", monthlyOps.published_content_items_count],
      ["scheduled_acervo_items_count", monthlyOps.scheduled_acervo_items_count],
      ["scheduled_blog_posts_count", monthlyOps.scheduled_blog_posts_count],
      ["scheduled_content_items_count", monthlyOps.scheduled_content_items_count]
    ];
    const csv = ["metric,value", ...rows.map(([metric, value]) => `${metric},${value}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `status_boletim_${selectedYear}_${String(selectedMonth).padStart(2, "0")}.csv`;
    trackCsvDownload("status", rows.length);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(monthlyBulletin);
      setCopyFeedback("Resumo copiado.");
      window.setTimeout(() => setCopyFeedback(null), 2400);
    } catch (err) {
      console.error("Falha ao copiar resumo:", err);
      setCopyFeedback("Nao foi possivel copiar.");
      window.setTimeout(() => setCopyFeedback(null), 2400);
    }
  };

  const handleShareBulletin = async () => {
    const shareUrl = `${window.location.origin}/s/boletim/${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;
    try {
      trackShare("boletim", `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`, "status");
      if (navigator.share) {
        await navigator.share({
          title: `Boletim SEMEAR — ${monthLabel}/${selectedYear}`,
          text: monthlyBulletin,
          url: shareUrl
        });
        setCopyFeedback("Link do boletim compartilhado.");
      } else {
        trackShare("boletim", `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`, "status-copy");
        await navigator.clipboard.writeText(shareUrl);
        setCopyFeedback("Link do boletim copiado.");
      }
    } catch (err) {
      console.error("Falha ao compartilhar boletim:", err);
      setCopyFeedback("Nao foi possivel compartilhar.");
    } finally {
      window.setTimeout(() => setCopyFeedback(null), 2400);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-ciano border-t-transparent" />
        <p className="text-sm font-bold uppercase tracking-widest text-ciano italic">Consultando sistemas...</p>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-2xl border border-dashed border-acento/30 p-8 text-center">
        <div className="text-4xl">⚠️</div>
        <h2 className="mt-4 text-xl font-black text-acento uppercase">Falha na Conexao</h2>
        <p className="mt-2 text-sm text-texto/60">{error || "Erro ao obter diagnostico."}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 rounded-lg bg-acento/10 px-6 py-2 text-xs font-bold uppercase tracking-wider text-acento hover:bg-acento/20"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <PortalPageShell className="status-stage animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <PortalHero
        badge={<span className="badge-dados-abertos">Operação pública</span>}
        title="Status do Sistema"
        subtitle="Visão consolidada da integridade técnica, operacional, financeira e editorial do portal SEMEAR."
        tone="lab"
        metrics={
          <>
          <div className="portal-kpi-card portal-kpi-card-lab">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Rede monitorada</p>
            <p className="mt-2 text-3xl font-black text-brand-primary">{status.monitoring.stations_count}</p>
            <p className="mt-1 text-sm text-text-secondary">estação(ões) ativas</p>
          </div>
          <div className="portal-kpi-card">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Medições 24h</p>
            <p className="mt-2 text-3xl font-black text-text-primary">{formatNumber(status.monitoring.measurements_24h)}</p>
            <p className="mt-1 text-sm text-text-secondary">leituras recentes consolidadas</p>
          </div>
          </>
        }
      />

      <SurfaceCard className="portal-list-panel p-6 md:p-8">
        <PortalSectionHeader
          eyebrow="Boletim mensal"
          title="Resumo exportável de operação"
          subtitle="Selecione o período para gerar um resumo institucional e exportar os KPIs consolidados do mês."
        />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-ciano">Boletim Mensal</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wide text-texto/70">
              Mes
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="rounded-lg border border-ciano/20 bg-base/20 px-3 py-2 text-sm font-semibold text-texto"
              >
                {MONTH_OPTIONS.map((month) => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wide text-texto/70">
              Ano
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="rounded-lg border border-ciano/20 bg-base/20 px-3 py-2 text-sm font-semibold text-texto"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <EditorialCard variant="compact">
            <EditorialCardBody className="justify-between p-4">
              <div className="space-y-2">
                <EditorialCardMeta>
                  <span>Medições</span>
                </EditorialCardMeta>
                <EditorialCardTitle className="text-3xl text-ciano">{monthlyLoading ? "..." : formatNumber(monthlyOps.total_measurements)}</EditorialCardTitle>
                <EditorialCardExcerpt>Linhas registradas em measurements.</EditorialCardExcerpt>
              </div>
            </EditorialCardBody>
          </EditorialCard>
          <EditorialCard variant="compact">
            <EditorialCardBody className="justify-between p-4">
              <div className="space-y-2">
                <EditorialCardMeta>
                  <span>Ingest novo / duplicado</span>
                </EditorialCardMeta>
                <EditorialCardTitle className="text-2xl text-primaria">{monthlyLoading ? "..." : `${formatNumber(monthlyOps.inserted_count)} / ${formatNumber(monthlyOps.duplicated_count)}`}</EditorialCardTitle>
                <EditorialCardExcerpt>Novas gravações vs repetições bloqueadas.</EditorialCardExcerpt>
              </div>
            </EditorialCardBody>
          </EditorialCard>
          <EditorialCard variant="compact">
            <EditorialCardBody className="justify-between p-4">
              <div className="space-y-2">
                <EditorialCardMeta>
                  <span>Alertas push</span>
                </EditorialCardMeta>
                <EditorialCardTitle className="text-3xl text-acento">{monthlyLoading ? "..." : formatNumber(monthlyOps.total_push_alerts)}</EditorialCardTitle>
                <EditorialCardExcerpt>Eventos com trigger ativo em push_events.</EditorialCardExcerpt>
              </div>
            </EditorialCardBody>
          </EditorialCard>
          <EditorialCard variant="compact">
            <EditorialCardBody className="justify-between p-4">
              <div className="space-y-2">
                <EditorialCardMeta>
                  <span>Conteúdo publicado</span>
                </EditorialCardMeta>
                <EditorialCardTitle className="text-3xl text-texto">{monthlyLoading ? "..." : formatNumber(monthlyOps.published_content_items_count)}</EditorialCardTitle>
                <EditorialCardExcerpt>Blog + acervo publicados no mês.</EditorialCardExcerpt>
              </div>
            </EditorialCardBody>
          </EditorialCard>
        </div>

        <div className="mt-5 rounded-2xl border border-base/30 bg-base/10 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wide text-ciano">Resumo gerado</p>
              {monthlyError ? (
                <p className="mt-2 text-sm text-acento">{monthlyError}</p>
              ) : (
                <p className="mt-2 text-sm leading-6 text-texto/80">{monthlyLoading ? "Gerando resumo do periodo selecionado..." : monthlyBulletin}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <Link
                to={`/transparencia?month=${String(selectedMonth).padStart(2, "0")}&year=${selectedYear}`}
                className="inline-flex min-h-11 items-center rounded-lg border border-primaria/20 bg-primaria/10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-primaria hover:bg-primaria/20"
              >
                Ver gastos do mes
              </Link>
              <button
                type="button"
                onClick={() => { void handleShareBulletin(); }}
                disabled={monthlyLoading || Boolean(monthlyError)}
                className="inline-flex min-h-11 items-center rounded-lg border border-success/20 bg-success/10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-success hover:bg-success/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Compartilhar boletim
              </button>
              <button
                type="button"
                onClick={handleDownloadMonthlyCsv}
                disabled={monthlyLoading || Boolean(monthlyError)}
                className="inline-flex min-h-11 items-center rounded-lg border border-ciano/20 bg-ciano/10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-ciano hover:bg-ciano/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Baixar CSV do período
              </button>
              <button
                type="button"
                onClick={() => { void handleCopySummary(); }}
                disabled={monthlyLoading || Boolean(monthlyError)}
                className="inline-flex min-h-11 items-center rounded-lg border border-base/30 bg-base/20 px-4 py-2 text-xs font-bold uppercase tracking-wide text-texto hover:bg-base/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Copiar resumo
              </button>
            </div>
          </div>
          {copyFeedback && <p className="mt-3 text-xs font-bold text-ciano">{copyFeedback}</p>}
        </div>
      </SurfaceCard>

      <SurfaceCard className="p-6 md:p-8">
        <PortalSectionHeader
          eyebrow="Operação"
          title="Rede, transparência e conteúdo"
          subtitle="Uma leitura institucional dos sinais do sistema, com mais hierarquia e menos aparência de console técnico."
        />
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <EditorialCard variant="compact">
            <EditorialCardBody className="justify-between p-5">
              <div className="space-y-3">
                <EditorialCardMeta><span>Rede de monitoramento</span></EditorialCardMeta>
                <EditorialCardTitle className="text-3xl text-primaria">{status.monitoring.stations_count}</EditorialCardTitle>
                <EditorialCardExcerpt>Estações ativas no ar e {status.monitoring.measurements_24h} medições nas últimas 24h.</EditorialCardExcerpt>
                {status.monitoring.latest_measurement ? (
                  <div className="rounded-2xl border border-divider-subtle bg-surface-2 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">{status.monitoring.latest_measurement.station_name}</p>
                    <p className="mt-1 text-sm font-semibold text-text-primary">{new Date(status.monitoring.latest_measurement.ts).toLocaleTimeString("pt-BR")}</p>
                  </div>
                ) : null}
              </div>
            </EditorialCardBody>
          </EditorialCard>

          <EditorialCard variant="compact">
            <EditorialCardBody className="justify-between p-5">
              <div className="space-y-3">
                <EditorialCardMeta><span>Alertas (7 dias)</span></EditorialCardMeta>
                <EditorialCardTitle className="text-3xl text-acento">{status.alerts.total_7d}</EditorialCardTitle>
                <EditorialCardExcerpt>Triggers e sinais por estação ou poluente.</EditorialCardExcerpt>
                <div className="space-y-2">
                  {status.alerts.top_stations.length > 0 ? (
                    status.alerts.top_stations.slice(0, 3).map((station, idx) => (
                      <div key={`${station.station_code}-${idx}`} className="flex items-center justify-between rounded-2xl bg-surface-2 px-3 py-2 text-xs">
                        <span className="font-mono text-text-secondary">{station.station_code}</span>
                        <span className="font-black text-acento">{station.count}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-text-secondary">Sem alertas relevantes no período.</p>
                  )}
                </div>
              </div>
            </EditorialCardBody>
          </EditorialCard>

          <EditorialCard variant="compact">
            <EditorialCardBody className="justify-between p-5">
              <div className="space-y-3">
                <EditorialCardMeta><span>Transparência</span></EditorialCardMeta>
                <EditorialCardTitle className="text-[1.95rem] text-primaria">{formatCurrency(status.transparency.current_month_total_cents)}</EditorialCardTitle>
                <EditorialCardExcerpt>
                  {formatNumber(status.transparency.current_month_count)} lançamentos no mês atual e {formatNumber(status.transparency.last_7d_count)} nos últimos 7 dias.
                </EditorialCardExcerpt>
                <div className="space-y-2">
                  {Object.entries(status.transparency.current_month_by_category).sort((a, b) => Number(b[1]) - Number(a[1])).slice(0, 3).map(([cat, amount]) => (
                    <div className="flex items-center justify-between rounded-2xl bg-surface-2 px-3 py-2 text-xs" key={cat}>
                      <span className="capitalize text-text-secondary">{cat}</span>
                      <span className="font-bold text-text-primary">{formatCurrency(amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <EditorialCardActions>
                <Link to="/transparencia" className="ui-btn-ghost">Detalhes financeiros</Link>
              </EditorialCardActions>
            </EditorialCardBody>
          </EditorialCard>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <EditorialCard variant="standard">
            <EditorialCardBody className="justify-between p-5">
              <div className="space-y-3">
                <EditorialCardMeta><span>Alcance social</span></EditorialCardMeta>
                <EditorialCardTitle className="text-3xl text-ciano">{formatNumber(status.social.total_7d)}</EditorialCardTitle>
                <EditorialCardExcerpt>Compartilhamentos por tipo de conteúdo nos últimos 7 dias.</EditorialCardExcerpt>
                <div className="space-y-2">
                  {socialKindsOrder.map((kind) => (
                    <div key={kind} className="flex items-center justify-between rounded-2xl bg-surface-2 px-3 py-2 text-xs">
                      <span className="text-text-secondary">{socialLabels[kind] || kind}</span>
                      <span className="font-black text-text-primary">{formatNumber(Number(socialByKind[kind] || 0))}</span>
                    </div>
                  ))}
                </div>
              </div>
            </EditorialCardBody>
          </EditorialCard>

          <EditorialCard variant="standard">
            <EditorialCardBody className="justify-between p-5">
              <div className="space-y-3">
                <EditorialCardMeta><span>Sinais de conteúdo</span></EditorialCardMeta>
                <EditorialCardTitle className="text-2xl">Sincronizado</EditorialCardTitle>
                <EditorialCardExcerpt>Blog, acervo, agenda e relatórios publicados com leitura contínua.</EditorialCardExcerpt>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-surface-2 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">Blog</p>
                    <p className="mt-2 text-2xl font-black text-text-primary">{status.content.latest_blog.length}</p>
                  </div>
                  <div className="rounded-2xl bg-surface-2 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">Acervo</p>
                    <p className="mt-2 text-2xl font-black text-text-primary">{status.content.latest_acervo.length}</p>
                  </div>
                  <div className="rounded-2xl bg-surface-2 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">Agenda</p>
                    <p className="mt-2 text-2xl font-black text-text-primary">{status.content.upcoming_events.length}</p>
                  </div>
                  <div className="rounded-2xl bg-surface-2 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">Relatórios</p>
                    <p className="mt-2 text-2xl font-black text-text-primary">{status.content.reports_published_month}</p>
                  </div>
                </div>
              </div>
            </EditorialCardBody>
          </EditorialCard>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <EditorialCard variant="standard">
            <EditorialCardBody className="justify-between p-5">
              <div className="space-y-3">
                <EditorialCardMeta><span>Saúde da rede</span></EditorialCardMeta>
                <EditorialCardTitle className="text-2xl">Estado operacional</EditorialCardTitle>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-2xl bg-surface-2 px-3 py-2 text-xs">
                    <span className="text-text-secondary">Excelente</span>
                    <span className="font-black text-text-primary">{status.network_health?.ok || 0}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-surface-2 px-3 py-2 text-xs">
                    <span className="text-text-secondary">Degradado</span>
                    <span className="font-black text-text-primary">{status.network_health?.degraded || 0}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-surface-2 px-3 py-2 text-xs">
                    <span className="text-text-secondary">Offline</span>
                    <span className="font-black text-text-primary">{status.network_health?.offline || 0}</span>
                  </div>
                </div>
              </div>
            </EditorialCardBody>
          </EditorialCard>

          <EditorialCard variant="standard">
            <EditorialCardBody className="justify-between p-5">
              <div className="space-y-3">
                <EditorialCardMeta><span>Erros nas últimas 24h</span></EditorialCardMeta>
                <EditorialCardTitle className="text-3xl text-acento">{formatNumber(observabilityErrors.total)}</EditorialCardTitle>
                <EditorialCardExcerpt>Contagem agregada e sanitizada de eventos do navegador e APIs.</EditorialCardExcerpt>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-surface-2 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">API</p>
                    <p className="mt-2 text-2xl font-black text-text-primary">{formatNumber(observabilityErrors.apiErrors)}</p>
                  </div>
                  <div className="rounded-2xl bg-surface-2 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">Runtime</p>
                    <p className="mt-2 text-2xl font-black text-text-primary">{formatNumber(observabilityErrors.runtimeErrors)}</p>
                  </div>
                  <div className="rounded-2xl bg-surface-2 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">Limiar 24h</p>
                    <p className="mt-2 text-2xl font-black text-text-primary">{formatNumber(totalAboveThreshold24h)}</p>
                  </div>
                </div>
              </div>
            </EditorialCardBody>
          </EditorialCard>
        </div>

        {isDevAccessibilityVisible && (
          <div className="rounded-2xl border border-amber-500/30 bg-fundo/60 p-6 flex flex-col md:col-span-3">
            <h2 className="text-xs font-black uppercase tracking-widest text-cta">Acessibilidade (dev)</h2>
            <div className="mt-4 flex flex-wrap items-end gap-6">
              <div>
                <p className="text-3xl font-black text-texto">{formatNumber(contrastAudit.length)}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-texto/60">Combinacoes auditadas</p>
              </div>
              <div>
                <p className="text-3xl font-black text-amber-500">{formatNumber(contrastFailures.length)}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-texto/60">Abaixo do AA</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {contrastAudit.map((item) => (
                <div key={item.name} className="flex flex-col gap-1 rounded-lg border border-base/20 bg-base/10 px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-bold text-texto">{item.name}</p>
                    <p className="text-texto/60">{item.foreground} em {item.background}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className={item.passes ? "font-black text-green-600" : "font-black text-amber-500"}>{item.ratio.toFixed(2)}:1</p>
                    <p className="text-texto/60">minimo {(item.minRatio ?? 4.5).toFixed(1)}:1</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-texto/60">Este bloco aparece apenas fora de producao para revisar contraste do design system.</p>
          </div>
        )}

        </SurfaceCard>

      {showOpsHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowOpsHelp(false)}>
          <div
            className="w-full max-w-xl rounded-2xl border border-ciano/30 bg-fundo p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ops-help-title"
            onClick={(ev) => ev.stopPropagation()}
          >
            <h3 id="ops-help-title" className="text-lg font-black text-texto">Como ler estes numeros</h3>
            <p className="mt-3 text-sm text-texto/70">Todos os indicadores cobrem os ultimos 7 dias corridos, em janela movel.</p>
            <ul className="mt-4 space-y-2 text-sm text-texto/80">
              <li><span className="font-bold">Medicoes:</span> total de linhas em measurements no periodo.</li>
              <li><span className="font-bold">Ingest inserido/duplicado:</span> contagem em ingest_logs da rotina hardenizada.</li>
              <li><span className="font-bold">Alertas disparados:</span> total de push_events com trigger verdadeiro.</li>
              <li><span className="font-bold">Eventos publicados:</span> registros de agenda com status = published no periodo.</li>
              <li><span className="font-bold">Acervo + blog publicados:</span> soma de novos itens de acervo e posts publicados.</li>
              <li><span className="font-bold">Agendados:</span> total de conteudos com publish_at no futuro.</li>
              <li><span className="font-bold">Acima do limiar (24h):</span> leituras por estacao acima de PM2.5 &gt; 15 ou PM10 &gt; 45.</li>
            </ul>
            <button
              type="button"
              onClick={() => setShowOpsHelp(false)}
              className="mt-6 rounded-lg bg-ciano/15 px-4 py-2 text-xs font-bold uppercase tracking-wide text-ciano hover:bg-ciano/25"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      <SurfaceCard className="p-6 md:p-8">
        <PortalSectionHeader
          eyebrow="Conteúdo"
          title="Próximos passos e memória digital"
          subtitle="Uma leitura final mais editorial para agenda, blog e acervo, fechando o Status com a mesma linguagem do restante do portal."
        />
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <EditorialCard variant="standard">
            <EditorialCardBody className="justify-between p-5">
              <div className="space-y-3">
                <EditorialCardMeta><span>Próximos passos</span></EditorialCardMeta>
                <EditorialCardTitle className="text-2xl">Agenda</EditorialCardTitle>
                {status.content.upcoming_events.length === 0 ? (
                  <EditorialCardExcerpt>Nenhum evento agendado.</EditorialCardExcerpt>
                ) : (
                  <div className="space-y-3">
                    {status.content.upcoming_events.map((ev) => (
                      <Link to={`/agenda`} key={ev.id} className="group block rounded-2xl border border-divider-subtle bg-surface-2 px-4 py-3 motion-surface motion-surface-hover">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">{new Date(ev.start_at).toLocaleDateString()}</p>
                        <p className="mt-1 text-sm font-semibold text-text-primary">{ev.title}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </EditorialCardBody>
          </EditorialCard>

          <EditorialCard variant="standard">
            <EditorialCardBody className="justify-between p-5">
              <div className="space-y-3">
                <EditorialCardMeta><span>Memória digital</span></EditorialCardMeta>
                <EditorialCardTitle className="text-2xl">Acervo e blog</EditorialCardTitle>
                {status.content.latest_acervo.length === 0 && status.content.latest_blog.length === 0 ? (
                  <EditorialCardExcerpt>Sem publicações recentes.</EditorialCardExcerpt>
                ) : (
                  <div className="space-y-3">
                    {status.content.latest_blog.slice(0, 2).map((post) => (
                      <Link to={`/blog/${post.slug}`} key={post.id} className="group block rounded-2xl border border-divider-subtle bg-surface-2 px-4 py-3 motion-surface motion-surface-hover">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">Blog</p>
                        <p className="mt-1 text-sm font-semibold text-text-primary">{post.title}</p>
                      </Link>
                    ))}
                    {status.content.latest_acervo.slice(0, 2).map((item) => (
                      <Link to={`/acervo/item/${item.slug}`} key={item.id} className="group block rounded-2xl border border-divider-subtle bg-surface-2 px-4 py-3 motion-surface motion-surface-hover">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">{item.kind}</p>
                        <p className="mt-1 text-sm font-semibold text-text-primary">{item.title}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </EditorialCardBody>
          </EditorialCard>
        </div>
      </SurfaceCard>
    </PortalPageShell>
  );
}




