import { getEvidenceStateLabel, RadarEvidenceStateBlock, type EvidenceState } from "./RadarEvidenceStateBlock";
import { RADAR_RELEASE_METADATA, type RadarReleaseMetadata } from "../../../data/air/radar-release-metadata";
import { RADAR_EXPERIMENTAL_OBSERVATION_NOTE } from "../../../data/air/radar-copy";
import { useRadarReleaseMetadata } from "../../../data/air/useRadarReleaseMetadata";
import type { RadarComparisonTab, RadarMode } from "./RadarTypes";

type PendingStatus = "open" | "monitoring" | "blocked";

type PendingItem = {
  title: string;
  status: PendingStatus;
  referenceDate: string;
  cycleVersion: string;
  lastMovement: string;
  nextReviewDate: string;
  responsible: string;
  missingArtifact: string;
  whyItMatters: string;
  evidenceState: EvidenceState;
  escalation: string;
  primary: { label: string; mode?: RadarMode; tab?: RadarComparisonTab; lai?: boolean };
  secondary: { label: string; mode?: RadarMode; tab?: RadarComparisonTab; lai?: boolean };
};

function getPendingTone(status: PendingStatus) {
  switch (status) {
    case "monitoring":
      return {
        badge: "border-sky-200 bg-sky-50 text-sky-800",
        card: "border-sky-200 bg-sky-50/70"
      };
    case "blocked":
      return {
        badge: "border-rose-200 bg-rose-50 text-rose-800",
        card: "border-rose-200 bg-rose-50/70"
      };
    default:
      return {
        badge: "border-amber-200 bg-amber-50 text-amber-900",
        card: "border-amber-200 bg-amber-50/70"
      };
  }
}

export const RADAR_PUBLIC_CYCLE_VERSION = RADAR_RELEASE_METADATA.cycleVersion;
export const RADAR_PUBLIC_NEXT_REVIEW = RADAR_RELEASE_METADATA.plannedReviewDate;

export function buildPendingItems(releaseMetadata: RadarReleaseMetadata = RADAR_RELEASE_METADATA): PendingItem[] {
  return [
    {
      title: "Metadata operacional integral da malha",
      status: "monitoring",
      referenceDate: "16/06/2026",
      cycleVersion: `release ${releaseMetadata.cycleVersion}`,
      lastMovement: "Metadata por estação publicado e incorporado aos cartões de confiança, ainda com parte da malha dependente de inferência controlada.",
      nextReviewDate: releaseMetadata.plannedReviewDate,
      responsible: "Órgão operador da rede + curadoria editorial do Radar",
      missingArtifact: "Janela operacional explícita e fonte rastreável para 100% das estações.",
      whyItMatters: "Sem isso, cobertura e comparabilidade seguem parcialmente dependentes de inferência controlada.",
      evidenceState: "partial",
      escalation: "Cobrar atualização do metadata por estação e revisar painéis que ainda dependem de inferência.",
      primary: { label: "Ver estações", mode: "STATIONS" },
      secondary: { label: "Abrir metodologia", mode: "METHODOLOGY" }
    },
    {
      title: RADAR_EXPERIMENTAL_OBSERVATION_NOTE,
      status: "open",
      referenceDate: "16/06/2026",
      cycleVersion: `release ${releaseMetadata.cycleVersion}`,
      lastMovement: "Lacuna institucional formalizada no roadmap, no quadro metodológico e no guia de ação por estado de evidência.",
      nextReviewDate: releaseMetadata.plannedReviewDate,
      responsible: "Órgão produtor da base pública",
      missingArtifact: "Flags por registro, regra pública de revisão e histórico versionado de correções.",
      whyItMatters: `Sem ${RADAR_EXPERIMENTAL_OBSERVATION_NOTE}, comparações regulatórias permanecem experimentais.`,
      evidenceState: "missing",
      escalation: `Protocolar pedido formal pelo artefato de ${RADAR_EXPERIMENTAL_OBSERVATION_NOTE} e registrar a ausência como lacuna institucional objetiva.`,
      primary: { label: "Abrir minuta de LAI", lai: true },
      secondary: { label: "Ver roadmap", mode: "METHODOLOGY" }
    },
    {
      title: "Resposta institucional rastreável",
      status: "open",
      referenceDate: "16/06/2026",
      cycleVersion: `release ${releaseMetadata.cycleVersion}`,
      lastMovement: "Pendência convertida em agenda pública explícita, mas ainda sem painel com protocolo, resposta e providência observável.",
      nextReviewDate: releaseMetadata.plannedReviewDate,
      responsible: "Órgão público demandado + governança do observatório",
      missingArtifact: "Painel com protocolo, status, resposta oficial e providência tomada para cada cobrança relevante.",
      whyItMatters: "Sem follow-up público, transparência mostra o problema, mas não mostra a reação institucional.",
      evidenceState: "missing",
      escalation: "Criar rotina pública de acompanhamento de LAIs, manutenção e ampliação da rede com data de atualização.",
      primary: { label: "Abrir minuta de LAI", lai: true },
      secondary: { label: "Ver visão geral", mode: "OVERVIEW" }
    },
    {
      title: "Parâmetros fora da camada operacional",
      status: "blocked",
      referenceDate: "16/06/2026",
      cycleVersion: `release ${releaseMetadata.cycleVersion}`,
      lastMovement: "NO₂ e PTS permaneceram corretamente em quarentena metodológica; a camada segue bloqueada até decisão pública conclusiva.",
      nextReviewDate: "15/07/2026",
      responsible: "Curadoria metodológica do Radar",
      missingArtifact: "Relatório conclusivo para liberação, quarentena ou separação definitiva de NO₂, PTS e afins.",
      whyItMatters: "Sem essa decisão pública, o usuário pode confundir memória técnica com dado operacional confiável.",
      evidenceState: "external",
      escalation: "Manter quarentena explícita e publicar critério final de liberação ou exclusão.",
      primary: { label: "Abrir metodologia", mode: "METHODOLOGY" },
      secondary: { label: "Ver histórico", mode: "TIME", tab: "TREND" }
    }
  ];
}

