import { Link } from "react-router-dom";
import { IconShell, SurfaceCard } from "../components/BrandSystem";
import { PortalHero, PortalPageShell, PortalSectionHeader } from "../components/portal";

const quickLinks = [
  { href: "/dados", label: "Painel de dados", description: "Veja medições recentes por estação." },
  { href: "/qualidade-ar/inea", label: "Radar INEA", description: "Entenda séries históricas, lacunas e evidências." },
  { href: "/acervo/linha", label: "Linha do tempo", description: "Compare contexto histórico e documentos." },
  { href: "/relatorios", label: "Relatórios", description: "Acesse leituras técnicas e sínteses públicas." },
  { href: "/conversar", label: "Conversas e atividades", description: "Leve dúvidas e evidências para escuta pública." },
  { href: "/agenda", label: "Agenda pública", description: "Participe das ações territoriais." }
];

const readingSteps = [
  {
    number: "1",
    title: "Comece pelo tempo",
    body: "Veja se o valor é pontual, persistente ou parte de uma sequência. Uma medição isolada pede cautela; várias horas elevadas indicam sinal mais robusto.",
    check: "Pergunta-chave: isso aconteceu uma vez ou está se repetindo?"
  },
  {
    number: "2",
    title: "Compare poluentes",
    body: "MP2.5, MP10, NO₂, SO₂ e CO contam histórias diferentes. Quando mais de um indicador sobe ao mesmo tempo, a leitura pública ganha força.",
    check: "Pergunta-chave: o padrão aparece em um poluente ou em vários?"
  },
  {
    number: "3",
    title: "Olhe a estação e o território",
    body: "Dados variam por posição da estação, vento, relevo, fontes próximas e manutenção. Compare bairros sem transformar estação em diagnóstico individual.",
    check: "Pergunta-chave: qual estação mediu e qual contexto territorial importa?"
  },
  {
    number: "4",
    title: "Transforme leitura em ação",
    body: "Use classificações de risco como orientação pública: informar, prevenir, registrar evidências e cobrar resposta, não para produzir pânico ou conclusão causal isolada.",
    check: "Pergunta-chave: qual decisão pública fica melhor informada por este dado?"
  }
];

const pollutantCards = [
  {
    label: "MP2.5",
    title: "Partículas finas",
    meaning: "Penetram mais profundamente no sistema respiratório e são importantes para atenção preventiva.",
    caution: "Um pico curto não substitui análise de tendência, exposição e contexto meteorológico."
  },
  {
    label: "MP10",
    title: "Partículas inaláveis",
    meaning: "Ajuda a perceber poeira, ressuspensão e material particulado mais grosso no ar.",
    caution: "Valores altos junto com MP2.5 reforçam atenção; sozinho, exige checar fonte e horário."
  },
  {
    label: "NO₂ / SO₂",
    title: "Gases indicadores",
    meaning: "Podem apontar pressão de combustão, atividade industrial ou tráfego, conforme estação e contexto.",
    caution: "Leia com série histórica e disponibilidade de dados para evitar conclusão apressada."
  },
  {
    label: "CO",
    title: "Monóxido de carbono",
    meaning: "Indicador útil para episódios específicos de combustão e qualidade do ar local.",
    caution: "A ausência de alta em CO não significa ausência de outros riscos ambientais."
  }
];

const commonMistakes = [
  "Comparar bairros sem verificar se as estações medem os mesmos poluentes e têm a mesma disponibilidade de dados.",
  "Usar um valor de uma única hora como prova definitiva de causa, dano ou responsabilidade.",
  "Ignorar vento, chuva, manutenção, lacunas e mudança de equipamento na leitura de séries longas.",
  "Tratar classificação pública de risco como diagnóstico médico individual.",
  "Confundir ausência de dado com ausência de poluição: lacuna de medição também é informação pública relevante."
];

