import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { RadarHero } from "./radar/RadarHero";
import { RadarGuidedJourneys } from "./radar/RadarGuidedJourneys";
import { RadarEvidenceDictionary } from "./radar/RadarEvidenceDictionary";
import { RadarEvidenceActionGuide } from "./radar/RadarEvidenceActionGuide";
import { RadarLaiModal } from "./radar/RadarLaiModal";
import { RadarMaturityScorecard } from "./radar/RadarMaturityScorecard";
import { RadarModeNav } from "./radar/RadarModeNav";
import { RadarOverviewMode } from "./radar/RadarOverviewMode";
import { RadarQuickSummary } from "./radar/RadarQuickSummary";
import { RadarStationsMode } from "./radar/RadarStationsMode";
import { PublicInterestProtocol } from "../../components/air/PublicInterestProtocol";
import {
  type BreakdownItem,
  type ControllerFrequencyItem,
  type DataGapItem,
  type LatestResult,
  LAI_TEMPLATE,
  type MonthlyProfileItem,
  type RadarChartPoint,
  type RadarComparisonTab,
  type RadarMode,
  type StationMetadataResponse,
  type StationMetadataItem,
  type RadarTimeseriesResponse,
  type RadarTimeseriesPoint,
  type SummaryStats,
  getIneaClassificationStyle
} from "./radar/RadarTypes";
import { fetchRadarJson } from "./radar/radarApi";

export { getIneaClassificationStyle };

const RadarMapMode = lazy(() =>
  import("./radar/RadarMapMode").then((module) => ({ default: module.RadarMapMode }))
);
const RadarTimeMode = lazy(() =>
  import("./radar/RadarTimeMode").then((module) => ({ default: module.RadarTimeMode }))
);
const RadarTerritoryMode = lazy(() =>
  import("./radar/RadarTerritoryMode").then((module) => ({ default: module.RadarTerritoryMode }))
);
const RadarMethodologyMode = lazy(() =>
  import("./radar/RadarMethodologyMode").then((module) => ({ default: module.RadarMethodologyMode }))
);

type RadarDataNotice =
  | { kind: "validation"; message: string }
  | { kind: "partial"; message: string; failedBlocks?: string[] }
  | null;

type LatestResponse = {
  stations?: LatestResult[];
};

function RadarModeLoadingFallback() {
  return (
    <div className="rounded-[2rem] border border-divider-subtle bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-40 rounded-full bg-slate-200/70" />
        <div className="h-10 w-72 rounded-2xl bg-slate-200/70" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-40 rounded-[1.5rem] bg-slate-200/60" />
          <div className="h-40 rounded-[1.5rem] bg-slate-200/60" />
        </div>
      </div>
    </div>
  );
}

