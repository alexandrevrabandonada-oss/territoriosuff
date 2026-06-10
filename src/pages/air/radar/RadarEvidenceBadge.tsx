type RadarEvidenceLevel = "strong" | "experimental" | "interpretive" | "insufficient";

interface RadarEvidenceBadgeProps {
  level: RadarEvidenceLevel;
  label?: string;
  detail: string;
}

const EVIDENCE_STYLES: Record<
  RadarEvidenceLevel,
  {
    chip: string;
    dot: string;
    title: string;
  }
> = {
  strong: {
    chip: "border-emerald-200 bg-emerald-50 text-emerald-800",
    dot: "bg-emerald-500",
    title: "Evidência forte"
  },
  experimental: {
    chip: "border-amber-200 bg-amber-50 text-amber-900",
    dot: "bg-amber-500",
    title: "Observação experimental"
  },
  interpretive: {
    chip: "border-indigo-200 bg-indigo-50 text-indigo-900",
    dot: "bg-indigo-500",
    title: "Hipótese interpretativa"
  },
  insufficient: {
    chip: "border-slate-200 bg-slate-100 text-slate-700",
    dot: "bg-slate-500",
    title: "Dado insuficiente"
  }
};

export function RadarEvidenceBadge({ level, label, detail }: RadarEvidenceBadgeProps) {
  const style = EVIDENCE_STYLES[level];

  return (
    <div className={`inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black ${style.chip}`}>
      <span className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
      <span className="uppercase tracking-[0.16em]">{label || style.title}</span>
      <span className="hidden font-semibold normal-case tracking-normal text-current/80 md:inline">· {detail}</span>
    </div>
  );
}
