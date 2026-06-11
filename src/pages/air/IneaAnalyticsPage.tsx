import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IconShell, SurfaceCard } from "../../components/BrandSystem";
import { DataFreshnessNotice } from "../../components/air/DataFreshnessNotice";
import { PublicInterpretationBox } from "../../components/air/PublicInterpretationBox";
import { WindRosePanel } from "../../components/air/WindRosePanel";
import { WeatherPollutionCorrelation } from "../../components/air/WeatherPollutionCorrelation";
import { RainWashEffectPanel } from "../../components/air/RainWashEffectPanel";
import { RadarEvidenceBadge } from "./radar/RadarEvidenceBadge";
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

export function IneaAnalyticsPage() {
  const [degradedDays, setDegradedDays] = useState<DegradedDayItem[]>([]);
  const [controllerFreq, setControllerFreq] = useState<ControllerFrequencyItem[]>([]);
  const [monthlyProfile, setMonthlyProfile] = useState<MonthlyProfileItem[]>([]);
  const [stationRanking, setStationRanking] = useState<StationRankingItem[]>([]);
  const [dataGaps, setDataGaps] = useState<DataGapItem[]>([]);
  const [classificationDays, setClassificationDays] = useState<Record<string, ClassificationDayItem>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const [
          resDegraded,
          resController,
          resMonthly,
          resRanking,
          resGaps,
          resClassif
        ] = await Promise.all([
          fetchRadarJson<DegradedDayItem[]>("/api/air/inea/analytics/degraded-days"),
          fetchRadarJson<ControllerFrequencyItem[]>("/api/air/inea/analytics/controller-frequency"),
          fetchRadarJson<MonthlyProfileItem[]>("/api/air/inea/analytics/monthly-profile"),
          fetchRadarJson<StationRankingItem[]>("/api/air/inea/analytics/station-ranking"),
          fetchRadarJson<DataGapItem[]>("/api/air/inea/analytics/data-gaps"),
          fetchRadarJson<ClassificationDaysResponse>("/api/air/inea/classification-days")
        ]);

        setDegradedDays(resDegraded);
        setControllerFreq(resController);
        setMonthlyProfile(resMonthly);
        setStationRanking(resRanking);
        setDataGaps(resGaps);
        setClassificationDays(resClassif);
        setLoading(false);
      } catch (err) {
        console.error("Error loading analytics data:", err);
        setError("Não foi possível carregar as análises. Verifique a conexão com o banco de dados.");
        setLoading(false);
      }
    }

    fetchAnalytics();
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
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-2xl">
          <h2 className="font-bold text-lg mb-2">Erro de Carregamento</h2>
          <p className="text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-all"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
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
              Camada analítica e diagnóstico das medições históricas de qualidade do ar em Volta Redonda.
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
              Estações com baixa cobertura não devem ser interpretadas como regiões de ar melhor. Ausência de dado não é qualidade boa.
            </p>
          </div>
        </SurfaceCard>
      </div>

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
              {worstStationByDegraded ? `${worstStationByDegraded.degraded_percent_of_measured_days}% dos dias registrados como MODERADA ou pior` : "-"}
            </p>
          </div>
          <div className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg self-start">
            Mais dias registrados como MODERADA ou pior
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
              {topController ? `${topController.percentage}% das leituras controladas por ele` : "-"}
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
              Registrado na estação {worstIndexStation} ({worstIndexClass})
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
              {worstMonthPct}% das medições mensais degradadas
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
            Mapeamento comparativo e classificação baseada em dados consistentes.
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
                    <span className="text-slate-400 font-medium">{total} dias registrados</span>
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
            💡 <strong>Nota Técnica:</strong> O poluente controlador é aquele que apresenta o maior subíndice em uma leitura específica, definindo o índice consolidado geral (IQAr) da estação naquele instante.
          </div>
        </SurfaceCard>

      </div>

      {/* Monthly Heatmap / Profile Section */}
      <SurfaceCard className="p-6 border border-slate-100 rounded-3xl space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-800">Perfil Mensal de Qualidade do Ar Degradada</h2>
          <p className="text-xs text-slate-500 font-medium">
            Proporção mensal de dias registrados como MODERADA ou pior com base nos registros válidos.
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
            Auditoria de integridade dos registros oficiais do INEA integrados ao banco de dados.
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
