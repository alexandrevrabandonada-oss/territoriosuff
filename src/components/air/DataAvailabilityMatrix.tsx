import { useEffect, useMemo, useState } from "react";
import { loadAvailabilityMatrix, type AvailabilityEntry } from "../../lib/air/availabilityMatrixLoader";
import { SurfaceCard } from "../BrandSystem";

const STATIONS = [
  { id: "69", name: "VR - Belmonte" },
  { id: "70", name: "VR - Retiro" },
  { id: "71", name: "VR - Santa Cecília" },
  { id: "72", name: "VR - Meteorológica Ilha das Águas Cruas" }
];

const POLLUTANTS = ["PM10", "PM2.5", "SO2", "NO2", "O3", "CO", "PTS"];

const YEARS = [
  2026, 2025, 2024, 2023, 2022, 2021, 2020,
  2019, 2018, 2017, 2016, 2015, 2014, 2013
];

const STATUS_CONFIG: Record<string, { label: string; colorClass: string; bgClass: string; borderClass: string; textClass: string }> = {
  AVAILABLE: {
    label: "Disponível (Todas as janelas)",
    colorClass: "bg-emerald-500",
    bgClass: "bg-emerald-50/70",
    borderClass: "border-emerald-500/25",
    textClass: "text-emerald-700"
  },
  LIKELY_AVAILABLE: {
    label: "Disponível Provável (Janelas parciais)",
    colorClass: "bg-teal-500",
    bgClass: "bg-teal-50/70",
    borderClass: "border-teal-500/25",
    textClass: "text-teal-700"
  },
  PARTIAL: {
    label: "Parcialmente Disponível",
    colorClass: "bg-amber-500",
    bgClass: "bg-amber-50/70",
    borderClass: "border-amber-500/25",
    textClass: "text-amber-700"
  },
  EMPTY: {
    label: "Vazio (Sem dados)",
    colorClass: "bg-slate-300",
    bgClass: "bg-slate-50",
    borderClass: "border-slate-300/20",
    textClass: "text-slate-500"
  },
  ERROR: {
    label: "Erro de Conexão/Plataforma",
    colorClass: "bg-rose-500",
    bgClass: "bg-rose-50/70",
    borderClass: "border-rose-500/25",
    textClass: "text-rose-700"
  },
  UNIT_REVIEW: {
    label: "Revisar Unidade de Medida",
    colorClass: "bg-indigo-500",
    bgClass: "bg-indigo-50/70",
    borderClass: "border-indigo-500/25",
    textClass: "text-indigo-700"
  },
  PARSER_REVIEW: {
    label: "Erro de Parsing de Dados",
    colorClass: "bg-violet-500",
    bgClass: "bg-violet-50/70",
    borderClass: "border-violet-500/25",
    textClass: "text-violet-700"
  }
};

