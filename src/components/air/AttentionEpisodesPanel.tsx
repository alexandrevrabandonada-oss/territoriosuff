import { useState } from 'react';
import { SurfaceCard } from '../BrandSystem';
import { ATTENTION_EPISODES, AttentionEpisode } from '../../data/air/attention-episodes-2020-2026';
import { SeasonalityHeatmap } from './SeasonalityHeatmap';

const STATIONS = [
  { id: "69", shortName: "Belmonte", name: "VR - Belmonte" },
  { id: "70", shortName: "Retiro", name: "VR - Retiro" },
  { id: "71", shortName: "Santa Cecília", name: "VR - Santa Cecília" }
];

const MONTH_NAMES: Record<string, string> = {
  "01": "Janeiro",
  "02": "Fevereiro",
  "03": "Março",
  "04": "Abril",
  "05": "Maio",
  "06": "Junho",
  "07": "Julho",
  "08": "Agosto",
  "09": "Setembro",
  "10": "Outubro",
  "11": "Novembro",
  "12": "Dezembro"
};

function formatMonthKey(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  return `${MONTH_NAMES[month]}/${year}`;
}

function formatDateTime(isoString: string | null): string {
  if (!isoString) return 'N/A';
  const [datePart, timePart] = isoString.split('T');
  const [year, month, day] = datePart.split('-');
  const hour = timePart.split(':')[0];
  return `${day}/${month}/${year} às ${hour}h`;
}

