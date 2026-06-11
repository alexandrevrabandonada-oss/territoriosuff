import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { SurfaceCard } from "../../components/BrandSystem";
import { MethodologyNotice } from "../../components/air/MethodologyNotice";
import { DataFreshnessNotice } from "../../components/air/DataFreshnessNotice";
import { AqiChart } from "../../components/air/AqiChart";
import { getIneaClassificationStyle } from "./IneaRadarPage";
import type { RadarMeasurement, RadarTimeseriesPoint } from "./radar/RadarTypes";

interface StationSummary {
  id: string;
  name: string;
  code: string;
  lat: number | null;
  lng: number | null;
  active: boolean;
  city: string;
  neighborhood: string | null;
}

interface LatestResult {
  station: StationSummary;
  measured_at: string | null;
  measurements: RadarMeasurement[];
}

interface LatestResponse {
  stations?: LatestResult[];
}

interface ClassificationDaysBreakdown {
  BOA: number;
  MODERADA: number;
  RUIM: number;
  "MUITO RUIM": number;
  "PÉSSIMA": number;
  moderateOrWorseDays: number;
  totalDays: number;
}

function classifySubindex(value: number | null | undefined): { label: string; color: string } {
  if (value === null || value === undefined) return { label: "Sem dados", color: "text-slate-400 border-slate-200 bg-slate-50" };
  if (value <= 40) return { label: "BOA", color: "text-emerald-800 border-emerald-500/20 bg-emerald-50" };
  if (value <= 80) return { label: "MODERADA", color: "text-amber-800 border-amber-500/20 bg-amber-50" };
  if (value <= 120) return { label: "RUIM", color: "text-orange-950 border-orange-500/20 bg-orange-50" };
  if (value <= 200) return { label: "MUITO RUIM", color: "text-red-800 border-red-500/20 bg-red-50" };
  return { label: "PÉSSIMA", color: "text-purple-800 border-purple-500/20 bg-purple-50" };
}

const POLLUTANTS_INFO: Record<string, { name: string; desc: string }> = {
  PM10: { name: "PM10", desc: "Partículas inaláveis grossas (poeira, cinzas)" },
  PM25: { name: "PM2.5", desc: "Partículas finas inaláveis (fumaça, fuligem)" },
  SO2: { name: "Dióxido de Enxofre (SO2)", desc: "Gás originado da queima de combustíveis fósseis e processos siderúrgicos" },
  NO2: { name: "Dióxido de Nitrogênio (NO2)", desc: "Gás poluente emitido por veículos e queima industrial" },
  O3: { name: "Ozônio (O3)", desc: "Gás secundário formado sob luz solar, irritante respiratório" },
  CO: { name: "Monóxido de Carbono (CO)", desc: "Gás asfixiante oriundo de combustão incompleta" }
};

