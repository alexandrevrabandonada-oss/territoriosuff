import type { RadarComparisonTab, RadarMode } from "./RadarTypes";
import { RADAR_EXPERIMENTAL_OBSERVATION_NOTE, RADAR_NO_DATA_NOT_CLEAN_AIR } from "../../../data/air/radar-copy";

type JourneyStep = {
  label: string;
  mode: RadarMode;
  tab?: RadarComparisonTab;
};

interface RadarGuidedJourneysProps {
  onNavigate: (mode: RadarMode, tab?: RadarComparisonTab) => void;
  onScrollToRecommendations: () => void;
}

const JOURNEYS: Array<{
  eyebrow: string;
  title: string;
  summary: string;
  caution: string;
  primary: JourneyStep;
  steps: JourneyStep[];
}> = [
  {
    eyebrow: "Morador",
    title: "Entenda seu território antes de concluir que o ar está bom ou ruim.",
    summary:
      "Comece pelo mapa para localizar as estações, avance para território para entender quem está mais exposto e feche no histórico para ver se o padrão se repete.",
    caution: `Ausência de leitura perto da sua casa não prova segurança: pode significar cobertura insuficiente. ${RADAR_NO_DATA_NOT_CLEAN_AIR}`,
    primary: { label: "Começar no mapa", mode: "MAP" },
    steps: [
      { label: "1. Mapa", mode: "MAP" },
      { label: "2. Território", mode: "TERRITORY" },
      { label: "3. Tempo", mode: "TIME", tab: "TREND" }
    ]
  },
  {
    eyebrow: "Jornalismo e pesquisa",
    title: "Monte uma leitura defensável, citando limites e lacunas com honestidade.",
    summary:
      "Abra visão geral para triagem, confirme no histórico, verifique cobertura e só publique depois de ler metodologia e metadados das estações.",
    caution: "Comparações com OMS/CONAMA e rankings são úteis, mas continuam interpretativos e dependem da base pública consolidada.",
    primary: { label: "Abrir visão geral", mode: "OVERVIEW" },
    steps: [
      { label: "1. Visão geral", mode: "OVERVIEW" },
      { label: "2. Tempo", mode: "TIME", tab: "TREND" },
      { label: "3. Cobertura", mode: "TIME", tab: "COVERAGE" },
      { label: "4. Metodologia", mode: "METHODOLOGY" }
    ]
  },
  {
    eyebrow: "Gestão pública",
    title: "Transforme leitura ambiental em prioridade operacional e territorial.",
    summary:
      "Cruze estações, silêncio de dados e bairros sensíveis para decidir onde manter sensores, reforçar saúde e cobrar mitigação ambiental.",
    caution: `O Radar apoia priorização pública; ele não substitui laudos regulatórios, fiscalização em campo ou ${RADAR_EXPERIMENTAL_OBSERVATION_NOTE}.`,
    primary: { label: "Ver territórios", mode: "TERRITORY" },
    steps: [
      { label: "1. Território", mode: "TERRITORY" },
      { label: "2. Cobertura", mode: "TIME", tab: "COVERAGE" },
      { label: "3. Estações", mode: "STATIONS" },
      { label: "4. Encaminhamentos", mode: "OVERVIEW" }
    ]
  }
];

export function RadarGuidedJourneys({ onNavigate, onScrollToRecommendations }: RadarGuidedJourneysProps) {
  return (
    <section className="space-y-5 rounded-[2.25rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.98))] p-5 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.35)] md:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Trilha guiada de leitura</div>
          <h2 className="max-w-3xl text-2xl font-black tracking-tight text-slate-900">
            O Radar ensina a ler o dado público antes de pedir confiança nele.
          </h2>
          <p className="max-w-3xl text-sm font-semibold leading-relaxed text-slate-600">
            Escolha um percurso conforme seu papel. Cada trilha organiza a ordem de leitura para reduzir erro de interpretação e fortalecer transparência pública.
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold leading-relaxed text-amber-900">
          Regra central: não trate silêncio de dados como evidência de ar limpo.
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {JOURNEYS.map((journey) => (
          <article
            key={journey.eyebrow}
            className="flex h-full flex-col justify-between rounded-[1.9rem] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.28)]"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">{journey.eyebrow}</div>
                <h3 className="text-lg font-black leading-tight tracking-tight text-slate-900">{journey.title}</h3>
                <p className="text-xs font-semibold leading-relaxed text-slate-600">{journey.summary}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Ordem recomendada</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {journey.steps.map((step) => (
                    <button
                      key={`${journey.eyebrow}-${step.label}`}
                      onClick={() => onNavigate(step.mode, step.tab)}
                      className="rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                    >
                      {step.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-[11px] font-semibold leading-relaxed text-rose-900">
                {journey.caution}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={() => onNavigate(journey.primary.mode, journey.primary.tab)}
                className="rounded-2xl bg-slate-900 px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.12em] text-white transition-colors hover:bg-slate-800"
              >
                {journey.primary.label}
              </button>
              {journey.eyebrow === "Gestão pública" && (
                <button
                  onClick={onScrollToRecommendations}
                  className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.12em] text-emerald-800 transition-colors hover:bg-emerald-100"
                >
                  Ver encaminhamentos
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
