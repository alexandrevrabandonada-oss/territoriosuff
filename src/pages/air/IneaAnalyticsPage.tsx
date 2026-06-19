import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IconShell, SurfaceCard } from "../../components/BrandSystem";
import { DataFreshnessNotice } from "../../components/air/DataFreshnessNotice";
import { PublicInterpretationBox } from "../../components/air/PublicInterpretationBox";
import { WindRosePanel } from "../../components/air/WindRosePanel";
import { WeatherPollutionCorrelation } from "../../components/air/WeatherPollutionCorrelation";
import { RainWashEffectPanel } from "../../components/air/RainWashEffectPanel";
import { RADAR_CONTROLLER_NOTE, RADAR_NO_DATA_NOT_CLEAN_AIR } from "../../data/air/radar-copy";
import { ATTENTION_EPISODES } from "../../data/air/attention-episodes-2020-2026";
import { PARTICULATE_TIMELINE } from "../../data/air/particulate-timeline-2020-2026";
import { AIR_PUBLIC_DOWNLOADS } from "../../data/air/public-downloads";
import { RadarEvidenceBadge } from "./radar/RadarEvidenceBadge";
import { RadarVisualNotice } from "./radar/RadarVisualNotice";
import { useRadarReleaseMetadata } from "../../data/air/useRadarReleaseMetadata";
import { fetchRadarJson } from "./radar/radarApi";
import type { ControllerFrequencyItem, DataGapItem, MonthlyProfileItem } from "./radar/RadarTypes";

interface DegradedDayItem {
  station_id: string;
  station_name: string;
  degraded_percent_of_measured_days: number;
}

interface StationRankingItem {
  station_id: string;
  station_name: string;
  coverage_percent: number;
  degraded_percent_of_measured_days: number;
  max_aqi: number;
  max_aqi_classification: string;
}

interface ClassificationDayItem {
  BOA?: number;
  MODERADA?: number;
  RUIM?: number;
  "MUITO RUIM"?: number;
  "PÉSSIMA"?: number;
  totalDays?: number;
}

type ClassificationDaysResponse = Record<string, ClassificationDayItem>;

function buildStaticAnalyticsSummary() {
  const timelineRows = PARTICULATE_TIMELINE.filter((row) => row.coveragePct > 0);
  const stations = Array.from(new Set(timelineRows.map((row) => row.station_name))).sort((a, b) => a.localeCompare(b, "pt-BR"));
  const years = Array.from(new Set(timelineRows.map((row) => row.year))).sort((a, b) => a - b);
  const pollutants = Array.from(new Set(timelineRows.map((row) => row.pollutant))).sort();
  const strongCoverageRows = timelineRows.filter((row) => row.coveragePct >= 75).length;
  const partialCoverageRows = timelineRows.filter((row) => row.coveragePct > 0 && row.coveragePct < 75).length;
  const attentionMonths = ATTENTION_EPISODES.filter((episode) => episode.who_exceedance_days > 0 || episode.conama_exceedance_days > 0);
  const worstAttentionMonth = attentionMonths.reduce<(typeof ATTENTION_EPISODES)[number] | null>((current, episode) => {
    const episodeScore = episode.who_exceedance_days + episode.conama_exceedance_days + episode.peak_pm10 + episode.peak_pm25;
    const currentScore = current ? current.who_exceedance_days + current.conama_exceedance_days + current.peak_pm10 + current.peak_pm25 : -1;
    return episodeScore > currentScore ? episode : current;
  }, null);

  return {
    stations,
    years,
    pollutants,
    strongCoverageRows,
    partialCoverageRows,
    attentionMonths,
    worstAttentionMonth,
    csvDownloads: AIR_PUBLIC_DOWNLOADS.filter((item) => item.file.endsWith(".csv")).length
  };
}

const staticAnalyticsSummary = buildStaticAnalyticsSummary();

