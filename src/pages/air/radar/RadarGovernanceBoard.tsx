import { buildPendingItems } from "./RadarPublicPendingLedger";
import type { StationMetadataItem, SummaryStats } from "./RadarTypes";
import { RADAR_EXPERIMENTAL_OBSERVATION_NOTE } from "../../../data/air/radar-copy";
import { useRadarReleaseMetadata } from "../../../data/air/useRadarReleaseMetadata";

interface RadarGovernanceBoardProps {
  summary: SummaryStats;
  stationMetadata: StationMetadataItem[];
}

export function RadarGovernanceBoard({ summary, stationMetadata }: RadarGovernanceBoardProps) {
  const releaseMetadata = useRadarReleaseMetadata();
  const totalStations = stationMetadata.length || summary.totalStations || 0;
  const explicitWindows = stationMetadata.filter((item) => !item.operation_window.is_inferred).length;
  const explicitShare = totalStations > 0 ? Math.round((explicitWindows / totalStations) * 100) : 0;
  const pendingItems = buildPendingItems(releaseMetadata);
  const openFronts = pendingItems.filter((item) => item.status === "open").length;
  const blockedFronts = pendingItems.filter((item) => item.status === "blocked").length;
  const monitoringFronts = pendingItems.filter((item) => item.status === "monitoring").length;
  const latestIngestedAt = summary.latest_ingested_at
    ? new Date(summary.latest_ingested_at).toLocaleDateString("pt-BR")
    : "indisponível";

  return (
    <section className="space-y-5 rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#f8fafc,#ffffff_46%,#ecfeff)] p-5 shadow-[0_24px_50px_-34px_rgba(15,23,42,0.38)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Painel de estado do radar</div>
          <h3 className="text-lg font-black tracking-tight text-slate-900">Leitura executiva da governança pública do módulo</h3>
          <p className="max-w-3xl text-[11px] font-semibold leading-relaxed text-slate-600">
            Esta é a vista consolidada do Radar como sistema público auditável: base publicada, força operacional da malha, frentes abertas de cobrança e próximo marco temporal de revisão.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-700">
            ciclo {releaseMetadata.cycleVersion}
          </div>
          <div className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-sky-800">
            próxima revisão {releaseMetadata.plannedReviewDate}
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50/70 p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">Base pública</div>
          <div className="mt-2 text-2xl font-black text-emerald-950">Auditável</div>
          <p className="mt-1 text-[11px] font-semibold leading-relaxed text-emerald-900/80">
            Manifesto, CSV bruto e catálogo já sustentam reprodução externa da análise.
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-sky-200 bg-sky-50/70 p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-700">Malha operacional</div>
          <div className="mt-2 text-2xl font-black text-sky-950">{explicitShare}%</div>
          <p className="mt-1 text-[11px] font-semibold leading-relaxed text-sky-900/80">
            {explicitWindows}/{totalStations || "--"} estações com janela operacional explícita publicada.
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50/70 p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-700">Frentes abertas</div>
          <div className="mt-2 text-2xl font-black text-amber-950">{openFronts + blockedFronts}</div>
          <p className="mt-1 text-[11px] font-semibold leading-relaxed text-amber-900/80">
            {openFronts} pendências abertas e {blockedFronts} bloqueios metodológicos ainda exigem cobrança ou decisão pública.
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Última base visível</div>
          <div className="mt-2 text-2xl font-black text-slate-900">{latestIngestedAt}</div>
          <p className="mt-1 text-[11px] font-semibold leading-relaxed text-slate-700">
            {monitoringFronts} frente sob monitoramento ativo no ciclo público atual.
          </p>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Pergunta executiva 1</div>
          <p className="mt-2 text-[11px] font-semibold leading-relaxed text-slate-700">
            O Radar já consegue ser auditado fora da interface? Sim. A infraestrutura aberta básica já está publicada.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Pergunta executiva 2</div>
          <p className="mt-2 text-[11px] font-semibold leading-relaxed text-slate-700">
            O que ainda impede referência regulatória forte? Principalmente {RADAR_EXPERIMENTAL_OBSERVATION_NOTE} e resposta institucional rastreável.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Pergunta executiva 3</div>
          <p className="mt-2 text-[11px] font-semibold leading-relaxed text-slate-700">
            Qual o próximo salto mensurável? Fechar a malha com metadata explícita e registrar o próximo movimento público até {releaseMetadata.plannedReviewDate}.
          </p>
        </div>
      </div>
    </section>
  );
}
