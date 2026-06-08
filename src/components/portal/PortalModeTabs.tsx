import type { ReactNode } from "react";

type PortalModeTab = {
  id: string;
  label: ReactNode;
};

type PortalModeTabsProps = {
  tabs: PortalModeTab[];
  active: string;
  onSelect: (id: string) => void;
};

export function PortalModeTabs({ tabs, active, onSelect }: PortalModeTabsProps) {
  return (
    <div className="sticky z-40 rounded-[1.6rem] border border-slate-200/70 bg-white/75 p-2 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.6)] backdrop-blur-xl">
      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto scroll-smooth px-0.5 py-0.5">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelect(tab.id)}
              className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-2xl border px-4 py-3 text-xs font-extrabold transition-all ${
                isActive
                  ? "border-emerald-500/20 bg-[linear-gradient(135deg,#0b2538,#11334a_55%,#12a06c)] text-white shadow-[0_16px_30px_-22px_rgba(16,185,129,0.95)]"
                  : "border-transparent bg-white/35 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
