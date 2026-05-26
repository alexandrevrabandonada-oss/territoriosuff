import { Link } from "react-router-dom";
import { IconShell, SurfaceCard } from "../../components/BrandSystem";
import { MethodologyNotice } from "../../components/air/MethodologyNotice";

export function RadarLandingPage() {
  return (
    <section className="portal-stage space-y-8 md:space-y-10">
      {/* Hero Section */}
      <SurfaceCard className="portal-stage-hero portal-stage-hero-lab overflow-hidden p-0">
        <div className="portal-stage-hero-inner">
          <div className="portal-stage-copy">
            <IconShell tone="brand" className="portal-stage-icon">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </IconShell>
            <h1>Portal de Qualidade do Ar</h1>
            <p>
              Consulte as leituras de qualidade do ar em Volta Redonda-RJ por meio de redes oficiais e redes complementares de monitoramento cidadão.
            </p>
          </div>
          <div className="portal-stage-stat">
            <span>2 Redes</span>
            <small>INEA & SEMEAR UFF</small>
          </div>
        </div>
      </SurfaceCard>

      {/* Information block */}
      <MethodologyNotice />

      {/* Selector Options */}
      <section className="grid gap-6 md:grid-cols-2">
        {/* SEMEAR local sensor network */}
        <SurfaceCard className="portal-list-panel p-6 flex flex-col justify-between h-full">
          <div>
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-text-primary">Rede Cidadã SEMEAR UFF</h2>
            <p className="mt-3 text-sm text-text-secondary leading-relaxed">
              Monitore sensores complementares instalados em Volta Redonda com leituras instantâneas minuto a minuto. Mede concentrações físicas brutas de partículas PM2.5 e PM10 em µg/m³.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-text-secondary list-disc pl-4 leading-relaxed">
              <li>Leitura de concentração física bruta (µg/m³)</li>
              <li>Dados atualizados minuto a minuto</li>
              <li>Histórico de 24h, 7 dias e buscas personalizadas</li>
            </ul>
          </div>
          <div className="mt-6">
            <Link
              to="/dados"
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-brand-primary px-5 py-2 text-xs font-black uppercase tracking-[0.12em] text-white hover:bg-brand-primary-dark transition-colors w-full sm:w-auto"
            >
              Acessar Rede SEMEAR UFF
            </Link>
          </div>
        </SurfaceCard>

        {/* Official INEA Data */}
        <SurfaceCard className="portal-list-panel p-6 flex flex-col justify-between h-full">
          <div>
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-lab/10 text-accent-lab">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 12H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 12V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-text-primary">Radar do Ar — INEA</h2>
            <p className="mt-3 text-sm text-text-secondary leading-relaxed">
              Painel de dados históricos oficiais baseado no inventário de monitoramento público do INEA. Apresenta o Índice IQAr consolidado e os subíndices de poluentes.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-text-secondary list-disc pl-4 leading-relaxed">
              <li>Leitura baseada nos subíndices oficiais do INEA (adimensional)</li>
              <li>Apresenta a classificação de qualidade oficial (BOA, MODERADA, etc.)</li>
              <li>Séries históricas e mapas das 4 estações em Volta Redonda</li>
            </ul>
          </div>
          <div className="mt-6">
            <Link
              to="/qualidade-ar/inea"
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-accent-lab px-5 py-2 text-xs font-black uppercase tracking-[0.12em] text-brand-primary-dark hover:bg-cyan-400 transition-colors w-full sm:w-auto"
            >
              Acessar Radar do Ar INEA
            </Link>
          </div>
        </SurfaceCard>
      </section>
    </section>
  );
}