function IneaAnalyticsFallback({ failedBlocks }: { failedBlocks: string[] }) {
  const releaseMetadata = useRadarReleaseMetadata();
  const yearStart = staticAnalyticsSummary.years[0] ?? 2020;
  const yearEnd = staticAnalyticsSummary.years[staticAnalyticsSummary.years.length - 1] ?? 2026;
  const worstMonthLabel = staticAnalyticsSummary.worstAttentionMonth
    ? `${staticAnalyticsSummary.worstAttentionMonth.month}/${staticAnalyticsSummary.worstAttentionMonth.year}`
    : "em consolidação";

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef7f5_48%,#ffffff_100%)] pb-16">
      <section className="mx-auto max-w-7xl px-4 pt-10 md:px-6 md:pt-16">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative overflow-hidden rounded-[2.25rem] bg-slate-950 p-7 text-white shadow-[0_28px_70px_-42px_rgba(15,23,42,0.78)] md:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(16,185,129,0.28),transparent_32%),radial-gradient(circle_at_88%_20%,rgba(14,165,233,0.24),transparent_34%)]" />
            <div className="relative z-10 space-y-6">
              <div className="inline-flex rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-200">
                Análise histórica sem API
              </div>
              <div className="space-y-3">
                <h1 className="max-w-3xl text-4xl font-black leading-[0.92] tracking-tight md:text-6xl">
                  Análises INEA a partir da base histórica consolidada
                </h1>
                <p className="max-w-2xl text-base font-semibold leading-relaxed text-slate-200 md:text-lg">
                  Esta rota não deve depender de endpoint em tempo real. Quando a camada analítica automática não responde,
                  o portal mostra a síntese pública já auditada: anos, estações, poluentes, cobertura e episódios de atenção.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-300">Janela</div>
                  <div className="mt-2 text-3xl font-black">{yearStart}-{yearEnd}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-300">Estações</div>
                  <div className="mt-2 text-3xl font-black">{staticAnalyticsSummary.stations.length}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-300">CSVs públicos</div>
                  <div className="mt-2 text-3xl font-black">{staticAnalyticsSummary.csvDownloads}</div>
                </div>
              </div>
            </div>
          </div>

          <SurfaceCard className="rounded-[2.25rem] border border-slate-200 bg-white p-6 shadow-[0_22px_52px_-40px_rgba(15,23,42,0.45)] md:p-8">
            <div className="space-y-4">
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Status da camada automática</div>
              <h2 className="text-2xl font-black tracking-tight text-slate-950">Endpoint analítico indisponível, rota preservada.</h2>
              <p className="text-sm font-semibold leading-relaxed text-slate-600">
                A ausência de resposta automática não torna a página morta. Ela passa a operar como painel pedagógico
                baseado nos artefatos históricos versionados do ciclo {releaseMetadata.cycleVersion}.
              </p>
              {failedBlocks.length > 0 ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-bold leading-relaxed text-amber-900">
                  Blocos automáticos sem resposta: {failedBlocks.join(", ")}.
                </div>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <Link to="/qualidade-ar/inea" className="rounded-2xl bg-slate-950 px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-white transition-colors hover:bg-emerald-700">
                  Voltar ao Radar
                </Link>
                <Link to="/qualidade-ar/inea/historia" className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-slate-700 transition-colors hover:bg-slate-50">
                  Ver história INEA
                </Link>
              </div>
            </div>
          </SurfaceCard>
        </div>
      </section>

      <section className="mx-auto mt-8 grid max-w-7xl gap-4 px-4 md:grid-cols-4 md:px-6">
        <SurfaceCard className="rounded-[1.6rem] border border-emerald-200 bg-emerald-50 p-5">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">Cobertura forte</div>
          <div className="mt-3 text-3xl font-black text-emerald-950">{staticAnalyticsSummary.strongCoverageRows}</div>
          <p className="mt-2 text-xs font-bold leading-relaxed text-emerald-900">linhas ano-estação-poluente com cobertura igual ou superior a 75%.</p>
        </SurfaceCard>
        <SurfaceCard className="rounded-[1.6rem] border border-amber-200 bg-amber-50 p-5">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-700">Cobertura cautelar</div>
          <div className="mt-3 text-3xl font-black text-amber-950">{staticAnalyticsSummary.partialCoverageRows}</div>
          <p className="mt-2 text-xs font-bold leading-relaxed text-amber-900">linhas úteis para contexto, mas insuficientes para ranking forte.</p>
        </SurfaceCard>
        <SurfaceCard className="rounded-[1.6rem] border border-rose-200 bg-rose-50 p-5">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-rose-700">Meses de atenção</div>
          <div className="mt-3 text-3xl font-black text-rose-950">{staticAnalyticsSummary.attentionMonths.length}</div>
          <p className="mt-2 text-xs font-bold leading-relaxed text-rose-900">meses com excedência OMS ou CONAMA na base de episódios.</p>
        </SurfaceCard>
        <SurfaceCard className="rounded-[1.6rem] border border-sky-200 bg-sky-50 p-5">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-700">Pico pedagógico</div>
          <div className="mt-3 text-3xl font-black text-sky-950">{worstMonthLabel}</div>
          <p className="mt-2 text-xs font-bold leading-relaxed text-sky-900">mês recomendado para iniciar leitura crítica de episódios.</p>
        </SurfaceCard>
      </section>

      <section className="mx-auto mt-8 max-w-7xl px-4 md:px-6">
        <SurfaceCard className="rounded-[1.8rem] border border-slate-200 bg-white p-6">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Como interpretar</div>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Esta análise é uma triagem pública, não laudo individual.</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold leading-relaxed text-slate-700">
              <strong className="block text-slate-950">1. Comece pela cobertura.</strong>
              Estação sem dado não é estação com ar limpo. Lacuna deve ser lida como problema de transparência e continuidade.
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold leading-relaxed text-slate-700">
              <strong className="block text-slate-950">2. Compare PM10 e PM2.5.</strong>
              Picos simultâneos ou recorrentes em material particulado merecem leitura territorial prioritária.
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold leading-relaxed text-slate-700">
              <strong className="block text-slate-950">3. Feche com ação pública.</strong>
              Use o Radar, a História INEA e a metodologia para formular cobrança, reunião ou pedido de informação.
            </div>
          </div>
        </SurfaceCard>
      </section>
    </main>
  );
}