export function IneaRadarPage() {
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [latestData, setLatestData] = useState<LatestResult[]>([]);
  const [timeseries, setTimeseries] = useState<RadarTimeseriesPoint[]>([]);
  const [rankings, setRankings] = useState<Record<string, BreakdownItem>>({});
  const [selectedStationChart, setSelectedStationChart] = useState<string>("");
  const [monthlyProfile, setMonthlyProfile] = useState<MonthlyProfileItem[]>([]);
  const [controllerFreq, setControllerFreq] = useState<ControllerFrequencyItem[]>([]);
  const [dataGaps, setDataGaps] = useState<DataGapItem[]>([]);
  const [stationMetadata, setStationMetadata] = useState<StationMetadataResponse["items"]>([]);
  const [timeseriesMeta, setTimeseriesMeta] = useState<{ total: number; limit: number; truncated: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<RadarDataNotice>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);
  const [isLaiModalOpen, setIsLaiModalOpen] = useState(false);
  const [copiedLai, setCopiedLai] = useState(false);
  const [currentMode, setCurrentMode] = useState<RadarMode>("OVERVIEW");
  const [comparisonTab, setComparisonTab] = useState<RadarComparisonTab>("TREND");

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        setNotice(null);
        setSummary(null);
        setLatestData([]);
        setRankings({});
        setMonthlyProfile([]);
        setControllerFreq([]);
        setDataGaps([]);
        setStationMetadata([]);

        const endpoints = [
          { key: "summary", label: "resumo geral", url: "/api/air/inea/summary" },
          { key: "latest", label: "últimas leituras", url: "/api/air/inea/latest" },
          { key: "rankings", label: "ranking por classificação", url: "/api/air/inea/classification-days" },
          { key: "monthly", label: "perfil mensal", url: "/api/air/inea/analytics/monthly-profile" },
          { key: "controller", label: "frequência do controlador", url: "/api/air/inea/analytics/controller-frequency" },
          { key: "gaps", label: "lacunas de dados", url: "/api/air/inea/analytics/data-gaps" },
          { key: "stationsMetadata", label: "metadados das estações", url: "/api/air/inea/stations-metadata" }
        ] as const;

        const responses = await Promise.allSettled(
          endpoints.map(async (endpoint) => {
            return { key: endpoint.key, payload: await fetchRadarJson<unknown>(endpoint.url) };
          })
        );

        if (cancelled) return;

        const resultMap = new Map<string, unknown>();
        const failedBlocks: string[] = [];

        responses.forEach((result, index) => {
          if (result.status === "fulfilled") {
            resultMap.set(result.value.key, result.value.payload);
          } else {
            failedBlocks.push(endpoints[index].label);
          }
        });

        const resSummary = resultMap.get("summary");
        const resLatest = resultMap.get("latest");
        const resRankings = resultMap.get("rankings");
        const resMonthly = resultMap.get("monthly");
        const resController = resultMap.get("controller");
        const resGaps = resultMap.get("gaps");
        const resStationsMetadata = resultMap.get("stationsMetadata");

        if (resSummary) setSummary(resSummary as SummaryStats);
        if (resLatest) {
          const list = ((resLatest as LatestResponse).stations || []);
          setLatestData(list);
          const activeStations = list.filter((r) => r.measured_at !== null);
          if (activeStations.length > 0) {
            setSelectedStationChart(activeStations[0].station.id);
          } else if (list.length > 0) {
            setSelectedStationChart(list[0].station.id);
          }
        }
        if (resRankings) setRankings(resRankings as Record<string, BreakdownItem>);
        if (resMonthly) setMonthlyProfile(resMonthly as MonthlyProfileItem[]);
        if (resController) setControllerFreq(resController as ControllerFrequencyItem[]);
        if (resGaps) setDataGaps(resGaps as DataGapItem[]);
        if (resStationsMetadata) setStationMetadata((resStationsMetadata as StationMetadataResponse).items || []);

        if (!resSummary || !resLatest || failedBlocks.length > 0) {
          const isLocalValidation =
            typeof window !== "undefined" &&
            (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

          if (isLocalValidation) {
            setNotice({
              kind: "validation",
              message: "Ambiente de validação: usando dados estáticos/fallback."
            });
          } else if (!resSummary && !resLatest) {
            setNotice({
              kind: "partial",
              message: "Parte das leituras públicas está temporariamente indisponível. A experiência segue com contexto editorial e dados de apoio.",
              failedBlocks
            });
          } else if (failedBlocks.length > 0) {
            setNotice({
              kind: "partial",
              message: `Alguns blocos analíticos não responderam nesta carga: ${failedBlocks.join(", ")}.`,
              failedBlocks
            });
          }
        }
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load official INEA data:", err);
        const isLocalValidation =
          typeof window !== "undefined" &&
          (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

        setNotice(
          isLocalValidation
            ? {
                kind: "validation",
                message: "Ambiente de validação: usando dados estáticos/fallback."
              }
            : {
                kind: "partial",
                message: "Parte das leituras públicas está temporariamente indisponível. A experiência segue com contexto editorial e dados de apoio."
              }
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchData();
    return () => {
      cancelled = true;
    };
  }, [retryTrigger]);

  useEffect(() => {
    if (!selectedStationChart) return;
    let cancelled = false;

    async function loadChartData() {
      try {
        setTimeseries([]);
        setTimeseriesMeta(null);

        const encodedStationId = encodeURIComponent(selectedStationChart);
        const data = await fetchRadarJson<RadarTimeseriesResponse>(
          `/api/air/inea/timeseries?stationId=${encodedStationId}&metricType=GENERAL_AQI`
        );

        if (!cancelled) {
          setTimeseries(data.items || []);
          setTimeseriesMeta({
            total: data.total,
            limit: data.limit,
            truncated: data.truncated
          });
        }
      } catch (err) {
        console.error("Failed to load chart timeseries:", err);
        if (!cancelled) {
          setTimeseriesMeta(null);
        }
      }
    }

    void loadChartData();
    return () => {
      cancelled = true;
    };
  }, [selectedStationChart]);

  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 500);
    }
  }, [loading]);

  const scrollToId = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navigateMode = (mode: RadarMode, tab?: RadarComparisonTab) => {
    setCurrentMode(mode);
    if (tab) setComparisonTab(tab);
    scrollToId("subnav-anchor");
  };

  const handleCopyLai = async () => {
    try {
      await navigator.clipboard.writeText(LAI_TEMPLATE);
      setCopiedLai(true);
      setTimeout(() => setCopiedLai(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const sortedRankings = useMemo(() => {
    if (latestData.length === 0) return [];
    return Object.entries(rankings)
      .map(([stationId, breakdown]) => {
        const station = latestData.find((l) => l.station.id === stationId)?.station;
        return {
          id: stationId,
          name: station?.name || "Estação Desconhecida",
          ...breakdown
        };
      })
      .sort((a, b) => b.moderateOrWorseDays - a.moderateOrWorseDays);
  }, [rankings, latestData]);

  const chartPoints = useMemo(
    () =>
      timeseries
        .filter((t) => typeof t.air_quality_index === "number")
        .map((t): RadarChartPoint => ({
          ts: t.measured_at,
          value: t.air_quality_index
        })),
    [timeseries]
  );

  const selectedStationMetadata = useMemo<StationMetadataItem | null>(
    () => stationMetadata.find((item) => item.station_id === selectedStationChart) || null,
    [selectedStationChart, stationMetadata]
  );

  const displaySummary: SummaryStats = summary || {
    totalStations: latestData.length,
    totalMeasurements: 0,
    timeRange: { minDate: "", maxDate: "" },
    moderateOrWorseDaysCount: 0,
    mostFrequentControllingPollutant: "Base pública temporariamente indisponível",
    source_system: "CKAN_XLSX",
    data_freshness_label: "Última base pública disponível",
    latest_measured_at: null,
    latest_ingested_at: null,
    is_realtime: false
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl animate-pulse space-y-8 px-4 py-8">
        <div className="h-48 rounded-2xl bg-slate-200/40" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-200/40" />
          ))}
        </div>
        <div className="h-96 rounded-2xl bg-slate-200/40" />
      </div>
    );
  }

  return (
    <div className="inea-radar-page relative min-h-screen w-full overflow-hidden bg-ambient-zen bg-dot-grid py-8">
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-[35rem] w-[35rem] rounded-full bg-emerald-400/5 blur-3xl" />
      <div className="pointer-events-none absolute right-1/4 top-2/3 h-[40rem] w-[40rem] rounded-full bg-blue-500/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-10 h-[30rem] w-[30rem] rounded-full bg-rose-500/5 blur-3xl" />

      <div id="top-anchor" className="relative z-10 container mx-auto max-w-7xl space-y-12 px-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/qualidade-ar" className="transition-colors hover:text-slate-800">
            Qualidade do Ar
          </Link>
          <span>/</span>
          <span className="text-slate-800">Radar INEA</span>
        </div>

        <RadarHero
          onNavigate={navigateMode}
          summary={displaySummary}
          activeStations={latestData.filter((item) => item.measured_at !== null).length}
        />

        <PublicInterestProtocol />

        {currentMode === "OVERVIEW" && (
          <>
            <RadarQuickSummary
              notice={notice}
              latestData={latestData}
              sortedRankings={sortedRankings}
              displaySummary={displaySummary}
              stationMetadata={stationMetadata}
              onRetry={() => setRetryTrigger((prev) => prev + 1)}
            />

            <RadarGuidedJourneys
              onNavigate={navigateMode}
              onScrollToRecommendations={() => {
                setCurrentMode("OVERVIEW");
                setTimeout(() => scrollToId("encaminhamentos"), 120);
              }}
            />

            <RadarMaturityScorecard summary={displaySummary} stationMetadata={stationMetadata} compact />

            <RadarEvidenceDictionary compact />

            <RadarEvidenceActionGuide compact onNavigate={navigateMode} onOpenLai={() => setIsLaiModalOpen(true)} />
          </>
        )}

        <div id="subnav-anchor" className="scroll-mt-28" />
        <RadarModeNav currentMode={currentMode} onSelectMode={navigateMode} />

        {currentMode === "OVERVIEW" && (
          <RadarOverviewMode
            latestData={latestData}
            sortedRankings={sortedRankings}
            displaySummary={displaySummary}
            stationMetadata={stationMetadata}
            onOpenLai={() => setIsLaiModalOpen(true)}
            onNavigate={navigateMode}
            onTop={() => scrollToId("top-anchor")}
            onScrollToRecommendations={() => scrollToId("encaminhamentos")}
          />
        )}

        {currentMode === "MAP" && (
          <Suspense fallback={<RadarModeLoadingFallback />}>
            <RadarMapMode onNavigate={navigateMode} onTop={() => scrollToId("top-anchor")} />
          </Suspense>
        )}

        {currentMode === "TIME" && (
          <Suspense fallback={<RadarModeLoadingFallback />}>
            <RadarTimeMode
              comparisonTab={comparisonTab}
              setComparisonTab={setComparisonTab}
              chartPoints={chartPoints}
              controllerFreq={controllerFreq}
              dataGaps={dataGaps}
              latestData={latestData}
              latestIngestedAt={displaySummary.latest_ingested_at}
              monthlyProfile={monthlyProfile}
              selectedStationMetadata={selectedStationMetadata}
              selectedStationChart={selectedStationChart}
              setSelectedStationChart={setSelectedStationChart}
              timeseriesMeta={timeseriesMeta}
              onNavigate={navigateMode}
              onTop={() => scrollToId("top-anchor")}
            />
          </Suspense>
        )}

        {currentMode === "TERRITORY" && (
          <Suspense fallback={<RadarModeLoadingFallback />}>
            <RadarTerritoryMode
              stationMetadata={stationMetadata}
              onNavigate={navigateMode}
              onTop={() => scrollToId("top-anchor")}
              onScrollToSocialMap={() => scrollToId("social-map-section")}
            />
          </Suspense>
        )}

        {currentMode === "STATIONS" && (
          <RadarStationsMode
            latestData={latestData}
            stationMetadata={stationMetadata}
            onNavigate={navigateMode}
            onTop={() => scrollToId("top-anchor")}
          />
        )}

        {currentMode === "METHODOLOGY" && (
          <Suspense fallback={<RadarModeLoadingFallback />}>
            <RadarMethodologyMode
              displaySummary={displaySummary}
              onNavigate={navigateMode}
              onOpenLai={() => setIsLaiModalOpen(true)}
              stationMetadata={stationMetadata}
              onTop={() => scrollToId("top-anchor")}
            />
          </Suspense>
        )}

        {isLaiModalOpen && (
          <RadarLaiModal copied={copiedLai} onClose={() => setIsLaiModalOpen(false)} onCopy={handleCopyLai} />
        )}
      </div>
    </div>
  );
}
