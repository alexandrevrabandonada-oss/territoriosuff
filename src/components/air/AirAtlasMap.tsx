import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { SITES, PARAMETERS } from '../../lib/inea/weblakesDictionary';
import summary2020 from '../../../data/inea_weblakes_normalized/summary-2020.json';
import summary2021 from '../../../data/inea_weblakes_normalized/summary-2021.json';
import summary2022 from '../../../data/inea_weblakes_normalized/summary-2022.json';
import summary2023 from '../../../data/inea_weblakes_normalized/summary-2023.json';
import summary2024 from '../../../data/inea_weblakes_normalized/summary-2024.json';
import summary2025 from '../../../data/inea_weblakes_normalized/summary-2025.json';
import summary2026 from '../../../data/inea_weblakes_normalized/summary-2026.json';

const SUMMARIES: Record<string, any> = {
  "2020": summary2020,
  "2021": summary2021,
  "2022": summary2022,
  "2023": summary2023,
  "2024": summary2024,
  "2025": summary2025,
  "2026": summary2026
};

// Fix Leaflet icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Coordinates for Leaflet map markers
const STATION_COORDINATES: Record<string, { lat: number; lng: number; desc: string }> = {
  "69": { lat: -22.517677, lng: -44.13254, desc: "Bairro residencial Belmonte, divisa municipal." },
  "70": { lat: -22.502349, lng: -44.12281, desc: "Avenida Jaraguá (Retiro), área densamente habitada." },
  "71": { lat: -22.52253, lng: -44.106564, desc: "Vila Santa Cecília, polo comercial e central." },
  "72": { lat: -22.4925, lng: -44.0812, desc: "Ilha das Águas Cruas, estação meteorológica." }
};


const MONTH_NAMES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

