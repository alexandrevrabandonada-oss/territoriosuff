import { getEvidenceStateLabel, type EvidenceState } from "./RadarEvidenceStateBlock";
import type { RadarComparisonTab, RadarMode } from "./RadarTypes";

type GuideItem = {
  state: EvidenceState;
  goal: string;
  action: string;
  caution: string;
  primary: { label: string; mode?: RadarMode; tab?: RadarComparisonTab; lai?: boolean };
  secondary: { label: string; mode?: RadarMode; tab?: RadarComparisonTab; lai?: boolean };
};

const GUIDE_ITEMS: GuideItem[] = [
  {
    state: "published",
    goal: "Quando a prova já está publicada, o foco deixa de ser descobrir e passa a ser reproduzir, comparar e cobrar resposta institucional.",
    action: "Refaça a leitura fora da interface, baixe os dados e converta o achado em cobrança documentada.",
    caution: "Prova publicada não elimina contexto metodológico; elimina a desculpa de ausência de base auditável.",
    primary: { label: "Abrir metodologia", mode: "METHODOLOGY" },
    secondary: { label: "Voltar à visão geral", mode: "OVERVIEW" }
  },
  {
    state: "partial",
    goal: "Quando a prova é parcial, o foco é fortalecer a leitura com cobertura, séries, estações e regra metodológica antes de fechar conclusão forte.",
    action: "Cruze a leitura com lacunas, janelas operacionais e territórios sensíveis antes de transformar o painel em afirmação pública dura.",
    caution: "Prova parcial é útil para triagem e pressão inicial, mas ainda não basta para fechamento técnico isolado.",
    primary: { label: "Checar cobertura", mode: "TIME", tab: "COVERAGE" },
    secondary: { label: "Ver estações", mode: "STATIONS" }
  },
  {
    state: "external",
    goal: "Quando a prova é externa, o foco é separar memória técnica e pesquisa de dado operacional consolidado.",
    action: "Use a referência como trilha de investigação e peça publicação rastreável antes de reintegrar a camada à interface operacional.",
    caution: "Memória externa sem reprocessamento auditável não deve ser promovida a evidência operacional do Radar.",
    primary: { label: "Abrir metodologia", mode: "METHODOLOGY" },
    secondary: { label: "Ver histórico temporal", mode: "TIME", tab: "TREND" }
  },
  {
    state: "missing",
    goal: "Quando a prova está ausente, o foco é protocolar cobrança específica pelo artefato que falta: QA/QC, metadado, série histórica ou resposta institucional.",
    action: "Transforme a lacuna em pedido público verificável, com protocolo, objeto claro e prazo institucional rastreável.",
    caution: "Prova ausente não autoriza preencher a lacuna com suposição otimista nem com silêncio administrativo.",
    primary: { label: "Abrir minuta de LAI", lai: true },
    secondary: { label: "Ver roadmap", mode: "METHODOLOGY" }
  }
];

interface RadarEvidenceActionGuideProps {
  compact?: boolean;
  onNavigate: (mode: RadarMode, tab?: RadarComparisonTab) => void;
  onOpenLai: () => void;
}

export function RadarEvidenceActionGuide({ compact = false, onNavigate, onOpenLai }: RadarEvidenceActionGuideProps) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f8fafc)] p-5 shadow-[0_20px_45px_-34px_rgba(15,23,42,0.35)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Ação por estado de prova</div>
          <h3 className="text-lg font-black tracking-tight text-slate-900">
            {compact ? "O que fazer quando a prova muda" : "Como cada estado de prova deve virar auditoria, prudência ou cobrança pública"}
          </h3>
          <p className="max-w-3xl text-[11px] font-semibold leading-relaxed text-slate-600">
            O Radar não usa a taxonomia só para classificar painéis. Cada estado exige uma resposta pública diferente: reproduzir, aprofundar, investigar ou cobrar.
          </p>
        </div>
        <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-700">
          leitura vira encaminhamento
        </div>
      </div>

      <div className={`mt-4 grid gap-3 ${compact ? "lg:grid-cols-2" : "xl:grid-cols-4 md:grid-cols-2"}`}>
        {GUIDE_ITEMS.map((item) => (
          <div key={item.state} className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_14px_30px_-28px_rgba(15,23,42,0.3)]">
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">{getEvidenceStateLabel(item.state)}</div>
            <p className="mt-2 text-[11px] font-black leading-relaxed text-slate-900">{item.goal}</p>
            <p className="mt-2 text-[11px] font-semibold leading-relaxed text-slate-600">{item.action}</p>
            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-semibold leading-relaxed text-slate-700">
              Cautela: {item.caution}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => (item.primary.lai ? onOpenLai() : item.primary.mode ? onNavigate(item.primary.mode, item.primary.tab) : undefined)}
                className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-800 transition-colors hover:border-emerald-300"
              >
                {item.primary.label}
              </button>
              <button
                onClick={() => (item.secondary.lai ? onOpenLai() : item.secondary.mode ? onNavigate(item.secondary.mode, item.secondary.tab) : undefined)}
                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-700 transition-colors hover:border-slate-300"
              >
                {item.secondary.label}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
