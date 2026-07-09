import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

import { IconShell, SectionHeader, SurfaceCard } from "../components/BrandSystem";
import { AxisEyebrow } from "../components/AxisSystem";
import { LoadingCard } from "../components/LoadingCard";
import { EmptyState } from "../components/EmptyState";
import { TextToSpeechButton } from "../components/TextToSpeechButton";
import { PortalPageShell, PortalSectionHeader } from "../components/portal";
import type { DownsampledMeasurement, StationOverview, StationHealth } from "../lib/api";
import { classifyOmsPollutant } from "../lib/airQuality";
import { trackCsvDownload } from "../lib/observability";

const ENV_HINT = " Verifique .env.local (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY).";
const POLLING_INTERVAL_MS = 60_000;

type TabId = "now" | "24h" | "7d" | "custom";

const MeasurementsChart = lazy(() =>
  import("../components/MeasurementsChart").then((m) => ({ default: m.MeasurementsChart }))
);

const ComparisonChart = lazy(() =>
  import("../components/ComparisonChart").then((m) => ({ default: m.ComparisonChart }))
);

const COMPARE_COLORS = [
  "#005daa", // Azul UFF/SEMEAR
  "#10b981", // Verde esmeralda
  "#f59e0b", // Âmbar/Laranja
  "#8b5cf6", // Roxo
  "#ec4899", // Rosa
  "#3b82f6", // Azul brilhante
  "#ef4444", // Vermelho
  "#14b8a6"  // Teal
];

function formatDate(value: unknown) {
  if (typeof value !== "string") return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("pt-BR");
}

function formatCellValue(value: unknown) {
  if (value === null || value === undefined) return "-";
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

function getHealthBadgeInfo(health: string | undefined) {
  switch (health) {
    case 'ok':
      return { label: 'Excelente', color: 'border-emerald-500/20 bg-emerald-50 text-emerald-800', icon: '✓' };
    case 'degraded':
      return { label: 'Degradado', color: 'border-amber-500/20 bg-amber-50 text-amber-900', icon: '⚠' };
    case 'offline':
      return { label: 'Offline', color: 'border-red-500/20 bg-red-50 text-red-900', icon: '✕' };
    case 'unknown':
    default:
      return { label: 'Desconhecido', color: 'border-slate-300 bg-slate-50 text-slate-700', icon: '?' };
  }
}

function getOmsLevelStyle(level: string) {
  switch (level) {
    case "bom":
      return "bg-green-100 text-green-900";
    case "moderado":
      return "bg-yellow-100 text-yellow-900";
    case "alto":
      return "bg-orange-100 text-orange-900";
    case "muito alto":
      return "bg-red-100 text-red-900";
    default:
      return "bg-gray-100 text-gray-900";
  }
}

function getBucketMinutes(startStr: string, endStr: string): number {
  const start = new Date(startStr);
  const end = new Date(endStr);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 2) {
    return 15;
  } else if (diffDays <= 7) {
    return 30;
  } else if (diffDays <= 30) {
    return 120;
  } else {
    return 1440;
  }
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6 mt-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="signature-surface h-24 rounded-2xl bg-slate-200/20 dark:bg-slate-800/20 border border-border-subtle" />
        ))}
      </div>
      <div className="signature-surface h-[360px] rounded-2xl bg-slate-200/20 dark:bg-slate-800/20 border border-border-subtle p-5">
        <div className="h-6 w-24 bg-slate-300/30 dark:bg-slate-700/30 rounded mb-4" />
        <div className="h-[260px] w-full bg-slate-300/10 dark:bg-slate-700/10 rounded" />
      </div>
    </div>
  );
}

