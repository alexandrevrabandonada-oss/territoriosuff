import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { loadIneaSummaryYear, type SummaryPayload } from '../../lib/inea/summaryLoader';
import { SITES, PARAMETERS } from '../../lib/inea/weblakesDictionary';

// Fix Leaflet icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
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
function createCustomMarkerIcon(color: string, label: string, isSelected: boolean) {
  const size = isSelected ? 32 : 24;
  const border = isSelected ? '3px solid #FFF' : '2px solid white';
  const shadow = isSelected 
    ? '0 0 0 4px rgba(245, 158, 11, 0.5), 0 4px 8px rgba(0,0,0,0.4)' // Amber ring focus for active selection
    : '0 2px 4px rgba(0,0,0,0.3)';
  const transform = isSelected ? 'scale(1.15)' : 'scale(1)';
  
  return new L.DivIcon({
    html: `<div style="background-color: ${color}; border: ${border}; border-radius: 50%; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: ${isSelected ? '12px' : '10px'}; box-shadow: ${shadow}; transform: ${transform}; transition: all 0.2s;" title="${label}"></div>`,
    className: 'custom-map-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
}

export function AirAtlasMap() {
  const [selectedYear, setSelectedYear] = useState<string>("2024");
  const [selectedPollutant, setSelectedPollutant] = useState<string>("18"); // PM10
  const [selectedMonth, setSelectedMonth] = useState<string>("ALL"); // Default ALL
  const [selectedMetric, setSelectedMetric] = useState<string>("mean"); // mean, max, coveragePct, zeroHours, exceedances
  const [selectedRegime, setSelectedRegime] = useState<'OMS' | 'BR'>('OMS');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedStation, setSelectedStation] = useState<string>("70"); // Default station is Retiro
  const [showLegend, setShowLegend] = useState<boolean>(true); // For collapsible legend
  const [loadedSummary, setLoadedSummary] = useState<SummaryPayload | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(true);
  const [summaryLoadError, setSummaryLoadError] = useState<boolean>(false);

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

  useEffect(() => {
    let cancelled = false;

    setIsLoadingSummary(true);
    setSummaryLoadError(false);

    loadIneaSummaryYear(selectedYear)
      .then((summary) => {
        if (!cancelled) {
          setLoadedSummary(summary);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadedSummary(null);
          setSummaryLoadError(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingSummary(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedYear]);

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

    for (const stationId of ["69", "70", "71", "72"]) {
      const coords = STATION_COORDINATES[stationId] || { lat: -22.5, lng: -44.1, desc: "" };
      const stationSummary = loadedSummary?.[stationId]?.pollutants[selectedPollutant];

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
      if (stationId !== "72" && selectedMetric !== 'coveragePct' && coveragePct > 0 && coveragePct < 75) {
        color = '#9CA3AF'; // Gray for insufficient coverage when not viewing coverage metric
        status = 'Cobertura Insuficiente';
      }
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
  }, [loadedSummary, selectedPollutant, selectedMonth, selectedMetric, selectedRegime, pollutantInfo.unit]);

  const activeStationData = mapData[selectedStation];

  const getSelectedStationStatus = (stationId: string, data: typeof mapData[string]) => {
    if (stationId === "72") {
      return {
        text: "sem dado (Estação Meteorológica)",
        colorClass: "bg-slate-500/10 text-slate-400 border border-slate-500/25",
        dotClass: "bg-slate-400"
      };
    }
    if (!data || data.mean === null || data.coveragePct === 0) {
      return {
        text: "sem dado",
        colorClass: "bg-slate-500/10 text-slate-400 border border-slate-500/25",
        dotClass: "bg-slate-400"
      };
    }
    if (data.coveragePct < 75) {
      return {
        text: "cobertura insuficiente",
        colorClass: "bg-indigo-500/15 text-indigo-300 border border-indigo-500/25",
        dotClass: "bg-indigo-400"
      };
    }

    const val = data.mean;
    if (selectedPollutant === "18") { // PM10
      const limit = selectedRegime === 'OMS' ? 45 : 50;
      if (val > limit) {
        return {
          text: "excedente",
          colorClass: "bg-rose-500/15 text-rose-300 border border-rose-500/25",
          dotClass: "bg-rose-450"
        };
      }
      if (val > limit * 0.7) {
        return {
          text: "atenção",
          colorClass: "bg-amber-500/15 text-amber-300 border border-amber-500/25",
          dotClass: "bg-amber-400"
        };
      }
      return {
        text: "dentro da referência",
        colorClass: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25",
        dotClass: "bg-emerald-400"
      };
    }

    if (selectedPollutant === "20") { // PM2.5
      const limit = selectedRegime === 'OMS' ? 15 : 25;
      if (val > limit) {
        return {
          text: "excedente",
          colorClass: "bg-rose-500/15 text-rose-300 border border-rose-500/25",
          dotClass: "bg-rose-450"
        };
      }
      if (val > limit * 0.7) {
        return {
          text: "atenção",
          colorClass: "bg-amber-500/15 text-amber-300 border border-amber-500/25",
          dotClass: "bg-amber-400"
        };
      }
      return {
        text: "dentro da referência",
        colorClass: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25",
        dotClass: "bg-emerald-400"
      };
    }

    return {
      text: "dentro da referência",
      colorClass: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25",
      dotClass: "bg-emerald-400"
    };
  };

  const activeStatus = getSelectedStationStatus(selectedStation, activeStationData);

  return (
    <div className="bg-[#0b2234] border border-slate-800/60 rounded-2xl p-5 md:p-6 shadow-2xl flex flex-col gap-6">
      
      {/* Title block - order-1 */}
      <div className="order-1 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Atlas Temático da Qualidade do Ar — {pollutantInfo.pollutant} {selectedYear}
          </h3>
          <p className="text-slate-350 text-xs font-semibold mt-1">
            Navegue no tempo, altere as réguas de comparação e verifique o diagnóstico de cobertura.
          </p>
        </div>
      </div>

      {/* Grouped Filters Block - order-3 on mobile, order-2 on desktop (large screens) */}
      <div className="order-3 lg:order-2 grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Bloco 1: O que ver? */}
        <div className="bg-[#0c283d] border border-slate-800/40 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">1. O que ver?</span>
            <h4 className="text-xs font-bold text-slate-200 mt-1 mb-3">Poluente</h4>
          </div>
          <select
            value={selectedPollutant}
            onChange={(e) => setSelectedPollutant(e.target.value)}
            className="w-full bg-[#061420] text-slate-200 border border-slate-700/60 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500/80 cursor-pointer"
          >
            <option value="18">PM10 (Material Particulado)</option>
            <option value="20" disabled={selectedYear === "2020"}>PM2.5 (Material Particulado Fino){selectedYear === "2020" ? " (Não disponível em 2020)" : ""}</option>
            <option value="3" disabled>CO (Ver no modo Tempo)</option>
            <option value="23" disabled>SO2 (Ver no modo Tempo)</option>
            <option value="1465" disabled>NO2 (Em Auditoria)</option>
            <option value="1955" disabled>PTS (Em Auditoria)</option>
            <option value="2130" disabled>O3 (Em Auditoria)</option>
          </select>
        </div>

        {/* Bloco 2: Quando? */}
        <div className="bg-[#0c283d] border border-slate-800/40 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">2. Quando?</span>
            <h4 className="text-xs font-bold text-slate-200 mt-1 mb-3">Ano / Período</h4>
          </div>
          <div className="flex flex-col gap-2">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-[#061420] text-slate-200 border border-slate-700/60 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500/80 cursor-pointer"
            >
              <option value="2026">Ano: 2026 (Parcial)*</option>
              <option value="2025">Ano: 2025</option>
              <option value="2024">Ano: 2024</option>
              <option value="2023">Ano: 2023 (Histórico)</option>
              <option value="2022">Ano: 2022 (Histórico)</option>
              <option value="2021">Ano: 2021 (Histórico)</option>
              <option value="2020">Ano: 2020 (Histórico)</option>
            </select>
            <span className="text-[11px] text-slate-400 font-medium">
              Período ativo: <strong className="text-emerald-400">{selectedMonth === "ALL" ? "Ano Inteiro" : `${MONTH_NAMES[parseInt(selectedMonth.split("-")[1]) - 1]} / ${selectedYear}`}</strong>
            </span>
          </div>
        </div>

        {/* Bloco 3: Como comparar? */}
        <div className="bg-[#0c283d] border border-slate-800/40 rounded-xl p-4 flex flex-col gap-3 justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">3. Como comparar?</span>
            <h4 className="text-xs font-bold text-slate-200 mt-1 mb-3">Métrica & Régua</h4>
          </div>
          <div className="flex flex-col gap-2">
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="w-full bg-[#061420] text-slate-200 border border-slate-700/60 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500/80 cursor-pointer"
            >
              <option value="mean">Média anual / do período</option>
              <option value="max">Pico horário pontual</option>
              <option value="exceedances_who">Dias acima OMS</option>
              <option value="exceedances_br">Dias acima CONAMA 506</option>
              <option value="coveragePct">Cobertura</option>
              <option value="zeroHours">Leituras zero em revisão</option>
            </select>
            <div className="bg-[#061420] p-1 border border-slate-700/60 rounded-lg flex gap-1 w-full justify-between">
              <button
                onClick={() => setSelectedRegime('OMS')}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-md transition-all cursor-pointer ${selectedRegime === 'OMS' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Régua OMS
              </button>
              <button
                onClick={() => setSelectedRegime('BR')}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-md transition-all cursor-pointer ${selectedRegime === 'BR' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Régua Brasil (CONAMA)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid for Map and Side Panel - order-2 on mobile, order-3 on desktop */}
      <div className="order-2 lg:order-3 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* The map */}
        <div className="lg:col-span-3 bg-[#061420] border border-slate-800/65 rounded-xl h-[450px] overflow-hidden relative shadow-inner">
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
                icon={createCustomMarkerIcon(
                  m.color, 
                  `${m.name}: ${m.id === "72" ? "Meteorológica" : (m.value !== null ? m.value.toFixed(2) : 'N/A')}`,
                  selectedStation === m.id
                )}
                eventHandlers={{
                  click: () => {
                    setSelectedStation(m.id);
                  }
                }}
              >
                <Popup>
                  <div className="text-slate-900 p-1 font-sans">
                    <h4 className="font-bold text-sm border-b pb-1 mb-1">{m.name}</h4>
                    <p className="text-[11px] text-slate-500 mb-1 leading-normal font-semibold">{m.desc}</p>
                    {m.id === "72" ? (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded text-[11px] text-blue-900 font-semibold leading-relaxed">
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
                        <div className="mt-3 p-1.5 bg-slate-50 border border-slate-200 rounded text-[9px] font-bold text-slate-655 leading-tight">
                          Selo Metodológico:
                          <div className="text-rose-800 font-semibold mt-0.5">
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

          {isLoadingSummary && (
            <div className="absolute inset-x-4 top-4 z-[1100] rounded-xl border border-emerald-500/20 bg-[#061420]/92 px-4 py-3 text-xs font-semibold text-emerald-100 shadow-lg backdrop-blur">
              Carregando resumo consolidado de {selectedYear} para atualizar o atlas.
            </div>
          )}

          {!isLoadingSummary && summaryLoadError && (
            <div className="absolute inset-x-4 top-4 z-[1100] rounded-xl border border-rose-500/20 bg-[#061420]/92 px-4 py-3 text-xs font-semibold text-rose-100 shadow-lg backdrop-blur">
              Nao foi possivel carregar o resumo anual do atlas neste momento.
            </div>
          )}

          {/* Collapsible map legend - fixed, simple, pedagogical */}
          <div className="absolute bottom-4 right-4 bg-[#061420]/95 backdrop-blur border border-slate-850 p-3.5 rounded-xl z-[1000] text-xs max-w-[240px] shadow-lg transition-all duration-300">
            {showLegend ? (
              <div>
                <div className="flex justify-between items-center border-b border-slate-800/60 pb-1.5 mb-2">
                  <h5 className="font-bold text-slate-200 uppercase tracking-wide text-[10px]">Legenda Pedagógica</h5>
                  <button
                    onClick={() => setShowLegend(false)}
                    className="text-slate-400 hover:text-slate-200 text-xs px-1 cursor-pointer font-bold"
                    title="Minimizar legenda"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex flex-col gap-2 text-slate-350 mb-2.5 font-semibold text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></span>
                    <span>Dentro da referência</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0"></span>
                    <span>Atenção</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500 shrink-0"></span>
                    <span>Acima da régua (Excedente)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-slate-500 shrink-0"></span>
                    <span>Sem dado / Cobertura baixa</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-405 border-t border-slate-800/60 pt-1.5 leading-tight italic font-medium">
                  Cores indicam comparação experimental com a régua selecionada.
                </p>
              </div>
            ) : (
              <button
                onClick={() => setShowLegend(true)}
                className="flex items-center gap-1.5 text-slate-200 font-bold px-2 py-1 bg-[#0c283d] hover:bg-slate-750 rounded-lg text-[10px] uppercase tracking-wider cursor-pointer"
              >
                <span>ℹ️ Mostrar Legenda</span>
              </button>
            )}
          </div>
        </div>

        {/* Selected Station Details Panel */}
        <div className="bg-[#061420]/80 border border-slate-800/60 rounded-xl p-4 flex flex-col justify-between shadow-inner backdrop-blur-sm">
          <div>
            <div className="border-b border-slate-800/60 pb-3 mb-4">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">Estação Selecionada</span>
              <h4 className="text-base font-black text-slate-100 mt-0.5">
                {activeStationData?.name || "Nenhuma Estação Selecionada"}
              </h4>
              <p className="text-[11px] text-slate-355 mt-1 italic leading-tight font-medium">
                {activeStationData?.desc || "Selecione uma estação no mapa."}
              </p>
            </div>

            <div className="space-y-3">
              {/* Visual Status */}
              <div>
                <span className="text-[10px] text-slate-400 font-bold block mb-1">Status Visual</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${activeStatus.colorClass}`}>
                  <span className={`w-2 h-2 rounded-full ${activeStatus.dotClass}`}></span>
                  {activeStatus.text}
                </span>
              </div>

              {/* Poluente */}
              <div className="grid grid-cols-2 gap-2 text-xs border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Poluente:</span>
                <span className="text-white font-bold text-right">{pollutantInfo.pollutant}</span>
              </div>

              {/* Ano/Período */}
              <div className="grid grid-cols-2 gap-2 text-xs border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Ano/Período:</span>
                <span className="text-white font-bold text-right">
                  {selectedMonth === "ALL" ? `${selectedYear}` : `${MONTH_NAMES[parseInt(selectedMonth.split("-")[1]) - 1]} / ${selectedYear}`}
                </span>
              </div>

              {/* Média */}
              <div className="grid grid-cols-2 gap-2 text-xs border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Média:</span>
                <strong className="text-white font-mono text-right">
                  {activeStationData?.mean !== null ? `${activeStationData.mean.toFixed(2)} µg/m³` : "Sem Dado"}
                </strong>
              </div>

              {/* Pico Horário */}
              <div className="grid grid-cols-2 gap-2 text-xs border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Pico horário pontual:</span>
                <strong className="text-white font-mono text-right">
                  {activeStationData?.max !== null ? `${activeStationData.max.toFixed(2)} µg/m³` : "Sem Dado"}
                </strong>
              </div>

              {/* Cobertura */}
              <div className="grid grid-cols-2 gap-2 text-xs border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Cobertura:</span>
                <strong className="text-white font-mono text-right">
                  {activeStationData ? `${activeStationData.coveragePct.toFixed(1)}%` : "N/A"}
                </strong>
              </div>

              {/* Dias Acima OMS */}
              <div className="grid grid-cols-2 gap-2 text-xs border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Dias acima da OMS:</span>
                <strong className="text-rose-450 font-mono text-right">
                  {activeStationData ? `${activeStationData.exceedancesWho}d` : "N/A"}
                </strong>
              </div>

              {/* Dias Acima CONAMA */}
              <div className="grid grid-cols-2 gap-2 text-xs pb-1">
                <span className="text-slate-400">Dias acima da CONAMA:</span>
                <strong className="text-amber-455 font-mono text-right">
                  {activeStationData ? `${activeStationData.exceedancesBr}d` : "N/A"}
                </strong>
              </div>
            </div>

            {/* Microtexto pedagógico */}
            <div className="mt-4 pt-3 border-t border-slate-800/60 space-y-3">
              <div>
                <strong className="text-[10px] text-emerald-450 uppercase tracking-wider block font-black">O que este ponto mostra?</strong>
                <p className="text-[11px] text-slate-350 leading-relaxed mt-0.5 font-medium">
                  Representa a estação de monitoramento selecionada no mapa, detalhando as concentrações de poluentes consolidadas para o período escolhido.
                </p>
              </div>
              <div>
                <strong className="text-[10px] text-emerald-455 uppercase tracking-wider block font-black">Como ler?</strong>
                <p className="text-[11px] text-slate-355 leading-relaxed mt-0.5 font-medium">
                  Compare a média com as réguas selecionadas. Cores indicam se a estação está dentro dos limites de atenção ou de excedente.
                </p>
              </div>
              <div>
                <strong className="text-[10px] text-emerald-455 uppercase tracking-wider block font-black">Por que importa?</strong>
                <p className="text-[11px] text-slate-355 leading-relaxed mt-0.5 font-medium">
                  Orienta políticas públicas de dispersão de poluentes urbanos e monitora a vulnerabilidade de saúde dos bairros próximos.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 text-[10px] text-slate-450 leading-relaxed italic font-medium">
            * Dados baseados na rede pública e comparações experimentais.
          </div>
        </div>
      </div>

      {/* Time scrubber controls - order-4 */}
      <div className="order-4 bg-[#061420]/60 border border-slate-800/60 p-4 rounded-xl flex flex-col md:flex-row md:items-center gap-4 backdrop-blur-sm shadow-md">
        {/* Play control */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`flex items-center justify-center w-12 h-12 rounded-full transition-all shrink-0 cursor-pointer ${isPlaying ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-white'}`}
          title={isPlaying ? "Pausar Reprodução" : "Iniciar Reprodução Mensal"}
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 ml-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
            </svg>
          )}
        </button>

        {/* Timeline sliders */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-1.5 text-xs font-bold text-slate-300">
            <span>Período Selecionado:</span>
            <span className="text-emerald-400 font-mono text-sm bg-[#061420] border border-slate-700/60 rounded px-2.5 py-0.5 shadow-inner">
              {selectedMonth === "ALL" ? `Ano Inteiro (${selectedYear})` : `${MONTH_NAMES[parseInt(selectedMonth.split("-")[1]) - 1]} / ${selectedYear}`}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedMonth("ALL")}
              className={`px-3.5 py-2 text-xs font-black rounded-lg transition-all shrink-0 cursor-pointer border ${selectedMonth === "ALL" ? 'bg-[#0c283d] border-slate-750 text-slate-100' : 'border-transparent text-slate-455 hover:text-slate-200'}`}
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
              className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Month labels */}
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-2.5 px-1">
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
      
      {/* Year notice warning if partial */}
      {selectedYear === "2026" && (
        <div className="bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs rounded-xl p-3.5 flex items-start gap-2.5 animate-pulse">
          <span className="text-amber-400 font-bold shrink-0 mt-0.5">⚠️</span>
          <div>
            <strong>Ano parcial/em andamento (acumulado até maio de 2026):</strong> Os indicadores do ano de 2026 representam dados provisórios parciais e não devem ser diretamente comparados com séries anuais completas fechadas.
          </div>
        </div>
      )}
    </div>
  );
}
