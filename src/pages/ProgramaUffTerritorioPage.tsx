import { Link } from "react-router-dom";

import { Chip, SectionHeader, SurfaceCard } from "../components/BrandSystem";
import { BudgetBreakdown } from "../components/programa/BudgetBreakdown";
import { GovernanceModel } from "../components/programa/GovernanceModel";
import { InteractiveFronts } from "../components/programa/InteractiveFronts";
import { Timeline24Months } from "../components/programa/Timeline24Months";
import {
  budgetSlices,
  deliveryHighlights,
  executiveNarrative,
  expansionBlocks,
  governanceActors,
  publicLegacyItems,
  programFronts,
  programHeroMetrics,
  programReasons,
  solutionBlocks,
  timelinePhases
} from "../content/programaUffTerritorio";

function ArrowRightIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-5-5l5 5-5 5" />
    </svg>
  );
}

export function ProgramaUffTerritorioPage() {
  return (
    <div className="space-y-8 md:space-y-10">
      <SurfaceCard className="relative overflow-hidden border-brand-primary/10 bg-[linear-gradient(135deg,rgba(247,251,255,0.98),rgba(255,255,255,0.98)_42%,rgba(255,248,238,0.98))] px-5 py-6 shadow-[0_24px_64px_rgba(17,38,59,0.09)] md:px-7 md:py-8">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -left-20 top-0 h-56 w-56 rounded-full bg-brand-primary/10 blur-3xl" />
          <div className="absolute right-0 top-10 h-56 w-56 rounded-full bg-accent-lab/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-accent-yellow/10 blur-3xl" />
        </div>
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.16fr)_minmax(340px,0.84fr)] lg:items-start">
          <div className="space-y-7">
            <div className="flex flex-wrap items-center gap-2.5">
              <Chip tone="active">Nova frente institucional</Chip>
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700">proposta integrada para o Médio Paraíba</span>
            </div>

            <div className="space-y-5">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-primary-dark">Programa UFF + Território</p>
              <h1 className="max-w-4xl text-4xl font-black leading-[0.9] tracking-[-0.05em] text-text-primary md:text-6xl xl:text-[4.8rem]">
                Observatório Popular do Médio Paraíba
              </h1>
              <p className="max-w-3xl text-base leading-relaxed text-slate-700 md:text-lg xl:text-[1.15rem]">
                Proposta institucional de R$ 1,5 milhão para enfrentar um problema real do território com uma solução integrada, factível e escalável, apoiada na infraestrutura digital, metodológica e institucional já em construção no SEMEAR.
              </p>
              <div className="max-w-3xl rounded-[1.5rem] border border-brand-primary/12 bg-white/80 p-4 backdrop-blur-sm md:p-5">
                <p className="text-sm font-semibold leading-relaxed text-text-primary md:text-base">
                  Um arranjo entre <span className="text-brand-primary-dark">UFF</span>, <span className="text-brand-primary-dark">FEC</span> e <span className="text-brand-primary-dark">Associação Popular pela Sustentabilidade</span> para transformar conhecimento, dados, presença comunitária e memória pública em capacidade concreta de resposta territorial.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a href="#frentes" className="ui-cta-primary px-6">
                Conheça as frentes
              </a>
              <a href="#governanca" className="ui-btn-secondary px-6">
                Ver governança
              </a>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {programHeroMetrics.map((metric) => (
                <div key={metric.label} className="rounded-[1.35rem] border border-border-subtle bg-white/85 p-4 shadow-sm backdrop-blur-sm transition-transform duration-200 hover:-translate-y-0.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700">{metric.label}</p>
                  <p className="mt-2 text-2xl font-black text-text-primary">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-brand-primary/15 bg-[#12304a] p-6 text-white shadow-[0_24px_52px_rgba(18,48,74,0.22)] md:p-7">
            <div
              className="pointer-events-none absolute -right-16 top-0 h-40 w-40 rounded-full opacity-60"
              style={{ background: "radial-gradient(circle at center, rgba(163,216,50,0.35) 0%, transparent 70%)" }}
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 rounded-full opacity-60"
              style={{ background: "radial-gradient(circle at center, rgba(0,183,177,0.28) 0%, transparent 70%)" }}
              aria-hidden="true"
            />

            <div className="relative space-y-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">Arranjo institucional</p>
                <h2 className="mt-2 text-2xl font-black leading-tight">Uma governança capaz de sair do diagnóstico e chegar à ação pública</h2>
              </div>

              <div className="space-y-3">
                <div className="rounded-[1.35rem] border border-white/12 bg-white/10 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/65">Coordenação</p>
                  <p className="mt-1 text-base font-semibold text-white">Universidade Federal Fluminense</p>
                </div>
                <div className="rounded-[1.35rem] border border-white/12 bg-white/10 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/65">Execução e apoio administrativo</p>
                  <p className="mt-1 text-base font-semibold text-white">Fundação Euclides da Cunha</p>
                </div>
                <div className="rounded-[1.35rem] border border-accent-seed/20 bg-[#f4f9e8] p-4 text-text-primary">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent-green">Coexecução territorial</p>
                  <p className="mt-1 text-base font-semibold">Associação Popular pela Sustentabilidade</p>
                </div>
              </div>

              <div className="rounded-[1.35rem] border border-white/12 bg-white/8 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/65">Resultado esperado</p>
                <p className="mt-1 text-sm leading-relaxed text-white/80">Dados públicos mais claros, presença territorial mais forte e pilotos com capacidade real de replicação.</p>
              </div>
            </div>
          </div>
        </div>
      </SurfaceCard>

      <section className="space-y-6">
        <SectionHeader
          eyebrow="Síntese executiva"
          title="Uma narrativa simples: problema real, solução integrada e capacidade de escala"
          description="A proposta foi desenhada para comunicar propósito, viabilidade, bom uso do recurso público e legado sem perder clareza institucional."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {executiveNarrative.map((item, index) => (
            <SurfaceCard
              key={item.title}
              className={[
                "rounded-[1.75rem] p-6 md:p-7",
                index === 0 ? "bg-white" : "",
                index === 1 ? "bg-gradient-to-br from-brand-primary-soft/70 via-white to-surface-2" : "",
                index === 2 ? "bg-gradient-to-br from-[#fff8ee] via-white to-[#fff1d6]" : ""
              ].join(" ")}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700">{item.eyebrow}</p>
              <h2 className="mt-3 text-2xl font-black leading-tight text-text-primary">{item.title}</h2>
              <p className="mt-3 text-base leading-relaxed text-slate-700">{item.body}</p>
            </SurfaceCard>
          ))}
        </div>
      </section>

      <section id="porque" className="scroll-mt-32 space-y-6">
        <SectionHeader
          eyebrow="1. Problema real do território"
          title="O programa parte de um problema público concreto, não de uma solução abstrata"
          description="A proposta responde a condições territoriais já instaladas e a uma demanda real por informação pública, capacidade de coordenação e presença local qualificada."
        />

        <div className="grid gap-4 lg:grid-cols-2">
          {programReasons.map((reason, index) => (
            <SurfaceCard
              key={reason.title}
              className={[
                "rounded-[1.75rem] p-6 md:p-7",
                index === 0 ? "bg-gradient-to-br from-white via-white to-brand-primary-soft/55" : "bg-gradient-to-br from-[#fffaf2] via-white to-[#fff1d6]"
              ].join(" ")}
            >
              <h2 className="text-2xl font-black leading-tight text-text-primary">{reason.title}</h2>
              <p className="mt-3 text-base leading-relaxed text-slate-700">{reason.body}</p>
            </SurfaceCard>
          ))}
        </div>
      </section>

      <section id="solucao" className="scroll-mt-32 space-y-6">
        <SectionHeader
          eyebrow="2. Solução integrada"
          title="Uma solução que articula dados, território, formação e memória pública"
          description="A resposta proposta não depende de uma única frente. Ela organiza uma arquitetura integrada para produzir evidência, ação territorial e inteligência pública em um mesmo desenho."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {solutionBlocks.map((item, index) => (
            <SurfaceCard
              key={item.title}
              className={[
                "rounded-[1.75rem] p-6 md:p-7",
                index === 0 ? "bg-gradient-to-br from-brand-primary-soft/75 via-white to-surface-2" : "",
                index === 1 ? "bg-gradient-to-br from-[#f7fbef] via-white to-[#eef8db]" : "",
                index === 2 ? "bg-gradient-to-br from-[#fff8ee] via-white to-[#fff1d6]" : ""
              ].join(" ")}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700">{item.eyebrow}</p>
              <h2 className="mt-3 text-2xl font-black leading-tight text-text-primary">{item.title}</h2>
              <p className="mt-3 text-base leading-relaxed text-slate-700">{item.body}</p>
            </SurfaceCard>
          ))}
        </div>
      </section>

      <section id="frentes" className="scroll-mt-32 space-y-6">
        <SectionHeader
          eyebrow="Frentes de implementação"
          title="Quatro frentes conectadas em uma mesma estratégia de entrega pública"
          description="Cada frente responde a um problema concreto e se conecta às demais por dados, ação territorial, formação, memória e devolutiva pública."
        />
        <InteractiveFronts fronts={programFronts} />
      </section>

      <section id="entregas" className="scroll-mt-32 space-y-6">
        <SectionHeader
          eyebrow="4. Entregas concretas"
          title="O investimento se traduz em produtos públicos, pilotos e capacidade instalada"
          description="As entregas previstas combinam resultados visíveis no curto prazo com construção de base pública para continuidade institucional e territorial."
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {deliveryHighlights.map((item, index) => (
            <SurfaceCard
              key={item.title}
              className={[
                "rounded-[1.75rem] p-5 md:p-6",
                index % 3 === 0 ? "bg-white" : "",
                index % 3 === 1 ? "bg-gradient-to-br from-brand-primary-soft/60 via-white to-surface-2" : "",
                index % 3 === 2 ? "bg-gradient-to-br from-[#fff8ee] via-white to-[#fff1d6]" : ""
              ].join(" ")}
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80 text-sm font-black text-brand-primary shadow-sm">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h2 className="mt-4 text-xl font-black leading-tight text-text-primary">{item.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-700 md:text-base">{item.body}</p>
            </SurfaceCard>
          ))}
        </div>
      </section>

      <section id="governanca" className="scroll-mt-32 space-y-6">
        <SectionHeader
          eyebrow="3. Arranjo institucional sólido"
          title="Governança compartilhada com papéis claros de coordenação, execução e presença territorial"
          description="UFF responde pela coordenação acadêmica e científica, a FEC pela gestão administrativa, financeira e contratual, e a Associação Popular pela Sustentabilidade pela coexecução territorial e comunitária do programa."
        />
        <GovernanceModel actors={governanceActors} />
      </section>

      <section id="base-existente" className="scroll-mt-32 space-y-6">
        <SectionHeader
          eyebrow="Base existente e viabilidade"
          title="A proposta amplia uma base já em construção e melhora a eficiência do investimento"
          description="A plataforma, os fluxos editoriais e a identidade pública do SEMEAR já estão em operação. Isso reduz tempo de implantação, qualifica a execução e fortalece a escala regional da proposta."
          action={
            <Link to="/sobre" className="ui-btn-ghost px-4">
              Ver base atual
            </Link>
          }
        />

        <div className="grid gap-4 lg:grid-cols-2">
          {expansionBlocks.map((item, index) => (
            <SurfaceCard
              key={item.title}
              className={[
                "rounded-[1.75rem] p-6 md:p-7",
                index === 0 ? "bg-gradient-to-br from-brand-primary-soft/75 via-white to-surface-2" : "bg-gradient-to-br from-[#fff8ee] via-white to-[#fff3d9]"
              ].join(" ")}
            >
              <h2 className="text-2xl font-black leading-tight text-text-primary">{item.title}</h2>
              <p className="mt-3 text-base leading-relaxed text-slate-700">{item.body}</p>
            </SurfaceCard>
          ))}
        </div>
      </section>

      <section id="cronograma" className="scroll-mt-32 space-y-6">
        <SectionHeader
          eyebrow="5. Cronograma factível"
          title="Quatro fases para implantar, operar, ampliar e consolidar o programa"
          description="O desenho temporal distribui implantação, pilotos, expansão e consolidação em um ciclo plausível de 24 meses, com entregas progressivas e validação territorial."
        />
        <Timeline24Months phases={timelinePhases} />
      </section>

      <section id="orcamento" className="scroll-mt-32 space-y-6">
        <SectionHeader
          eyebrow="6. Orçamento preliminar consistente"
          title="Distribuição orientada por presença territorial, equipe, dados e entrega pública"
          description="A composição preliminar demonstra coerência entre finalidade pública, capacidade de execução e expansão da base já existente do SEMEAR, sem duplicação de sistemas."
        />
        <BudgetBreakdown items={budgetSlices} totalLabel="R$ 1,5 milhão" />
      </section>

      <section id="legado" className="scroll-mt-32 space-y-6">
        <SectionHeader
          eyebrow="7. Legado público acumulativo"
          title="O programa deixa método, rede, acervo e pilotos replicáveis"
          description="Ao final do ciclo, o resultado esperado não é apenas execução. É capacidade pública acumulada para continuidade territorial, institucional e regional."
        />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
          <SurfaceCard className="overflow-hidden rounded-[2rem] border-brand-primary/12 bg-gradient-to-br from-[#12304a] via-[#183b58] to-[#0f5b78] p-6 text-white md:p-8">
            <div className="space-y-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">Legado estratégico</p>
              <h2 className="max-w-[16ch] text-3xl font-black leading-[1] md:text-[3.2rem]">Não é só uma execução. É uma capacidade pública que permanece.</h2>
              <p className="max-w-2xl text-sm leading-relaxed text-white/80 md:text-base">
                O legado esperado combina método, rede, acervo e pilotos com potência de continuidade. A proposta entrega resultados agora, mas também deixa infraestrutura institucional e territorial para o ciclo seguinte.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.35rem] border border-white/12 bg-white/10 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/65">Método</p>
                  <p className="mt-2 text-2xl font-black">1 arquitetura</p>
                </div>
                <div className="rounded-[1.35rem] border border-white/12 bg-white/10 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/65">Rede</p>
                  <p className="mt-2 text-2xl font-black">múltiplos atores</p>
                </div>
                <div className="rounded-[1.35rem] border border-white/12 bg-white/10 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/65">Replicação</p>
                  <p className="mt-2 text-2xl font-black">novos territórios</p>
                </div>
              </div>
            </div>
          </SurfaceCard>

          <div className="grid gap-4 md:grid-cols-2">
            {publicLegacyItems.map((item, index) => (
              <SurfaceCard
                key={item.title}
                className={[
                  "rounded-[1.75rem] p-5 md:p-6",
                  index === 0 ? "bg-white" : "",
                  index === 1 ? "bg-gradient-to-br from-[#f7fbef] via-white to-[#eef8db]" : "",
                  index === 2 ? "bg-gradient-to-br from-brand-primary-soft/60 via-white to-surface-2" : "",
                  index === 3 ? "bg-gradient-to-br from-[#fff8ee] via-white to-[#fff1d6]" : ""
                ].join(" ")}
              >
                <div className="space-y-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80 text-sm font-black text-brand-primary shadow-sm">
                    0{index + 1}
                  </span>
                  <h2 className="text-xl font-black leading-tight text-text-primary">{item.title}</h2>
                  <p className="text-sm leading-relaxed text-slate-700">{item.body}</p>
                </div>
              </SurfaceCard>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-brand-primary/12 bg-gradient-to-r from-[#12304a] via-[#183b58] to-[#0f5b78] px-6 py-7 text-white md:px-8 md:py-9">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">Rodapé institucional</p>
            <h2 className="text-2xl font-black leading-tight md:text-3xl">Uma proposta viável para responder ao território, qualificar o uso do recurso público e deixar legado regional</h2>
            <p className="text-sm leading-relaxed text-white/80 md:text-base">
              Página institucional criada sobre a base do SEMEAR para apresentação a parceiros, gabinetes e instituições, com foco em clareza de propósito, consistência executiva e capacidade pública de escala.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a href="#frentes" className="ui-btn-secondary border-white/15 bg-white/10 px-5 text-white hover:bg-white/15">
              Revisitar frentes
            </a>
            <Link to="/governanca" className="ui-btn-secondary border-white/15 bg-white/10 px-5 text-white hover:bg-white/15">
              Governança do portal
              <ArrowRightIcon />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
