interface RadarVisualNoticeProps {
  type: "info" | "warning" | "error" | "quarantine";
  title: string;
  description: string;
  nextStep?: string;
  action?: () => void;
  actionLabel?: string;
  badges?: string[];
}

export function RadarVisualNotice({
  type,
  title,
  description,
  nextStep,
  action,
  actionLabel,
  badges
}: RadarVisualNoticeProps) {
  const icon = type === "error" ? "❌" : type === "warning" ? "⚠️" : type === "quarantine" ? "🔍" : "ℹ️";
  const colorClasses =
    type === "error"
      ? "border-red-300/70 bg-[linear-gradient(135deg,#fff1f2,#ffe4e6)] text-red-950 shadow-[0_18px_38px_-30px_rgba(220,38,38,0.8)]"
      : type === "warning"
        ? "border-amber-300/70 bg-[linear-gradient(135deg,#fffbeb,#fff1cc)] text-amber-950 shadow-[0_18px_38px_-30px_rgba(217,119,6,0.9)]"
        : type === "quarantine"
          ? "border-indigo-300/70 bg-[linear-gradient(135deg,#eef2ff,#e0e7ff)] text-indigo-950 shadow-[0_18px_38px_-30px_rgba(79,70,229,0.75)]"
          : "border-emerald-300/70 bg-[linear-gradient(135deg,#ecfdf5,#dcfce7)] text-slate-900 shadow-[0_18px_38px_-30px_rgba(16,185,129,0.75)]";
  const badgeClasses =
    type === "error"
      ? "bg-red-600 text-white"
      : type === "warning"
        ? "bg-amber-500 text-white"
        : type === "quarantine"
          ? "bg-indigo-600 text-white"
          : "bg-emerald-600 text-white";
  const accentClasses =
    type === "error"
      ? "border-red-200/80 text-red-700"
      : type === "warning"
        ? "border-amber-200/80 text-amber-700"
        : type === "quarantine"
          ? "border-indigo-200/80 text-indigo-700"
          : "border-emerald-200/80 text-emerald-700";

  return (
    <div className={`space-y-3 rounded-[1.7rem] border p-4 text-xs font-semibold leading-relaxed ${colorClasses}`}>
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-base shadow-sm ${badgeClasses}`}>{icon}</div>
        <div className="space-y-1">
          <div className={`w-fit rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.18em] ${accentClasses}`}>
            {type === "error" ? "Alerta" : type === "warning" ? "Cautela" : type === "quarantine" ? "Metodologia" : "Ação guiada"}
          </div>
          <p className="text-[11px] font-extrabold uppercase tracking-wider">{title}</p>
        </div>
      </div>
      <p className="font-medium leading-normal text-slate-700">{description}</p>
      {badges?.length ? (
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => (
            <div
              key={badge}
              className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] ${accentClasses}`}
            >
              {badge}
            </div>
          ))}
        </div>
      ) : null}
      {nextStep && (
        <div className="flex items-center justify-between border-t border-slate-900/5 pt-3 text-[10px] font-bold text-slate-600">
          <span>Próximo passo: {nextStep}</span>
          {action && actionLabel && (
            <button
              onClick={action}
              className={`cursor-pointer rounded-full border px-3 py-1 transition-colors hover:bg-white/70 ${accentClasses}`}
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
