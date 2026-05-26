import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { IconShell, SurfaceCard } from "../../components/BrandSystem";
import { MethodologyNotice } from "../../components/air/MethodologyNotice";
import { DataFreshnessNotice } from "../../components/air/DataFreshnessNotice";
import { PublicLaunchBanner } from "../../components/air/PublicLaunchBanner";
import { AqiChart } from "../../components/air/AqiChart";

// Fix default Leaflet marker icons in React
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface StationSummary {
  id: string;
  name: string;
  code: string;
  lat: number | null;
  lng: number | null;
  active: boolean;
}

interface LatestResult {
  station: StationSummary;
  measured_at: string | null;
  measurements: any[];
}

interface SummaryStats {
  totalStations: number;
  timeRange: { minDate: string; maxDate: string };
  totalMeasurements: number;
  moderateOrWorseDaysCount: number;
  mostFrequentControllingPollutant: string;
}

interface BreakdownItem {
  BOA: number;
  MODERADA: number;
  RUIM: number;
  "MUITO RUIM": number;
  "PÉSSIMA": number;
  moderateOrWorseDays: number;
  totalDays: number;
}

export function getIneaClassificationStyle(classification: string | null | undefined) {
  const cls = (classification || "").toUpperCase().trim();
  switch (cls) {
    case "BOA":
      return "border-emerald-500/20 bg-emerald-50 text-emerald-800";
    case "MODERADA":
      return "border-amber-500/20 bg-amber-50 text-amber-900";
    case "RUIM":
      return "border-orange-500/20 bg-orange-50 text-orange-950";
    case "MUITO RUIM":
      return "border-red-500/20 bg-red-50 text-red-900";
    case "PÉSSIMA":
      return "border-purple-500/20 bg-purple-50 text-purple-900";
    default:
      return "border-slate-300 bg-slate-50 text-slate-700";
  }
}

