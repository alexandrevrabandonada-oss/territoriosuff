interface RadarModeFooterProps {
  nextStep: string;
  primaryLabel: string;
  onPrimary: () => void;
  onTop: () => void;
  dark?: boolean;
}

export function RadarModeFooter({ nextStep, primaryLabel, onPrimary, onTop, dark = false }: RadarModeFooterProps) {
  return (
    <div className={`space-y-6 border-t pt-6 ${dark ? "border-[#0d2e46]" : "border-slate-200/60"}`}>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <span className={`text-xs font-semibold ${dark ? "text-slate-400" : "text-slate-500"}`}>💡 {nextStep}</span>
        <div className="flex items-center gap-2.5">
          <button
            onClick={onPrimary}
            className="min-h-11 cursor-pointer rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-800"
          >
            {primaryLabel}
          </button>
          <button
            onClick={onTop}
            className={`inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold uppercase transition-colors ${
              dark
                ? "border border-[#0d2e46] bg-[#0a2336] text-slate-350 hover:bg-[#0d2e46]"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <span>▲</span> Voltar ao topo
          </button>
        </div>
      </div>
    </div>
  );
}
