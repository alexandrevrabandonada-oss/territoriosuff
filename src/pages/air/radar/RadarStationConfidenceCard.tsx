import { getStationGovernanceLabel, scoreStationGovernance } from "./RadarGovernanceModel";
import type { StationMetadataItem } from "./RadarTypes";

type ConfidenceTone = "strong" | "moderate" | "caution";

function resolveConfidenceTone(station: StationMetadataItem): ConfidenceTone {
  const governance = scoreStationGovernance(station);
  if (governance.level === "strong") return "strong";
  if (governance.level === "advancing") return "moderate";
  return "caution";
}

function getToneClasses(tone: ConfidenceTone) {
  if (tone === "strong") {
    return {
      badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
      panel: "border-emerald-200 bg-emerald-50/70",
      title: "Robustez alta"
    };
  }
  if (tone === "moderate") {
    return {
      badge: "border-sky-200 bg-sky-50 text-sky-800",
      panel: "border-sky-200 bg-sky-50/70",
      title: "Robustez moderada"
    };
  }
  return {
    badge: "border-amber-200 bg-amber-50 text-amber-800",
    panel: "border-amber-200 bg-amber-50/70",
    title: "Robustez cautelar"
  };
}

function formatDate(value: string | null) {
  if (!value) return "não publicada";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("pt-BR");
}

interface RadarStationConfidenceCardProps {
  stationMetadata: StationMetadataItem | null;
  compact?: boolean;
}

export function RadarStationConfidenceCard({
  stationMetadata,
  compact = false
}: RadarStationConfidenceCardProps) {
  if (!stationMetadata) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Score metodológico</div>
        <p className="mt-2 text-[11px] font-semibold leading-relaxed text-slate-600">
          O metadado operacional desta estação não respondeu nesta carga. A leitura pública segue disponível, mas com rastreabilidade incompleta.
        </p>
      </div>
    );
  }

  const tone = resolveConfidenceTone(stationMetadata);
  const classes = getToneClasses(tone);
  const governance = scoreStationGovernance(stationMetadata);

  return (
    <div className={`rounded-2xl border p-4 ${classes.panel}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Score metodológico</div>
          <h4 className="mt-1 text-sm font-black text-slate-900">{classes.title}</h4>
          <p className="mt-1 text-[11px] font-semibold leading-relaxed text-slate-600">
            Prontidão pública {getStationGovernanceLabel(governance.level)} com score {governance.score}/100.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${classes.badge}`}>
            {stationMetadata.operation_window.is_inferred ? "janela inferida" : "janela explícita"}
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-700">
            score {governance.score}
          </span>
        </div>
      </div>

      <div className={`mt-3 grid gap-3 ${compact ? "" : "md:grid-cols-2"}`}>
        <div className="rounded-xl border border-white/70 bg-white/70 px-3 py-2">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Janela observada</div>
          <p className="mt-1 text-[11px] font-semibold leading-relaxed text-slate-700">
            {formatDate(stationMetadata.operation_window.start_date)} até {formatDate(stationMetadata.operation_window.end_date)}
          </p>
        </div>
        <div className="rounded-xl border border-white/70 bg-white/70 px-3 py-2">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Fonte da janela</div>
          <p className="mt-1 text-[11px] font-semibold leading-relaxed text-slate-700">
            {stationMetadata.operation_window.source || "fonte operacional não publicada"}
          </p>
        </div>
      </div>

      <div className={`mt-3 grid gap-2 ${compact ? "" : "md:grid-cols-2"}`}>
        <div className="rounded-xl border border-white/70 bg-white/70 px-3 py-2">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Critérios atendidos</div>
          <p className="mt-1 text-[11px] font-semibold leading-relaxed text-slate-700">
            {[
              governance.hasExplicitWindow ? "janela explícita" : null,
              governance.hasPublishedWindowBounds ? "datas publicadas" : null,
              governance.hasPublishedSource ? "fonte publicada" : null,
              governance.hasProvenanceNotes ? "notas publicadas" : null
            ]
              .filter(Boolean)
              .join(" · ") || "lastro público ainda muito reduzido"}
          </p>
        </div>
        <div className="rounded-xl border border-white/70 bg-white/70 px-3 py-2">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Próximo reforço</div>
          <p className="mt-1 text-[11px] font-semibold leading-relaxed text-slate-700">
            {governance.hasExplicitWindow && governance.hasPublishedWindowBounds && governance.hasPublishedSource && governance.hasProvenanceNotes
              ? "Manter atualização regular e tornar manutenção/QA mais rastreáveis."
              : "Completar metadata operacional explícita para reduzir inferência e elevar a defensabilidade desta estação."}
          </p>
        </div>
      </div>

      <p className="mt-3 text-[11px] font-semibold leading-relaxed text-slate-700">
        {stationMetadata.operation_window.is_inferred
          ? "Esta estação ainda depende de inferência controlada para parte da leitura de cobertura e lacunas. Use o dado como sinal público relevante, mas com cautela adicional."
          : "Esta estação já possui janela operacional publicada, o que fortalece a leitura de cobertura, lacunas e comparação histórica no Radar."}
      </p>
    </div>
  );
}
