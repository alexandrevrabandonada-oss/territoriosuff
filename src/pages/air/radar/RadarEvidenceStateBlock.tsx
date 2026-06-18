export type EvidenceState = "published" | "partial" | "missing" | "external";

interface RadarEvidenceStateBlockProps {
  state: EvidenceState;
  title?: string;
  description: string;
}

export function getEvidenceStateLabel(state: EvidenceState) {
  switch (state) {
    case "published":
      return "Prova publicada";
    case "partial":
      return "Prova parcial";
    case "external":
      return "Prova externa";
    default:
      return "Prova ausente";
  }
}

function getEvidenceStateTone(state: EvidenceState) {
  switch (state) {
    case "published":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "partial":
      return "border-sky-200 bg-sky-50 text-sky-900";
    case "external":
      return "border-violet-200 bg-violet-50 text-violet-900";
    default:
      return "border-amber-300 bg-amber-50 text-amber-950";
  }
}

export function RadarEvidenceStateBlock({ state, title, description }: RadarEvidenceStateBlockProps) {
  return (
    <div className={`rounded-2xl border p-4 ${getEvidenceStateTone(state)}`}>
      <div className="text-[10px] font-black uppercase tracking-[0.16em]">{title || getEvidenceStateLabel(state)}</div>
      <p className="mt-2 text-[11px] font-semibold leading-relaxed">{description}</p>
    </div>
  );
}