export function IneaRadarPage() {
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [latestData, setLatestData] = useState<LatestResult[]>([]);
  const [timeseries, setTimeseries] = useState<any[]>([]);
  const [rankings, setRankings] = useState<Record<string, BreakdownItem>>({});
  const [selectedStationChart, setSelectedStationChart] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch API endpoints
        const [resSummary, resLatest, resRankings] = await Promise.all([
          fetch("/api/air/inea/summary").then(r => r.json()),
          fetch("/api/air/inea/latest").then(r => r.json()),
          fetch("/api/air/inea/classification-days").then(r => r.json())
        ]);

        setSummary(resSummary);
        const stationsList = resLatest.stations || [];
        setLatestData(stationsList);
        setRankings(resRankings);

        const activeStations = stationsList.filter((r: any) => r.measured_at !== null);
        if (activeStations.length > 0) {
          const firstStationId = activeStations[0].station.id;
          setSelectedStationChart(firstStationId);
        }
      } catch (err: any) {
        console.error("Failed to load official INEA data:", err);
        setError("Não foi possível carregar os dados oficiais do INEA. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    }
    void fetchData();
  }, []);

  // Fetch timeseries when selected chart station changes
  useEffect(() => {
    if (!selectedStationChart) return;
    let cancelled = false;

    async function loadChartData() {
      try {
        const data = await fetch(
          `/api/air/inea/timeseries?stationId=${selectedStationChart}&metricType=GENERAL_AQI`
        ).then(r => r.json());
        
        if (!cancelled) {
          setTimeseries(data);
        }
      } catch (err) {
        console.error("Failed to load chart timeseries:", err);
      }
    }

    void loadChartData();
    return () => { cancelled = true; };
  }, [selectedStationChart]);

  // Format dates for display
  const formatDateRange = (range: any) => {
    if (!range || !range.minDate) return "-";
    const dMin = new Date(range.minDate).toLocaleDateString("pt-BR");
    const dMax = new Date(range.maxDate).toLocaleDateString("pt-BR");
    return `${dMin} a ${dMax}`;
  };

  // Prepares the rankings sorted by moderate or worse days descending
  const sortedRankings = useMemo(() => {
    if (!rankings || latestData.length === 0) return [];
    return Object.entries(rankings)
      .map(([stationId, breakdown]) => {
        const s = latestData.find(l => l.station.id === stationId)?.station;
        return {
          id: stationId,
          name: s?.name || "Estação Desconhecida",
          ...breakdown
        };
      })
      .sort((a, b) => b.moderateOrWorseDays - a.moderateOrWorseDays);
  }, [rankings, latestData]);

  // Prepares chart series data
  const chartPoints = useMemo(() => {
    return timeseries.map(t => ({
      ts: t.measured_at,
      value: t.air_quality_index
    }));
  }, [timeseries]);

  if (loading) {
    return (
      <div className="portal-stage space-y-8 animate-pulse">
        <div className="h-48 bg-slate-200/40 rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200/40 rounded-2xl" />
          ))}
        </div>
        <div className="h-96 bg-slate-200/40 rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="portal-stage p-12 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500 mb-4">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800">{error}</h2>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary-dark transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <section className="portal-stage space-y-8 md:space-y-10">
      {/* Title */}
      <SurfaceCard className="portal-stage-hero portal-stage-hero-lab overflow-hidden p-0">
        <div className="portal-stage-hero-inner">
          <div className="portal-stage-copy">
            <IconShell tone="lab" className="portal-stage-icon">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </IconShell>
            <h1>Radar do Ar — Dados oficiais do INEA em Volta Redonda</h1>
            <p>
              Monitoramento baseado em relatórios consolidados do inventário oficial de qualidade do ar do INEA.
            </p>
          </div>
          <div className="portal-stage-stat">
            <span>{summary?.totalStations} Estações</span>
            <small>Volta Redonda-RJ</small>
          </div>
        </div>
      </SurfaceCard>

      {/* Methodology Banner */}
      <MethodologyNotice />
      <DataFreshnessNotice />

      {/* Public Launch Banner — validated findings + editorial framing */}
      <PublicLaunchBanner />

      {/* Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <SurfaceCard className="p-4 bg-white border border-slate-100 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Estações</span>
          <strong className="text-2xl font-black text-slate-800 mt-1 block">{summary?.totalStations}</strong>
        </SurfaceCard>

        <SurfaceCard className="p-4 bg-white border border-slate-100 rounded-2xl col-span-1 lg:col-span-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Período Histórico</span>
          <strong className="text-sm font-bold text-slate-700 mt-2 block">
            {formatDateRange(summary?.timeRange)}
          </strong>
        </SurfaceCard>

        <SurfaceCard className="p-4 bg-white border border-slate-100 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Registros</span>
          <strong className="text-xl font-black text-slate-800 mt-1 block">
            {summary?.totalMeasurements.toLocaleString("pt-BR")}
          </strong>
        </SurfaceCard>

        <SurfaceCard className="p-4 bg-white border border-slate-100 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Dias &gt;= Moderada</span>
          <strong className="text-2xl font-black text-amber-700 mt-1 block">
            {summary?.moderateOrWorseDaysCount}
          </strong>
        </SurfaceCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Map panel */}
        <SurfaceCard className="p-5 md:p-6 bg-white border border-slate-100 rounded-2xl">
          <h2 className="text-lg font-black text-slate-800">Mapa das Estações Oficiais</h2>
          <p className="text-xs text-slate-400 mt-1">Localização e situação atual das estações de monitoramento do INEA.</p>
          
          <div className="h-[360px] w-full rounded-xl overflow-hidden mt-4 relative z-0 border border-slate-100">
            <MapContainer
              center={[-22.5203, -44.1044]}
              zoom={12}
              scrollWheelZoom={false}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />
              {latestData.map((d) => {
                if (d.station.lat === null || d.station.lng === null) return null;
                
                const latestAqi = d.measurements.find(m => m.metric_type === "GENERAL_AQI");
                const classification = latestAqi?.air_quality_classification || "Sem Leitura";
                const aqiValue = latestAqi?.value !== undefined ? Math.round(latestAqi.value) : "-";

                return (
                  <Marker
                    key={d.station.id}
                    position={[d.station.lat, d.station.lng]}
                  >
                    <Popup>
                      <div className="text-xs space-y-1 text-slate-800">
                        <strong className="font-bold block text-sm border-b pb-1 mb-1">{d.station.name}</strong>
                        <p><strong>Índice IQAr:</strong> {aqiValue}</p>
                        <p>
                          <strong>Classificação:</strong>{" "}
                          <span className="font-bold">{classification}</span>
                        </p>
                        <p><strong>Controlador:</strong> {latestAqi?.controlling_pollutant || "-"}</p>
                        <Link
                          to={`/qualidade-ar/inea/estacoes/${d.station.id}`}
                          className="text-brand-primary font-bold hover:underline block pt-2 mt-1 border-t text-[10px] uppercase tracking-wider text-center"
                        >
                          Ver Estação Detalhada &rarr;
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </SurfaceCard>

        {/* Rankings panel */}
        <SurfaceCard className="p-5 md:p-6 bg-white border border-slate-100 rounded-2xl flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-800">Ranking por Poluição</h2>
            <p className="text-xs text-slate-400 mt-1">Estações com mais dias com classificação Moderada ou pior.</p>
            
            <div className="space-y-3 mt-4">
              {sortedRankings.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Sem classificações gravadas no período.</p>
              ) : (
                sortedRankings.map((r, idx) => (
                  <div key={r.id} className="p-3 border border-slate-50 bg-slate-50/50 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-300 w-4">#{idx + 1}</span>
                      <div className="space-y-0.5">
                        <Link to={`/qualidade-ar/inea/estacoes/${r.id}`} className="text-xs font-bold text-slate-800 hover:text-brand-primary">
                          {r.name}
                        </Link>
                        <span className="text-[10px] text-slate-400 block">{r.totalDays} dias auditados</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <strong className="text-sm font-black text-amber-700 block">{r.moderateOrWorseDays} dias</strong>
                      <span className="text-[9px] text-slate-400 block font-semibold">Moderada ou pior</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg text-[9px] leading-tight text-slate-500 border border-slate-100 mt-4">
            Poluente controlador mais frequente no município: <strong className="text-slate-700 font-extrabold">{summary?.mostFrequentControllingPollutant}</strong>
          </div>
        </SurfaceCard>
      </div>

      {/* Latest Readings Table */}
      <SurfaceCard className="p-5 md:p-6 bg-white border border-slate-100 rounded-2xl">
        <h2 className="text-lg font-black text-slate-800">Últimas Leituras de Qualidade do Ar</h2>
        <p className="text-xs text-slate-400 mt-1">Status mais recente reportado de cada uma das estações em Volta Redonda.</p>
        
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30">
                <th scope="col" className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Estação</th>
                <th scope="col" className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Última Leitura</th>
                <th scope="col" className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Índice IQAr</th>
                <th scope="col" className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Classificação</th>
                <th scope="col" className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Controlador</th>
                <th scope="col" className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs">
              {latestData.map((d) => {
                const latestAqi = d.measurements.find(m => m.metric_type === "GENERAL_AQI");
                const classification = latestAqi?.air_quality_classification || "Sem Leitura";
                const value = latestAqi?.value !== undefined ? Math.round(latestAqi.value) : "-";
                const colorClass = getIneaClassificationStyle(classification);

                return (
                  <tr key={d.station.id} className="hover:bg-slate-50/40">
                    <td className="px-6 py-3 font-bold text-slate-800">
                      <Link to={`/qualidade-ar/inea/estacoes/${d.station.id}`} className="hover:underline">
                        {d.station.name}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-slate-500 font-semibold">
                      {d.measured_at ? new Date(d.measured_at).toLocaleString("pt-BR") : "-"}
                    </td>
                    <td className="px-6 py-3 text-center font-black text-slate-800 text-lg">
                      {value}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-block rounded-full border px-2.5 py-0.5 font-bold ${colorClass}`}>
                        {classification}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-bold text-slate-600">
                      {latestAqi?.controlling_pollutant || "-"}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Link
                        to={`/qualidade-ar/inea/estacoes/${d.station.id}`}
                        className="text-brand-primary hover:underline font-bold"
                      >
                        Ver Estação
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SurfaceCard>

      {/* Historical series chart */}
      <SurfaceCard className="p-5 md:p-6 bg-white border border-slate-100 rounded-2xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h2 className="text-lg font-black text-slate-800">Série Histórica do Índice Geral IQAr</h2>
            <p className="text-xs text-slate-400 mt-1">Evolução temporal das leituras do Índice geral de qualidade do ar.</p>
          </div>
          <div>
            <select
              value={selectedStationChart}
              onChange={(e) => setSelectedStationChart(e.target.value)}
              className="text-xs border border-slate-200 bg-white rounded-xl p-2 font-bold text-slate-700 outline-none focus:border-brand-primary"
            >
              {latestData.map(d => (
                <option key={d.station.id} value={d.station.id}>{d.station.name}</option>
              ))}
            </select>
          </div>
        </div>

        <AqiChart data={chartPoints} />
      </SurfaceCard>
    </section>
  );
}
