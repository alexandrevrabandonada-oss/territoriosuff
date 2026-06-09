import { ATTENTION_EPISODES } from '../../data/air/attention-episodes-2020-2026';

interface SeasonalityHeatmapProps {
  selectedPollutant: 'PM10' | 'PM2.5';
  selectedYear: number;
  selectedRegime: 'OMS' | 'CONAMA';
  selectedStation: string; // "69" | "70" | "71" | "all"
}

const STATIONS = [
  { id: "69", shortName: "Belmonte", name: "VR - Belmonte" },
  { id: "70", shortName: "Retiro", name: "VR - Retiro" },
  { id: "71", shortName: "Santa Cecília", name: "VR - Santa Cecília" }
];

const MONTHS = [
  { id: "01", name: "Jan" },
  { id: "02", name: "Fev" },
  { id: "03", name: "Mar" },
  { id: "04", name: "Abr" },
  { id: "05", name: "Mai" },
  { id: "06", name: "Jun" },
  { id: "07", name: "Jul" },
  { id: "08", name: "Ago" },
  { id: "09", name: "Set" },
  { id: "10", name: "Out" },
  { id: "11", name: "Nov" },
  { id: "12", name: "Dez" }
];

export function SeasonalityHeatmap({
  selectedPollutant,
  selectedYear,
  selectedRegime,
  selectedStation
}: SeasonalityHeatmapProps) {
  
  // Helpers to fetch data
  const getCellData = (stationId: string, monthId: string) => {
    const monthKey = `${selectedYear}-${monthId}`;
    return ATTENTION_EPISODES.find(
      ep =>
        ep.year === selectedYear &&
        ep.pollutant === selectedPollutant &&
        ep.station_id === stationId &&
        ep.month === monthKey
    );
  };

  const getColorClass = (exceedDays: number, isLowCoverage: boolean, regime: 'OMS' | 'CONAMA') => {
    if (isLowCoverage) {
      return "bg-slate-100 text-slate-400 border border-slate-200 border-dashed";
    }
    if (exceedDays === 0) {
      return "bg-slate-50 text-slate-400 border border-slate-100";
    }

    if (regime === 'OMS') {
      if (exceedDays <= 2) return "bg-rose-50 text-rose-700 border border-rose-100";
      if (exceedDays <= 5) return "bg-rose-100 text-rose-800 border border-rose-200";
      if (exceedDays <= 10) return "bg-rose-300 text-rose-950 border border-rose-400";
      if (exceedDays <= 15) return "bg-rose-500 text-white border border-rose-600";
      return "bg-rose-700 text-white border border-rose-800";
    } else {
      if (exceedDays <= 2) return "bg-amber-50 text-amber-700 border border-amber-100";
      if (exceedDays <= 5) return "bg-amber-100 text-amber-800 border border-amber-200";
      if (exceedDays <= 10) return "bg-amber-300 text-amber-950 border border-amber-400";
      if (exceedDays <= 15) return "bg-amber-500 text-white border border-amber-600";
      return "bg-amber-700 text-white border border-amber-800";
    }
  };

  return (
    <div className="space-y-4">
      {/* Visual Heatmap Grid */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="min-w-[640px]">
          {/* Header row: Months */}
          <div className="grid grid-cols-[120px_repeat(12,_1fr)] gap-2 border-b border-slate-100 pb-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estação</span>
            {MONTHS.map(m => (
              <span key={m.id} className="text-center text-[10px] font-black text-slate-500 uppercase tracking-wider">
                {m.name}
              </span>
            ))}
          </div>

          {/* Station Rows */}
          <div className="space-y-3 pt-3">
            {STATIONS.map(st => {
              const isRowHighlighted = selectedStation === "all" || selectedStation === st.id;

              return (
                <div
                  key={st.id}
                  className={`grid grid-cols-[120px_repeat(12,_1fr)] gap-2 items-center p-1 rounded-xl transition-all ${
                    isRowHighlighted ? 'opacity-100 bg-slate-50/20' : 'opacity-40 hover:opacity-75'
                  }`}
                >
                  {/* Station Label */}
                  <span className="text-xs font-bold text-slate-700 truncate pr-2">
                    {st.shortName}
                  </span>

                  {/* Heatmap Cells */}
                  {MONTHS.map(m => {
                    const cell = getCellData(st.id, m.id);
                    const exceedDays = cell
                      ? (selectedRegime === 'OMS' ? cell.who_exceedance_days : cell.conama_exceedance_days)
                      : 0;
                    const isLowCoverage = cell ? cell.coverage_percent < 30 : true;
                    const colorClass = getColorClass(exceedDays, isLowCoverage, selectedRegime);

                    return (
                      <div
                        key={m.id}
                        className={`group relative h-10 rounded-lg flex flex-col justify-center items-center transition-all duration-300 font-mono text-xs font-bold ${colorClass}`}
                      >
                        {/* Day count or N/A */}
                        <span>
                          {isLowCoverage ? "N/A" : exceedDays}
                        </span>

                        {/* Hover Tooltip */}
                        <div className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-slate-800 text-white text-[9px] rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 shadow-md leading-relaxed">
                          <div className="font-sans font-bold text-slate-200 border-b border-slate-700 pb-1 mb-1">
                            {st.shortName} — {m.name}/{selectedYear}
                          </div>
                          <div>Poluente: <span className="font-bold text-white">{selectedPollutant}</span></div>
                          <div>Régua: <span className="font-bold text-white">{selectedRegime === 'OMS' ? 'OMS (24h)' : 'CONAMA 506 (24h)'}</span></div>
                          {isLowCoverage ? (
                            <div className="text-amber-300 font-bold mt-1">Dados Insuficientes (cobertura &lt; 30%)</div>
                          ) : (
                            <>
                              <div>Dias de atenção: <span className="font-bold text-white">{exceedDays} dias</span></div>
                              {cell?.max_hourly_value !== null && cell?.max_hourly_value !== undefined && (
                                <div className="mt-1 border-t border-slate-700/60 pt-1 text-slate-300">
                                  Pico horário pontual:<br/>
                                  <span className="font-mono text-white">{cell.max_hourly_value.toFixed(1)} µg/m³</span>
                                </div>
                              )}
                              <div className="text-slate-400 text-[8px] mt-0.5">{cell?.validation_note}</div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend Block */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100 text-[10px]">
        {/* Caption */}
        <p className="text-slate-500 font-semibold italic max-w-lg">
          “Esta matriz ajuda a enxergar em quais meses os eventos de atenção se concentraram. A leitura é experimental e depende da cobertura pública disponível.”
        </p>

        {/* Legend Scale */}
        <div className="flex items-center gap-1.5 font-mono">
          <span className="text-slate-400 mr-1.5 font-sans font-bold">Dias acima da régua:</span>
          
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 rounded bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-slate-400">0</span>
            <span className="text-slate-400 text-[8px] mr-1">0</span>
          </div>

          <div className="flex items-center gap-1">
            <span className={`w-4 h-4 rounded border flex items-center justify-center font-bold ${selectedRegime === 'OMS' ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>+</span>
            <span className="text-slate-400 text-[8px] mr-1">1-2</span>
          </div>

          <div className="flex items-center gap-1">
            <span className={`w-4 h-4 rounded border flex items-center justify-center font-bold ${selectedRegime === 'OMS' ? 'bg-rose-100 border-rose-200 text-rose-800' : 'bg-amber-100 border-amber-200 text-amber-800'}`}>++</span>
            <span className="text-slate-400 text-[8px] mr-1">3-5</span>
          </div>

          <div className="flex items-center gap-1">
            <span className={`w-4 h-4 rounded border flex items-center justify-center font-bold ${selectedRegime === 'OMS' ? 'bg-rose-300 border-rose-400 text-rose-950' : 'bg-amber-300 border-amber-400 text-amber-950'}`}>+++</span>
            <span className="text-slate-400 text-[8px] mr-1">6-10</span>
          </div>

          <div className="flex items-center gap-1">
            <span className={`w-4 h-4 rounded border flex items-center justify-center font-bold ${selectedRegime === 'OMS' ? 'bg-rose-500 border-rose-600 text-white' : 'bg-amber-500 border-amber-600 text-white'}`}>++++</span>
            <span className="text-slate-400 text-[8px] mr-1">11-15</span>
          </div>

          <div className="flex items-center gap-1">
            <span className={`w-4 h-4 rounded border flex items-center justify-center font-bold ${selectedRegime === 'OMS' ? 'bg-rose-700 border-rose-800 text-white' : 'bg-amber-700 border-amber-800 text-white'}`}>Max</span>
            <span className="text-slate-400 text-[8px]">16+</span>
          </div>

          <div className="flex items-center gap-1 ml-2 border-l border-slate-200 pl-3">
            <span className="w-4 h-4 rounded bg-slate-100 border border-slate-200 border-dashed flex items-center justify-center font-bold text-slate-400">N/A</span>
            <span className="text-slate-400 font-sans font-bold">&lt;30%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
