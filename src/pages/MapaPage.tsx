import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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

function getHealthMarkerIcon(health: string | undefined) {
  const colors: Record<string, { bg: string; text: string }> = {
    ok: { bg: '#22c55e', text: '#fff' },        // green
    degraded: { bg: '#eab308', text: '#000' },  // yellow
    offline: { bg: '#ef4444', text: '#fff' },   // red
    unknown: { bg: '#a1a1a1', text: '#fff' }    // gray
  };
  
  const color = colors[health || 'unknown'];
  
  return new L.DivIcon({
    html: `<div style="
      background-color: ${color.bg};
      color: ${color.text};
      border: 2px solid white;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">
      ${health === 'ok' ? '✓' : health === 'degraded' ? '⚠' : health === 'offline' ? '✕' : '?'}
    </div>`,
    className: 'leaflet-health-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

export function MapaPage() {
  const [stations, setStations] = useState<StationOverview[]>([]);
  const [stationHealth, setStationHealth] = useState<Map<string, StationHealth>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);


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
    const firstStation = stations[0];
    return getStationCoordinates(firstStation.code);
  }, [stations]);

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
          <div className="relative" style={{ height: "520px" }}>
            <MapContainer
              center={mapCenter}
              zoom={13}
              scrollWheelZoom={false}
              style={{ height: "100%", width: "100%", borderRadius: "1rem" }}
              className="z-0 rounded-[1rem]"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Station Markers */}
              {stations.map((station) => {
                const coords = getStationCoordinates(station.code);
                const health = stationHealth.get(station.station_id);
                const icon = getHealthMarkerIcon(health?.health_status);
                
                return (
                  <Marker key={station.station_id} position={coords} icon={icon}>
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-bold text-sm mb-1">{station.name}</h3>
                        <p className="text-xs text-text-secondary mb-2">
                          Status: <span className={station.is_online ? "text-accent-green" : "text-error"}>
                            {station.is_online ? "● Online" : "● Offline"}
                          </span>
                        </p>
                        {health && (
                          <p className="text-xs text-text-secondary mb-2">
                            Qualidade: <span className="font-bold">{health.health_status === 'ok' ? 'Excelente' : health.health_status === 'degraded' ? 'Degradado' : health.health_status === 'offline' ? 'Offline' : 'Desconhecido'}</span>
                          </p>
                        )}
                        {station.bairro && (
                          <p className="text-xs text-text-secondary mb-2">{station.bairro}</p>
                        )}
                        <Link
                          to={`/dados?station=${station.code}`}
                          aria-label={`Abrir dados da estação ${station.name}`}
                          className="ui-btn-primary motion-focus motion-action mt-2 px-3 py-1 text-xs"
                        >
                          Abrir dados da estação
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        )}

        {/* Legend */}
        {!loading && (
          <div className="mt-4 rounded-[1.35rem] border border-brand-primary/10 bg-white/[0.88] p-4 shadow-[0_14px_36px_rgba(17,38,59,0.06)]">
            <p className="text-xs font-bold uppercase tracking-wide text-brand-primary mb-3">Legenda</p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <div style={{ backgroundColor: '#22c55e', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>✓</div>
                <span className="text-xs text-text-secondary"><strong>Excelente:</strong> leitura confiável</span>
              </div>
              <div className="flex items-center gap-2">
                <div style={{ backgroundColor: '#eab308', color: '#000', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>⚠</div>
                <span className="text-xs text-text-secondary"><strong>Degradado:</strong> qualidade comprometida</span>
              </div>
              <div className="flex items-center gap-2">
                <div style={{ backgroundColor: '#ef4444', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>✕</div>
                <span className="text-xs text-text-secondary"><strong>Offline:</strong> sem comunicação</span>
              </div>
              <div className="flex items-center gap-2">
                <div style={{ backgroundColor: '#a1a1a1', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>?</div>
                <span className="text-xs text-text-secondary"><strong>Desconhecido:</strong> sem dados</span>
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



