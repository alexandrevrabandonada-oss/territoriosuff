import { useEffect, useState, useMemo, Fragment } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Polygon } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { getStationOverview, getStationHealth, type StationOverview, type StationHealth } from "../lib/api";

import { OfflineBanner } from "../components/OfflineBanner";
import { Chip, IconShell, SurfaceCard } from "../components/BrandSystem";

// Fix default marker icons in react-leaflet
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const ENV_HINT = " Verifique .env.local (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY).";

// Mock coordinates for stations (Volta Redonda region)
// In production, these should come from the database
const MOCK_COORDINATES: Record<string, [number, number]> = {
  "vr-centro-01": [-22.5203, -44.1044],
  "vr-retiro-01": [-22.5123, -44.0944],
  "vr-siderlandia-01": [-22.5303, -44.1144],
  "default": [-22.5203, -44.1044],
};

function getStationCoordinates(code: string | null): [number, number] {
  if (!code) return MOCK_COORDINATES.default;
  return MOCK_COORDINATES[code] || MOCK_COORDINATES.default;
}

function getPlumeColor(pm25: number): string {
  if (pm25 <= 15) return "#10b981"; // Excelente/Bom
  if (pm25 <= 35) return "#f59e0b"; // Moderado
  return "#ef4444"; // Alto/Crítico
}

function calculatePlumePoints(
  center: [number, number],
  direction: "N" | "NE" | "L" | "SE" | "S" | "SO" | "O" | "NO",
  speed: "low" | "medium" | "high",
  pm25: number,
  scaleFactor: number
): [number, number][] {
  const [lat, lng] = center;
  
  const directionAngles: Record<string, number> = {
    L: 0,
    NE: Math.PI / 4,
    N: Math.PI / 2,
    NO: 3 * Math.PI / 4,
    O: Math.PI,
    SO: 5 * Math.PI / 4,
    S: 3 * Math.PI / 2,
    SE: 7 * Math.PI / 4,
  };
  
  const baseAngle = directionAngles[direction] ?? 0;
  
  let spreadAngle = Math.PI / 4; 
  if (speed === "low") spreadAngle = Math.PI / 2.2; 
  if (speed === "high") spreadAngle = Math.PI / 6; 
  
  const currentSpread = spreadAngle * (scaleFactor === 0.4 ? 0.6 : scaleFactor === 0.75 ? 0.85 : 1.0);
  
  const speedFactors = { low: 0.75, medium: 1.2, high: 1.7 };
  const speedFactor = speedFactors[speed] ?? 1.0;
  const pmFactor = 1 + Math.min(pm25, 120) / 40;
  
  const baseLength = 0.0065; 
  const length = baseLength * pmFactor * speedFactor * scaleFactor;
  
  const points: [number, number][] = [[lat, lng]]; 
  const steps = 8; 
  
  for (let i = 0; i <= steps; i++) {
    const angle = baseAngle - currentSpread / 2 + (currentSpread * i) / steps;
    const pLat = lat + length * Math.sin(angle);
    const pLng = lng + length * Math.cos(angle);
    points.push([pLat, pLng]);
  }
  
  points.push([lat, lng]); 
  return points;
}

