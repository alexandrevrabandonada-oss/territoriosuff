import { useState } from "react";

import { RADAR_MODES, type RadarMode } from "./RadarTypes";

interface RadarModeNavProps {
  currentMode: RadarMode;
  onSelectMode: (mode: RadarMode) => void;
}

export function RadarModeNav({ currentMode, onSelectMode }: RadarModeNavProps) {
  const [copied, setCopied] = useState(false);

  const copyCurrentView = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      className="sticky z-40 flex items-center gap-2 rounded-[1.6rem] border border-slate-200/70 bg-white/90 p-2 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.6)] backdrop-blur-xl transition-all dark:border-slate-800/50 dark:bg-slate-900/90"
      style={{ top: "5.45rem" }}
      aria-label="Navegação analítica do Radar"
    >
      <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-2 overflow-x-auto scroll-smooth px-0.5 py-0.5" role="tablist" aria-label="Modos de análise">
        {RADAR_MODES.map((mode) => {
          const isActive = currentMode === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              role="tab"
              aria-selected={isActive}
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
      <button
        type="button"
        onClick={() => void copyCurrentView()}
        className="hidden min-h-11 shrink-0 items-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 transition hover:border-emerald-200 hover:text-emerald-800 sm:inline-flex"
        aria-live="polite"
      >
        {copied ? "Link copiado" : "Compartilhar visão"}
      </button>
    </div>
  );
}
