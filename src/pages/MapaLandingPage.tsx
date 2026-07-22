import { lazy, Suspense, useState } from "react";
import { Link } from "react-router-dom";

import { Chip, IconShell, SurfaceCard } from "../components/BrandSystem";
import { LoadingCard } from "../components/LoadingCard";

const InteractiveMapPage = lazy(() =>
  import("./MapaPage").then((module) => ({ default: module.MapaPage }))
);

const INEA_REFERENCE_STATIONS = [
  { id: "69", name: "VR-Belmonte" },
  { id: "70", name: "VR-Retiro" },
  { id: "71", name: "VR-Santa Cecília" }
];

export function MapaLandingPage() {
  const [mapRequested, setMapRequested] = useState(false);

  if (mapRequested) {
    return (
      <Suspense fallback={<LoadingCard message="Carregando mapa interativo e dados operacionais…" />}>
        <InteractiveMapPage />
      </Suspense>
    );
  }

  return (
    <section className="portal-stage map-stage space-y-8 md:space-y-10">
      <a href="#mapa-lista" className="inline-flex min-h-[44px] items-center rounded-full border border-brand-primary/20 bg-white/90 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-brand-primary shadow-sm shadow-brand-primary/5 focus:fixed focus:left-4 focus:top-4 focus:z-50">
        Pular mapa e ir para lista acessível
      </a>

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
              Consulte primeiro a lista acessível de estações públicas do INEA. O mapa operacional do SEMEAR usa tiles externos e dados dinâmicos, por isso é carregado somente quando você solicitar.
            </p>
          </div>
          <div className="portal-stage-stat gap-4">
            <span>{INEA_REFERENCE_STATIONS.length}</span>
            <small>estações INEA de referência</small>
            <div className="flex flex-wrap gap-2">
              <Chip tone="active">Acessível</Chip>
              <Chip tone="seed">Leitura sem mapa</Chip>
            </div>
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard className="grid gap-5 border-brand-primary/10 bg-gradient-to-br from-white via-white to-brand-primary-soft/45 p-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-8">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-brand-primary">Conteúdo opcional</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-text-primary">Mapa interativo e dados operacionais sob demanda</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-700 md:text-base">
            Ao carregar, o portal baixa a biblioteca do mapa, consulta o estado operacional e solicita imagens cartográficas de terceiros. A posição das estações SEMEAR nessa visualização é aproximada enquanto a rede própria está em implantação.
          </p>
        </div>
        <button type="button" className="ui-btn-primary min-h-12 px-6" onClick={() => setMapRequested(true)}>
          Carregar mapa interativo
        </button>
      </SurfaceCard>

      <section id="mapa-lista" tabIndex={-1} aria-labelledby="mapa-lista-titulo">
        <SurfaceCard className="portal-list-panel p-6 md:p-8">
          <h2 id="mapa-lista-titulo" className="text-xl font-black text-brand-primary">Lista de estações</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-700">
            Referências históricas identificadas no dicionário público da base INEA/WebLakes. Abra cada estação para consultar cobertura, histórico e limites metodológicos sem depender do mapa.
          </p>
          <ul className="mt-5 grid gap-3 md:grid-cols-3">
            {INEA_REFERENCE_STATIONS.map((station) => (
              <li key={station.id} className="rounded-[1.35rem] border border-border-subtle bg-white p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-600">Estação pública INEA {station.id}</p>
                <h3 className="mt-2 text-lg font-black text-text-primary">{station.name}</h3>
                <Link className="mt-4 inline-flex min-h-11 items-center font-black text-brand-primary hover:underline" to={`/qualidade-ar/inea/estacoes/${station.id}`}>
                  Abrir dados da estação →
                </Link>
              </li>
            ))}
          </ul>
        </SurfaceCard>
      </section>
    </section>
  );
}
