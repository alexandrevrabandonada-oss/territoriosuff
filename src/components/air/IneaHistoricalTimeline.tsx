import { IconShell, SurfaceCard } from "../BrandSystem";
import { useRadarReleaseMetadata } from "../../data/air/useRadarReleaseMetadata";
import { RadarEvidenceStateBlock } from "../../pages/air/radar/RadarEvidenceStateBlock";

interface IneaHistoricalTimelineProps {
  lastIngestedAt?: string | null;
}

export function IneaHistoricalTimeline({ lastIngestedAt }: IneaHistoricalTimelineProps) {
  const releaseMetadata = useRadarReleaseMetadata();
  const formattedIngestedAt = lastIngestedAt
    ? new Date(lastIngestedAt).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Fevereiro/2025";

  return (
    <SurfaceCard className="border border-emerald-500/10 bg-gradient-to-br from-emerald-50/20 to-slate-50 p-6 rounded-2xl relative overflow-hidden transition-all duration-300 hover:shadow-md">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
      
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <IconShell tone="lab" className="shrink-0 bg-emerald-100 text-emerald-800">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </IconShell>
            <div>
              <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">
                Linha do Tempo da Base Pública
              </h3>
              <p className="text-[11px] text-slate-400 font-bold uppercase">
                Período Coberto e Processamento
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-800">
                  ciclo {releaseMetadata.cycleVersion}
                </span>
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-700">
                  metodologia {releaseMetadata.methodologyVersion}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-emerald-100/60 border border-emerald-500/15 rounded-lg px-2.5 py-1 text-right">
            <span className="text-[9px] text-emerald-800 font-bold uppercase block leading-none">Último Processamento</span>
            <strong className="text-[11px] text-emerald-950 font-black block mt-0.5">{formattedIngestedAt}</strong>
          </div>
        </div>

        {/* Visual Timeline Bar */}
        <div className="relative pt-4 pb-2">
          {/* Horizontal Track Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 rounded-full" />
          
          {/* Progress fill */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 -translate-y-1/2 rounded-full" />

          {/* Timeline Nodes */}
          <div className="relative flex justify-between items-center">
            {/* Start Node */}
            <div className="flex flex-col items-center">
              <div className="h-4 w-4 rounded-full bg-white border-4 border-emerald-500 shadow-sm z-10" />
              <div className="text-center mt-2.5">
                <span className="text-xs font-black text-slate-800 block">02/01/2022</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase block mt-0.5">Início da Base</span>
              </div>
            </div>

            {/* Middle decorative node (Year boundary 2023) */}
            <div className="flex flex-col items-center">
              <div className="h-3 w-3 rounded-full bg-emerald-400 shadow-xs z-10" />
              <div className="text-center mt-2.5">
                <span className="text-xs font-bold text-slate-600 block">Janeiro/2023</span>
              </div>
            </div>

            {/* Middle decorative node (Year boundary 2024) */}
            <div className="flex flex-col items-center">
              <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-xs z-10" />
              <div className="text-center mt-2.5">
                <span className="text-xs font-bold text-slate-600 block">Janeiro/2024</span>
              </div>
            </div>

            {/* End Node */}
            <div className="flex flex-col items-center">
              <div className="h-4 w-4 rounded-full bg-white border-4 border-emerald-600 shadow-sm z-10" />
              <div className="text-center mt-2.5">
                <span className="text-xs font-black text-slate-800 block">13/02/2025</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase block mt-0.5">Fim da Base Atual</span>
              </div>
            </div>
          </div>
        </div>

        {/* Informative Caveat Box */}
        <div className="p-3 bg-slate-100/80 border border-slate-200/50 rounded-xl">
          <p className="text-[11px] leading-relaxed text-slate-500 font-semibold italic text-center">
            "A linha mostra o período coberto pela base pública disponível no release {releaseMetadata.cycleVersion}, não todo o histórico possível de monitoramento."
          </p>
        </div>

        <RadarEvidenceStateBlock
          state="partial"
          title="Cobertura temporal publicada, não série integral"
          description={`A linha do tempo ajuda a delimitar até onde a base pública aberta alcança no release ${releaseMetadata.cycleVersion}. Ela é uma referência de cobertura e processamento, não uma prova de completude histórica total do monitoramento.`}
        />
      </div>
    </SurfaceCard>
  );
}