export function IneaStationPage() {
  const { stationId } = useParams<{ stationId: string }>();

  const [stationInfo, setStationInfo] = useState<StationSummary | null>(null);
  const [latestMeasurements, setLatestMeasurements] = useState<RadarMeasurement[]>([]);
  const [timeseries, setTimeseries] = useState<RadarTimeseriesPoint[]>([]);
  const [breakdown, setBreakdown] = useState<ClassificationDaysBreakdown | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stationId) return;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch API endpoints
        const [resLatest, resTimeseries, resBreakdown]: [LatestResponse, RadarTimeseriesPoint[], ClassificationDaysBreakdown] = await Promise.all([
          fetch("/api/air/inea/latest").then(r => r.json()),
          fetch(`/api/air/inea/timeseries?stationId=${stationId}&metricType=GENERAL_AQI`).then(r => r.json()),
          fetch(`/api/air/inea/classification-days?stationId=${stationId}`).then(r => r.json())
        ]);

        const stationsList = resLatest.stations || [];
        const stationMatch = stationsList.find((l: LatestResult) => l.station.id === stationId);

        if (!stationMatch) {
          setError("Estação não encontrada.");
          return;
        }

        setStationInfo(stationMatch.station);
        setLatestMeasurements(stationMatch.measurements);
        setTimeseries(resTimeseries);
        setBreakdown(resBreakdown);

      } catch (err) {
        console.error("Failed to load station details:", err);
        setError("Não foi possível carregar as informações detalhadas desta estação.");
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [stationId]);

  // Extract general AQI record
  const generalAqi = useMemo(() => {
    return latestMeasurements.find(m => m.metric_type === "GENERAL_AQI");
  }, [latestMeasurements]);

  // Extract subindices list
  const subindices = useMemo(() => {
    return latestMeasurements.filter(m => m.metric_type === "POLLUTANT_SUBINDEX");
  }, [latestMeasurements]);

  // Group chart points
  const chartPoints = useMemo(() => {
    return timeseries.map(t => ({
      ts: t.measured_at,
      value: t.air_quality_index
    }));
  }, [timeseries]);

  // Compute controlling pollutant frequencies
  const controllingPollutantFrequency = useMemo(() => {
    const counts: Record<string, number> = {};
    let total = 0;
    for (const t of timeseries) {
      if (t.controlling_pollutant) {
        const p = t.controlling_pollutant.toUpperCase().trim();
        counts[p] = (counts[p] || 0) + 1;
        total++;
      }
    }
    return Object.entries(counts)
      .map(([pollutant, count]) => ({
        pollutant,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);
  }, [timeseries]);

  // Prepares classification list for the progress bars
  const classificationList = useMemo(() => {
    if (!breakdown) return [];
    const total = breakdown.totalDays || 1;
    return [
      { name: "BOA", count: breakdown.BOA, color: "bg-emerald-500", text: "text-emerald-700" },
      { name: "MODERADA", count: breakdown.MODERADA, color: "bg-amber-500", text: "text-amber-700" },
      { name: "RUIM", count: breakdown.RUIM, color: "bg-orange-500", text: "text-orange-800" },
      { name: "MUITO RUIM", count: breakdown["MUITO RUIM"], color: "bg-red-500", text: "text-red-700" },
      { name: "PÉSSIMA", count: breakdown["PÉSSIMA"], color: "bg-purple-500", text: "text-purple-700" }
    ].map(item => ({
      ...item,
      percentage: (item.count / total) * 100
    }));
  }, [breakdown]);

  if (loading) {
    return (
      <div className="portal-stage space-y-8 animate-pulse">
        <div className="h-40 bg-slate-200/40 rounded-2xl" />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="h-96 bg-slate-200/40 rounded-2xl md:col-span-2" />
          <div className="h-96 bg-slate-200/40 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !stationInfo) {
    return (
      <div className="portal-stage p-12 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500 mb-4">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800">{error || "Estação Desconhecida"}</h2>
        <Link
          to="/qualidade-ar/inea"
          className="mt-4 inline-flex px-6 py-2 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary-dark transition-colors"
        >
          Voltar para o Radar do Ar
        </Link>
      </div>
    );
  }

  const badgeStyle = getIneaClassificationStyle(generalAqi?.air_quality_classification);

  return (
    <section className="portal-stage space-y-8 md:space-y-10">
      {/* Back button */}
      <div>
        <Link
          to="/qualidade-ar/inea"
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.14em] text-slate-400 hover:text-brand-primary transition-colors"
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar para o Radar do Ar
        </Link>
      </div>

      {/* Hero card */}
      <SurfaceCard className="portal-stage-hero portal-stage-hero-lab overflow-hidden p-0">
        <div className="portal-stage-hero-inner">
          <div className="portal-stage-copy">
            <div className="flex flex-wrap items-center gap-2">
              <span className="section-badge">Estação INEA</span>
              {stationInfo.neighborhood && (
                <span className="text-xs text-slate-400 font-semibold">• {stationInfo.neighborhood}</span>
              )}
            </div>
            <h1 className="mt-2">{stationInfo.name}</h1>
            <p className="text-xs text-slate-500 font-bold">
              Localização: Latitude {stationInfo.lat?.toFixed(5)} | Longitude {stationInfo.lng?.toFixed(5)}
            </p>
          </div>

          <div className="portal-stage-stat flex flex-col items-end gap-1 shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
              Último Índice IQAr
            </span>
            <div className="flex items-baseline gap-2">
              <strong className="text-4xl font-black text-slate-800 leading-none">
                {typeof generalAqi?.value === "number" ? Math.round(generalAqi.value) : "--"}
              </strong>
            </div>
            <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold mt-2 ${badgeStyle}`}>
              {generalAqi?.air_quality_classification || "Sem Leitura"}
            </span>
          </div>
        </div>
      </SurfaceCard>

      <MethodologyNotice />
      <DataFreshnessNotice />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Timeseries graph */}
        <SurfaceCard className="p-5 md:p-6 bg-white border border-slate-100 rounded-2xl md:col-span-2">
          <h2 className="text-lg font-black text-slate-800">Série Histórica do Índice Geral IQAr</h2>
          <p className="text-xs text-slate-400 mt-1 mb-4">Acompanhe a variação do índice geral ao longo do tempo nesta estação.</p>
          <AqiChart data={chartPoints} />
        </SurfaceCard>

        {/* Classification Breakdown progress bars */}
        <SurfaceCard className="p-5 md:p-6 bg-white border border-slate-100 rounded-2xl flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-800">Dias por Classificação</h2>
            <p className="text-xs text-slate-400 mt-1">Frequência acumulada das faixas de qualidade de ar nesta estação.</p>
            
            <div className="space-y-4 mt-6">
              {classificationList.map(item => (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span className={item.text}>{item.name}</span>
                    <span>{item.count} dias ({item.percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4 text-[10px] text-slate-400 leading-relaxed font-semibold">
            Total de dias auditados nesta estação: <strong className="text-slate-600">{breakdown?.totalDays} dias</strong>.
          </div>
        </SurfaceCard>
      </div>

      {/* Controlling pollutant frequency */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Pollutant Subindices Grid */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-black text-slate-800">Subíndices Detalhados por Poluente</h2>
          <p className="text-xs text-slate-400 mt-1">Últimos subíndices de qualidade do ar computados por tipo de partícula ou gás poluente.</p>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.entries(POLLUTANTS_INFO).map(([poll, info]) => {
              const matchedSub = subindices.find(s => s.pollutant === poll);
              const value = typeof matchedSub?.value === "number" ? Math.round(matchedSub.value) : null;
              const classification = classifySubindex(value);

              return (
                <SurfaceCard key={poll} className="p-4 bg-white border border-slate-100 rounded-2xl flex flex-col justify-between h-40">
                  <div>
                    <h3 className="text-xs font-black text-slate-800 leading-tight uppercase tracking-wider">{info.name}</h3>
                    <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed font-medium">{info.desc}</p>
                  </div>
                  <div className="flex items-baseline justify-between mt-4">
                    <strong className="text-3xl font-black text-slate-800">
                      {value !== null ? value : "--"}
                    </strong>
                    <span className={`inline-block rounded-full border px-2 py-0.5 text-[9px] font-bold ${classification.color}`}>
                      {classification.label}
                    </span>
                  </div>
                </SurfaceCard>
              );
            })}
          </div>
        </div>

        {/* Controlling pollutant list */}
        <SurfaceCard className="p-5 md:p-6 bg-white border border-slate-100 rounded-2xl">
          <h2 className="text-lg font-black text-slate-800">Frequência do Controlador</h2>
          <p className="text-xs text-slate-400 mt-1">Poluente responsável por definir a classificação da qualidade nesta estação.</p>
          
          <div className="mt-6 space-y-4">
            {controllingPollutantFrequency.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Nenhum poluente controlador registrado no período.</p>
            ) : (
              controllingPollutantFrequency.map((item, idx) => (
                <div key={item.pollutant} className="flex items-center justify-between border-b border-slate-50 pb-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-300 w-4">#{idx + 1}</span>
                    <strong className="text-xs font-bold text-slate-800">{item.pollutant}</strong>
                  </div>
                  <div className="text-right">
                    <strong className="text-xs font-bold text-slate-700">{item.count} vezes</strong>
                    <span className="text-[9px] text-slate-400 block font-semibold">({item.percentage.toFixed(0)}% das ocorrências)</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </SurfaceCard>
      </div>
    </section>
  );
}
