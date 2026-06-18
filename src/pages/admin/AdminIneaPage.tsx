import { useCallback, useEffect, useState } from "react";
import { getSupabaseClientOrNull } from "../../lib/supabase/runtime";

interface IngestRun {
  id: string;
  started_at: string;
  finished_at: string | null;
  status: string;
  rows_read: number;
  rows_inserted: number;
  error_message: string | null;
  report_json: Record<string, unknown> | null;
}

interface AirStation {
  id: string;
  name: string;
  city: string;
  neighborhood: string | null;
  lat: number | null;
  lng: number | null;
  active: boolean;
  operation_start_date?: string | null;
  operation_end_date?: string | null;
  operation_window_source?: string | null;
}

interface AirMeasurement {
  id: string;
  station_id: string;
  station_name?: string;
  pollutant: string | null;
  value: number;
  unit: string | null;
  measured_at: string;
  quality_flag: string | null;
  metric_type: string;
  air_quality_index: number | null;
  air_quality_classification: string | null;
  controlling_pollutant: string | null;
  raw_column: string;
}

type AirMeasurementRow = Omit<AirMeasurement, "station_name"> & {
  air_stations?: { name?: string | null } | null;
};

const CLASSIFICATION_COLORS: Record<string, string> = {
  BOA: "bg-emerald-100 text-emerald-800 border-emerald-200",
  MODERADA: "bg-yellow-100 text-yellow-800 border-yellow-200",
  RUIM: "bg-orange-100 text-orange-800 border-orange-200",
  "MUITO RUIM": "bg-rose-100 text-rose-800 border-rose-200",
  "PÉSSIMA": "bg-purple-100 text-purple-800 border-purple-200",
  INDISPONÍVEL: "bg-slate-100 text-slate-500 border-slate-200"
};

function getErrorMessage(error: unknown, fallback = "Erro desconhecido") {
  return error instanceof Error ? error.message : fallback;
}