export function DataAvailabilityMatrix() {
  const [selectedStation, setSelectedStation] = useState("70");
  const [selectedCell, setSelectedCell] = useState<AvailabilityEntry | null>(null);
  const [entries, setEntries] = useState<AvailabilityEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);

  useEffect(() => {
    let cancelled = false;

    loadAvailabilityMatrix()
      .then((data) => {
        if (!cancelled) {
          setEntries(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEntries([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingEntries(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const entriesByStationYearPollutant = useMemo(
    () => new Map(entries.map((entry) => [`${entry.station_id}:${entry.year}:${entry.pollutant}`, entry] as const)),
    [entries]
  );

  const getCellData = (year: number, pollutant: string): AvailabilityEntry | undefined => {
    return entriesByStationYearPollutant.get(`${selectedStation}:${year}:${pollutant}`);
  };

  const handleCellClick = (entry: AvailabilityEntry | undefined) => {
    if (entry) {
      setSelectedCell(entry);
    }
  };

  return (
    <SurfaceCard className="p-6 bg-white border border-slate-100 rounded-3xl space-y-6 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-base font-black text-slate-800 uppercase tracking-wider">Matriz Amostral de Disponibilidade</h3>
          <p className="text-xs text-slate-400 mt-1 font-semibold">
            Status dos dados históricos exibidos na base pública INEA/WebLakes em testes de janelas pontuais.
          </p>
        </div>
        
        {/* Selector */}
        <div className="w-full md:w-auto">
          <label htmlFor="station-selector" className="sr-only">Selecione a Estação</label>
          <select
            id="station-selector"
            value={selectedStation}
            onChange={(e) => {
              setSelectedStation(e.target.value);
              setSelectedCell(null);
            }}
            className="w-full md:w-72 px-4 py-2 border border-slate-200 rounded-xl text-xs font-black text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          >
            {STATIONS.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loadingEntries ? (
        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-8 text-center text-sm font-semibold text-slate-500">
          Carregando matriz amostral de disponibilidade...
        </div>
      ) : (
        <>
      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Grid Table */}
        <div className="overflow-x-auto border border-slate-100 rounded-2xl bg-slate-50/50 p-4">
          <table className="min-w-full text-center border-collapse">
            <thead>
              <tr>
                <th className="px-2 py-3 text-[10px] font-black uppercase text-slate-400 text-left">Ano</th>
                {POLLUTANTS.map((poll) => (
                  <th key={poll} className="px-1 py-3 text-[10px] font-black uppercase text-slate-400 text-center">
                    {poll}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {YEARS.map((year) => (
                <tr key={year} className="hover:bg-slate-100/50 transition-colors">
                  <td className="px-2 py-2 text-xs font-black text-slate-700 text-left border-t border-slate-100">
                    {year}
                  </td>
                  {POLLUTANTS.map((poll) => {
                    const entry = getCellData(year, poll);
                    const status = entry?.estimated_availability || "EMPTY";
                    const config = STATUS_CONFIG[status] || STATUS_CONFIG.EMPTY;
                    const isSelected = selectedCell &&
                      selectedCell.year === year &&
                      selectedCell.pollutant === poll;

                    return (
                      <td key={poll} className="px-1 py-2 border-t border-slate-100 text-center">
                        <button
                          onClick={() => handleCellClick(entry)}
                          title={`${poll} (${year}): ${config.label}`}
                          className={`h-7 w-7 sm:h-9 sm:w-9 rounded-lg mx-auto flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary ${config.colorClass} ${
                            isSelected ? "ring-4 ring-offset-2 ring-slate-800 scale-110 shadow-md" : "hover:scale-105 hover:shadow-sm"
                          }`}
                          aria-label={`${poll} em ${year}: ${config.label}`}
                        >
                          <span className="sr-only">{config.label}</span>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Details Card */}
        <div className="space-y-4">
          {selectedCell ? (
            <div className={`p-5 rounded-2xl border ${STATUS_CONFIG[selectedCell.estimated_availability].borderClass} ${STATUS_CONFIG[selectedCell.estimated_availability].bgClass} space-y-3.5`}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-black text-slate-800">{selectedCell.pollutant}</h4>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{selectedCell.year} · {selectedCell.station_name}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${STATUS_CONFIG[selectedCell.estimated_availability].colorClass} text-white`}>
                  {selectedCell.estimated_availability}
                </span>
              </div>

              <div className="space-y-2 text-xs font-semibold text-slate-600">
                <p className="text-[11px] leading-relaxed italic text-slate-700">
                  {selectedCell.notes}
                </p>
                <div className="pt-2 border-t border-slate-200/50 space-y-1.5 font-medium text-slate-500">
                  <div className="flex justify-between">
                    <span>Amostras com dados:</span>
                    <strong className="text-slate-700">{selectedCell.windows_with_data} de {selectedCell.sampled_windows}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Unidade Detectada:</span>
                    <strong className="text-slate-700">{selectedCell.unit_detected || "N/A"}</strong>
                  </div>
                  {selectedCell.min_sample_value !== null && (
                    <div className="flex justify-between">
                      <span>Valor Mínimo Amostra:</span>
                      <strong className="text-slate-700">{selectedCell.min_sample_value.toFixed(2)}</strong>
                    </div>
                  )}
                  {selectedCell.max_sample_value !== null && (
                    <div className="flex justify-between">
                      <span>Valor Máximo Amostra:</span>
                      <strong className="text-slate-700">{selectedCell.max_sample_value.toFixed(2)}</strong>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Registros de Zeros:</span>
                    <strong className="text-slate-700">{selectedCell.zeros_count}</strong>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50 text-center text-xs font-semibold text-slate-400 space-y-2">
              <svg className="h-8 w-8 text-slate-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>Selecione um bloco da matriz para visualizar o detalhamento das amostras físicas.</p>
            </div>
          )}

          {/* Color Legend */}
          <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Legenda de Status</h4>
            <div className="space-y-2">
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <div key={key} className="flex items-center gap-2.5 text-[11px] font-semibold text-slate-600">
                  <span className={`h-4.5 w-4.5 rounded-md ${config.colorClass} shrink-0`} />
                  <span>{config.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Warning text */}
      <div className="p-4 bg-blue-50/50 border border-blue-500/10 rounded-2xl text-xs text-blue-700 leading-relaxed font-semibold">
        <strong>Nota Regulamentar:</strong> Esta matriz mostra disponibilidade amostral pontual de dados e foi estruturada apenas como indicação cívica experimental do portal. Não substitui e não invalida o processo de coleta histórica integral do Observatório do Ar.
      </div>
        </>
      )}
    </SurfaceCard>
  );
}
