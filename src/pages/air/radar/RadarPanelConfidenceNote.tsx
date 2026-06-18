import { RadarEvidenceBadge } from "./RadarEvidenceBadge";
import { RadarEvidenceStateBlock } from "./RadarEvidenceStateBlock";
import { getStationGovernanceLabel, scoreStationGovernance } from "./RadarGovernanceModel";
import type { StationMetadataItem } from "./RadarTypes";

interface RadarPanelConfidenceNoteProps {
  title: string;
  summary: string;
  level: "strong" | "experimental" | "interpretive" | "insufficient";
  stationMetadata?: StationMetadataItem | null;
  truncated?: boolean;
}

export function RadarPanelConfidenceNote({
  title,
  summary,
  level,
  stationMetadata,
  truncated = false
}: RadarPanelConfidenceNoteProps) {
  const stationWindowText = stationMetadata
    ? stationMetadata.operation_window.is_inferred
      ? "janela operacional ainda inferida para esta estação"
      : "janela operacional explícita publicada para esta estação"
    : "metadado operacional da estação indisponível nesta carga";
  const stationGovernance = stationMetadata ? scoreStationGovernance(stationMetadata) : null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1.5">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Defensabilidade desta visualização</div>
          <h4 className="text-sm font-black text-slate-900">{title}</h4>
          <p className="max-w-3xl text-[11px] font-semibold leading-relaxed text-slate-600">{summary}</p>
        </div>
        <RadarEvidenceBadge level={level} detail={stationWindowText} />
      </div>

      {(stationMetadata || truncated) && (
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <RadarEvidenceStateBlock
            state={stationMetadata?.operation_window.is_inferred ? "partial" : "published"}
            title={stationMetadata?.operation_window.is_inferred ? "Prova parcial" : "Prova publicada"}
            description={
              stationGovernance
                ? `${stationWindowText}. Score de prontidão pública ${stationGovernance.score}/100, em faixa ${getStationGovernanceLabel(stationGovernance.level)}.`
                : `${stationWindowText}.`
            }
          />
          <RadarEvidenceStateBlock
            state={truncated ? "partial" : "published"}
            title={truncated ? "Prova parcial" : "Prova publicada"}
            description={
              truncated
                ? "Esta leitura está truncada na resposta atual; use exportação bruta ou recortes adicionais para auditoria integral."
                : "Esta leitura não está truncada nesta resposta atual."
            }
          />
        </div>
      )}
    </div>
  );
}
