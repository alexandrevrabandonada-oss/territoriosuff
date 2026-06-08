import { RADAR_MODES, type RadarMode } from "./RadarTypes";

interface RadarModeNavProps {
  currentMode: RadarMode;
  onSelectMode: (mode: RadarMode) => void;
}

export function RadarModeNav({ currentMode, onSelectMode }: RadarModeNavProps) {
  return (
    <div
      className="sticky z-40 rounded-[1.6rem] border border-slate-200/70 bg-white/75 p-2 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.6)] backdrop-blur-xl transition-all dark:border-slate-800/50 dark:bg-slate-900/80"
      style={{ top: "5.45rem" }}
    >
      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto scroll-smooth px-0.5 py-0.5">
        {RADAR_MODES.map((mode) => {
          const isActive = currentMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-2xl border px-4 py-3 text-xs font-extrabold transition-all ${
                isActive
                  ? "border-emerald-500/20 bg-[linear-gradient(135deg,#0b2538,#11334a_55%,#12a06c)] text-white shadow-[0_16px_30px_-22px_rgba(16,185,129,0.95)]"
                  : "border-transparent bg-white/35 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-xl text-sm transition-all ${
                  isActive ? "bg-white/14 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {mode.icon}
              </span>
              <span className="whitespace-nowrap">{mode.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
