import { useRef, useState, type KeyboardEvent } from "react";

import { RADAR_MODES, type RadarMode } from "./RadarTypes";

interface RadarModeNavProps {
  currentMode: RadarMode;
  onSelectMode: (mode: RadarMode) => void;
}

export function RadarModeNav({ currentMode, onSelectMode }: RadarModeNavProps) {
  const [copied, setCopied] = useState(false);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const selectAndFocusMode = (index: number) => {
    const normalizedIndex = (index + RADAR_MODES.length) % RADAR_MODES.length;
    onSelectMode(RADAR_MODES[normalizedIndex].id);
    tabRefs.current[normalizedIndex]?.focus();
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const nextIndexByKey: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowDown: index + 1,
      ArrowLeft: index - 1,
      ArrowUp: index - 1,
      Home: 0,
      End: RADAR_MODES.length - 1
    };
    const nextIndex = nextIndexByKey[event.key];
    if (nextIndex === undefined) return;
    event.preventDefault();
    selectAndFocusMode(nextIndex);
  };

  const copyCurrentView = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="sticky z-40 space-y-1" style={{ top: "5.45rem" }}>
      <div
        className="flex items-center gap-2 rounded-[1.6rem] border border-slate-200/70 bg-white/90 p-2 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.6)] backdrop-blur-xl transition-all dark:border-slate-800/50 dark:bg-slate-900/90"
        aria-label="Navegação analítica do Radar"
      >
        <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-2 overflow-x-auto scroll-smooth px-0.5 py-0.5" role="tablist" aria-label="Modos de análise">
          {RADAR_MODES.map((mode, index) => {
            const isActive = currentMode === mode.id;
            return (
              <button
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                key={mode.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                onClick={() => onSelectMode(mode.id)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-2xl border px-4 py-3 text-xs font-extrabold transition-all ${
                  isActive
                    ? "border-emerald-500/20 bg-[linear-gradient(135deg,#0b2538,#11334a_55%,#12a06c)] text-white shadow-[0_16px_30px_-22px_rgba(16,185,129,0.95)]"
                    : "border-transparent bg-white/35 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-xl text-sm transition-all ${
                    isActive ? "bg-white/14 text-white" : "bg-slate-100 text-slate-600"
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
      <p className="pr-3 text-right text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600 sm:hidden" aria-hidden="true">
        Deslize para ver todos os modos →
      </p>
    </div>
  );
}