export function AdminIneaPage() {
  const [lastRun, setLastRun] = useState<IngestRun | null>(null);
  const [stations, setStations] = useState<AirStation[]>([]);
  const [recentMeasurements, setRecentMeasurements] = useState<AirMeasurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showManualModal, setShowManualModal] = useState(false);
  const [filterStation, setFilterStation] = useState<string>("");
  const [filterMetricType, setFilterMetricType] = useState<string>("");

  const loadData = useCallback(async () => {
    const supabase = await getSupabaseClientOrNull();
    if (!supabase) return;
    setLoading(true);

    try {
      // 1. Get last ingestion run
      const { data: runs, error: runsError } = await supabase
        .from("air_ingest_runs")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(1);

      if (runsError) throw runsError;
      if (runs && runs.length > 0) {
        setLastRun(runs[0] as IngestRun);
      }

      // 2. Get Volta Redonda stations
      const { data: stationsData, error: stationsError } = await supabase
        .from("air_stations")
        .select("*")
        .eq("source", "INEA")
        .eq("city", "Volta Redonda")
        .order("name", { ascending: true });

      if (stationsError) throw stationsError;
      setStations((stationsData || []) as AirStation[]);

      // 3. Get recent measurements (join via station_id)
      const { data: measData, error: measError } = await supabase
        .from("air_measurements")
        .select(`
          id,
          station_id,
          pollutant,
          value,
          unit,
          measured_at,
          quality_flag,
          metric_type,
          air_quality_index,
          air_quality_classification,
          controlling_pollutant,
          raw_column,
          air_stations (
            name
          )
        `)
        .order("measured_at", { ascending: false })
        .limit(120);

      if (measError) throw measError;

      const formattedMeas = ((measData || []) as AirMeasurementRow[]).map((m) => ({
        id: m.id,
        station_id: m.station_id,
        station_name: m.air_stations?.name || "Desconhecida",
        pollutant: m.pollutant,
        value: m.value,
        unit: m.unit,
        measured_at: m.measured_at,
        quality_flag: m.quality_flag,
        metric_type: m.metric_type || "POLLUTANT_SUBINDEX",
        air_quality_index: m.air_quality_index,
        air_quality_classification: m.air_quality_classification,
        controlling_pollutant: m.controlling_pollutant,
        raw_column: m.raw_column || "IQA"
      }));

      setRecentMeasurements(formattedMeas);

    } catch (err) {
      alert("Erro ao carregar dados do INEA: " + getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Find last GENERAL_AQI measurement by station
  const getLastAqiByStation = (stationId: string) => {
    const stationMeas = recentMeasurements.filter(m => m.station_id === stationId && m.metric_type === "GENERAL_AQI");
    if (stationMeas.length === 0) return null;
    return stationMeas[0];
  };

  // Check if any station is missing data (no data or last seen > 24 hours ago)
  const getMissingDataAlerts = () => {
    const alerts: string[] = [];
    const now = new Date();

    for (const station of stations) {
      const last = getLastAqiByStation(station.id) || recentMeasurements.find(m => m.station_id === station.id);
      if (!last) {
        alerts.push(`Estação "${station.name}" não possui nenhuma medição no banco.`);
      } else {
        const lastDate = new Date(last.measured_at);
        const diffHrs = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);
        if (diffHrs > 24) {
          alerts.push(`Estação "${station.name}" está sem novos índices há mais de 24 horas (Última atualização: ${lastDate.toLocaleDateString("pt-BR")} ${lastDate.toLocaleTimeString("pt-BR")}).`);
        }
      }
    }

    return alerts;
  };

  const alerts = getMissingDataAlerts();

  // Get list of unique pollutants in recent data
  const getUniquePollutants = () => {
    const set = new Set<string>();
    recentMeasurements.forEach(m => {
      if (m.pollutant && m.pollutant !== "IQAr") {
        set.add(m.pollutant);
      }
    });
    return Array.from(set).join(", ") || "Nenhum";
  };

  // Filtered measurements for table
  const filteredMeasurements = recentMeasurements.filter(m => {
    const matchStation = filterStation ? m.station_name === filterStation : true;
    const matchMetric = filterMetricType ? m.metric_type === filterMetricType : true;
    return matchStation && matchMetric;
  });

  return (
    <div className="admin-list-page space-y-8 animate-in fade-in duration-500">
      
      {/* Hero Header */}
      <div className="admin-list-hero flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <span className="admin-command-eyebrow">Diagnóstico de Qualidade do Ar</span>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">Coletor INEA (Volta Redonda)</h1>
          <p className="mt-3 max-w-2xl text-base font-medium text-slate-300">
            Painel de controle, status de ingestão e validação metodológica dos índices e subíndices oficiais do INEA.
          </p>
        </div>
        <button 
          onClick={() => setShowManualModal(true)} 
          className="admin-command-cta bg-blue-600 hover:bg-blue-700 text-white"
        >
          Sincronizar Manualmente
        </button>
      </div>

      {/* Alert Banner for methodology */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-6 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-wider text-blue-900 flex items-center gap-2">
          <span>⚠️ Aviso Metodológico</span>
        </h3>
        <p className="mt-2 text-sm font-semibold text-blue-800 leading-relaxed">
          Os dados importados deste XLSX representam índices (IQA geral) e subíndices (por poluente) adimensionais de qualidade do ar, 
          conforme indicado pelas colunas originais do INEA (que começam com <span className="font-bold text-blue-950">"IQA"</span>). 
          Para evitar erros conceituais de engenharia de dados, estes registros são salvos **sem unidade de medida física** (µg/m³ ou ppm) 
          e categorizados de acordo com seu tipo metodológico.
        </p>
      </div>

      {/* Alert Banner if any issues */}
      {alerts.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-wider text-amber-800">Alertas de Dados Ausentes</h3>
          <ul className="mt-3 space-y-2">
            {alerts.map((alertText, idx) => (
              <li key={idx} className="text-sm font-semibold text-amber-700 flex items-start gap-2">
                <span className="text-amber-900">•</span>
                {alertText}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Ingest Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Card 1: Last Ingestion */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 flex flex-col justify-between shadow-sm">
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Última Ingestão</h4>
            {lastRun ? (
              <div className="mt-3">
                <span className={`inline-block rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                  lastRun.status === "success" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                }`}>
                  {lastRun.status === "success" ? "Sucesso" : "Falha"}
                </span>
                <p className="mt-2 text-sm font-bold text-slate-700">
                  Executada em: {new Date(lastRun.started_at).toLocaleString("pt-BR")}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {lastRun.rows_inserted} registros metodológicos processados.
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500 italic font-medium">Nenhuma ingestão registrada.</p>
            )}
          </div>
        </div>

        {/* Card 2: Stations Count */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 flex flex-col justify-between shadow-sm">
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Estações Ativas (INEA)</h4>
            <div className="mt-3">
              <span className="text-4xl font-black text-slate-800">{stations.length}</span>
              <p className="mt-2 text-sm font-bold text-slate-700">
                {stations.map(s => s.name).join(", ") || "Nenhuma cadastrada"}
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Pollutants */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 flex flex-col justify-between shadow-sm">
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Poluentes Monitorados</h4>
            <div className="mt-3">
              <p className="text-lg font-black text-slate-800">{getUniquePollutants()}</p>
              <p className="mt-2 text-xs text-slate-500">
                Identificados a partir das colunas de subíndice do XLSX do INEA.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stations Overview Table */}
      <div className="admin-table-shell overflow-hidden mt-8 shadow-sm">
        <h2 className="p-6 text-xl font-black text-slate-900 border-b border-slate-100">Status Metodológico das Estações</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th scope="col" className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Estação</th>
                <th scope="col" className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Índice IQAr</th>
                <th scope="col" className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Classificação</th>
                <th scope="col" className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Poluente Controlador</th>
                <th scope="col" className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Janela Operacional</th>
                <th scope="col" className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Última Atualização</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {stations.map((station) => {
                const lastAqi = getLastAqiByStation(station.id);
                const colorClass = lastAqi?.air_quality_classification 
                  ? CLASSIFICATION_COLORS[lastAqi.air_quality_classification.toUpperCase()] || "bg-slate-100 text-slate-600 border-slate-200"
                  : "bg-slate-100 text-slate-500 border-slate-200";

                return (
                  <tr key={station.id} className="transition-colors hover:bg-slate-50/50">
                    <td className="px-8 py-6 font-bold text-slate-950">{station.name}</td>
                    <td className="px-8 py-6 font-black text-2xl text-slate-800">
                      {lastAqi ? lastAqi.value : "-"}
                    </td>
                    <td className="px-8 py-6">
                      {lastAqi?.air_quality_classification ? (
                        <span className={`inline-block rounded-full border px-3 py-1 text-xs font-bold ${colorClass}`}>
                          {lastAqi.air_quality_classification}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Indisponível</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      {lastAqi?.controlling_pollutant ? (
                        <span className="rounded bg-blue-100 border border-blue-200 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                          {lastAqi.controlling_pollutant}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-xs font-semibold text-slate-500">
                      <div>
                        {station.operation_start_date
                          ? `${new Date(`${station.operation_start_date}T00:00:00`).toLocaleDateString("pt-BR")} - ${
                              station.operation_end_date
                                ? new Date(`${station.operation_end_date}T00:00:00`).toLocaleDateString("pt-BR")
                                : "aberta"
                            }`
                          : "não cadastrada"}
                      </div>
                      {station.operation_window_source && (
                        <div className="mt-1 text-[10px] text-slate-400">{station.operation_window_source}</div>
                      )}
                    </td>
                    <td className="px-8 py-6 text-xs font-semibold text-slate-500">
                      {lastAqi ? new Date(lastAqi.measured_at).toLocaleString("pt-BR") : "Sem dados"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Measurements Log */}
      <div className="admin-table-shell overflow-hidden mt-8 shadow-sm">
        <div className="p-6 border-b border-slate-100 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <h2 className="text-xl font-black text-slate-900">Registro Histórico</h2>
          
          <div className="flex flex-wrap gap-4">
            {/* Station Filter */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Estação:</label>
              <select 
                value={filterStation} 
                onChange={(e) => setFilterStation(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm"
              >
                <option value="">Todas</option>
                {stations.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Metric Type Filter */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Tipo de Métrica:</label>
              <select 
                value={filterMetricType} 
                onChange={(e) => setFilterMetricType(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm"
              >
                <option value="">Todos</option>
                <option value="GENERAL_AQI">Índice Geral (IQAr)</option>
                <option value="POLLUTANT_SUBINDEX">Subíndices de Poluentes</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 italic">Carregando dados...</div>
        ) : filteredMeasurements.length === 0 ? (
          <div className="p-12 text-center text-slate-400 italic">Nenhum dado correspondente encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th scope="col" className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Estação</th>
                  <th scope="col" className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Data/Hora</th>
                  <th scope="col" className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Métrica / Coluna Original</th>
                  <th scope="col" className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Valor / Índice</th>
                  <th scope="col" className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status / Classificação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredMeasurements.map((m) => {
                  const classification = m.air_quality_classification || m.quality_flag;
                  const colorClass = classification 
                    ? CLASSIFICATION_COLORS[classification.toUpperCase()] || "bg-slate-100 text-slate-600 border-slate-200"
                    : "bg-slate-100 text-slate-500 border-slate-200";

                  return (
                    <tr key={m.id} className="transition-colors hover:bg-slate-50/50 text-sm">
                      <td className="px-8 py-4 font-bold text-slate-900">{m.station_name}</td>
                      <td className="px-8 py-4 font-semibold text-slate-500">
                        {new Date(m.measured_at).toLocaleString("pt-BR")}
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700">
                            {m.metric_type === "GENERAL_AQI" ? "Índice IQAr Geral" : `Subíndice (${m.pollutant})`}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {m.raw_column}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-4 font-black text-slate-800 text-lg">
                        {m.value}
                      </td>
                      <td className="px-8 py-4">
                        {classification ? (
                          <span className={`inline-block rounded-full border px-3 py-0.5 text-xs font-bold ${colorClass}`}>
                            {classification}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                        {m.metric_type === "GENERAL_AQI" && m.controlling_pollutant && (
                          <span className="ml-2 text-xs font-semibold text-slate-500">
                            (Controlador: {m.controlling_pollutant})
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Ingestion Command Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl animate-in zoom-in duration-300">
            <h3 className="text-2xl font-black text-white">Sincronização Manual de Dados</h3>
            <p className="mt-4 text-sm font-medium text-slate-300">
              Para executar o processo de ingestão de dados oficiais do INEA (que lê o XLSX do Portal de Dados Abertos e atualiza o banco Supabase), execute o seguinte comando no servidor:
            </p>
            <div className="mt-4 rounded-2xl bg-slate-950 p-4 border border-slate-800 font-mono text-xs text-emerald-400 select-all cursor-pointer">
              npm run inea:backfill:methodology
            </div>
            <p className="mt-4 text-xs font-semibold text-slate-400">
              *Nota: Este comando executa a validação metodológica, o mapeamento de subíndices e o índice IQAr Geral. Sincronizações recorrentes são acionadas via CRON.
            </p>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowManualModal(false)}
                className="rounded-xl bg-slate-800 px-6 py-3 text-sm font-black uppercase tracking-wider text-slate-200 hover:bg-slate-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