function getCustomMarkerIcon(
  health: string | undefined,
  layer: "pm25" | "temp" | "humidity",
  station: StationOverview
) {
  const healthStatus = health || "unknown";
  let valueText = "?";
  
  if (layer === "pm25") {
    valueText = station.pm25 !== null && station.pm25 !== undefined ? String(Math.round(station.pm25)) : "-";
  } else if (layer === "temp") {
    valueText = station.temp !== null && station.temp !== undefined ? `${Math.round(station.temp)}°` : "-";
  } else if (layer === "humidity") {
    valueText = station.humidity !== null && station.humidity !== undefined ? `${Math.round(station.humidity)}%` : "-";
  }

  let colorClass = "marker-unknown";
  let pulseClass = "";

  if (healthStatus === "ok") {
    colorClass = "marker-ok";
    pulseClass = "map-marker-pulse";
  } else if (healthStatus === "degraded") {
    colorClass = "marker-degraded";
    pulseClass = "map-marker-pulse";
  } else if (healthStatus === "offline") {
    colorClass = "marker-offline";
  }

  return new L.DivIcon({
    html: `<div class="map-custom-marker ${colorClass} ${pulseClass}" style="width: 36px; height: 36px; line-height: 31px; text-align: center;">
      ${valueText}
    </div>`,
    className: "leaflet-custom-marker-icon",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

export function MapaPage() {
  const [stations, setStations] = useState<StationOverview[]>([]);
  const [stationHealth, setStationHealth] = useState<Map<string, StationHealth>>(new Map());
  const [selectedStation, setSelectedStation] = useState<StationOverview | null>(null);
  const [activeLayer, setActiveLayer] = useState<"pm25" | "temp" | "humidity">("pm25");
  const [activeBasemap, setActiveBasemap] = useState<"light" | "dark" | "osm">("light");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  
  // Plume & Wind Simulation States
  const [showPlume, setShowPlume] = useState(false);
  const [windDirection, setWindDirection] = useState<"N" | "NE" | "L" | "SE" | "S" | "SO" | "O" | "NO">("NE");
  const [windSpeed, setWindSpeed] = useState<"low" | "medium" | "high">("medium");


  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const [stationsData, healthData] = await Promise.all([
          getStationOverview(),
          getStationHealth(),
        ]);
        setStations(stationsData);
        if (stationsData.length > 0) {
          setSelectedStation(stationsData[0]);
        }
        
        // Create health map by station_id
        const healthMap = new Map<string, StationHealth>();
        healthData.forEach(h => {
          healthMap.set(h.station_id, h);
        });
        setStationHealth(healthMap);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Falha ao carregar dados do mapa.";
        setError(`${message}${ENV_HINT}`);
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, []);

  const mapCenter = useMemo<[number, number]>(() => {
    if (stations.length === 0) return [-22.5203, -44.1044]; // Volta Redonda center
    const firstStation = selectedStation || stations[0];
    return getStationCoordinates(firstStation?.code || null);
  }, [stations, selectedStation]);

  return (
    <section className="portal-stage map-stage space-y-8 md:space-y-10">
      <a href="#mapa-lista" className="inline-flex min-h-[44px] items-center rounded-full border border-brand-primary/20 bg-white/90 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-brand-primary shadow-sm shadow-brand-primary/5 focus:fixed focus:left-4 focus:top-4 focus:z-50">
        Pular mapa e ir para lista acessível
      </a>
      {!isOnline && (
        <OfflineBanner
          description="O mapa interativo depende de tiles externos. A lista abaixo continua disponível mesmo sem conexão."
          onRetry={() => window.location.reload()}
        />
      )}

      <SurfaceCard className="portal-stage-hero portal-stage-hero-lab overflow-hidden p-0">
        <div className="portal-stage-hero-inner">
          <div className="portal-stage-copy">
              <IconShell tone="brand" className="portal-stage-icon">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </IconShell>
              <h1>Mapa de monitoramento</h1>
            <p>
              Visualize a localização das estações de monitoramento em Volta Redonda e região. Se o mapa não carregar, use a lista acessível abaixo.
            </p>
          </div>
          <div className="portal-stage-stat gap-4">
            <span>{loading ? "..." : stations.length}</span>
            <small>estação(ões) no mapa</small>
            <div className="flex flex-wrap gap-2">
            <Chip tone="active">Acessível</Chip>
            <Chip tone="seed">Offline friendly</Chip>
            </div>
          </div>
        </div>
      </SurfaceCard>

      {/* Error message */}
      {error && (
        <p aria-live="assertive" className="rounded-md border border-error/30 bg-error/10 p-3 text-sm text-error" role="alert">
          {error}
        </p>
      )}

      {/* Map Section */}
      <SurfaceCard className="portal-map-panel p-5 md:p-6">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-primary">Mapa interativo</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-text-primary md:text-3xl">Navegação espacial do monitoramento</h2>
            <p className="mt-1 text-sm text-text-secondary">Estações e leitura complementar na lista acessível.</p>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 rounded-[1.5rem] border border-border-subtle bg-surface-2 p-6">
            <p aria-live="polite" className="text-sm text-text-secondary" role="status">
              Carregando mapa...
            </p>
          </div>
        ) : !isOnline ? (
          <div className="mt-6 space-y-4">
            <OfflineBanner
              compact
              description="Sem conexão, o mapa pode não carregar. A lista acessível abaixo continua disponível."
              onRetry={() => window.location.reload()}
            />
            <p className="text-sm text-text-secondary">Use a lista de estações para navegação completa enquanto estiver offline.</p>
          </div>
        ) : (
          <div className="relative" style={{ height: "550px" }}>
            <MapContainer
              center={mapCenter}
              zoom={13}
              scrollWheelZoom={false}
              style={{ height: "100%", width: "100%", borderRadius: "1.25rem" }}
              className="z-0 rounded-[1.25rem]"
            >
              <TileLayer
                attribution={
                  activeBasemap === "osm"
                    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                }
                url={
                  activeBasemap === "light"
                    ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    : activeBasemap === "dark"
                    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                }
              />
              
              {/* Plume Dispersion Overlays */}
              {showPlume && stations.map((station) => {
                if (!station.is_online || station.pm25 === null || station.pm25 === undefined) return null;
                const coords = getStationCoordinates(station.code);
                const color = getPlumeColor(station.pm25);
                
                const innerPoints = calculatePlumePoints(coords, windDirection, windSpeed, station.pm25, 0.4);
                const midPoints = calculatePlumePoints(coords, windDirection, windSpeed, station.pm25, 0.75);
                const outerPoints = calculatePlumePoints(coords, windDirection, windSpeed, station.pm25, 1.0);
                
                return (
                  <Fragment key={`plumes-${station.station_id}`}>
                    <Polygon 
                      positions={outerPoints}
                      pathOptions={{
                        fillColor: color,
                        fillOpacity: 0.05,
                        color: color,
                        weight: 0.8,
                        opacity: 0.15,
                        dashArray: "3,5"
                      }}
                    />
                    <Polygon 
                      positions={midPoints}
                      pathOptions={{
                        fillColor: color,
                        fillOpacity: 0.16,
                        color: color,
                        weight: 1,
                        opacity: 0.3
                      }}
                    />
                    <Polygon 
                      positions={innerPoints}
                      pathOptions={{
                        fillColor: color,
                        fillOpacity: 0.32,
                        color: color,
                        weight: 1.5,
                        opacity: 0.5
                      }}
                    />
                  </Fragment>
                );
              })}

              {/* Station Markers */}
              {stations.map((station) => {
                const coords = getStationCoordinates(station.code);
                const health = stationHealth.get(station.station_id);
                const icon = getCustomMarkerIcon(health?.health_status, activeLayer, station);
                
                return (
                  <Marker 
                    key={station.station_id} 
                    position={coords} 
                    icon={icon}
                    eventHandlers={{
                      click: () => {
                        setSelectedStation(station);
                      }
                    }}
                  />
                );
              })}
            </MapContainer>

            {/* FLOATING CONTROLS */}
            <div className="map-floating-controls">
              {/* Layer selector */}
              <div className={`map-floating-panel ${activeBasemap === "dark" ? "map-floating-panel-dark" : "map-floating-panel-light"}`}>
                <button
                  type="button"
                  className={activeLayer === "pm25" ? "active" : ""}
                  onClick={() => setActiveLayer("pm25")}
                  aria-label="Mostrar camada PM2.5"
                >
                  PM2.5
                </button>
                <button
                  type="button"
                  className={activeLayer === "temp" ? "active" : ""}
                  onClick={() => setActiveLayer("temp")}
                  aria-label="Mostrar camada Temperatura"
                >
                  Temp
                </button>
                <button
                  type="button"
                  className={activeLayer === "humidity" ? "active" : ""}
                  onClick={() => setActiveLayer("humidity")}
                  aria-label="Mostrar camada Umidade"
                >
                  Umid
                </button>
              </div>

              {/* Basemap selector */}
              <div className={`map-floating-panel ${activeBasemap === "dark" ? "map-floating-panel-dark" : "map-floating-panel-light"}`}>
                <button
                  type="button"
                  className={activeBasemap === "light" ? "active" : ""}
                  onClick={() => setActiveBasemap("light")}
                  aria-label="Usar mapa claro"
                >
                  Claro
                </button>
                <button
                  type="button"
                  className={activeBasemap === "dark" ? "active" : ""}
                  onClick={() => setActiveBasemap("dark")}
                  aria-label="Usar mapa escuro"
                >
                  Escuro
                </button>
                <button
                  type="button"
                  className={activeBasemap === "osm" ? "active" : ""}
                  onClick={() => setActiveBasemap("osm")}
                  aria-label="Usar mapa padrão"
                >
                  Padrão
                </button>
              </div>

              {/* Plume Simulation toggle */}
              <div className={`map-floating-panel ${activeBasemap === "dark" ? "map-floating-panel-dark" : "map-floating-panel-light"}`}>
                <button
                  type="button"
                  className={showPlume ? "active" : ""}
                  onClick={() => setShowPlume(!showPlume)}
                  aria-label="Alternar simulação de pluma de vento"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <span>🌬️</span>
                  <span>{showPlume ? "Simulador Ativo" : "Simulador"}</span>
                </button>
              </div>
            </div>

            {/* WIND DISPERSION SIMULATOR HUD PANEL */}
            {showPlume && (
              <div className={`absolute bottom-4 left-4 z-[400] w-[calc(100%-2rem)] sm:w-[320px] rounded-[1.25rem] p-4 backdrop-blur-xl border transition-all duration-300 ${
                activeBasemap === "dark" 
                  ? "bg-slate-950/85 border-white/10 text-white shadow-[0_15px_30px_rgba(0,0,0,0.4)]" 
                  : "bg-white/85 border-black/10 text-text-primary shadow-[0_15px_30px_rgba(15,38,59,0.12)]"
              }`}>
                <div className="flex items-center justify-between mb-3 border-b border-black/5 dark:border-white/5 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🌬️</span>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-brand-primary dark:text-cyan-400">Simulador de Pluma</h4>
                      <p className="text-[10px] opacity-75">Dispersão de Poluição Atmosférica</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowPlume(false)} 
                    className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-xs opacity-70 hover:opacity-100 transition-opacity"
                    aria-label="Fechar simulador"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Wind Direction Section */}
                <div className="mb-4">
                  <span className="block text-[10px] font-bold uppercase tracking-wider mb-2 opacity-80">Direção do Vento (Soprando para)</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(["N", "NE", "L", "SE", "S", "SO", "O", "NO"] as const).map((dir) => {
                      const dirLabels: Record<string, string> = {
                        N: "↑ N",
                        NE: "↗ NE",
                        L: "→ L",
                        SE: "↘ SE",
                        S: "↓ S",
                        SO: "↙ SO",
                        O: "← O",
                        NO: "↖ NO"
                      };
                      return (
                        <button
                          key={dir}
                          type="button"
                          onClick={() => setWindDirection(dir)}
                          className={`py-1 text-center text-xs font-bold rounded-lg border transition-all duration-150 ${
                            windDirection === dir
                              ? activeBasemap === "dark"
                                ? "bg-cyan-500/20 border-cyan-400 text-cyan-400 font-extrabold shadow-sm shadow-cyan-500/20"
                                : "bg-brand-primary/15 border-brand-primary text-brand-primary font-extrabold shadow-sm shadow-brand-primary/10"
                              : activeBasemap === "dark"
                              ? "bg-white/5 border-white/5 hover:bg-white/10 text-slate-300"
                              : "bg-black/5 border-black/5 hover:bg-black/10 text-slate-700"
                          }`}
                        >
                          {dirLabels[dir]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Wind Speed Section */}
                <div className="mb-4">
                  <span className="block text-[10px] font-bold uppercase tracking-wider mb-2 opacity-80">Velocidade do Vento</span>
                  <div className="grid grid-cols-3 gap-2">
                    {(["low", "medium", "high"] as const).map((speed) => {
                      const speedLabels = { low: "Fraco", medium: "Médio", high: "Forte" };
                      const speedDesc = { low: "Dispersão Lenta (Cone Aberto)", medium: "Padrão", high: "Dispersão Rápida (Cone Estreito)" };
                      return (
                        <button
                          key={speed}
                          type="button"
                          onClick={() => setWindSpeed(speed)}
                          title={speedDesc[speed]}
                          className={`py-1 px-2 text-center text-xs font-bold rounded-lg border transition-all duration-150 ${
                            windSpeed === speed
                              ? activeBasemap === "dark"
                                ? "bg-cyan-500/20 border-cyan-400 text-cyan-400 font-extrabold"
                                : "bg-brand-primary/15 border-brand-primary text-brand-primary font-extrabold"
                              : activeBasemap === "dark"
                              ? "bg-white/5 border-white/5 hover:bg-white/10 text-slate-300"
                              : "bg-black/5 border-black/5 hover:bg-black/10 text-slate-700"
                          }`}
                        >
                          {speedLabels[speed]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Simulation Legend & Description */}
                <div className="rounded-lg p-2.5 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                  <p className="text-[9px] leading-tight opacity-75">
                    <strong>Modelo Físico Simplificado:</strong> Plumas com três zonas de decaimento gradual de poluentes de acordo com a velocidade do vento.
                  </p>
                  <div className="flex gap-2 mt-1.5 justify-start text-[9px] font-bold">
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" /> Excelente</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" /> Moderado</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" /> Crítico</span>
                  </div>
                </div>
              </div>
            )}

            {/* SELECTED STATION HUD PANEL */}
            {selectedStation && (
              <div className={`map-hud-panel ${activeBasemap === "dark" ? "map-hud-panel-dark" : ""}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Estação Selecionada</span>
                    <h3 className="font-bold text-base mt-0.5 leading-tight">{selectedStation.name}</h3>
                    <p className="text-xs opacity-80 mt-0.5">{selectedStation.bairro || "Região Metropolitana"}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedStation(null)} 
                    className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-xs opacity-70 hover:opacity-100 transition-opacity"
                    aria-label="Fechar painel de detalhes"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${selectedStation.is_online ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                  <span className="text-xs font-semibold">
                    {selectedStation.is_online ? "Online" : "Sem comunicação"}
                  </span>
                  {selectedStation.last_seen_at && (
                    <span className="text-[10px] opacity-60">
                      • {new Date(selectedStation.last_seen_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                </div>

                {/* Grid of values */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                    <span className="block text-[10px] opacity-60 font-medium">PM2.5</span>
                    <strong className="text-lg font-black mt-0.5 block leading-none">
                      {selectedStation.pm25 !== null ? `${Math.round(selectedStation.pm25)}` : "--"}
                      <small className="text-[10px] font-normal opacity-70 ml-1">µg/m³</small>
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                    <span className="block text-[10px] opacity-60 font-medium">PM10</span>
                    <strong className="text-lg font-black mt-0.5 block leading-none">
                      {selectedStation.pm10 !== null ? `${Math.round(selectedStation.pm10)}` : "--"}
                      <small className="text-[10px] font-normal opacity-70 ml-1">µg/m³</small>
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                    <span className="block text-[10px] opacity-60 font-medium">Temperatura</span>
                    <strong className="text-lg font-black mt-0.5 block leading-none">
                      {selectedStation.temp !== null ? `${selectedStation.temp.toFixed(1)}` : "--"}
                      <small className="text-[10px] font-normal opacity-70 ml-0.5">°C</small>
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                    <span className="block text-[10px] opacity-60 font-medium">Umidade</span>
                    <strong className="text-lg font-black mt-0.5 block leading-none">
                      {selectedStation.humidity !== null ? `${Math.round(selectedStation.humidity)}` : "--"}
                      <small className="text-[10px] font-normal opacity-70 ml-0.5">%</small>
                    </strong>
                  </div>
                </div>

                <Link
                  to={`/dados?station=${selectedStation.code}`}
                  className="flex min-h-11 w-full items-center justify-center text-center py-2.5 px-4 text-xs font-bold text-white bg-brand-primary dark:bg-accent-lab hover:bg-brand-primary-dark hover:shadow-lg dark:text-brand-primary-dark dark:hover:bg-cyan-400 rounded-xl transition-all duration-200 shadow-md"
                >
                  Ver histórico e gráficos completos
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        {!loading && (
          <div className="mt-4 rounded-[1.35rem] border border-brand-primary/10 bg-white/[0.88] p-4 shadow-[0_14px_36px_rgba(17,38,59,0.06)]">
            <p className="text-xs font-bold uppercase tracking-wide text-brand-primary mb-3">Legenda Operacional</p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <div className="map-custom-marker marker-ok" style={{ width: '24px', height: '24px', fontSize: '10px', borderWidth: '1.5px' }}>✓</div>
                <span className="text-xs text-text-secondary"><strong>Excelente:</strong> leitura confiável e comunicação ativa</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="map-custom-marker marker-degraded" style={{ width: '24px', height: '24px', fontSize: '10px', borderWidth: '1.5px' }}>⚠</div>
                <span className="text-xs text-text-secondary"><strong>Degradado:</strong> qualidade comprometida ou calibração necessária</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="map-custom-marker marker-offline" style={{ width: '24px', height: '24px', fontSize: '10px', borderWidth: '1.5px' }}>✕</div>
                <span className="text-xs text-text-secondary"><strong>Offline:</strong> sem comunicação com a estação</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="map-custom-marker marker-unknown" style={{ width: '24px', height: '24px', fontSize: '10px', borderWidth: '1.5px' }}>?</div>
                <span className="text-xs text-text-secondary"><strong>Desconhecido:</strong> dados ausentes ou não inicializado</span>
              </div>
            </div>
          </div>
        )}
      </SurfaceCard>

      {/* Accessible Fallback List */}
      <section id="mapa-lista" tabIndex={-1} aria-labelledby="mapa-lista-titulo">
        <SurfaceCard className="portal-list-panel p-6 md:p-8">
          <h2 id="mapa-lista-titulo" className="mb-4 text-lg font-bold text-brand-primary">Lista de estações</h2>
          <p className="mb-4 text-sm text-text-secondary">
            Informações acessíveis para leitores de tela e navegação sem JavaScript.
          </p>

          <div className="mb-6">
            <h3 className="mb-3 text-md font-bold text-text-primary">Estações de Monitoramento</h3>
            {loading ? (
              <p aria-live="polite" className="text-sm text-text-secondary" role="status">
                Carregando estações...
              </p>
            ) : stations.length === 0 ? (
              <p className="text-sm text-text-secondary">Nenhuma estação encontrada no momento.</p>
            ) : (
              <ul className="space-y-3">
                {stations.map((station) => (
                  <li key={station.station_id} className="rounded-[1.35rem] border border-border-subtle bg-surface-1 p-4 motion-surface motion-surface-hover">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-text-primary">{station.name}</h4>
                        {station.bairro && (
                          <p className="mt-1 text-sm text-text-secondary">{station.bairro}</p>
                        )}
                        <p className="mt-2 text-sm">
                          <span className="font-semibold">Status:</span>{" "}
                          <span className={station.is_online ? "text-accent-green" : "text-error"}>
                            {station.is_online ? "● Online" : "● Offline"}
                          </span>
                        </p>
                        {station.last_seen_at && (
                          <p className="mt-1 text-sm text-text-secondary">
                            Última atualização: {new Date(station.last_seen_at).toLocaleString("pt-BR")}
                          </p>
                        )}
                      </div>
                      <Link
                        to={`/dados?station=${station.code}`}
                        aria-label={`Abrir dados da estação ${station.name}`}
                        className="ui-btn-primary motion-focus motion-action px-4 py-2 text-sm"
                      >
                        Abrir dados da estação
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </SurfaceCard>
      </section>
    </section>
  );
}



