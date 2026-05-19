import { IconShell, SurfaceCard } from "../components/BrandSystem";
import { INSTITUTIONAL_CITATION, INSTITUTIONAL_COORDINATION, INSTITUTIONAL_FUNDING, INSTITUTIONAL_SUMMARY, INSTITUTIONAL_TAGLINE, INSTITUTIONAL_UNIVERSITY_FULL_NAME } from "../content/institucional";

export function SobrePage() {
  return (
    <section className="portal-stage about-stage space-y-8 md:space-y-10">
      {/* Hero Section */}
      <SurfaceCard className="portal-stage-hero portal-stage-hero-lab overflow-hidden p-0">
        <div className="portal-stage-hero-inner">
          <div className="portal-stage-copy">
            <IconShell tone="brand" className="portal-stage-icon"><span className="font-black" aria-hidden="true">UFF</span></IconShell>
            <h1>Sistema de Monitoramento e Memória Socioambiental</h1>
            <p>{INSTITUTIONAL_SUMMARY}</p>
            <p className="!text-sm">{INSTITUTIONAL_CITATION}</p>
          </div>
          <div className="portal-stage-stat">
            <span>SEMEAR</span>
            <small>{INSTITUTIONAL_UNIVERSITY_FULL_NAME}</small>
          </div>
        </div>
      </SurfaceCard>

      {/* Institutional Framework */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="portal-list-panel rounded-[1.75rem] p-6">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-xl font-black text-text-primary">Projeto Público-Universitário</h2>
          <p className="mt-3 text-base text-text-secondary">
            {INSTITUTIONAL_TAGLINE}. Iniciativa da {INSTITUTIONAL_UNIVERSITY_FULL_NAME} (UFF) voltada para o monitoramento científico da qualidade do ar e a construção de memória socioambiental participativa.
          </p>
        </div>

        <div className="portal-list-panel rounded-[1.75rem] p-6">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-green/10 text-accent-green">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-black text-text-primary">Financiamento por Emenda Parlamentar</h2>
          <p className="mt-3 text-base text-text-secondary">
            {INSTITUTIONAL_FUNDING} com transparência total na aplicação dos investimentos e prestação de contas acessível à população.
          </p>
        </div>
      </section>

      {/* Core Principles */}
      <SurfaceCard className="portal-list-panel p-6 md:p-8">
        <h2 className="mb-6 text-2xl font-black text-text-primary">Princípios e Valores</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-primary text-white">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-text-primary">Ciência Aberta</h3>
            <p className="mt-2 text-sm text-text-secondary">
              Dados científicos acessíveis em tempo real, metodologia transparente e resultados de pesquisa compartilhados publicamente para o bem comum.
            </p>
          </div>

          <div>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-success text-white">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-text-primary">Vigilância Popular em Saúde</h3>
            <p className="mt-2 text-sm text-text-secondary">
              Empoderamento comunitário através do monitoramento participativo da qualidade do ar, promovendo justiça ambiental e saúde coletiva.
            </p>
          </div>

          <div>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-brown text-white">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-text-primary">Memória Pública</h3>
            <p className="mt-2 text-sm text-text-secondary">
              Preservação e disponibilização de acervo histórico sobre questões socioambientais, construindo memória coletiva e registro permanente.
            </p>
          </div>
        </div>
      </SurfaceCard>

      {/* What We Do */}
      <SurfaceCard className="portal-list-panel p-6 md:p-8">
        <h2 className="mb-6 text-2xl font-black text-text-primary">O Que Fazemos</h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-accent-green/10 text-accent-green">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-text-primary">Monitoramento da Qualidade do Ar</h3>
              <p className="mt-1 text-sm text-text-secondary">
                Estações de medição em tempo real de material particulado (MP2.5 e MP10), disponibilizando dados científicos para a população e órgãos públicos.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-text-primary">Acervo Documental e Histórico</h3>
              <p className="mt-1 text-sm text-text-secondary">
                Coleção curada de documentos, imagens, reportagens e materiais científicos sobre questões socioambientais da região.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-accent-yellow/10 text-accent-brown">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-text-primary">Atividades Públicas e Formação</h3>
              <p className="mt-1 text-sm text-text-secondary">
                Oficinas, conversas públicas, apresentações de dados e encontros formativos sobre meio ambiente, saúde e participação social.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-text-primary">Mapeamento de Corredores Climáticos</h3>
              <p className="mt-1 text-sm text-text-secondary">
                Identificação e documentação de rotas e territórios estratégicos para adaptação climática e infraestrutura verde urbana.
              </p>
            </div>
          </div>
        </div>
      </SurfaceCard>

      {/* Team & Contact */}
      <SurfaceCard className="portal-list-panel border-brand-primary/15 bg-brand-primary-soft p-6 md:p-8">
        <h2 className="mb-4 text-2xl font-black text-brand-primary">Coordenação e Contato</h2>
        <p className="text-base text-text-primary">
          <strong>Coordenação Institucional:</strong> {INSTITUTIONAL_COORDINATION}
        </p>
        <p className="mt-2 text-base text-text-primary">
          <strong>E-mail:</strong> <a href="mailto:contato@semear.uff.br" className="text-brand-primary hover:underline">contato@semear.uff.br</a>
        </p>
        <p className="mt-2 text-base text-text-primary">
          <strong>Transparência:</strong> Acesse a <a href="/transparencia" className="text-brand-primary hover:underline">prestação de contas completa</a>
        </p>
      </SurfaceCard>
    </section>
  );
}
