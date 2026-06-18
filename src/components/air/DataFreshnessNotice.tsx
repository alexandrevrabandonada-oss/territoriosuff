import { IconShell, SurfaceCard } from "../BrandSystem";
import { useRadarReleaseMetadata } from "../../data/air/useRadarReleaseMetadata";

interface DataFreshnessNoticeProps {
  latestMeasuredAt?: string | null;
  latestIngestedAt?: string | null;
  truncatedLabel?: string | null;
}

function formatDateTime(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleString("pt-BR");
}

export function DataFreshnessNotice({
  latestMeasuredAt,
  latestIngestedAt,
  truncatedLabel
}: DataFreshnessNoticeProps) {
  const releaseMetadata = useRadarReleaseMetadata();
  const measuredText = formatDateTime(latestMeasuredAt);
  const ingestedText = formatDateTime(latestIngestedAt);

  return (
    <SurfaceCard className="border border-slate-200 bg-slate-50 p-4 rounded-xl transition-all">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <IconShell tone="neutral" className="shrink-0">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </IconShell>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">
              Atualização e Freshness dos Dados
            </h4>
            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-slate-700">
              ciclo {releaseMetadata.cycleVersion}
            </span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-emerald-700">
              metodologia {releaseMetadata.methodologyVersion}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-slate-600 font-semibold">
            Os dados desta página vêm do arquivo público qualidade_ar.xlsx do INEA/Dados Abertos RJ. Eles representam a última base pública disponível no momento da ingestão, não monitoramento minuto a minuto.
          </p>
          <p className="text-[11px] leading-relaxed text-slate-500 font-semibold">
            Release público vigente: dataset {releaseMetadata.datasetVersion} com próxima revisão prevista para {releaseMetadata.plannedReviewDate}.
          </p>
          {(measuredText || ingestedText || truncatedLabel) && (
            <div className="space-y-1 pt-1 text-[11px] font-semibold text-slate-500">
              {measuredText && <p>Última medição pública na base: {measuredText}.</p>}
              {ingestedText && <p>Última ingestão registrada pelo portal: {ingestedText}.</p>}
              {truncatedLabel && <p>{truncatedLabel}</p>}
            </div>
          )}
        </div>
      </div>
    </SurfaceCard>
  );
}