const audienceGuides = [
  {
    title: "Moradores",
    body: "Acompanhe tendência recente, registre data, horário, bairro e percepção local. Use o portal para conversar com evidência, não apenas impressão."
  },
  {
    title: "Escolas e CRAS",
    body: "Observe horários de maior atenção e planeje atividades externas com cautela quando houver persistência de indicadores elevados."
  },
  {
    title: "Imprensa",
    body: "Cruze números com metodologia, fonte, período e lacunas. Evite manchetes baseadas em um único ponto sem contexto."
  },
  {
    title: "Gestão pública",
    body: "Use séries, território e vulnerabilidade social para priorizar prevenção, resposta e transparência operacional."
  }
];

export function ComoLerDadosPage() {
  return (
    <PortalPageShell>
      <PortalHero
        tone="lab"
        badge={<span className="badge-metodologia">Biblioteca pedagógica</span>}
        title="Como ler os dados"
        subtitle="Um guia público para interpretar qualidade do ar com contexto, cautela metodológica e foco em ação coletiva."
        metrics={
          <>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-white">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/70">Método</div>
              <div className="mt-2 text-3xl font-black">4</div>
              <div className="mt-1 text-xs font-bold text-white/75">camadas de leitura</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-white">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/70">Foco</div>
              <div className="mt-2 text-lg font-black">Contexto antes da conclusão</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-white">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/70">Resultado</div>
              <div className="mt-2 text-lg font-black">Decisão pública melhor informada</div>
            </div>
          </>
        }
        aside={
          <div className="space-y-3">
            <div className="rounded-[1.8rem] border border-white/10 bg-white/10 p-5 text-white backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <IconShell tone="lab" className="portal-stage-icon"><span aria-hidden="true">📊</span></IconShell>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/70">Guia público</div>
                  <div className="mt-1 text-base font-black">Entenda o que um indicador diz, o que ele não diz e onde buscar contexto.</div>
                </div>
              </div>
            </div>
            <div className="rounded-[1.35rem] border border-white/10 bg-white/10 p-4 text-sm leading-relaxed text-white/82">
              Regra de ouro: dado ambiental bom para política pública é lido com fonte, horário, série, território e limite de interpretação.
            </div>
          </div>
        }
      />

      <SurfaceCard className="overflow-hidden border-brand-primary/10 bg-gradient-to-br from-white via-sky-50/80 to-emerald-50/70 p-0 shadow-[0_24px_80px_rgba(17,38,59,0.10)]">
        <div className="grid gap-0 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="bg-gradient-to-br from-slate-950 via-brand-primary-dark to-teal-700 p-6 text-white md:p-8">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/80">
              Leitura em camadas
            </span>
            <h2 className="mt-5 max-w-lg text-3xl font-black tracking-[-0.04em] md:text-4xl">
              Não leia o número sozinho. Leia o padrão.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/80 md:text-base">
              A qualidade do ar muda ao longo do dia. O valor exibido no painel é uma entrada para investigação pública:
              ele precisa ser comparado com tendência, estação, poluente, território e histórico.
            </p>
            <div className="mt-6 rounded-2xl border border-white/15 bg-white/10 p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/65">Leitura segura</div>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-white/86">
                Use o dado para orientar cuidado, conversa pública e cobrança institucional. Evite transformar uma medição isolada em sentença.
              </p>
            </div>
          </div>
          <div className="grid gap-4 p-5 md:grid-cols-2 md:p-7">
            {readingSteps.map((step) => (
              <article key={step.number} className="rounded-[1.35rem] border border-brand-primary/10 bg-white/90 p-5 shadow-[0_14px_36px_rgba(17,38,59,0.06)]">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-primary text-lg font-black text-white">
                    {step.number}
                  </span>
                  <h3 className="text-lg font-black text-text-primary">{step.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">{step.body}</p>
                <p className="mt-4 rounded-2xl bg-brand-primary-soft p-3 text-xs font-bold leading-relaxed text-brand-primary-dark">
                  {step.check}
                </p>
              </article>
            ))}
          </div>
        </div>
      </SurfaceCard>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <SurfaceCard className="portal-list-panel p-6 md:p-7">
          <PortalSectionHeader
            eyebrow={<span className="badge-dados-abertos">Glossário essencial</span>}
            title="O que cada indicador ajuda a enxergar"
            subtitle="Poluentes diferentes respondem a fontes, escalas e efeitos distintos. O portal deve ser lido como conjunto de evidências."
          />
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {pollutantCards.map((item) => (
              <article key={item.label} className="rounded-[1.25rem] border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-primary">{item.label}</p>
                    <h3 className="mt-1 text-base font-black text-text-primary">{item.title}</h3>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700">indicador</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">{item.meaning}</p>
                <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-xs font-semibold leading-relaxed text-slate-600">{item.caution}</p>
              </article>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard className="portal-list-panel border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 md:p-7">
          <PortalSectionHeader
            eyebrow={<span className="rounded-full border border-amber-200 bg-amber-100 px-4 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-amber-800">Evite erro comum</span>}
            title="O que o dado não autoriza concluir sozinho"
            subtitle="Transparência de qualidade exige mostrar limites, não apenas números fortes."
          />
          <ul className="mt-5 space-y-3">
            {commonMistakes.map((mistake) => (
              <li key={mistake} className="flex gap-3 rounded-2xl border border-amber-200/70 bg-white/80 p-4 text-sm font-semibold leading-relaxed text-amber-950">
                <span className="mt-0.5 text-amber-600" aria-hidden="true">!</span>
                <span>{mistake}</span>
              </li>
            ))}
          </ul>
        </SurfaceCard>
      </section>

      <SurfaceCard className="portal-list-panel p-6 md:p-7">
        <PortalSectionHeader
          eyebrow={<span className="badge-metodologia">Roteiros por público</span>}
          title="Como usar este portal na prática"
          subtitle="A mesma base pública pode apoiar cuidado comunitário, jornalismo, educação ambiental e gestão."
        />
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {audienceGuides.map((item) => (
            <article key={item.title} className="rounded-[1.35rem] border border-brand-primary/10 bg-white p-5 shadow-[0_12px_32px_rgba(17,38,59,0.05)]">
              <h3 className="text-lg font-black text-text-primary">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">{item.body}</p>
            </article>
          ))}
        </div>
      </SurfaceCard>

      <SurfaceCard className="portal-list-panel p-6 md:p-7">
        <PortalSectionHeader
          eyebrow={<span className="badge-metodologia">Navegação guiada</span>}
          title="Onde buscar mais contexto"
          subtitle="Avance do dado bruto para contexto territorial, histórico, institucional e metodológico."
        />
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="rounded-[1.25rem] border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand-primary/30 hover:shadow-[0_16px_42px_rgba(17,38,59,0.08)]"
            >
              <div className="text-sm font-black text-brand-primary">{item.label}</div>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{item.description}</p>
            </Link>
          ))}
        </div>
      </SurfaceCard>

      <SurfaceCard className="border-brand-primary/15 bg-brand-primary-soft p-6 md:p-7">
        <PortalSectionHeader
          eyebrow={<span className="badge-dados-abertos">Acessibilidade e apoio</span>}
          title="Se algo parecer confuso, isso também é dado para melhorar"
          subtitle="O objetivo é que moradores, escolas, imprensa e gestão consigam ler o portal sem barreira técnica desnecessária."
        />
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white/80 p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-primary">Acesso</div>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-text-primary">Navegação por teclado, foco visível e contraste reforçado devem orientar cada página pública.</p>
          </div>
          <div className="rounded-2xl bg-white/80 p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-primary">Dúvidas</div>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-text-primary">Para dúvidas sobre interpretação pública, consulte também a página <Link className="text-brand-primary underline" to="/sobre">Sobre o projeto</Link>.</p>
          </div>
          <div className="rounded-2xl bg-white/80 p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-primary">Contato</div>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-text-primary">Encontrou barreira de acesso? Escreva para <a className="text-brand-primary underline" href="mailto:contato@semear.uff.br">contato@semear.uff.br</a>.</p>
          </div>
        </div>
      </SurfaceCard>
    </PortalPageShell>
  );
}