export function AttentionEpisodesPanel() {
  const [selectedPollutant, setSelectedPollutant] = useState<'PM10' | 'PM2.5'>('PM2.5');
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedStation, setSelectedStation] = useState<string>('all'); // 'all' | '69' | '70' | '71'
  const [selectedRegime, setSelectedRegime] = useState<'OMS' | 'CONAMA'>('OMS');

  // 1. Filter dataset for current selectors
  const filteredEpisodes = ATTENTION_EPISODES.filter(ep => {
    const matchesPollutant = ep.pollutant === selectedPollutant;
    const matchesYear = ep.year === selectedYear;
    const matchesStation = selectedStation === 'all' || ep.station_id === selectedStation;
    return matchesPollutant && matchesYear && matchesStation;
  });

  // Helper to resolve exceedance days based on active regime
  const getExceedanceDays = (ep: AttentionEpisode) => {
    return selectedRegime === 'OMS' ? ep.who_exceedance_days : ep.conama_exceedance_days;
  };

  // 2. Card 1: Mês com mais dias de atenção
  let worstMonthEpisode: AttentionEpisode | null = null;
  for (const ep of filteredEpisodes) {
    if (ep.coverage_percent < 30) continue; // skip invalid or low data quality months
    const val = getExceedanceDays(ep);
    if (!worstMonthEpisode || val > getExceedanceDays(worstMonthEpisode)) {
      worstMonthEpisode = ep;
    }
  }

  // 3. Card 2: Maior pico horário
  let maxPeakEpisode: AttentionEpisode | null = null;
  for (const ep of filteredEpisodes) {
    if (ep.max_hourly_value !== null && ep.max_hourly_value !== undefined) {
      if (!maxPeakEpisode || ep.max_hourly_value > (maxPeakEpisode.max_hourly_value || 0)) {
        maxPeakEpisode = ep;
      }
    }
  }

  // 4. Card 3: Estação com maior recorrência (in the active selection)
  // We sum exceedances by station
  const stationExceedanceSum: Record<string, { name: string; sum: number }> = {};
  for (const st of STATIONS) {
    stationExceedanceSum[st.id] = { name: st.shortName, sum: 0 };
  }
  for (const ep of filteredEpisodes) {
    stationExceedanceSum[ep.station_id].sum += getExceedanceDays(ep);
  }

  let mostRecurrentStationId = '69';
  let maxExceedanceSum = -1;
  for (const stId in stationExceedanceSum) {
    if (stationExceedanceSum[stId].sum > maxExceedanceSum) {
      maxExceedanceSum = stationExceedanceSum[stId].sum;
      mostRecurrentStationId = stId;
    }
  }
  const mostRecurrentStation = stationExceedanceSum[mostRecurrentStationId];

  // 5. Card 4: Onde a série fica mais frágil (Lowest coverage month)
  let lowestCoverageEpisode: AttentionEpisode | null = null;
  for (const ep of filteredEpisodes) {
    // Only flag if it has some missing data or is lowest
    if (!lowestCoverageEpisode || ep.coverage_percent < lowestCoverageEpisode.coverage_percent) {
      lowestCoverageEpisode = ep;
    }
  }

  return (
    <div id="painel-episodios-atencao" className="space-y-6">
      {/* Visual Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            Painel de Episódios de Atenção
          </h3>
          <p className="text-slate-500 text-xs mt-1">
            Explore os picos horários pontuais de concentração, a sazonalidade mensal e os períodos críticos na rede pública.
          </p>
        </div>

        {/* Action controls selectors */}
        <div className="flex flex-wrap gap-2.5">
          {/* Year buttons */}
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200/40">
            {[2020, 2021, 2022, 2023, 2024, 2025, 2026].map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${selectedYear === yr ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {yr}{yr === 2026 ? "*" : ""}
              </button>
            ))}
          </div>

          {/* Pollutant buttons */}
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200/40">
            {(['PM10', 'PM2.5'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPollutant(p)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${selectedPollutant === p ? 'bg-brand-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Station selector */}
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200/40">
            <button
              onClick={() => setSelectedStation('all')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${selectedStation === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Comparar Todas
            </button>
            {STATIONS.map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStation(st.id)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${selectedStation === st.id ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {st.shortName}
              </button>
            ))}
          </div>

          {/* Exceedance Regime selector */}
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200/40">
            <button
              onClick={() => setSelectedRegime('OMS')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${selectedRegime === 'OMS' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              OMS 24h
            </button>
            <button
              onClick={() => setSelectedRegime('CONAMA')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${selectedRegime === 'CONAMA' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              CONAMA 506
            </button>
          </div>
        </div>
      </div>

      {selectedYear === 2026 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl p-3.5 flex items-start gap-2.5 animate-pulse">
          <span className="text-amber-500 font-bold shrink-0 mt-0.5">⚠️</span>
          <div>
            <strong>Ano parcial/em andamento (acumulado até maio de 2026):</strong> Os indicadores de 2026 representam apenas os dados parciais disponíveis e não devem ser comparados com anos completos fechados.
          </div>
        </div>
      )}

      {selectedYear === 2020 && selectedPollutant === 'PM2.5' && (
        <div className="bg-slate-50 border border-slate-200 text-slate-600 text-xs rounded-xl p-3.5 flex items-start gap-2.5">
          <span className="text-slate-400 font-bold shrink-0 mt-0.5">ℹ️</span>
          <div>
            <strong>Sensor PM2.5 indisponível em 2020:</strong> A medição de PM2.5 não existia fisicamente na rede de monitoramento de Volta Redonda em 2020. Os rankings abaixo mostram ausência total de dados para este período.
          </div>
        </div>
      )}

      {/* Narrative block header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 rounded-2xl shadow-sm space-y-2">
        <h4 className="text-base font-bold">Quando o ar exige mais atenção?</h4>
        <p className="text-xs text-slate-350 leading-relaxed max-w-3xl">
          Em vez de olhar só a média anual, este painel mostra os meses, dias e picos horários em que PM10 e PM2.5 chamaram mais atenção nas estações de Volta Redonda.
        </p>
      </div>

      {/* 4 Rankings/Didactic Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Mês com mais dias de atenção */}
        <SurfaceCard className="p-4.5 bg-white border border-slate-100 rounded-xl flex flex-col justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest block">Sazonalidade Crítica</span>
            <h5 className="font-bold text-slate-800 text-xs">Mês com mais dias de atenção</h5>
          </div>
          <div className="mt-3.5 space-y-1">
            {worstMonthEpisode && getExceedanceDays(worstMonthEpisode) > 0 ? (
              <>
                <div className="text-lg font-black text-rose-600 leading-tight">
                  {getExceedanceDays(worstMonthEpisode)} dias
                </div>
                <div className="text-[10px] text-slate-600 font-semibold leading-relaxed">
                  Em <span className="text-slate-900 font-bold">{formatMonthKey(worstMonthEpisode.month)}</span>
                  {selectedStation === 'all' && <> na estação <span className="text-slate-900 font-bold">{worstMonthEpisode.station_name.replace('VR - ', '')}</span></>}
                  <br/>
                  (Régua {selectedRegime})
                </div>
              </>
            ) : (
              <div className="text-[10px] text-slate-450 italic py-2">Nenhum evento registrado no período.</div>
            )}
          </div>
        </SurfaceCard>

        {/* Card 2: Maior pico horário */}
        <SurfaceCard className="p-4.5 bg-white border border-slate-100 rounded-xl flex flex-col justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest block">Intensidade Elevada</span>
            <h5 className="font-bold text-slate-800 text-xs">Maior pico horário</h5>
          </div>
          <div className="mt-3.5 space-y-1">
            {maxPeakEpisode && maxPeakEpisode.max_hourly_value !== null ? (
              <>
                <div className="text-lg font-black text-indigo-600 leading-tight">
                  {maxPeakEpisode.max_hourly_value.toFixed(1)} µg/m³
                </div>
                <div className="text-[10px] text-slate-600 font-semibold leading-relaxed">
                  Em <span className="text-slate-900 font-bold">{formatDateTime(maxPeakEpisode.max_hourly_at)}</span>
                  {selectedStation === 'all' && <> na estação <span className="text-slate-900 font-bold">{maxPeakEpisode.station_name.replace('VR - ', '')}</span></>}
                  <br/>
                  <span className="text-slate-450 text-[9px] italic">(pico horário pontual de concentração)</span>
                </div>
              </>
            ) : (
              <div className="text-[10px] text-slate-450 italic py-2">Sem pico horário registrado.</div>
            )}
          </div>
        </SurfaceCard>

        {/* Card 3: Estação com maior recorrência */}
        <SurfaceCard className="p-4.5 bg-white border border-slate-100 rounded-xl flex flex-col justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest block">Recorrência Espacial</span>
            <h5 className="font-bold text-slate-800 text-xs">Maior recorrência</h5>
          </div>
          <div className="mt-3.5 space-y-1">
            {maxExceedanceSum > 0 ? (
              <>
                <div className="text-lg font-black text-amber-600 leading-tight">
                  {maxExceedanceSum} dias
                </div>
                <div className="text-[10px] text-slate-600 font-semibold leading-relaxed">
                  Na estação <span className="text-slate-900 font-bold">{mostRecurrentStation.name}</span>
                  <br/>
                  Acumulado de {selectedYear} ({selectedRegime})
                </div>
              </>
            ) : (
              <div className="text-[10px] text-slate-450 italic py-2">Nenhuma ultrapassagem registrada no período.</div>
            )}
          </div>
        </SurfaceCard>

        {/* Card 4: Onde a série fica mais frágil */}
        <SurfaceCard className="p-4.5 bg-white border border-slate-100 rounded-xl flex flex-col justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest block">Integridade de Dados</span>
            <h5 className="font-bold text-slate-800 text-xs">Série mais frágil</h5>
          </div>
          <div className="mt-3.5 space-y-1">
            {lowestCoverageEpisode ? (
              <>
                <div className="text-lg font-black text-slate-700 leading-tight">
                  {lowestCoverageEpisode.coverage_percent.toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-600 font-semibold leading-relaxed">
                  Cobertura em <span className="text-slate-900 font-bold">{formatMonthKey(lowestCoverageEpisode.month)}</span>
                  {selectedStation === 'all' && <> na estação <span className="text-slate-900 font-bold">{lowestCoverageEpisode.station_name.replace('VR - ', '')}</span></>}
                  <br/>
                  <span className="text-rose-500 font-bold">Ausência de dado não representa ar bom.</span>
                </div>
              </>
            ) : (
              <div className="text-[10px] text-slate-450 italic py-2">Sem dados de cobertura.</div>
            )}
          </div>
        </SurfaceCard>
      </div>

      {/* Heatmap Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <span className="w-1.5 h-3 rounded-full bg-slate-400"></span>
          Matriz de Concentração Mensal de Eventos
        </h4>
        <SeasonalityHeatmap
          selectedPollutant={selectedPollutant}
          selectedYear={selectedYear}
          selectedRegime={selectedRegime}
          selectedStation={selectedStation}
        />
      </div>

      {/* Narrativas Editoriais (2x2 grid) */}
      <div className="grid gap-4 sm:grid-cols-2">
        <SurfaceCard className={`p-4 border rounded-xl transition-all ${selectedStation === "69" ? 'border-rose-300 bg-rose-50/10' : 'border-slate-100 bg-white'}`}>
          <h5 className="font-bold text-slate-800 text-sm mb-1.5">VR - Belmonte</h5>
          <p className="text-slate-600 text-xs leading-relaxed">
            <strong>Belmonte aparece com maior recorrência de atenção em vários recortes.</strong> Esta estação acumula com frequência a maior contagem de dias com médias elevadas, sofrendo o impacto cumulativo de episódios prolongados de exposição.
          </p>
        </SurfaceCard>

        <SurfaceCard className={`p-4 border rounded-xl transition-all ${selectedStation === "70" ? 'border-indigo-300 bg-indigo-50/10' : 'border-slate-100 bg-white'}`}>
          <h5 className="font-bold text-slate-800 text-sm mb-1.5">VR - Retiro</h5>
          <p className="text-slate-600 text-xs leading-relaxed">
            <strong>Retiro registra picos pontuais relevantes, especialmente em PM2.5.</strong> Devido a picos horários pontuais de concentração de particulados finos, esta estação exibe episódios severos que chamam atenção mesmo em meses de média geral mais amena.
          </p>
        </SurfaceCard>

        <SurfaceCard className={`p-4 border rounded-xl transition-all ${selectedStation === "71" ? 'border-teal-300 bg-teal-50/10' : 'border-slate-100 bg-white'}`}>
          <h5 className="font-bold text-slate-800 text-sm mb-1.5">VR - Santa Cecília</h5>
          <p className="text-slate-600 text-xs leading-relaxed">
            <strong>Santa Cecília tem médias menores, mas não ausência de episódios.</strong> A topografia local e ventos podem suavizar a exposição recorrente, mas a estação ainda capta dias específicos de atenção acima das recomendações internacionais da OMS.
          </p>
        </SurfaceCard>

        <SurfaceCard className="p-4 border border-slate-100 bg-white rounded-xl">
          <h5 className="font-bold text-slate-800 text-sm mb-1.5">Sazonalidade e Meteorologia</h5>
          <p className="text-slate-600 text-xs leading-relaxed">
            <strong>Meses de estiagem e inverno merecem atenção especial.</strong> O calor e a seca prolongada, ou a inversão térmica no meio do ano, concentram historicamente a grande parte dos episódios de atenção, agravados pela falta de dispersão atmosférica.
          </p>
        </SurfaceCard>
      </div>

      {/* Safety block of Metodologia & Freshness */}
      <div className="bg-slate-50 border border-slate-150 p-4.5 rounded-2xl text-slate-500 text-[11px] leading-relaxed space-y-2.5">
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <span className="w-2 h-2 rounded-full bg-slate-400" />
          Salvaguardas Metodológicas e Notas Técnicas
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2 text-[10px]">
          <div>
            • <strong>Comparação Experimental:</strong> As comparações com OMS e CONAMA 506 são experimentais por natureza, servindo de indicação de episódios sob atenção em base de dados secundária.
          </div>
          <div>
            • <strong>Sem QA/QC Oficial de Origem:</strong> Os dados públicos da plataforma WebLakes são disponibilizados sem flags técnicas explícitas detalhadas de controle de qualidade e calibração de sensores de monitoramento de origem.
          </div>
          <div>
            • <strong>Ausência de Dado Não Representa Ar Bom:</strong> A integridade das medições varia mês a mês. Lacunas nas séries temporais impedem a avaliação em certos períodos (a ausência de dado não representa ar bom).
          </div>
          <div>
            • <strong>Exposição Periódica:</strong> As leituras resumem a exposição histórica acumulada no período e não representam monitoramento ao vivo ou leitura minuto a minuto.
          </div>
        </div>
        <div className="border-t border-slate-200/60 pt-2 font-mono text-[9px] text-slate-450 text-right">
          Selo Metodológico: Dado horário público WebLakes — comparação experimental — sem QA/QC oficial explícito
        </div>
      </div>
    </div>
  );
}
