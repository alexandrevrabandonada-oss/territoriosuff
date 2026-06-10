import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { SensitiveFacilitiesLayer } from './SensitiveFacilitiesLayer';
import { VulnerabilityLegend } from './VulnerabilityLegend';
import type { CensusSector } from '../../data/social/census-sectors';
import type { Facility } from '../../data/social/sensitive-facilities';

// Fix default Leaflet icon paths
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Coordinates for air quality stations
const STATIONS = [
  { id: "RET", name: "VR-Retiro", lat: -22.502349, lng: -44.12281, desc: "Avenida Jaraguá, Retiro. Próxima ao corredor industrial." },
  { id: "BEL", name: "VR-Belmonte", lat: -22.517677, lng: -44.13254, desc: "Bairro Belmonte, divisa oeste." },
  { id: "SCE", name: "VR-Santa Cecília", lat: -22.52253, lng: -44.106564, desc: "Vila Santa Cecília, polo comercial central." },
  { id: "NSG", name: "VR-Nossa Sra. das Graças", lat: -22.50656, lng: -44.09669, desc: "Aterrado, Campus do IFRJ." }
];

// CSN Center
const CSN_CENTER = { lat: -22.512631, lng: -44.112870, name: "Usina Presidente Vargas (CSN)" };

function createStationIcon(label: string) {
  return new L.DivIcon({
    html: `<div style="background-color: #6366F1; border: 2px solid white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);" title="${label}">📡</div>`,
    className: 'custom-station-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
}

function createCsnIcon() {
  return new L.DivIcon({
    html: `<div style="background-color: #374151; border: 2px solid white; border-radius: 4px; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; font-size: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.4);" title="CSN">🏭</div>`,
    className: 'custom-csn-marker',
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });
}

export function SocialExposureMap() {
  const [selectedSector, setSelectedSector] = useState<CensusSector | null>(null);
  const [showSectors, setShowSectors] = useState<boolean>(true);
  const [showFacilities, setShowFacilities] = useState<boolean>(true);
  const [demographicFilter, setDemographicFilter] = useState<'ALL' | 'CHILDREN' | 'ELDERLY' | 'INCOME' | 'INDUSTRIAL'>('ALL');
  const [selectedFacilityTypes, setSelectedFacilityTypes] = useState<Facility['type'][]>([
    'Escola', 'Creche', 'UBS', 'UPA', 'Hospital', 'CRAS'
  ]);
  const [showStations, setShowStations] = useState<boolean>(true);
  const [sectors, setSectors] = useState<CensusSector[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoadingLayers, setIsLoadingLayers] = useState(true);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      import('../../data/social/census-sectors'),
      import('../../data/social/sensitive-facilities')
    ])
      .then(([sectorModule, facilityModule]) => {
        if (cancelled) return;

        const loadedSectors = sectorModule.CENSUS_SECTORS;
        setSectors(loadedSectors);
        setFacilities(facilityModule.SENSITIVE_FACILITIES);
        setSelectedSector((current) => current ?? loadedSectors[0] ?? null);
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingLayers(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Sector visual helper
  const getSectorStyle = (zone: CensusSector['exposureZone']) => {
    switch (zone) {
      case 'Muito Alto':
        return { color: '#EF4444', fillColor: '#DC2626' }; // Red
      case 'Alto':
        return { color: '#F97316', fillColor: '#EA580C' }; // Orange
      case 'Médio':
        return { color: '#F59E0B', fillColor: '#D97706' }; // Yellow
      case 'Baixo':
        return { color: '#10B981', fillColor: '#059669' }; // Green
    }
  };

  const filteredSectors = useMemo(() => {
    return sectors.filter(sec => {
      if (demographicFilter === 'ALL') return true;
      if (demographicFilter === 'CHILDREN') {
        return (sec.children05 / sec.populationTotal) > 0.07;
      }
      if (demographicFilter === 'ELDERLY') {
        return (sec.elderly60plus / sec.populationTotal) > 0.18;
      }
      if (demographicFilter === 'INCOME') {
        return sec.lowIncomeProxy > 0.25;
      }
      if (demographicFilter === 'INDUSTRIAL') {
        return sec.distanceToIndustrialAreaM < 1500;
      }
      return true;
    });
  }, [demographicFilter, sectors]);

  const toggleFacilityType = (type: Facility['type']) => {
    setSelectedFacilityTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const facilityTypesConfig: { type: Facility['type']; label: string; symbol: string }[] = [
    { type: 'Escola', label: 'Escolas', symbol: '✏️' },
    { type: 'Creche', label: 'Creches', symbol: '🧸' },
    { type: 'UBS', label: 'UBSF', symbol: '🩺' },
    { type: 'UPA', label: 'UPAs', symbol: '🚨' },
    { type: 'Hospital', label: 'Hospitais', symbol: '🏥' },
    { type: 'CRAS', label: 'CRAS', symbol: '🤝' }
  ];

  return (
    <div className="bg-[#0b2234] border border-slate-800/60 rounded-2xl p-5 md:p-6 shadow-2xl space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-black text-slate-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            Mapa de Exposição Social e Vulnerabilidade Territorial
          </h3>
          <p className="text-slate-350 text-xs font-semibold mt-1">
            Cruze a vulnerabilidade social com infraestruturas sensíveis e a proximidade do polo industrial.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1 text-[10px] font-black text-indigo-100">
              <span className="h-2 w-2 rounded-full bg-indigo-400" />
              <span className="uppercase tracking-[0.16em]">Priorização pública</span>
              <span className="hidden font-semibold normal-case text-indigo-100/80 md:inline">camada territorial para orientar monitoramento, prevenção e resposta</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-[10px] font-black text-amber-100">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span className="uppercase tracking-[0.16em]">Não é laudo causal</span>
            </div>
          </div>
        </div>

        {/* Map Control Toolbar */}
        <div className="flex flex-wrap gap-2.5">
          <div className="flex items-center bg-[#061420] border border-slate-700/60 p-1.5 rounded-lg gap-1.5 font-sans">
            <button
              onClick={() => setShowSectors(!showSectors)}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${showSectors ? 'bg-[#0e2c45] text-white shadow-xs' : 'text-slate-400 hover:text-slate-300'}`}
            >
              Setores Censitários
            </button>
            {showSectors && (
              <select
                value={demographicFilter}
                onChange={(e) => setDemographicFilter(e.target.value as any)}
                className="bg-[#0c283d] text-slate-200 text-[11px] outline-none border border-slate-700/60 rounded px-2 py-1 font-semibold cursor-pointer"
              >
                <option value="ALL">Filtro: Todos</option>
                <option value="CHILDREN">Crianças &gt; 7%</option>
                <option value="ELDERLY">Idosos &gt; 18%</option>
                <option value="INCOME">Baixa Renda &gt; 25%</option>
                <option value="INDUSTRIAL">Próx. Industrial &lt; 1500m</option>
              </select>
            )}
          </div>
          
          <button
            onClick={() => setShowStations(!showStations)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${showStations ? 'bg-[#0e2c45] border-slate-700/60 text-white' : 'bg-[#061420] border-slate-800/60 text-slate-400'}`}
          >
            {showStations ? 'Ocultar Estações' : 'Mostrar Estações'}
          </button>

          <button
            onClick={() => setShowFacilities(!showFacilities)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${showFacilities ? 'bg-[#0e2c45] border-slate-700/60 text-white' : 'bg-[#061420] border-slate-800/60 text-slate-400'}`}
          >
            {showFacilities ? 'Ocultar Equipamentos' : 'Mostrar Equipamentos'}
          </button>
        </div>
      </div>

      {showFacilities && (
        <div className="flex flex-wrap items-center gap-2 bg-[#061420]/40 p-2.5 border border-slate-800/60 rounded-xl font-sans">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-1">Tipos de Equipamentos:</span>
          <div className="flex flex-wrap gap-1.5">
            {facilityTypesConfig.map(cfg => {
              const isActive = selectedFacilityTypes.includes(cfg.type);
              return (
                <button
                  key={cfg.type}
                  onClick={() => toggleFacilityType(cfg.type)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0e2c45] text-white border-slate-700/60 shadow-sm'
                      : 'bg-[#061420]/20 text-slate-400 border-slate-800/60 hover:text-slate-300'
                  }`}
                >
                  <span className={isActive ? '' : 'opacity-50'}>{cfg.symbol}</span>
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Leaflet Map Container */}
        <div className="lg:col-span-3 bg-[#061420] border border-slate-800/65 rounded-xl h-[500px] overflow-hidden relative shadow-inner">
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

            {/* Industrial Center Marker (CSN) */}
            <Marker position={[CSN_CENTER.lat, CSN_CENTER.lng]} icon={createCsnIcon()}>
              <Popup>
                <div className="text-slate-900 p-1 font-sans">
                  <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                    🏭 {CSN_CENTER.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">
                    Centro geométrico da Usina Presidente Vargas. Principal complexo industrial e fonte de emissão monitorada em Volta Redonda.
                  </p>
                </div>
              </Popup>
            </Marker>

            {/* Air Quality Stations Layer */}
            {showStations && STATIONS.map(st => (
              <Marker
                key={st.id}
                position={[st.lat, st.lng]}
                icon={createStationIcon(`${st.name}: ${st.id}`)}
              >
                <Popup>
                  <div className="text-slate-900 p-1 font-sans">
                    <span className="text-[9px] uppercase font-black text-indigo-500 block tracking-wider">Estação Oficial INEA</span>
                    <h4 className="font-extrabold text-sm text-slate-800 leading-tight mt-0.5">{st.name} ({st.id})</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-normal font-medium">{st.desc}</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Census Sectors (Vulnerability buffer zones) */}
            {showSectors && filteredSectors.map(sec => {
              const style = getSectorStyle(sec.exposureZone);
              return (
                <Circle
                  key={sec.sectorId}
                  center={[sec.lat, sec.lng]}
                  radius={450} // 450 meters buffer area
                  pathOptions={{
                    color: style.color,
                    fillColor: style.fillColor,
                    fillOpacity: 0.35,
                    weight: 2
                  }}
                  eventHandlers={{
                    click: () => {
                      setSelectedSector(sec);
                    }
                  }}
                />
              );
            })}

            {/* Sensitive Facilities Layer */}
            <SensitiveFacilitiesLayer facilities={facilities} visible={showFacilities} selectedTypes={selectedFacilityTypes} />
          </MapContainer>

          {isLoadingLayers && (
            <div className="absolute inset-x-4 top-4 z-[1100] rounded-xl border border-indigo-500/20 bg-[#061420]/92 px-4 py-3 text-xs font-semibold text-indigo-100 shadow-lg backdrop-blur">
              Carregando camadas territoriais e equipamentos sensiveis.
            </div>
          )}

          {/* Floating Map Safeguard Warning */}
          <div className="absolute bottom-4 left-4 right-4 md:right-auto md:max-w-md bg-[#061420]/95 backdrop-blur-md border border-slate-800 p-3 rounded-xl z-[1000] text-[10px] leading-relaxed text-slate-350 shadow-xl">
            <span className="text-amber-400 font-bold">⚠️ Índice Experimental:</span> Este mapa organiza dados socioeconômicos e sinais territoriais de pressão ambiental para priorização de políticas públicas. Não mede risco individual de adoecimento nem prova causalidade direta.
          </div>
        </div>

        {/* Details and Comparison Sidebar */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-200 border-b border-slate-800/60 pb-2.5 uppercase tracking-widest">
              Detalhes do Território
            </h4>

            {selectedSector ? (
              <div className="bg-[#061420]/80 border border-slate-800/60 rounded-xl p-4 space-y-3.5 shadow-inner backdrop-blur-sm">
                <div>
                  <div className="flex justify-between items-start">
                    <strong className="text-sm text-white font-bold">{selectedSector.bairro}</strong>
                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-md ${
                      selectedSector.exposureZone === 'Muito Alto' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      selectedSector.exposureZone === 'Alto' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                      selectedSector.exposureZone === 'Médio' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {selectedSector.exposureZone}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono font-bold mt-0.5 block">Setor: {selectedSector.sectorId}</span>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800/60 text-xs font-semibold text-slate-300">
                  <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                    <span>População Total:</span>
                    <strong className="text-white font-mono">{selectedSector.populationTotal.toLocaleString('pt-BR')} hab</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                    <span>Crianças (0-5 anos):</span>
                    <strong className="text-white font-mono">{selectedSector.children05} ({Math.round(selectedSector.children05 / selectedSector.populationTotal * 100)}%)</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                    <span>Idosos (60+ anos):</span>
                    <strong className="text-white font-mono">{selectedSector.elderly60plus} ({Math.round(selectedSector.elderly60plus / selectedSector.populationTotal * 100)}%)</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                    <span>Proxy Baixa Renda:</span>
                    <strong className="text-white font-mono">{Math.round(selectedSector.lowIncomeProxy * 100)}%</strong>
                  </div>
                  <div className="flex justify-between text-indigo-300 pt-1.5 border-b border-slate-800/60 pb-1.5">
                    <span>Score Vulnerabilidade:</span>
                    <strong className="font-mono text-sm text-indigo-200">{selectedSector.vulnerabilityScore.toFixed(3)}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                    <span>Distância CSN:</span>
                    <strong className="font-mono text-white">{selectedSector.distanceToIndustrialAreaM} m</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Estação de Ar Próxima:</span>
                    <strong className="text-white font-mono">{selectedSector.nearestAirStation}</strong>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg text-[10px] text-slate-300 leading-relaxed font-semibold">
                  <strong className="text-slate-100">Nota do Setor:</strong> {selectedSector.methodologyNote}
                </div>
                <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-3 py-2 text-[10px] font-semibold leading-relaxed text-indigo-100">
                  Leia este setor como aproximação territorial de prioridade. O score combina sensibilidade demográfica, proxy socioeconômica e proximidade industrial, mas não representa dose individual nem laudo epidemiológico.
                </div>
              </div>
            ) : (
              <div className="p-5 border border-dashed border-slate-800 bg-[#061420]/40 text-center rounded-xl text-xs text-slate-455 font-bold italic leading-relaxed shadow-inner">
                Clique em um setor (círculo) no mapa para carregar os microdados demográficos do Censo 2022.
              </div>
            )}
          </div>

          {/* Render the legend sidebar */}
          <VulnerabilityLegend />
        </div>
      </div>
      
      {/* Downloader for the social files */}
      <div className="p-4 bg-[#061420]/60 border border-slate-800/60 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-semibold text-slate-400 backdrop-blur-sm shadow-md">
        <div>
          <strong className="text-slate-200 block">Camada de Dados Abertos Censitários:</strong>
          <span className="text-[11px] text-slate-455">Baixe a tabela contendo o cruzamento social e territorial de Volta Redonda.</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="/data/social/vr-vulnerabilidade-setores-2022.csv"
            download="vr-vulnerabilidade-setores-2022.csv"
            className="inline-flex min-h-[32px] items-center justify-center rounded-lg bg-emerald-600/10 hover:bg-emerald-600/25 border border-emerald-500/25 text-emerald-400 px-3.5 py-1 text-[11px] uppercase tracking-wider font-bold transition-all cursor-pointer"
          >
            Setores CSV
          </a>
          <a
            href="/data/social/equipamentos-sensiveis-vr.csv"
            download="equipamentos-sensiveis-vr.csv"
            className="inline-flex min-h-[32px] items-center justify-center rounded-lg bg-indigo-600/10 hover:bg-indigo-600/25 border border-indigo-500/25 text-indigo-400 px-3.5 py-1 text-[11px] uppercase tracking-wider font-bold transition-all cursor-pointer"
          >
            Equipamentos CSV
          </a>
          <a
            href="/data/social/social-data-dictionary.csv"
            download="social-data-dictionary.csv"
            className="inline-flex min-h-[32px] items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-200 px-3.5 py-1 text-[11px] uppercase tracking-wider font-bold transition-all cursor-pointer"
          >
            Dicionário CSV
          </a>
        </div>
      </div>
    </div>
  );
}