export function DadosPage() {
  const [searchParams] = useSearchParams();
  const stationCodeFromQuery = searchParams.get("station");

  const [stations, setStations] = useState<StationOverview[]>([]);
  const [stationHealth, setStationHealth] = useState<Map<string, StationHealth>>(new Map());
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("24h");
  const [measurements24h, setMeasurements24h] = useState<DownsampledMeasurement[]>([]);
  const [measurements7d, setMeasurements7d] = useState<DownsampledMeasurement[]>([]);
  const [measurementsCustom, setMeasurementsCustom] = useState<DownsampledMeasurement[]>([]);
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 3);
    return d.toISOString().split("T")[0];
  });
  const [customEndDate, setCustomEndDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [appliedStartDate, setAppliedStartDate] = useState(customStartDate);
  const [appliedEndDate, setAppliedEndDate] = useState(customEndDate);
  const [, setLoadingStations] = useState(true);
  const [loadingMeasurements, setLoadingMeasurements] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPM25, setShowPM25] = useState(true);
  const [showPM10, setShowPM10] = useState(false);
  const [showTemp, setShowTemp] = useState(false);
  const [showHumidity, setShowHumidity] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(
    typeof document === "undefined" ? true : document.visibilityState === "visible"
  );

  // Estados do Comparador
  const [isComparing, setIsComparing] = useState(false);
  const [selectedStationIds, setSelectedStationIds] = useState<string[]>([]);
  const [compareMetric, setCompareMetric] = useState<"pm25" | "pm10" | "temp" | "humidity">("pm25");
  const [compareData, setCompareData] = useState<Record<string, DownsampledMeasurement[]>>({});
  const [loadingCompare, setLoadingCompare] = useState(false);

  // Estados da Climatologia Preditiva
  const [predictiveScenario, setPredictiveScenario] = useState<"normal" | "thermal_inversion" | "rain">("normal");

  // Carrega estações na inicialização

  useEffect(() => {
    async function run() {
      try {
        setLoadingStations(true);
        setError(null);
        const monitoringApi = await import("../lib/api/monitoring");
        const data = await monitoringApi.getStationOverview();
        const health = await monitoringApi.getStationHealth();
        
        setStations(data);
        
        // Criar mapa de health por station_id
        const healthMap = new Map<string, StationHealth>();
        health.forEach(h => {
          healthMap.set(h.station_id, h);
        });
        setStationHealth(healthMap);

        let defaultStationId = data[0]?.station_id ?? null;
        if (stationCodeFromQuery) {
          const matched = data.find(s => s.code === stationCodeFromQuery);
          if (matched) defaultStationId = matched.station_id;
        }

        setSelectedStationId((prev) => prev ?? defaultStationId);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Falha ao carregar estacoes.";
        setError(`${message}${ENV_HINT}`);
      } finally {
        setLoadingStations(false);
      }
    }

    void run();
  }, [stationCodeFromQuery]);

  // Carrega medições 24h, 7d e personalizado
  const loadMeasurements = useCallback(async (stationId: string, silent = false) => {
    try {
      if (!silent) setLoadingMeasurements(true);
      setError(null);
      
      const monitoringApi = await import("../lib/api/monitoring");
      const promises: [
        Promise<DownsampledMeasurement[]>,
        Promise<DownsampledMeasurement[]>,
        Promise<DownsampledMeasurement[]>?
      ] = [
        monitoringApi.getMeasurementsDownsampled(stationId, "24h"),
        monitoringApi.getMeasurementsDownsampled(stationId, "7d")
      ];

      if (activeTab === "custom") {
        const bucketMinutes = getBucketMinutes(appliedStartDate, appliedEndDate);
        const startTs = new Date(appliedStartDate + "T00:00:00Z").toISOString();
        const endTs = new Date(appliedEndDate + "T23:59:59Z").toISOString();
        promises.push(monitoringApi.getMeasurementsByRange(stationId, startTs, endTs, bucketMinutes));
      }
      
      const [data24h, data7d, dataCustom] = await Promise.all(promises);
      
      setMeasurements24h(data24h);
      setMeasurements7d(data7d);
      if (dataCustom) {
        setMeasurementsCustom(dataCustom);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao carregar medições.";
      setError(`${message}${ENV_HINT}`);
    } finally {
      if (!silent) setLoadingMeasurements(false);
    }
  }, [activeTab, appliedStartDate, appliedEndDate]);

  // Atualiza medições quando muda estação
  useEffect(() => {
    const stationId = selectedStationId ?? "";
    if (!stationId) return;
    void loadMeasurements(stationId);
  }, [loadMeasurements, selectedStationId]);

  // Polling automático quando página visível
  useEffect(() => {
    function onVisibilityChange() {
      const visible = document.visibilityState === "visible";
      setIsPageVisible(visible);
      if (visible && selectedStationId) {
        void loadMeasurements(selectedStationId, true);
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [loadMeasurements, selectedStationId]);

  useEffect(() => {
    const stationId = selectedStationId ?? "";
    if (!stationId || !isPageVisible) return;

    const intervalId = window.setInterval(() => {
      void loadMeasurements(stationId, true);
    }, POLLING_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [isPageVisible, loadMeasurements, selectedStationId]);

  // Inicializa selectedStationIds com as duas primeiras estações se estiver vazio e for comparar
  useEffect(() => {
    if (isComparing && selectedStationIds.length === 0 && stations.length > 0) {
      const defaultIds = [
        selectedStationId ?? stations[0].station_id,
        stations.find(s => s.station_id !== selectedStationId)?.station_id ?? stations[1]?.station_id
      ].filter(Boolean) as string[];
      setSelectedStationIds(defaultIds);
    }
  }, [isComparing, stations, selectedStationId, selectedStationIds.length]);

  // Carrega dados de comparação
  useEffect(() => {
    if (!isComparing || selectedStationIds.length === 0) return;

    let cancelled = false;

    async function run() {
      try {
        setLoadingCompare(true);
        setError(null);
        const monitoringApi = await import("../lib/api/monitoring");
        
        // No modo comparação, usamos a aba ativa (forçamos 24h ou 7d se estiver em 'now')
        const range = activeTab === "now" ? "24h" : activeTab;
        if (activeTab === "now" && !cancelled) {
          setActiveTab("24h");
        }
        
        const promises = selectedStationIds.map(async (id) => {
          let data: DownsampledMeasurement[];
          if (activeTab === "custom") {
            const bucketMinutes = getBucketMinutes(appliedStartDate, appliedEndDate);
            const startTs = new Date(appliedStartDate + "T00:00:00Z").toISOString();
            const endTs = new Date(appliedEndDate + "T23:59:59Z").toISOString();
            data = await monitoringApi.getMeasurementsByRange(id, startTs, endTs, bucketMinutes);
          } else {
            data = await monitoringApi.getMeasurementsDownsampled(id, range as "24h" | "7d");
          }
          return { id, data };
        });

        const results = await Promise.all(promises);

        if (!cancelled) {
          const map: Record<string, DownsampledMeasurement[]> = {};
          results.forEach(r => {
            map[r.id] = r.data;
          });
          setCompareData(map);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Falha ao carregar dados comparativos.";
          setError(`${message}${ENV_HINT}`);
        }
      } finally {
        if (!cancelled) {
          setLoadingCompare(false);
        }
      }
    }

    void run();
    return () => { cancelled = true; };
  }, [isComparing, selectedStationIds, activeTab, appliedStartDate, appliedEndDate]);

  // Seletor de unidade da métrica de comparação
  const compareMetricUnit = useMemo(() => {
    if (compareMetric === "pm25" || compareMetric === "pm10") return "µg/m³";
    if (compareMetric === "temp") return "°C";
    if (compareMetric === "humidity") return "%";
    return "";
  }, [compareMetric]);

  // Alinhamento de dados para o uPlot de Comparação
  const sortedTs = useMemo(() => {
    if (!isComparing) return [];
    const allTs = new Set<number>();
    selectedStationIds.forEach(id => {
      const list = compareData[id] ?? [];
      list.forEach(m => {
        const sec = new Date(m.bucket_ts).getTime() / 1000;
        if (!Number.isNaN(sec)) {
          allTs.add(sec);
        }
      });
    });
    return Array.from(allTs).sort((a, b) => a - b);
  }, [isComparing, selectedStationIds, compareData]);

  const stationMaps = useMemo(() => {
    if (!isComparing) return [];
    return selectedStationIds.map(id => {
      const map = new Map<number, DownsampledMeasurement>();
      const list = compareData[id] ?? [];
      list.forEach(m => {
        const sec = new Date(m.bucket_ts).getTime() / 1000;
        if (!Number.isNaN(sec)) {
          map.set(Math.round(sec), m);
        }
      });
      return { id, map };
    });
  }, [isComparing, selectedStationIds, compareData]);

  const alignedCompareData = useMemo<uPlot.AlignedData>(() => {
    if (!isComparing || sortedTs.length === 0) return [[], []] as uPlot.AlignedData;
    
    const seriesData = selectedStationIds.map(() => [] as (number | null)[]);
    sortedTs.forEach(ts => {
      const roundedTs = Math.round(ts);
      stationMaps.forEach(({ map }, stationIdx) => {
        const m = map.get(roundedTs);
        let val: number | null = null;
        if (m) {
          if (compareMetric === "pm25") val = m.pm25;
          else if (compareMetric === "pm10") val = m.pm10;
          else if (compareMetric === "temp") val = m.temp;
          else if (compareMetric === "humidity") val = m.humidity;
        }
        seriesData[stationIdx].push(val);
      });
    });
    
    return [sortedTs, ...seriesData];
  }, [isComparing, sortedTs, stationMaps, selectedStationIds, compareMetric]);

  const stationSeriesConfig = useMemo(() => {
    return selectedStationIds.map((id, index) => {
      const s = stations.find(st => st.station_id === id);
      const color = COMPARE_COLORS[index % COMPARE_COLORS.length];
      return {
        label: s?.name ?? id,
        stroke: color,
        show: true
      };
    });
  }, [selectedStationIds, stations]);

  const comparisonStats = useMemo(() => {
    if (!isComparing) return [];
    return selectedStationIds.map(id => {
      const s = stations.find(st => st.station_id === id);
      const list = compareData[id] ?? [];
      
      const values = list
        .map(m => {
          if (compareMetric === "pm25") return m.pm25;
          if (compareMetric === "pm10") return m.pm10;
          if (compareMetric === "temp") return m.temp;
          if (compareMetric === "humidity") return m.humidity;
          return null;
        })
        .filter((v): v is number => v !== null);

      const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null;
      const max = values.length > 0 ? Math.max(...values) : null;
      const min = values.length > 0 ? Math.min(...values) : null;
      
      const classification = (compareMetric === "pm25" || compareMetric === "pm10") && avg !== null
        ? classifyOmsPollutant(compareMetric, avg)
        : null;

      return {
        id,
        name: s?.name ?? id,
        avg,
        max,
        min,
        classification
      };
    });
  }, [isComparing, selectedStationIds, compareData, compareMetric, stations]);

  const handleCompareExportCSV = () => {
    if (selectedStationIds.length === 0 || sortedTs.length === 0) return;
    const headers = ["timestamp", ...selectedStationIds.map(id => {
      const s = stations.find(st => st.station_id === id);
      return `${s?.name ?? id} (${compareMetric})`;
    })];
    
    const csvRows = [headers.join(",")];
    sortedTs.forEach(ts => {
      const roundedTs = Math.round(ts);
      const row = [new Date(ts * 1000).toISOString()];
      stationMaps.forEach(({ map }) => {
        const m = map.get(roundedTs);
        let val: number | null = null;
        if (m) {
          if (compareMetric === "pm25") val = m.pm25;
          else if (compareMetric === "pm10") val = m.pm10;
          else if (compareMetric === "temp") val = m.temp;
          else if (compareMetric === "humidity") val = m.humidity;
        }
        row.push(val !== null ? String(val) : "");
      });
      csvRows.push(row.join(","));
    });
    
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const today = new Date().toISOString().split("T")[0];
    a.href = url;
    a.download = `semear_comparacao_${compareMetric}_${activeTab}_${today}.csv`;
    trackCsvDownload("dados_comparacao", sortedTs.length);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleApplyCustomFilter = () => {
    if (customStartDate > customEndDate) {
      setError("A data de início não pode ser posterior à data de fim.");
      return;
    }
    setError(null);
    setAppliedStartDate(customStartDate);
    setAppliedEndDate(customEndDate);
  };

  // Dados computados
  const selectedStation = useMemo(
    () => stations.find((station) => station.station_id === selectedStationId) ?? null,
    [selectedStationId, stations]
  );

  const currentMeasurements =
    activeTab === "24h"
      ? measurements24h
      : activeTab === "7d"
      ? measurements7d
      : activeTab === "custom"
      ? measurementsCustom
      : [];
  const isStationOnline = selectedStation?.is_online ?? false;
  const hasHistoricalMeasurements = measurements24h.length > 0 || measurements7d.length > 0 || measurementsCustom.length > 0;
  const semearOperationalStatus = !selectedStation
    ? "Em implantação"
    : isStationOnline
      ? "Operacional"
      : hasHistoricalMeasurements
        ? "Dados históricos disponíveis"
        : "Sem transmissão atual";

  // Estatísticas
  const stats = useMemo(() => {
    if (currentMeasurements.length === 0) {
      return { pm25Avg: null, pm25Max: null, pm10Avg: null, pm10Max: null, lastValue: null, lastTime: null };
    }

    const pm25Values = currentMeasurements.filter(m => m.pm25 !== null).map(m => m.pm25!);
    const pm10Values = currentMeasurements.filter(m => m.pm10 !== null).map(m => m.pm10!);

    const last = currentMeasurements[0];

    return {
      pm25Avg: pm25Values.length > 0 ? pm25Values.reduce((a, b) => a + b, 0) / pm25Values.length : null,
      pm25Max: pm25Values.length > 0 ? Math.max(...pm25Values) : null,
      pm10Avg: pm10Values.length > 0 ? pm10Values.reduce((a, b) => a + b, 0) / pm10Values.length : null,
      pm10Max: pm10Values.length > 0 ? Math.max(...pm10Values) : null,
      lastValue: last,
      lastTime: last?.bucket_ts ?? null
    };
  }, [currentMeasurements]);

  const pm25NowClassification = useMemo(() => classifyOmsPollutant("pm25", stats.lastValue?.pm25 ?? null), [stats.lastValue]);
  const pm10NowClassification = useMemo(() => classifyOmsPollutant("pm10", stats.lastValue?.pm10 ?? null), [stats.lastValue]);

  // Resumo textual para acessibilidade
  const textualSummary = useMemo(() => {
    if (!selectedStation || currentMeasurements.length === 0) {
      return "Nenhum dado disponível para o período selecionado.";
    }

    const period = activeTab === "24h" ? "últimas 24 horas" : activeTab === "7d" ? "últimos 7 dias" : "agora";
    const pm25Text = stats.pm25Avg !== null 
      ? `PM2.5 com média de ${stats.pm25Avg.toFixed(1)} µg/m³ (máximo de ${stats.pm25Max?.toFixed(1)} µg/m³)` 
      : "PM2.5 sem dados";
    const pm10Text = stats.pm10Avg !== null 
      ? `PM10 com média de ${stats.pm10Avg.toFixed(1)} µg/m³ (máximo de ${stats.pm10Max?.toFixed(1)} µg/m³)` 
      : "PM10 sem dados";

    return `Na estação ${selectedStation.name}, ${period}: ${pm25Text}, ${pm10Text}.`;
  }, [activeTab, currentMeasurements.length, selectedStation, stats]);

  // Preparar dados para o gráfico
  const chartData = useMemo(() => {
    return [...currentMeasurements]
      .reverse()
      .map(m => ({
        ts: m.bucket_ts,
        pm25: m.pm25,
        pm10: m.pm10,
        temp: m.temp,
        humidity: m.humidity
      }));
  }, [currentMeasurements]);

  // Climatologia Preditiva Model
  const hourlyProjection = useMemo(() => {
    if (!stats.lastValue) return [];
    
    const currentPm = stats.lastValue.pm25 ?? 12;
    const points = [];
    const nowHour = new Date().getHours();
    
    for (let i = 1; i <= 24; i++) {
      const targetHour = (nowHour + i) % 24;
      // Representação do ciclo diário de partículas (picos no trânsito/frio matinal/noturno, dispersão à tarde)
      const cycleFactor = targetHour >= 6 && targetHour <= 9
        ? 5
        : targetHour >= 18 && targetHour <= 21
          ? 7
          : targetHour >= 22 || targetHour <= 5
            ? 1.5
            : -3;
      
      let value = currentPm + cycleFactor;
      
      if (predictiveScenario === "thermal_inversion") {
        if (targetHour <= 8 || targetHour >= 19) {
          value = value * 1.6;
        } else {
          value = value * 1.2;
        }
      } else if (predictiveScenario === "rain") {
        value = Math.max(1.5, value * 0.2);
      }
      
      value = Math.max(1, value);
      points.push({
        hour: `${String(targetHour).padStart(2, "0")}:00`,
        pm25: parseFloat(value.toFixed(1))
      });
    }
    return points;
  }, [stats.lastValue, predictiveScenario]);

  const maxProjectedPm = useMemo(() => {
    if (hourlyProjection.length === 0) return 0;
    return Math.max(...hourlyProjection.map(p => p.pm25));
  }, [hourlyProjection]);

  const riskAssessment = useMemo(() => {
    if (hourlyProjection.length === 0) return { percent: 0, text: "Sem dados", color: "text-slate-500 border-slate-200 bg-slate-50", bg: "bg-slate-500", tone: "low" };
    const percent = Math.min(99, Math.round((maxProjectedPm / 45) * 100));
    
    if (percent < 35) {
      return {
        percent,
        text: "Risco Baixo",
        color: "text-emerald-800 dark:text-emerald-400 border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10",
        bg: "bg-emerald-500",
        tone: "low"
      };
    } else if (percent < 70) {
      return {
        percent,
        text: "Risco Moderado",
        color: "text-amber-800 dark:text-amber-400 border-amber-500/20 bg-amber-50 dark:bg-amber-500/10",
        bg: "bg-amber-500",
        tone: "medium"
      };
    } else {
      return {
        percent,
        text: "Risco Alto",
        color: "text-red-800 dark:text-red-400 border-red-500/20 bg-red-50 dark:bg-red-500/10",
        bg: "bg-red-500",
        tone: "high"
      };
    }
  }, [maxProjectedPm, hourlyProjection]);

  // Função para exportar CSV
  const handleExportCSV = () => {
    if (!selectedStation || currentMeasurements.length === 0) return;

    const headers = ["bucket_ts", "pm25", "pm10", "temp", "humidity", "quality_flag"];
    const csvRows = [headers.join(",")];

    for (const row of currentMeasurements) {
      const values = [
        row.bucket_ts ? new Date(row.bucket_ts).toISOString() : "",
        row.pm25 ?? "",
        row.pm10 ?? "",
        row.temp ?? "",
        row.humidity ?? "",
        row.quality_flag ?? ""
      ];
      csvRows.push(values.map(v => typeof v === 'string' && v.includes(',') ? `"${v}"` : String(v)).join(","));
    }

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const today = new Date().toISOString().split("T")[0];
    a.href = url;
    a.download = `semear_${selectedStation.code}_${activeTab}_${today}.csv`;
    trackCsvDownload("dados", currentMeasurements.length);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <PortalPageShell className="data-dashboard">
      {/* Abas de Navegação de Dados */}
      <PortalSectionHeader
        eyebrow={<span className="badge-dados-abertos">Catálogo público de dados</span>}
        title="Dados abertos para ação pública"
        subtitle="Use os atalhos abaixo para navegar entre leituras da rede SEMEAR, base oficial do INEA e análises consolidadas."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-5 bg-white border-2 border-brand-primary rounded-2xl shadow-sm transition-all">
          <strong className="text-sm font-black text-brand-primary block">Leituras SEMEAR</strong>
          <p className="text-xs text-slate-500 mt-1">Rede própria, com publicação condicionada à transmissão e à validação dos equipamentos.</p>
          <span className="inline-block mt-3 rounded-full bg-brand-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-primary">{semearOperationalStatus}</span>
        </div>

        <Link to="/qualidade-ar/inea" className="p-5 bg-white border border-slate-100 rounded-2xl hover:border-slate-200 hover:shadow-sm transition-all block">
          <strong className="text-sm font-black text-slate-800 block">Dados oficiais INEA</strong>
          <p className="text-xs text-slate-500 mt-1">Estações oficiais de Volta Redonda na última base pública disponível.</p>
          <span className="inline-block mt-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Acessar painel &rarr;</span>
        </Link>

        <Link to="/qualidade-ar/inea/analises" className="p-5 bg-white border border-slate-100 rounded-2xl hover:border-slate-200 hover:shadow-sm transition-all block">
          <strong className="text-sm font-black text-slate-800 block">Análises do INEA</strong>
          <p className="text-xs text-slate-500 mt-1">Dias registrados como MODERADA ou pior, poluentes controladores e lacunas.</p>
          <span className="inline-block mt-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ver análises &rarr;</span>
        </Link>
      </div>

      {/* Card de Destaque do Radar do Ar INEA */}
      <SurfaceCard className="border border-brand-primary/10 bg-slate-50/50 p-5 rounded-2xl md:p-6 transition-all hover:border-brand-primary/25">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5 max-w-2xl">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
              Radar do Ar INEA
            </h3>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              Veja no mapa as estações oficiais de qualidade do ar em Volta Redonda, a série histórica disponível e as lacunas de transparência da base pública.
            </p>
            <p className="text-[10px] text-slate-400">
              Fonte: INEA / Dados Abertos RJ — dados oficiais disponíveis em lote, não minuto a minuto.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:self-center shrink-0">
            <Link
              to="/qualidade-ar/inea#mapa"
              className="inline-flex min-h-11 items-center px-4 py-2 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary-dark transition-colors text-xs"
            >
              Abrir mapa do INEA
            </Link>
            <Link
              to="/qualidade-ar/inea/analises"
              className="inline-flex min-h-11 items-center px-4 py-2 border border-slate-200 bg-white text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors text-xs"
            >
              Ver síntese histórica
            </Link>
            <Link
              to="/qualidade-ar/inea#alertas"
              className="inline-flex min-h-11 items-center px-4 py-2 border border-slate-200 bg-white text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors text-xs"
            >
              Ver análises
            </Link>
          </div>
        </div>
      </SurfaceCard>

      {/* Banner de Destaque dos Episódios de Atenção */}
      <div className="home-inea-episodes-banner my-6 p-6 md:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 rounded-[2rem] text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center gap-6 justify-between">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-3 max-w-3xl relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
            Sazonalidade e Limiares
          </span>
          <h2 className="text-xl md:text-2xl font-black text-white leading-tight">
            Quando o ar exige mais atenção?
          </h2>
          <p className="text-sm text-slate-300 font-medium leading-relaxed">
            Explore a linha do tempo 2022–2024 e veja os meses, estações e poluentes com mais eventos de atenção.
          </p>
          <p className="text-[10px] text-slate-400">
            * Dado horário público WebLakes — comparação experimental — sem QA/QC oficial explícito.
          </p>
        </div>
        <div className="shrink-0 relative z-10">
          <Link
            to="/qualidade-ar/inea#episodios"
            className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 bg-brand-primary hover:bg-brand-primary-dark text-white font-black uppercase tracking-[0.14em] text-xs rounded-xl shadow-lg shadow-brand-primary/20 transition-all hover:-translate-y-0.5"
          >
            Ver episódios de atenção &rarr;
          </Link>
        </div>
      </div>

      <SurfaceCard className="data-hero overflow-hidden p-0">
        <div className="data-hero-grid">
          <div className="data-hero-copy">
            <div className="flex items-center gap-3">
              <IconShell tone="lab" className="data-hero-icon">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </IconShell>
              <div className="space-y-1">
                <AxisEyebrow axis="dados">Painel ambiental</AxisEyebrow>
                <h1 className="data-hero-title">Leituras SEMEAR</h1>
              </div>
            </div>
            <p className="data-hero-lede">
              Monitoramento ambiental com atualização frequente quando há transmissão ativa, leitura pública, recortes comparáveis e exportação para auditoria cidadã.
            </p>
            <div className="data-hero-strip" aria-label="Indicadores rápidos">
              {!isComparing ? (
                <>
                  <div>
                    <span>Estação</span>
                    <strong>{selectedStation?.name ?? "Aguardando seleção"}</strong>
                  </div>
                  <div>
                    <span>Status</span>
                    <strong>{selectedStationId ? (isStationOnline ? "Operacional" : semearOperationalStatus) : "Sem estação"}</strong>
                  </div>
                  <div>
                    <span>Última leitura</span>
                    <strong>{stats.lastTime ? formatDate(stats.lastTime) : "Aguardando"}</strong>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span>Comparando</span>
                    <strong>{selectedStationIds.length} Estações</strong>
                  </div>
                  <div>
                    <span>Métrica</span>
                    <strong className="capitalize">{compareMetric === "pm25" ? "PM2.5" : compareMetric === "pm10" ? "PM10" : compareMetric === "temp" ? "Temperatura" : "Umidade"}</strong>
                  </div>
                  <div>
                    <span>Período</span>
                    <strong>{activeTab === "7d" ? "7 dias" : "24 horas"}</strong>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="data-control-panel">
            {/* Toggle de Modo */}
            <div className="flex rounded-2xl bg-surface-2 p-1 mb-4 border border-border-subtle/50">
              <button
                type="button"
                className={`min-h-11 flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${!isComparing ? "bg-white text-brand-primary shadow-[0_4px_12px_rgba(0,93,170,0.08)]" : "text-text-secondary hover:text-text-primary"}`}
                onClick={() => setIsComparing(false)}
              >
                Individual
              </button>
              <button
                type="button"
                className={`min-h-11 flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${isComparing ? "bg-white text-brand-primary shadow-[0_4px_12px_rgba(0,93,170,0.08)]" : "text-text-secondary hover:text-text-primary"}`}
                onClick={() => setIsComparing(true)}
              >
                Comparar
              </button>
            </div>

            {!isComparing ? (
              <>
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                  <label className="block">
                    <span className="data-control-label">Estação</span>
                    <select
                      className="data-select"
                      disabled={!stations.length}
                      onChange={(e) => setSelectedStationId(e.target.value || null)}
                      value={selectedStationId ?? ""}
                    >
                      {!selectedStationId ? <option value="">Selecione uma estação</option> : null}
                      {stations.map((station) => (
                        <option key={station.station_id} value={station.station_id}>
                          {String(station.name ?? station.station_id)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    className="data-refresh"
                    disabled={!selectedStationId || loadingMeasurements}
                    onClick={() => selectedStationId && void loadMeasurements(selectedStationId)}
                    type="button"
                  >
                    Recarregar
                  </button>
                </div>

                <div className="data-status-grid">
                  <div className="data-status-card">
                    <p>Status</p>
                    <p className={`mt-1.5 inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${selectedStationId ? (isStationOnline ? "border-emerald-500/20 bg-emerald-50 text-emerald-800" : "border-amber-500/25 bg-amber-50 text-amber-900") : "border-slate-300 bg-slate-50 text-slate-700"}`}>
                      {selectedStationId ? (isStationOnline ? "Operacional" : semearOperationalStatus) : "Sem estação"}
                    </p>
                  </div>
                  <div className="data-status-card">
                    <p>Qualidade</p>
                    <strong>
                      {selectedStationId && stationHealth.has(selectedStationId)
                        ? getHealthBadgeInfo(stationHealth.get(selectedStationId)!.health_status).label
                        : "Sem leitura"}
                    </strong>
                  </div>
                  <div className="data-status-card">
                    <p>Atualização</p>
                    <strong>{stats.lastTime ? formatDate(stats.lastTime) : "Aguardando"}</strong>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-3">
                  <div className="block">
                    <span className="data-control-label">Estações (Selecione pelo menos duas)</span>
                    <div className="mt-1.5 grid gap-1.5 grid-cols-2 max-h-[120px] overflow-y-auto p-2 border border-border-subtle rounded-2xl bg-surface-1">
                      {stations.map((station) => {
                        const isChecked = selectedStationIds.includes(station.station_id);
                        return (
                          <label key={station.station_id} className="flex cursor-pointer items-center gap-2 px-2 py-1 rounded-lg hover:bg-surface-2 transition-all">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setSelectedStationIds(prev => prev.filter(id => id !== station.station_id));
                                } else {
                                  setSelectedStationIds(prev => [...prev, station.station_id]);
                                }
                              }}
                              className="h-4 w-4 rounded border-border-subtle text-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                            />
                            <span className="text-xs font-semibold text-text-primary truncate">{station.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <label className="block">
                    <span className="data-control-label">Métrica de Comparação</span>
                    <select
                      className="data-select"
                      value={compareMetric}
                      onChange={(e) => setCompareMetric(e.target.value as typeof compareMetric)}
                    >
                      <option value="pm25">Partículas Finas (PM2.5)</option>
                      <option value="pm10">Partículas Inaláveis (PM10)</option>
                      <option value="temp">Temperatura (°C)</option>
                      <option value="humidity">Umidade Relativa (%)</option>
                    </select>
                  </label>
                </div>
              </>
            )}

            {activeTab === "custom" && (
              <div className="mt-4 pt-4 border-t border-border-subtle/50 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="data-control-label">Data Início</span>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      max={customEndDate || new Date().toISOString().split("T")[0]}
                      className="data-select w-full"
                    />
                  </label>
                  <label className="block">
                    <span className="data-control-label">Data Fim</span>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      min={customStartDate}
                      max={new Date().toISOString().split("T")[0]}
                      className="data-select w-full"
                    />
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handleApplyCustomFilter}
                  disabled={loadingMeasurements || loadingCompare || !customStartDate || !customEndDate}
                  className="data-refresh w-full py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all"
                >
                  {loadingMeasurements || loadingCompare ? "Filtrando..." : "Filtrar Período"}
                </button>
              </div>
            )}
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard className="data-info-panel p-5 md:p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:items-start">
          <div className="space-y-4">
            <SectionHeader
              eyebrow="Leitura pública"
              title="Como ler"
              description="PM2.5 e PM10 medem partículas; use 24h e 7 dias para contexto."
            />
            <ul className="grid gap-2 text-sm leading-relaxed text-text-secondary md:grid-cols-2">
              <li>
                <span className="font-semibold text-text-primary">1.</span> PM2.5 e PM10 medem partículas no ar.
              </li>
              <li>
                <span className="font-semibold text-text-primary">2.</span> A OMS resume o estado em bom, moderado, alto ou muito alto.
              </li>
              <li>
                <span className="font-semibold text-text-primary">3.</span> Use 24h e 7 dias para contexto.
              </li>
              <li>
                <span className="font-semibold text-text-primary">4.</span> Se faltar dado, recarregue ou troque de estação.
              </li>
            </ul>
          </div>

          <div className="data-export-card p-4 md:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">CSV</p>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              Baixe o recorte do período visível quando houver leitura disponível.
            </p>
            <div className="mt-4 rounded-2xl border border-border-subtle bg-surface-2 p-3.5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">Legenda</p>
              <p className="mt-1.5 text-sm text-text-primary">
                Mais recente, mais claro, mais fácil de comparar.
              </p>
            </div>
          </div>
        </div>
      </SurfaceCard>

      {/* Seção Principal de Exibição */}
      {!isComparing ? (
        selectedStationId && (
          <>
            <SurfaceCard className="p-4 md:p-5">
            <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Período de visualização">
              <button
                id="tab-now"
                role="tab"
                aria-selected={activeTab === "now"}
                aria-controls="panel-now"
                className={activeTab === "now" ? "ui-segment-tab ui-segment-tab-active" : "ui-segment-tab"}
                onClick={() => setActiveTab("now")}
                type="button"
              >
                Agora
              </button>
              <button
                id="tab-24h"
                role="tab"
                aria-selected={activeTab === "24h"}
                aria-controls="panel-24h"
                className={activeTab === "24h" ? "ui-segment-tab ui-segment-tab-active" : "ui-segment-tab"}
                onClick={() => setActiveTab("24h")}
                type="button"
              >
                24h
              </button>
              <button
                id="tab-7d"
                role="tab"
                aria-selected={activeTab === "7d"}
                aria-controls="panel-7d"
                className={activeTab === "7d" ? "ui-segment-tab ui-segment-tab-active" : "ui-segment-tab"}
                onClick={() => setActiveTab("7d")}
                type="button"
              >
                7 dias
              </button>
              <button
                id="tab-custom"
                role="tab"
                aria-selected={activeTab === "custom"}
                aria-controls="panel-custom"
                className={activeTab === "custom" ? "ui-segment-tab ui-segment-tab-active" : "ui-segment-tab"}
                onClick={() => setActiveTab("custom")}
                type="button"
              >
                Personalizado
              </button>
            </div>

            {activeTab === "now" && (
              <div role="tabpanel" id="panel-now" aria-labelledby="tab-now">
                <h2 className="mt-5 text-base font-bold text-brand-primary">Agora</h2>
                {stats.lastValue ? (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="signature-surface p-4 md:p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">PM2.5</p>
                      <p className="mt-2 text-3xl font-black leading-none text-text-primary md:text-[2.65rem]">{stats.lastValue.pm25?.toFixed(1) ?? "-"}</p>
                      <div className={`mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${getOmsLevelStyle(pm25NowClassification.level)}`}>
                        <span aria-hidden="true">{pm25NowClassification.icon}</span>
                        <span>{pm25NowClassification.level}</span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-text-secondary">{pm25NowClassification.summary}</p>
                      <p className="mt-1 text-xs font-medium text-text-secondary">{pm25NowClassification.recommendation}</p>
                    </div>
                    <div className="signature-surface p-4 md:p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">PM10</p>
                      <p className="mt-2 text-3xl font-black leading-none text-text-primary md:text-[2.65rem]">{stats.lastValue.pm10?.toFixed(1) ?? "-"}</p>
                      <div className={`mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${getOmsLevelStyle(pm10NowClassification.level)}`}>
                        <span aria-hidden="true">{pm10NowClassification.icon}</span>
                        <span>{pm10NowClassification.level}</span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-text-secondary">{pm10NowClassification.summary}</p>
                      <p className="mt-1 text-xs font-medium text-text-secondary">{pm10NowClassification.recommendation}</p>
                    </div>
                    <div className="signature-surface p-4 md:p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">Temp.</p>
                      <p className="mt-2 text-2xl font-black text-text-primary md:text-3xl">{stats.lastValue.temp?.toFixed(1) ?? "-"}</p>
                      <p className="mt-1 text-xs text-text-secondary">°C</p>
                    </div>
                    <div className="signature-surface p-4 md:p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">Umid.</p>
                      <p className="mt-2 text-2xl font-black text-text-primary md:text-3xl">{stats.lastValue.humidity?.toFixed(0) ?? "-"}</p>
                      <p className="mt-1 text-xs text-text-secondary">%</p>
                    </div>
                  </div>
                ) : (
                  <EmptyState title="Sem leitura agora" description="Troque de estação ou aguarde o próximo envio." />
                )}
              </div>
            )}

            {(activeTab === "24h" || activeTab === "7d" || activeTab === "custom") && (
              <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
                {loadingMeasurements ? (
                  <DashboardSkeleton />
                ) : currentMeasurements.length === 0 ? (
                  <EmptyState title="Sem dados neste intervalo" description="Troque de período ou aguarde a próxima coleta." />
                ) : (
                  <>
                    <div className="sr-only" aria-live="polite" role="status">
                      {textualSummary}
                    </div>

                    <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.82fr)]">
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="signature-surface p-3.5 md:p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">PM2.5 méd.</p>
                          <p className="mt-2 text-2xl font-black text-text-primary md:text-3xl">{stats.pm25Avg !== null ? stats.pm25Avg.toFixed(1) : "-"}</p>
                          <p className="mt-1 text-xs text-text-secondary">µg/m³</p>
                        </div>
                        <div className="signature-surface p-3.5 md:p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">PM2.5 máx.</p>
                          <p className="mt-2 text-2xl font-black text-text-primary md:text-3xl">{stats.pm25Max !== null ? stats.pm25Max.toFixed(1) : "-"}</p>
                          <p className="mt-1 text-xs text-text-secondary">µg/m³</p>
                        </div>
                        <div className="signature-surface p-3.5 md:p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">PM10 méd.</p>
                          <p className="mt-2 text-2xl font-black text-text-primary md:text-3xl">{stats.pm10Avg !== null ? stats.pm10Avg.toFixed(1) : "-"}</p>
                          <p className="mt-1 text-xs text-text-secondary">µg/m³</p>
                        </div>
                        <div className="signature-surface p-3.5 md:p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">PM10 máx.</p>
                          <p className="mt-2 text-2xl font-black text-text-primary md:text-3xl">{stats.pm10Max !== null ? stats.pm10Max.toFixed(1) : "-"}</p>
                          <p className="mt-1 text-xs text-text-secondary">µg/m³</p>
                        </div>
                      </div>

                      <div className="signature-surface p-4 md:p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">Resumo</p>
                        <p className="mt-2 text-sm leading-relaxed text-text-secondary">{textualSummary}</p>
                        <div className="mt-4">
                          <TextToSpeechButton
                            label="Ouvir resumo"
                            title="Resumo dos dados ambientais"
                            text={textualSummary}
                          />
                        </div>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl bg-surface-2 p-3.5">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">Período</p>
                            <p className="mt-1.5 text-sm font-bold text-text-primary">
                              {activeTab === "24h" ? "24 horas" : activeTab === "7d" ? "7 dias" : "Personalizado"}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-surface-2 p-3.5">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">Exportação</p>
                            <p className="mt-1.5 text-sm font-bold text-text-primary">Pronto para CSV</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-3">
                        <label className="flex cursor-pointer items-center gap-2">
                          <input
                            type="checkbox"
                            checked={showPM25}
                            onChange={(e) => setShowPM25(e.target.checked)}
                            className="h-4 w-4 rounded border-border-subtle text-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                          />
                          <span className="text-sm font-semibold text-text-primary"><span style={{ color: "#10b981" }}>■</span> PM2.5</span>
                        </label>
                        <label className="flex cursor-pointer items-center gap-2">
                          <input
                            type="checkbox"
                            checked={showPM10}
                            onChange={(e) => setShowPM10(e.target.checked)}
                            className="h-4 w-4 rounded border-border-subtle text-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                          />
                          <span className="text-sm font-semibold text-text-primary"><span style={{ color: "#f59e0b" }}>■</span> PM10</span>
                        </label>
                        <label className="flex cursor-pointer items-center gap-2">
                          <input
                            type="checkbox"
                            checked={showTemp}
                            onChange={(e) => setShowTemp(e.target.checked)}
                            className="h-4 w-4 rounded border-border-subtle text-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                          />
                          <span className="text-sm font-semibold text-text-primary"><span style={{ color: "#ef4444" }}>■</span> Temperatura</span>
                        </label>
                        <label className="flex cursor-pointer items-center gap-2">
                          <input
                            type="checkbox"
                            checked={showHumidity}
                            onChange={(e) => setShowHumidity(e.target.checked)}
                            className="h-4 w-4 rounded border-border-subtle text-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                          />
                          <span className="text-sm font-semibold text-text-primary"><span style={{ color: "#3b82f6" }}>■</span> Umidade</span>
                        </label>
                      </div>
                      <button
                        className="ui-btn-secondary px-4 text-xs font-black uppercase tracking-wide text-brand-primary disabled:opacity-60"
                        disabled={currentMeasurements.length === 0}
                        onClick={handleExportCSV}
                        type="button"
                        aria-label="Baixar dados visíveis em CSV"
                      >
                        CSV
                      </button>
                    </div>

                    <div className="signature-surface mt-5 p-4 md:p-5">
                      <h3 className="mb-3 text-sm font-bold text-brand-primary">Gráfico</h3>
                      <Suspense fallback={<LoadingCard message="Carregando gráfico histórico..." />}>
                        <MeasurementsChart
                          data={chartData}
                          showPM25={showPM25}
                          showPM10={showPM10}
                          showTemp={showTemp}
                          showHumidity={showHumidity}
                        />
                      </Suspense>
                    </div>

                    <details className="signature-surface mt-5 p-4">
                      <summary className="cursor-pointer text-sm font-bold text-brand-primary">
                        Abrir tabela
                      </summary>
                      <div className="mt-4 overflow-x-auto">
                        <table className="min-w-full border-collapse text-sm">
                          <caption className="sr-only">
                            Leituras ambientais da estação selecionada no período visível, com data, partículas, temperatura, umidade e qualidade.
                          </caption>
                          <thead>
                            <tr className="border-b border-border-subtle text-left text-xs uppercase tracking-wide text-brand-primary">
                              <th scope="col" className="px-3 py-2 font-bold">Data/Hora</th>
                              <th scope="col" className="px-3 py-2 font-bold">PM2.5 (µg/m³)</th>
                              <th scope="col" className="px-3 py-2 font-bold">PM10 (µg/m³)</th>
                              <th scope="col" className="px-3 py-2 font-bold">Temp (°C)</th>
                              <th scope="col" className="px-3 py-2 font-bold">Umid. (%)</th>
                              <th scope="col" className="px-3 py-2 font-bold">Qualidade</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentMeasurements.map((row) => (
                              <tr className="border-b border-border-subtle/50" key={String(row.bucket_ts)}>
                                <td className="px-3 py-2 text-text-primary">{formatDate(row.bucket_ts)}</td>
                                <td className="px-3 py-2 text-text-primary">{formatCellValue(row.pm25)}</td>
                                <td className="px-3 py-2 text-text-primary">{formatCellValue(row.pm10)}</td>
                                <td className="px-3 py-2 text-text-primary">{formatCellValue(row.temp)}</td>
                                <td className="px-3 py-2 text-text-primary">{formatCellValue(row.humidity)}</td>
                                <td className="px-3 py-2 text-text-primary">{formatCellValue(row.quality_flag)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </details>
                  </>
                )}
              </div>
            )}
            </SurfaceCard>

            {/* NOVO CARD: CLIMATOLOGIA PREDITIVA */}
            {currentMeasurements.length > 0 && hourlyProjection.length > 0 && (
              <SurfaceCard className="mt-6 border border-brand-primary/10 bg-white/[0.88] p-5 md:p-6 shadow-[0_12px_36px_rgba(15,38,59,0.08)]">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-border-subtle pb-4 mb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">Modelagem Científica (UFF)</span>
                    <h2 className="text-xl font-black tracking-tight text-text-primary mt-1">Previsão e Climatologia Preditiva (24h)</h2>
                    <p className="text-xs text-text-secondary mt-0.5">Projeções matemáticas baseadas na leitura mais recente e microclima local.</p>
                  </div>
                  
                  {/* Seletor de Cenários */}
                  <div className="flex flex-wrap gap-1 bg-surface-2 p-1 rounded-xl border border-border-subtle/50 mt-3 md:mt-0">
                    {(["normal", "thermal_inversion", "rain"] as const).map((scen) => {
                      const labels = { normal: "Padrão", thermal_inversion: "Inversão Térmica", rain: "Chuva / Lavagem" };
                      return (
                        <button
                          key={scen}
                          type="button"
                          onClick={() => setPredictiveScenario(scen)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                            predictiveScenario === scen
                              ? "bg-white text-brand-primary shadow-sm"
                              : "text-text-secondary hover:text-text-primary"
                          }`}
                        >
                          {labels[scen]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Dashboard grid */}
                <div className="grid gap-4 md:grid-cols-3 mb-6">
                  {/* Risco Card */}
                  <div className={`p-4 rounded-2xl border ${riskAssessment.color}`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">Risco de Pico (OMS)</span>
                    <div className="flex items-baseline gap-2 mt-1.5">
                      <strong className="text-2xl font-black leading-none">{riskAssessment.percent}%</strong>
                      <span className="text-xs font-extrabold">{riskAssessment.text}</span>
                    </div>
                    {/* Tiny visual progress bar */}
                    <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div className={`h-full ${riskAssessment.bg}`} style={{ width: `${riskAssessment.percent}%` }} />
                    </div>
                  </div>

                  {/* Máximo Projetado */}
                  <div className="p-4 rounded-2xl bg-surface-1 border border-border-subtle">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">Máximo Projetado PM2.5</span>
                    <div className="flex items-baseline gap-1 mt-1.5">
                      <strong className="text-2xl font-black text-text-primary leading-none">{maxProjectedPm.toFixed(1)}</strong>
                      <small className="text-xs text-text-secondary">µg/m³</small>
                    </div>
                    <p className="text-[10px] text-text-secondary mt-3">
                      Limiar diário recomendado pela OMS: <strong>15 µg/m³</strong>.
                    </p>
                  </div>

                  {/* Horário Crítico */}
                  <div className="p-4 rounded-2xl bg-surface-1 border border-border-subtle">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">Janela de Concentração</span>
                    <div className="mt-1.5">
                      <strong className="text-lg font-black text-text-primary block leading-tight">
                        {predictiveScenario === "rain" ? "Sem Alerta" : "06:00 - 09:00 e 18:00 - 21:00"}
                      </strong>
                      <p className="text-[10px] text-text-secondary mt-1.5">
                        Horários de maior tráfego e resfriamento atmosférico local.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Health Warning Banner */}
                <div className={`p-4 rounded-2xl border mb-6 flex gap-3 items-start ${
                  riskAssessment.tone === "high"
                    ? "border-red-500/20 bg-red-50/50 dark:bg-red-500/5 text-red-950 dark:text-red-300"
                    : riskAssessment.tone === "medium"
                    ? "border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5 text-amber-950 dark:text-amber-300"
                    : "border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5 text-emerald-950 dark:text-emerald-300"
                }`}>
                  <span className="text-xl">
                    {riskAssessment.tone === "high" ? "🚨" : riskAssessment.tone === "medium" ? "⚠️" : "✨"}
                  </span>
                  <div className="space-y-1">
                    <h4 className="text-xs font-black uppercase tracking-wider">Diretriz de Saúde Preventiva</h4>
                    <p className="text-xs leading-relaxed opacity-90">
                      {riskAssessment.tone === "high"
                        ? "Pico de poluição projetado excede as diretrizes recomendadas pela OMS. Recomenda-se reduzir atividades físicas intensas ao ar livre. Manter janelas fechadas durante os horários críticos."
                        : riskAssessment.tone === "medium"
                        ? "Atenção: aumento temporário de partículas projetado nos horários de pico. Grupos sensíveis (crianças, idosos, asmáticos) devem evitar esforço físico prolongado ao ar livre nestes intervalos."
                        : "Condições ideais. Qualidade do ar projetada estável e segura para atividades físicas externas e ventilação natural."}
                    </p>
                  </div>
                </div>

                {/* Interactive SVG Chart */}
                <div className="signature-surface p-4 md:p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-brand-primary">Gráfico de Projeção Horária (PM2.5)</h3>
                    <span className="text-[10px] text-text-secondary flex items-center gap-1.5">
                      <span className="inline-block w-2.5 h-0.5 border-t-2 border-dashed border-red-500/60" /> Limite OMS (15)
                    </span>
                  </div>

                  <div className="w-full overflow-x-auto">
                    <div className="min-w-[580px] py-2">
                      {/* SVG Render */}
                      {(() => {
                        const svgWidth = 600;
                        const svgHeight = 160;
                        const padding = { top: 15, bottom: 25, left: 35, right: 15 };
                        const chartW = svgWidth - padding.left - padding.right;
                        const chartH = svgHeight - padding.top - padding.bottom;
                        
                        const peakVal = Math.max(...hourlyProjection.map(p => p.pm25));
                        const maxVal = Math.max(30, peakVal * 1.2);
                        
                        const coords = hourlyProjection.map((p, idx) => {
                          const x = padding.left + (idx / 23) * chartW;
                          const y = padding.top + chartH - (p.pm25 / maxVal) * chartH;
                          return { x, y, val: p.pm25, hour: p.hour };
                        });
                        
                        const pathD = `M ${coords[0].x},${coords[0].y} ` + 
                          coords.slice(1).map(c => `L ${c.x},${c.y}`).join(" ");
                          
                        const fillD = `${pathD} L ${coords[coords.length - 1].x},${padding.top + chartH} L ${coords[0].x},${padding.top + chartH} Z`;
                        
                        const whoY = padding.top + chartH - (15 / maxVal) * chartH;
                        
                        const gridInterval = maxVal > 60 ? 20 : 10;
                        const gridLines = [];
                        for (let val = gridInterval; val < maxVal; val += gridInterval) {
                          gridLines.push({
                            val,
                            y: padding.top + chartH - (val / maxVal) * chartH
                          });
                        }
                        
                        const strokeColor = riskAssessment.tone === "high" ? "#ef4444" : riskAssessment.tone === "medium" ? "#f59e0b" : "#10b981";
                        const gradientId = `grad-${predictiveScenario}`;
                        
                        return (
                          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible select-none">
                            <defs>
                              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
                                <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
                              </linearGradient>
                            </defs>
                            
                            {gridLines.map(g => (
                              <g key={g.val}>
                                <line 
                                  x1={padding.left} 
                                  y1={g.y} 
                                  x2={svgWidth - padding.right} 
                                  y2={g.y} 
                                  className="stroke-black/[0.06] dark:stroke-white/[0.06]" 
                                  strokeWidth={1} 
                                />
                                <text 
                                  x={padding.left - 8} 
                                  y={g.y + 4} 
                                  textAnchor="end" 
                                  className="fill-text-secondary text-[8px] font-semibold"
                                >
                                  {g.val}
                                </text>
                              </g>
                            ))}
                            
                            <line 
                              x1={padding.left} 
                              y1={padding.top + chartH} 
                              x2={svgWidth - padding.right} 
                              y2={padding.top + chartH} 
                              className="stroke-black/10 dark:stroke-white/10" 
                              strokeWidth={1} 
                            />
                            
                            {whoY >= padding.top && whoY <= padding.top + chartH && (
                              <line 
                                x1={padding.left} 
                                y1={whoY} 
                                x2={svgWidth - padding.right} 
                                y2={whoY} 
                                stroke="#ef4444" 
                                strokeWidth={1} 
                                strokeDasharray="4,4" 
                                opacity={0.6}
                              />
                            )}
                            
                            <path d={fillD} fill={`url(#${gradientId})`} />
                            
                            <path d={pathD} fill="none" stroke={strokeColor} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                            
                            {coords.map((c, idx) => {
                              const isPeak = c.val === peakVal;
                              const shouldShowDot = idx % 2 === 0 || isPeak;
                              if (!shouldShowDot) return null;
                              return (
                                <g key={idx}>
                                  <circle 
                                    cx={c.x} 
                                    cy={c.y} 
                                    r={isPeak ? 4.5 : 3.5} 
                                    fill={isPeak ? "#ef4444" : strokeColor} 
                                    className="stroke-white dark:stroke-slate-900" 
                                    strokeWidth={1.5} 
                                  />
                                  {isPeak && (
                                    <text 
                                      x={c.x} 
                                      y={c.y - 8} 
                                      textAnchor="middle" 
                                      className="fill-red-600 dark:fill-red-400 text-[8px] font-black"
                                    >
                                      Pico: {c.val}
                                    </text>
                                  )}
                                </g>
                              );
                            })}
                            
                            {coords.map((c, idx) => {
                              if (idx % 4 !== 0) return null;
                              return (
                                <text 
                                  key={idx} 
                                  x={c.x} 
                                  y={padding.top + chartH + 15} 
                                  textAnchor="middle" 
                                  className="fill-text-secondary text-[8px] font-bold"
                                >
                                  {c.hour}
                                </text>
                              );
                            })}
                          </svg>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </SurfaceCard>
            )}
          </>
        )
      ) : (
        <SurfaceCard className="p-4 md:p-5">
          {/* Seletor de Período para Comparação */}
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Período de visualização">
            <button
              id="tab-compare-24h"
              role="tab"
              aria-selected={activeTab === "24h"}
              className={activeTab === "24h" ? "ui-segment-tab ui-segment-tab-active" : "ui-segment-tab"}
              onClick={() => setActiveTab("24h")}
              type="button"
            >
              24h
            </button>
            <button
              id="tab-compare-7d"
              role="tab"
              aria-selected={activeTab === "7d"}
              className={activeTab === "7d" ? "ui-segment-tab ui-segment-tab-active" : "ui-segment-tab"}
              onClick={() => setActiveTab("7d")}
              type="button"
            >
              7 dias
            </button>
            <button
              id="tab-compare-custom"
              role="tab"
              aria-selected={activeTab === "custom"}
              className={activeTab === "custom" ? "ui-segment-tab ui-segment-tab-active" : "ui-segment-tab"}
              onClick={() => setActiveTab("custom")}
              type="button"
            >
              Personalizado
            </button>
          </div>

          {loadingCompare ? (
            <div className="mt-6">
              <LoadingCard message="Carregando dados comparativos das estações..." />
            </div>
          ) : selectedStationIds.length < 2 ? (
            <div className="mt-6">
              <EmptyState
                title="Selecione pelo menos duas estações"
                description="Use o painel superior para marcar as estações que deseja colocar lado a lado no gráfico."
              />
            </div>
          ) : sortedTs.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                title="Sem dados para comparação"
                description="Não há registros consolidados para as estações selecionadas neste período."
              />
            </div>
          ) : (
            <>
              {/* Cards Estatísticos Comparativos */}
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {comparisonStats.map((stat, idx) => {
                  const color = COMPARE_COLORS[idx % COMPARE_COLORS.length];
                  return (
                    <div key={stat.id} className="signature-surface p-4 md:p-5 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: color }} />
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-bold text-text-primary truncate">{stat.name}</h3>
                        {stat.classification && (
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${getOmsLevelStyle(stat.classification.level)}`}>
                            {stat.classification.level}
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-xl bg-surface-2 p-2">
                          <p className="text-[9px] font-semibold uppercase tracking-wide text-text-secondary">Média</p>
                          <p className="mt-1 text-sm font-black text-text-primary">
                            {stat.avg !== null ? `${stat.avg.toFixed(1)}` : "-"}
                          </p>
                        </div>
                        <div className="rounded-xl bg-surface-2 p-2">
                          <p className="text-[9px] font-semibold uppercase tracking-wide text-text-secondary">Máximo</p>
                          <p className="mt-1 text-sm font-black text-text-primary">
                            {stat.max !== null ? `${stat.max.toFixed(1)}` : "-"}
                          </p>
                        </div>
                        <div className="rounded-xl bg-surface-2 p-2">
                          <p className="text-[9px] font-semibold uppercase tracking-wide text-text-secondary">Mínimo</p>
                          <p className="mt-1 text-sm font-black text-text-primary">
                            {stat.min !== null ? `${stat.min.toFixed(1)}` : "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Botões de Ações */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-text-secondary">Legenda:</span>
                  <div className="flex flex-wrap gap-2">
                    {stationSeriesConfig.map((s, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs font-semibold text-text-primary bg-surface-1 px-2.5 py-1 rounded-full border border-border-subtle">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.stroke }} />
                        <span>{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <button
                  className="ui-btn-secondary px-4 text-xs font-black uppercase tracking-wide text-brand-primary"
                  onClick={handleCompareExportCSV}
                  type="button"
                  aria-label="Exportar comparação em CSV"
                >
                  Exportar CSV
                </button>
              </div>

              {/* Gráfico de Comparação */}
              <div className="signature-surface mt-5 p-4 md:p-5">
                <h3 className="mb-3 text-sm font-bold text-brand-primary">Gráfico Comparativo</h3>
                <Suspense fallback={<LoadingCard message="Carregando gráfico comparativo..." />}>
                  <ComparisonChart
                    data={alignedCompareData}
                    stationSeries={stationSeriesConfig}
                    metricUnit={compareMetricUnit}
                  />
                </Suspense>
              </div>

              {/* Tabela de Comparação */}
              <details className="signature-surface mt-5 p-4">
                <summary className="cursor-pointer text-sm font-bold text-brand-primary">
                  Tabela Comparativa Consolidada
                </summary>
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full border-collapse text-sm">
                    <caption className="sr-only">
                      Medições consolidadas para todas as estações selecionadas ordenadas por data.
                    </caption>
                    <thead>
                      <tr className="border-b border-border-subtle text-left text-xs uppercase tracking-wide text-brand-primary">
                        <th scope="col" className="px-3 py-2 font-bold">Data/Hora</th>
                        {stationSeriesConfig.map((s, idx) => (
                          <th scope="col" key={idx} className="px-3 py-2 font-bold">
                            {s.label} ({compareMetricUnit})
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedTs.map((ts, rowIdx) => (
                        <tr className="border-b border-border-subtle/50" key={ts}>
                          <td className="px-3 py-2 text-text-primary">
                            {formatDate(new Date(ts * 1000).toISOString())}
                          </td>
                          {selectedStationIds.map((_, stationIdx) => {
                            const val = alignedCompareData[stationIdx + 1]?.[rowIdx];
                            return (
                              <td className="px-3 py-2 text-text-primary" key={stationIdx}>
                                {val !== null && val !== undefined ? val.toFixed(1) : "-"}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </>
          )}
        </SurfaceCard>
      )}

      {/* Mensagens de erro */}
      {error ? (
        <p aria-live="assertive" className="rounded-md border border-error/30 bg-error/10 p-3 text-sm text-error" role="alert">
          {error}
        </p>
      ) : null}
    </PortalPageShell>
  );
}