// Helper to render customized DivIcon to color-code based on value
function createCustomMarkerIcon(color: string, label: string) {
  return new L.DivIcon({
    html: `<div style="background-color: ${color}; border: 2px solid white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);" title="${label}"></div>`,
    className: 'custom-map-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
}

export function AirAtlasMap() {
  const [selectedYear, setSelectedYear] = useState<string>("2024");
  const [selectedPollutant, setSelectedPollutant] = useState<string>("18"); // PM10
  const [selectedMonth, setSelectedMonth] = useState<string>("ALL"); // Default ALL
  const [selectedMetric, setSelectedMetric] = useState<string>("mean"); // mean, max, coveragePct, zeroHours, exceedances
  const [selectedRegime, setSelectedRegime] = useState<'OMS' | 'BR'>('OMS');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [compareStationA, setCompareStationA] = useState<string>("70");
  const [compareStationB, setCompareStationB] = useState<string>("71");

  // Reset month when year changes, and redirect PM2.5 in 2020
  useEffect(() => {
    setSelectedMonth("ALL");
    if (selectedYear === "2020" && selectedPollutant === "20") {
      setSelectedPollutant("18");
    }
  }, [selectedYear, selectedPollutant]);

  // Play timeline animation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setSelectedMonth(current => {
          if (current === "ALL") return `${selectedYear}-01`;
          const m = parseInt(current.split("-")[1]);
          if (m >= 12) return "ALL";
          return `${selectedYear}-${String(m + 1).padStart(2, '0')}`;
        });
      }, 2000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, selectedYear]);

  const pollutantInfo = PARAMETERS[selectedPollutant] || { pollutant: "PM10", unit: "µg/m³" };

  // Color logic for map markers based on regime and values
  const getMarkerColorAndStatus = (val: number | null, metric: string, pollutant: string, regime: 'OMS' | 'BR') => {
    if (val === null) return { color: '#9CA3AF', status: 'Sem Dados' }; // gray

    if (metric === 'coveragePct') {
      if (val >= 90) return { color: '#10B981', status: 'Excelente' }; // green
      if (val >= 75) return { color: '#3B82F6', status: 'Aceitável' }; // blue
      return { color: '#EF4444', status: 'Crítico (Baixa Cobertura)' }; // red
    }

    if (metric === 'gaps' || metric === 'zeroHours') {
      if (val === 0) return { color: '#10B981', status: 'Nenhuma' };
      if (val < 24) return { color: '#F59E0B', status: 'Leve' };
      return { color: '#EF4444', status: 'Significativo' };
    }

    if (metric === 'exceedances_who' || metric === 'exceedances_br') {
      if (val === 0) return { color: '#10B981', status: '0 Excedências' };
      if (val < 5) return { color: '#F59E0B', status: 'Episódios Isolados' };
      return { color: '#EF4444', status: 'Alta Frequência' };
    }

    // Default for mean/max concentration
    if (pollutant === "18") { // PM10
      const limit = regime === 'OMS' ? 45 : 50; // WHO 45 vs CONAMA 50
      if (val > limit) return { color: '#EF4444', status: 'Excedeu Limite' }; // red
      if (val > limit * 0.7) return { color: '#F59E0B', status: 'Atenção' }; // orange
      return { color: '#10B981', status: 'Dentro da Referência' }; // green
    }

    if (pollutant === "20") { // PM2.5
      const limit = regime === 'OMS' ? 15 : 25;
      if (val > limit) return { color: '#EF4444', status: 'Excedeu Limite' };
      if (val > limit * 0.7) return { color: '#F59E0B', status: 'Atenção' };
      return { color: '#10B981', status: 'Dentro da Referência' };
    }

    if (pollutant === "3") { // CO
      const limit = 9.0; // 9 ppm
      if (val > limit) return { color: '#EF4444', status: 'Excedeu Limite' };
      return { color: '#10B981', status: 'Dentro da Referência' };
    }

    // Default fallback
    return { color: '#3B82F6', status: 'Ativo' }; // blue
  };

  // Compile stations data for current selections
  const mapData = useMemo(() => {
    const result: Record<string, {
      id: string;
      name: string;
      lat: number;
      lng: number;
      desc: string;
      value: number | null;
      unit: string;
      coveragePct: number;
      zeroHours: number;
      totalHours: number;
      exceedancesWho: number;
      exceedancesBr: number;
      mean: number | null;
      max: number | null;
      color: string;
      status: string;
      tier: string;
    }> = {};

    const summaryCast = SUMMARIES[selectedYear] as any;

    for (const stationId of ["69", "70", "71", "72"]) {
      const coords = STATION_COORDINATES[stationId] || { lat: -22.5, lng: -44.1, desc: "" };
      const stationSummary = summaryCast[stationId]?.pollutants[selectedPollutant];

      let value: number | null = null;
      let coveragePct = 0;
      let zeroHours = 0;
      let exceedancesWho = 0;
      let exceedancesBr = 0;
      let totalHours = 0;
      let mean: number | null = null;
      let max: number | null = null;

      if (stationSummary) {
        if (selectedMonth === "ALL") {
          totalHours = stationSummary.totalHours;
          coveragePct = stationSummary.coveragePct;
          zeroHours = stationSummary.zeroHours;
          exceedancesWho = stationSummary.exceedances?.WHO_24H || 0;
          exceedancesBr = stationSummary.exceedances?.BR_24H_FINAL || 0;
          mean = stationSummary.mean;
          max = stationSummary.max;

          if (selectedMetric === 'mean') value = stationSummary.mean;
          else if (selectedMetric === 'max') value = stationSummary.max;
          else if (selectedMetric === 'coveragePct') value = stationSummary.coveragePct;
          else if (selectedMetric === 'zeroHours') value = stationSummary.zeroHours;
          else if (selectedMetric === 'exceedances_who') value = exceedancesWho;
          else if (selectedMetric === 'exceedances_br') value = exceedancesBr;
        } else {
          const monthData = stationSummary.months?.[selectedMonth];
          if (monthData) {
            coveragePct = monthData.coveragePct;
            zeroHours = monthData.zeroHours;
            exceedancesWho = monthData.exceedances?.WHO_24H || 0;
            exceedancesBr = monthData.exceedances?.BR_24H_FINAL || 0;
            mean = monthData.mean;
            max = monthData.max;

            if (selectedMetric === 'mean') value = monthData.mean;
            else if (selectedMetric === 'max') value = monthData.max;
            else if (selectedMetric === 'coveragePct') value = monthData.coveragePct;
            else if (selectedMetric === 'zeroHours') value = monthData.zeroHours;
            else if (selectedMetric === 'exceedances_who') value = exceedancesWho;
            else if (selectedMetric === 'exceedances_br') value = exceedancesBr;
          }
        }
      }

      let { color, status } = getMarkerColorAndStatus(value, selectedMetric, selectedPollutant, selectedRegime);
      if (stationId === "72") {
        color = '#9CA3AF';
        status = 'Meteorológica';
      }

      result[stationId] = {
        id: stationId,
        name: SITES[stationId].name,
        lat: coords.lat,
        lng: coords.lng,
        desc: coords.desc,
        value,
        unit: selectedMetric === 'coveragePct' 
          ? '%' 
          : (selectedMetric === 'exceedances_who' || selectedMetric === 'exceedances_br' 
              ? 'dias' 
              : (selectedMetric === 'zeroHours' ? 'h' : pollutantInfo.unit)),
        coveragePct,
        zeroHours,
        totalHours,
        exceedancesWho,
        exceedancesBr,
        mean,
        max,
        color,
        status,
        tier: stationId === "72" ? "N/A" : (stationSummary && stationSummary.totalHours > 0 ? "RAW_PUBLIC_PLATFORM" : "N/A")
      };
    }

    return result;
  }, [selectedYear, selectedPollutant, selectedMonth, selectedMetric, selectedRegime, pollutantInfo.unit]);

  const stationA = mapData[compareStationA];
  const stationB = mapData[compareStationB];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Atlas Temático da Qualidade do Ar — {pollutantInfo.pollutant} {selectedYear}
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            Navegue no tempo, altere as réguas de comparação e verifique o diagnóstico de cobertura.
          </p>
        </div>

        {/* Configuration selectors */}
        <div className="flex flex-wrap gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:border-emerald-500"
          >
            <option value="2026">Ano: 2026 (Parcial)*</option>
            <option value="2025">Ano: 2025</option>
            <option value="2024">Ano: 2024</option>
            <option value="2023">Ano: 2023 (Histórico)</option>
            <option value="2022">Ano: 2022 (Histórico)</option>
            <option value="2021">Ano: 2021 (Histórico)</option>
            <option value="2020">Ano: 2020 (Histórico)</option>
          </select>
          <select
            value={selectedPollutant}
            onChange={(e) => setSelectedPollutant(e.target.value)}
            className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="18">PM10 (Material Particulado)</option>
            <option value="20" disabled={selectedYear === "2020"}>PM2.5 (Material Particulado Fino){selectedYear === "2020" ? " (Não disponível em 2020)" : ""}</option>
            <option value="3" disabled>CO (Em Auditoria)</option>
            <option value="23" disabled>SO2 (Em Auditoria)</option>
            <option value="1465" disabled>NO2 (Em Auditoria)</option>
            <option value="1955" disabled>PTS (Em Auditoria)</option>
            <option value="2130" disabled>O3 (Em Auditoria)</option>
          </select>

          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="mean">Média anual</option>
            <option value="max">Pico horário</option>
            <option value="exceedances_who">Dias acima OMS</option>
            <option value="exceedances_br">Dias acima CONAMA 506</option>
            <option value="coveragePct">Cobertura</option>
            <option value="zeroHours">Leituras zero em revisão</option>
          </select>

          <div className="bg-slate-850 p-1 border border-slate-700 rounded-lg flex gap-1">
            <button
              onClick={() => setSelectedRegime('OMS')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${selectedRegime === 'OMS' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Régua OMS
            </button>
            <button
              onClick={() => setSelectedRegime('BR')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${selectedRegime === 'BR' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Régua Brasil
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Year notice warning if partial */}
        {selectedYear === "2026" && (
          <div className="bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs rounded-xl p-3.5 flex items-start gap-2.5 animate-pulse mb-4">
            <span className="text-amber-400 font-bold shrink-0 mt-0.5">⚠️</span>
            <div>
              <strong>Ano parcial/em andamento (acumulado até maio de 2026):</strong> Os indicadores do ano de 2026 representam dados provisórios parciais e não devem ser diretamente comparados com séries anuais completas fechadas.
            </div>
          </div>
        )}

        {/* The map */}
        <div className="lg:col-span-3 bg-slate-950 border border-slate-800 rounded-xl h-[450px] overflow-hidden relative">
          <MapContainer
            center={[-22.51, -44.115]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {Object.values(mapData).map(m => (
              <Marker
                key={m.id}
                position={[m.lat, m.lng]}
                icon={createCustomMarkerIcon(m.color, `${m.name}: ${m.id === "72" ? "Meteorológica" : (m.value !== null ? m.value.toFixed(2) : 'N/A')}`)}
              >
                <Popup>
                  <div className="text-slate-900 p-1">
                    <h4 className="font-bold text-sm border-b pb-1 mb-1">{m.name}</h4>
                    <p className="text-[11px] text-slate-500 mb-1">{m.desc}</p>
                    {m.id === "72" ? (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded text-[11px] text-blue-850 font-semibold leading-relaxed">
                        Estação exclusivamente meteorológica (registra ventos e dados climáticos para apoio à dispersão). Não possui sensores de material particulado ({pollutantInfo.pollutant}) nesta base de dados.
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs mt-2 font-mono">
                          <span>Métrica Selecionada:</span>
                          <span className="font-bold text-right">
                            {m.value !== null ? `${m.value.toFixed(2)} ${m.unit}` : 'N/A'}
                          </span>
                          <span>Cobertura Geral:</span>
                          <span className="text-right">{m.coveragePct.toFixed(1)}%</span>
                          <span>Média Anual:</span>
                          <span className="text-right font-semibold">
                            {m.mean !== null ? `${m.mean.toFixed(2)} µg/m³` : 'N/A'}
                          </span>
                          <span>Pico Horário:</span>
                          <span className="text-right font-semibold">
                            {m.max !== null ? `${m.max.toFixed(2)} µg/m³` : 'N/A'}
                          </span>
                          <span>Dias acima OMS:</span>
                          <span className="text-right text-rose-600 font-semibold">{m.exceedancesWho}d</span>
                          <span>Dias acima CONAMA:</span>
                          <span className="text-right text-orange-600 font-semibold">{m.exceedancesBr}d</span>
                        </div>
                        <div className="mt-3 p-1.5 bg-slate-50 border border-slate-200 rounded text-[9px] font-bold text-slate-650 leading-tight">
                          Selo Metodológico:
                          <div className="text-rose-700 font-semibold mt-0.5">
                            Dado horário público WebLakes — comparação experimental — sem QA/QC oficial explícito
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Floating map legend */}
          <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur border border-slate-700 p-3 rounded-lg z-[1000] text-xs max-w-[200px]">
            <h5 className="font-semibold text-slate-200 border-b border-slate-700 pb-1 mb-2">Legenda Visual</h5>
            <div className="flex flex-col gap-1.5 text-slate-350">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span>Dentro da referência</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span>Limiar de Atenção</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span>Alerta / Excedente</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-400"></span>
                <span>Sem Medição</span>
              </div>
            </div>
          </div>
        </div>

        {/* Side panel for side-by-side comparison */}
        <div className="bg-slate-850 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-200 border-b border-slate-700 pb-2 mb-4 uppercase tracking-wider">
              Comparação Lado a Lado
            </h4>
            
            <div className="flex flex-col gap-4">
              {/* Estação A */}
              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Estação A</label>
                <select
                  value={compareStationA}
                  onChange={(e) => setCompareStationA(e.target.value)}
                  className="w-full bg-slate-800 text-slate-200 border border-slate-700 rounded p-1.5 text-xs"
                >
                  {Object.entries(SITES).filter(([id]) => id !== "72").map(([id, s]) => (
                    <option key={id} value={id}>{s.shortName}</option>
                  ))}
                </select>
                <div className="mt-2 bg-slate-900 border border-slate-800 rounded p-2.5">
                  <div className="text-xs text-slate-400">Média / Máx:</div>
                  <div className="text-lg font-bold text-slate-100 font-mono mt-0.5">
                    {stationA?.value !== null ? `${stationA.value.toFixed(2)} ${stationA.unit}` : 'Sem Dados'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                    <span>Cobertura: {stationA?.coveragePct.toFixed(1)}%</span>
                    <span>Excedências: {selectedRegime === 'OMS' ? stationA?.exceedancesWho : stationA?.exceedancesBr}d</span>
                  </div>
                </div>
              </div>

              {/* Estação B */}
              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Estação B</label>
                <select
                  value={compareStationB}
                  onChange={(e) => setCompareStationB(e.target.value)}
                  className="w-full bg-slate-800 text-slate-200 border border-slate-700 rounded p-1.5 text-xs"
                >
                  {Object.entries(SITES).filter(([id]) => id !== "72").map(([id, s]) => (
                    <option key={id} value={id}>{s.shortName}</option>
                  ))}
                </select>
                <div className="mt-2 bg-slate-900 border border-slate-800 rounded p-2.5">
                  <div className="text-xs text-slate-400">Média / Máx:</div>
                  <div className="text-lg font-bold text-slate-100 font-mono mt-0.5">
                    {stationB?.value !== null ? `${stationB.value.toFixed(2)} ${stationB.unit}` : 'Sem Dados'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                    <span>Cobertura: {stationB?.coveragePct.toFixed(1)}%</span>
                    <span>Excedências: {selectedRegime === 'OMS' ? stationB?.exceedancesWho : stationB?.exceedancesBr}d</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-450 leading-relaxed">
            * Dado horário público WebLakes — comparação experimental — sem QA/QC oficial explícito.
          </div>
        </div>
      </div>

      {/* Time scrubber controls */}
      <div className="mt-6 bg-slate-950/50 border border-slate-850 p-4 rounded-xl flex flex-col md:flex-row md:items-center gap-4">
        {/* Play control */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-all shrink-0 ${isPlaying ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-white'}`}
          title={isPlaying ? "Pausar Reprodução" : "Iniciar Reprodução Mensal"}
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 ml-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
            </svg>
          )}
        </button>

        {/* Timeline sliders */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-1.5 text-xs font-bold text-slate-350">
            <span>Período Selecionado:</span>
            <span className="text-emerald-400 font-mono text-sm bg-slate-900 border border-slate-800 rounded px-2.5 py-0.5">
              {selectedMonth === "ALL" ? `Ano Inteiro (${selectedYear})` : `${MONTH_NAMES[parseInt(selectedMonth.split("-")[1]) - 1]} / ${selectedYear}`}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedMonth("ALL")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all shrink-0 ${selectedMonth === "ALL" ? 'bg-slate-800 border border-slate-700 text-slate-100' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Ano
            </button>
            <input
              type="range"
              min="0"
              max={selectedYear === "2026" ? 5 : 12}
              step="1"
              value={selectedMonth === "ALL" ? 0 : parseInt(selectedMonth.split("-")[1])}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (val === 0) setSelectedMonth("ALL");
                else setSelectedMonth(`${selectedYear}-${String(val).padStart(2, '0')}`);
              }}
              className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Month labels */}
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-2 px-1">
            <span>Ano</span>
            {MONTH_NAMES.map((name, i) => {
              if (selectedYear === "2026" && i >= 5) return null;
              return (
                <span
                  key={name}
                  className={selectedMonth !== "ALL" && parseInt(selectedMonth.split("-")[1]) === i + 1 ? "text-emerald-400 font-bold" : ""}
                >
                  {name}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