export function IneaAnalyticsPage() {
  const releaseMetadata = useRadarReleaseMetadata();
  const [degradedDays, setDegradedDays] = useState<DegradedDayItem[]>([]);
  const [controllerFreq, setControllerFreq] = useState<ControllerFrequencyItem[]>([]);
  const [monthlyProfile, setMonthlyProfile] = useState<MonthlyProfileItem[]>([]);
  const [stationRanking, setStationRanking] = useState<StationRankingItem[]>([]);
  const [dataGaps, setDataGaps] = useState<DataGapItem[]>([]);
  const [classificationDays, setClassificationDays] = useState<Record<string, ClassificationDayItem>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [failedBlocks, setFailedBlocks] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function fetchAnalytics() {
      try {
        setLoading(true);
        setError(null);
        setFailedBlocks([]);

        const endpoints = [
          { key: "degraded", label: "dias degradados", url: "/api/air/inea/analytics/degraded-days" },
          { key: "controller", label: "poluente controlador", url: "/api/air/inea/analytics/controller-frequency" },
          { key: "monthly", label: "perfil mensal", url: "/api/air/inea/analytics/monthly-profile" },
          { key: "ranking", label: "ranking das estações", url: "/api/air/inea/analytics/station-ranking" },
          { key: "gaps", label: "lacunas de dados", url: "/api/air/inea/analytics/data-gaps" },
          { key: "classification", label: "dias por classificação", url: "/api/air/inea/classification-days" }
        ] as const;

        const responses = await Promise.allSettled(
          endpoints.map(async (endpoint) => ({
            key: endpoint.key,
            payload: await fetchRadarJson<unknown>(endpoint.url)
          }))
        );

        if (cancelled) return;

        const resultMap = new Map<string, unknown>();
        const failed: string[] = [];

        responses.forEach((result, index) => {
          if (result.status === "fulfilled") {
            resultMap.set(result.value.key, result.value.payload);
          } else {
            failed.push(endpoints[index].label);
          }
        });

        setDegradedDays((resultMap.get("degraded") as DegradedDayItem[]) || []);
        setControllerFreq((resultMap.get("controller") as ControllerFrequencyItem[]) || []);
        setMonthlyProfile((resultMap.get("monthly") as MonthlyProfileItem[]) || []);
        setStationRanking((resultMap.get("ranking") as StationRankingItem[]) || []);
        setDataGaps((resultMap.get("gaps") as DataGapItem[]) || []);
        setClassificationDays((resultMap.get("classification") as ClassificationDaysResponse) || {});
        setFailedBlocks(failed);

        if (failed.length === endpoints.length) {
          setError("Não foi possível carregar as análises públicas do Radar INEA.");
        }
      } catch (err) {
        if (cancelled) return;
        console.error("Error loading analytics data:", err);
        setError("Não foi possível carregar as análises. Verifique a conexão com o banco de dados.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchAnalytics();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
          <p className="text-slate-500 text-sm font-medium">Processando dados analíticos oficiais...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <IneaAnalyticsFallback failedBlocks={failedBlocks.length ? failedBlocks : ["todos os blocos analíticos"]} />;
  }

  // Calculate high-level metrics cards
  const worstStationByDegraded = degradedDays.length > 0 ? degradedDays[0] : null;
  const topController = controllerFreq.length > 0 ? controllerFreq[0] : null;
  
  let worstIndexAqi = 0;
  let worstIndexStation = "-";
  let worstIndexClass = "BOA";
  for (const r of stationRanking) {
    if (r.max_aqi > worstIndexAqi) {
      worstIndexAqi = r.max_aqi;
      worstIndexStation = r.station_name;
      worstIndexClass = r.max_aqi_classification;
    }
  }

  let worstMonthName = "-";
  let worstMonthPct = 0;
  for (const m of monthlyProfile) {
    if (m.degraded_percent_of_measured_days > worstMonthPct) {
      worstMonthPct = m.degraded_percent_of_measured_days;
      worstMonthName = m.month_name;
    }
  }

  const worstStationGaps = dataGaps.length > 0 
    ? [...dataGaps].sort((a, b) => b.gap_count - a.gap_count)[0] 
    : null;

  // Filter stations that meet the minimum coverage requirement (30%)
  const validRankedStations = stationRanking.filter(r => r.coverage_percent >= 30.0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-10">
      
      {/* Header and Breadcrumbs */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/qualidade-ar" className="hover:text-slate-800 transition-colors">Radar do Ar</Link>
          <span>/</span>
          <Link to="/qualidade-ar/inea" className="hover:text-slate-800 transition-colors">INEA</Link>
          <span>/</span>
          <span className="text-slate-800">Análises</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">O que os dados oficiais mostram?</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">
              Camada analítica e diagnóstico público das medições históricas de qualidade do ar em Volta Redonda, condicionados ao release vigente e à cobertura respondida.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <RadarEvidenceBadge
                level="experimental"
                label="Leitura analítica pública"
                detail="diagnóstico útil para interpretação coletiva, com cautela sobre cobertura e validação por registro"
              />
              <RadarEvidenceBadge
                level="interpretive"
                label="Meteorologia mista"
                detail="vento observado; demais condições atmosféricas devem ser lidas como camada auxiliar"
              />
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-700">
                ciclo {releaseMetadata.cycleVersion}
              </span>
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">
                metodologia {releaseMetadata.methodologyVersion}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link 
              to="/qualidade-ar/inea/historia"
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all shadow-sm"
            >
              Ver explicação didática
            </Link>
            <Link 
              to="/qualidade-ar/inea"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm"
            >
              Voltar para o Painel Geral
            </Link>
          </div>
        </div>
      </div>

      {/* Freshness Disclaimer & Coverage Warning Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DataFreshnessNotice />
        <SurfaceCard className="border border-amber-300 bg-amber-50/50 p-4 rounded-xl flex items-start gap-3">
          <IconShell tone="warm" className="shrink-0">
            <svg className="h-5 w-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </IconShell>
          <div className="space-y-1">
            <h4 className="font-bold text-amber-800 text-xs uppercase tracking-wider">Aviso de Integridade Analítica</h4>
            <p className="text-xs leading-relaxed text-amber-700 font-bold">
              Estações com baixa cobertura não devem ser interpretadas como regiões de ar melhor. {RADAR_NO_DATA_NOT_CLEAN_AIR}
            </p>
          </div>
        </SurfaceCard>
      </div>

      {failedBlocks.length > 0 && (
        <RadarVisualNotice
          type="warning"
          title="Carga analítica parcial"
          description={`Alguns blocos não responderam nesta carga: ${failedBlocks.join(", ")}. Os indicadores abaixo refletem apenas os dados que responderam, ainda dentro do release público vigente.`}
          badges={[
            `ciclo ${releaseMetadata.cycleVersion}`,
            `dataset ${releaseMetadata.datasetVersion}`,
            `revisão ${releaseMetadata.plannedReviewDate}`
          ]}
          nextStep="Use esta leitura como triagem analítica e confirme no painel principal, no histórico e na metodologia antes de fechar conclusão pública forte."
        />
      )}

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Worst Station */}
        <SurfaceCard className="p-5 border border-slate-100 rounded-2xl flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estação Crítica</span>
            <h3 className="text-base font-extrabold text-slate-800 leading-tight">
              {worstStationByDegraded ? worstStationByDegraded.station_name : "-"}
            </h3>
            <p className="text-xs text-slate-500 font-semibold">
              {worstStationByDegraded ? `${worstStationByDegraded.degraded_percent_of_measured_days}% dos dias medidos classificados como MODERADA ou pior` : "-"}
            </p>
          </div>
          <div className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg self-start">
            Mais dias medidos como MODERADA ou pior
          </div>
        </SurfaceCard>

        {/* Card 2: Top Controller */}
        <SurfaceCard className="p-5 border border-slate-100 rounded-2xl flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Poluente Controlador</span>
            <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {topController ? topController.pollutant : "-"}
            </h3>
            <p className="text-xs text-slate-500 font-semibold">
              {topController ? `${topController.percentage}% das leituras respondidas controladas por ele` : "-"}
            </p>
          </div>
          <div className="text-[11px] font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg self-start">
            Frequência mais alta
          </div>
        </SurfaceCard>

        {/* Card 3: Worst AQI */}
        <SurfaceCard className="p-5 border border-slate-100 rounded-2xl flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Maior Índice IQAr registrado</span>
            <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {worstIndexAqi}
            </h3>
            <p className="text-xs text-slate-500 font-semibold">
              Maior valor encontrado na base pública respondida: {worstIndexStation} ({worstIndexClass})
            </p>
          </div>
          <div className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg self-start">
            Maior Índice IQAr registrado
          </div>
        </SurfaceCard>

        {/* Card 4: Worst Month */}
        <SurfaceCard className="p-5 border border-slate-100 rounded-2xl flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Época Crítica</span>
            <h3 className="text-base font-extrabold text-slate-800 leading-tight">
              {worstMonthName}
            </h3>
            <p className="text-xs text-slate-500 font-semibold">
              {worstMonthPct}% das medições mensais válidas classificadas como MODERADA ou pior
            </p>
          </div>
          <div className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg self-start">
            Maior proporção registrada
          </div>
        </SurfaceCard>

        {/* Card 5: Gaps */}
        <SurfaceCard className="p-5 border border-slate-100 rounded-2xl flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lacunas Temporais</span>
            <h3 className="text-base font-extrabold text-slate-800 leading-tight">
              {worstStationGaps ? worstStationGaps.station_name : "-"}
            </h3>
            <p className="text-xs text-slate-500 font-semibold">
              {worstStationGaps ? `${worstStationGaps.gap_count} lacunas de dados > 24h` : "-"}
            </p>
          </div>
          <div className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg self-start">
            Maior número de interrupções
          </div>
        </SurfaceCard>

      </div>

      {/* Rankings Section (Filtered by 30% coverage minimum) */}
      <SurfaceCard className="p-6 border border-slate-100 rounded-3xl space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-800">Ranking Comparativo de Estações (Cobertura Mínima de 30%)</h2>
          <p className="text-xs text-slate-500 font-medium">
            Mapeamento comparativo baseado em dados minimamente consistentes para leitura pública inicial, não em equivalência regulatória fechada.
          </p>
        </div>

        {validRankedStations.length === 0 ? (
          <div className="p-6 border border-dashed border-slate-200 bg-slate-50/50 rounded-2xl text-center space-y-2">
            <svg className="mx-auto h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="font-extrabold text-slate-700 text-sm">Ausência de Cobertura para Ranking</h4>
            <p className="text-xs text-slate-500 font-semibold max-w-lg mx-auto">
              Não há cobertura suficiente para ranking comparativo robusto entre estações. 
              Nenhuma das estações atinge a cobertura mínima recomendada de 30% de dias medidos sobre os dias esperados.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {validRankedStations.map((station, index) => (
              <div key={station.station_id} className="py-4 flex justify-between items-center text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-black text-lg text-emerald-600">#{index + 1}</span>
                  <div>
                    <h4 className="font-bold text-slate-800">{station.station_name}</h4>
                    <p className="text-slate-400 font-medium">Cobertura: {station.coverage_percent}%</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-slate-800">{station.degraded_percent_of_measured_days}%</span>
                  <p className="text-slate-400 font-medium">dias MODERADA ou pior</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </SurfaceCard>

      {/* Main Charts & Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Visualization 1: Classifications Breakdown by Station */}
        <SurfaceCard className="p-6 border border-slate-100 rounded-3xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-800">Distribuição de Dias por Classificação Oficial</h2>
            <p className="text-xs text-slate-500 font-medium">
              Contagem total de dias atribuídos a cada faixa de qualidade do ar por estação oficial.
            </p>
          </div>

          <div className="space-y-5">
            {Object.entries(classificationDays).map(([sId, data]) => {
              const stationName = degradedDays.find(d => d.station_id === sId)?.station_name || sId;
              
              // Recalculate total including insufficient/missing days if any
              const stationGapInfo = dataGaps.find(d => d.station_id === sId);
              const insufficient = stationGapInfo ? stationGapInfo.insufficient_data_days : 0;
              const total = (data.totalDays || 0) + insufficient;
              
              return (
                <div key={sId} className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span>{stationName}</span>
                    <span className="text-slate-400 font-medium">{total} dias medidos ou sinalizados</span>
                  </div>
                  {/* Stacked Progress Bar */}
                  <div className="h-6 w-full rounded-lg overflow-hidden flex bg-slate-100 shadow-inner">
                    {(data.BOA ?? 0) > 0 && (
                      <div 
                        style={{ width: `${((data.BOA ?? 0) / total) * 100}%` }}
                        className="bg-green-500 h-full flex items-center justify-center text-[10px] text-white font-extrabold transition-all hover:opacity-90"
                        title={`BOA: ${data.BOA} dias`}
                      >
                        {(data.BOA ?? 0) > 15 && `BOA (${data.BOA})`}
                      </div>
                    )}
                    {(data.MODERADA ?? 0) > 0 && (
                      <div 
                        style={{ width: `${((data.MODERADA ?? 0) / total) * 100}%` }}
                        className="bg-yellow-400 h-full flex items-center justify-center text-[10px] text-yellow-900 font-extrabold transition-all hover:opacity-90"
                        title={`MODERADA: ${data.MODERADA} dias`}
                      >
                        {(data.MODERADA ?? 0) > 15 && `MOD (${data.MODERADA})`}
                      </div>
                    )}
                    {(data.RUIM ?? 0) > 0 && (
                      <div 
                        style={{ width: `${((data.RUIM ?? 0) / total) * 100}%` }}
                        className="bg-orange-500 h-full flex items-center justify-center text-[10px] text-white font-extrabold transition-all hover:opacity-90"
                        title={`RUIM: ${data.RUIM} dias`}
                      >
                        {(data.RUIM ?? 0) > 10 && `RUIM (${data.RUIM})`}
                      </div>
                    )}
                    {(data["MUITO RUIM"] ?? 0) > 0 && (
                      <div 
                        style={{ width: `${((data["MUITO RUIM"] ?? 0) / total) * 100}%` }}
                        className="bg-red-500 h-full flex items-center justify-center text-[10px] text-white font-extrabold transition-all hover:opacity-90"
                        title={`MUITO RUIM: ${data["MUITO RUIM"]} dias`}
                      >
                        {(data["MUITO RUIM"] ?? 0) > 5 && `M.R. (${data["MUITO RUIM"]})`}
                      </div>
                    )}
                    {(data["PÉSSIMA"] ?? 0) > 0 && (
                      <div 
                        style={{ width: `${((data["PÉSSIMA"] ?? 0) / total) * 100}%` }}
                        className="bg-purple-600 h-full flex items-center justify-center text-[10px] text-white font-extrabold transition-all hover:opacity-90"
                        title={`PÉSSIMA: ${data["PÉSSIMA"]} dias`}
                      >
                        {(data["PÉSSIMA"] ?? 0) > 5 && `PÉS (${data["PÉSSIMA"]})`}
                      </div>
                    )}
                    {insufficient > 0 && (
                      <div 
                        style={{ width: `${(insufficient / total) * 100}%` }} 
                        className="bg-slate-400 h-full flex items-center justify-center text-[10px] text-white font-extrabold transition-all hover:opacity-90"
                        title={`DADO INSUFICIENTE: ${insufficient} dias`}
                      >
                        {insufficient > 15 && `INSUF (${insufficient})`}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Classification Legend */}
          <div className="flex flex-wrap gap-3 pt-3 border-t border-slate-100 justify-start text-[10px] font-bold text-slate-500">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
              <span>BOA</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-yellow-400 rounded-sm"></div>
              <span>MODERADA</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-orange-500 rounded-sm"></div>
              <span>RUIM</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
              <span>MUITO RUIM</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-purple-600 rounded-sm"></div>
              <span>PÉSSIMA</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-slate-400 rounded-sm"></div>
              <span>DADO INSUFICIENTE / SEM DADO</span>
            </div>
          </div>
        </SurfaceCard>

        {/* Visualization 2: Controlling Pollutant Frequency */}
        <SurfaceCard className="p-6 border border-slate-100 rounded-3xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-800">Frequência do Poluente Controlador</h2>
            <p className="text-xs text-slate-500 font-medium">
              Percentual de medições em que cada poluente determinou o Índice geral IQAr.
            </p>
          </div>

          <div className="space-y-4">
            {controllerFreq.map((item) => (
              <div key={item.pollutant} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">{item.pollutant}</span>
                  <span className="font-semibold text-slate-500">{item.count} vezes ({item.percentage}%)</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${item.percentage}%` }}
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl text-[10px] leading-relaxed text-slate-500 font-semibold border border-slate-100">
            💡 <strong>Nota Técnica:</strong> O poluente controlador é aquele que apresenta o maior subíndice em uma leitura específica, definindo o índice consolidado geral (IQAr) da estação naquele instante. {RADAR_CONTROLLER_NOTE}
          </div>
        </SurfaceCard>

      </div>

      {/* Monthly Heatmap / Profile Section */}
      <SurfaceCard className="p-6 border border-slate-100 rounded-3xl space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-800">Perfil Mensal de Qualidade do Ar Degradada</h2>
          <p className="text-xs text-slate-500 font-medium">
            Proporção mensal de dias registrados como MODERADA ou pior com base apenas nos registros válidos que responderam na base pública.
          </p>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-12 gap-3">
          {monthlyProfile.map((item) => {
            const pct = item.degraded_percent_of_measured_days;
            
            // Choose color based on degradation percentage
            let cardBg = "bg-green-50 border-green-200 text-green-800";
            if (pct > 0 && pct <= 15) cardBg = "bg-yellow-50 border-yellow-200 text-yellow-800";
            else if (pct > 15 && pct <= 35) cardBg = "bg-orange-50 border-orange-200 text-orange-800";
            else if (pct > 35) cardBg = "bg-red-50 border-red-200 text-red-800";

            return (
              <div 
                key={item.month} 
                className={`p-4 border rounded-xl flex flex-col justify-between items-center text-center space-y-2 hover:scale-[1.02] transition-all duration-200 ${cardBg}`}
              >
                <span className="text-[10px] font-extrabold uppercase tracking-wider">{item.month_name}</span>
                <span className="text-2xl font-black">{pct}%</span>
                <span className="text-[9px] font-bold opacity-80">
                  {item.degraded_days} / {item.measured_days} dias
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-4 justify-start text-[10px] font-bold text-slate-500 pt-2">
          <span>Legenda de Degradação Mensal:</span>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 bg-green-50 border border-green-200 rounded"></div>
            <span>Excelente (0%)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 bg-yellow-50 border border-yellow-200 rounded"></div>
            <span>Baixa (1% - 15%)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 bg-orange-50 border border-orange-200 rounded"></div>
            <span>Moderada (16% - 35%)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 bg-red-50 border border-red-200 rounded"></div>
            <span>Crítica (&gt; 35%)</span>
          </div>
        </div>
      </SurfaceCard>

      {/* Coverage & Data Gaps Table */}
      <SurfaceCard className="p-6 border border-slate-100 rounded-3xl space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-800">Lacunas e Cobertura de Dados por Estação</h2>
          <p className="text-xs text-slate-500 font-medium">
            Auditoria de integridade dos registros oficiais integrados ao portal, essencial para evitar superinterpretação comparativa.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                <th className="p-4">Estação</th>
                <th className="p-4">Dias Registrados</th>
                <th className="p-4 text-center">Dias Esperados</th>
                <th className="p-4 text-center">Dias Insuficientes</th>
                <th className="p-4 text-center">Cobertura (%)</th>
                <th className="p-4 text-center">Janela Esperada</th>
                <th className="p-4 text-center">Lacunas (&gt; 24h)</th>
                <th className="p-4 text-center">Maior Interrupção</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {dataGaps.map((item) => {
                return (
                  <tr key={item.station_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{item.station_name}</td>
                    <td className="p-4 text-slate-500">{item.measured_days} dias</td>
                    <td className="p-4 text-center">{item.expected_days}</td>
                    <td className="p-4 text-center text-amber-600 font-bold">{item.insufficient_data_days}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded-md font-bold ${
                        item.coverage_percent >= 90 ? "bg-green-50 text-green-800" :
                        item.coverage_percent >= 30 ? "bg-yellow-50 text-yellow-800" : "bg-red-50 text-red-800"
                      }`}>
                        {item.coverage_percent}%
                      </span>
                    </td>
                    <td className="p-4 text-center text-[11px] leading-relaxed text-slate-500">
                      <div>
                        {item.expected_start_date && item.expected_end_date
                          ? `${new Date(`${item.expected_start_date}T00:00:00`).toLocaleDateString("pt-BR")} - ${new Date(`${item.expected_end_date}T00:00:00`).toLocaleDateString("pt-BR")}`
                          : "-"}
                      </div>
                      <div className="mt-1">
                        {item.window_is_inferred ? (
                          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-amber-800">
                            inferida
                          </span>
                        ) : (
                          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-emerald-800">
                            documentada
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`font-bold ${item.gap_count > 0 ? "text-amber-600" : "text-slate-400"}`}>
                        {item.gap_count}
                      </span>
                    </td>
                    <td className="p-4 text-center text-slate-500">
                      {item.max_gap_hours > 0 ? `${item.max_gap_hours} horas` : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SurfaceCard>

      {/* Camada Meteorológica e Dispersão — v0 */}
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-800">Camada Meteorológica & Dispersão</h2>
          <p className="text-xs text-slate-500 font-medium">
            Correlações físicas da velocidade e direção do vento, calmaria e chuva com a concentração de poluentes.
          </p>
          <div className="pt-2 flex flex-wrap gap-2">
            <RadarEvidenceBadge level="strong" label="Vento observado" detail="direção e velocidade do vento formam a parte mais forte desta camada" />
            <RadarEvidenceBadge level="interpretive" label="Condições estimadas" detail="chuva e demais condições devem ser lidas como apoio interpretativo" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WindRosePanel />
          <WeatherPollutionCorrelation />
        </div>

        <RainWashEffectPanel />
      </div>

      {/* Public Interpretation Box */}
      <PublicInterpretationBox />

    </div>
  );
}