interface RadarPublicPendingLedgerProps {
  onNavigate: (mode: RadarMode, tab?: RadarComparisonTab) => void;
  onOpenLai: () => void;
}

export function RadarPublicPendingLedger({ onNavigate, onOpenLai }: RadarPublicPendingLedgerProps) {
  const releaseMetadata = useRadarReleaseMetadata();
  const pendingItems = buildPendingItems(releaseMetadata);

  return (
    <section className="space-y-5 rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f8fafc)] p-5 shadow-[0_20px_45px_-34px_rgba(15,23,42,0.35)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Pendências públicas do radar</div>
          <h3 className="text-lg font-black tracking-tight text-slate-900">O que ainda falta, de quem depende e como deve ser cobrado</h3>
          <p className="max-w-3xl text-[11px] font-semibold leading-relaxed text-slate-600">
            Este painel transforma lacunas metodológicas em agenda pública concreta. Cada pendência explicita responsável, artefato faltante, último movimento e próximo rito de cobrança.
          </p>
        </div>
        <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-700">
          ciclo público {releaseMetadata.cycleVersion}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {pendingItems.map((item) => {
          const tone = getPendingTone(item.status);
          return (
            <article key={item.title} className={`rounded-[1.6rem] border p-5 ${tone.card}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Data de referência</div>
                  <div className="mt-1 text-[11px] font-black text-slate-900">{item.referenceDate}</div>
                </div>
                <div className="rounded-full border border-white/80 bg-white/90 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-slate-700">
                  {item.cycleVersion}
                </div>
                <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] ${tone.badge}`}>
                  {item.status === "monitoring" ? "monitorando" : item.status === "blocked" ? "bloqueio ativo" : "pendência aberta"}
                </span>
              </div>

              <h4 className="mt-3 text-base font-black tracking-tight text-slate-900">{item.title}</h4>

              <div className="mt-4 space-y-3 text-[11px] font-semibold leading-relaxed text-slate-700">
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Responsável pressionado</span>
                  <p className="mt-1">{item.responsible}</p>
                </div>
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Artefato faltante</span>
                  <p className="mt-1">{item.missingArtifact}</p>
                </div>
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Último movimento público</span>
                  <p className="mt-1">{item.lastMovement}</p>
                </div>
                <RadarEvidenceStateBlock
                  state={item.evidenceState}
                  title={getEvidenceStateLabel(item.evidenceState)}
                  description={item.whyItMatters}
                />
                <div className="rounded-xl border border-white/80 bg-white/80 px-3 py-2 text-[10px] font-semibold leading-relaxed text-slate-700">
                  Próximo rito: {item.escalation}
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-semibold leading-relaxed text-slate-700">
                  Próxima revisão pública prevista: {item.nextReviewDate}
                </div>
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
            </article>
          );
        })}
      </div>
    </section>
  );
}
