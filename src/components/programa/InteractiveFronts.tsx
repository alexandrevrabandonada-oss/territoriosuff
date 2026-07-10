import { useId, useRef, useState } from "react";

import { Chip, IconShell, SurfaceCard } from "../BrandSystem";
import type { ProgramFront } from "../../content/programaUffTerritorio";

type InteractiveFrontsProps = {
  fronts: ProgramFront[];
};

function FrontIcon({ accent }: { accent: ProgramFront["accent"] }) {
  if (accent === "lab") {
    return (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 3v4l-4 7a4 4 0 003.47 6h7.06A4 4 0 0019 14l-4-7V3" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 10h8" />
      </svg>
    );
  }

  if (accent === "seed") {
    return (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 21c5-3.2 7-8.1 7-12.6A8.2 8.2 0 0012 3 8.2 8.2 0 005 8.4C5 12.9 7 17.8 12 21z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 7v10" />
      </svg>
    );
  }

  if (accent === "warm") {
    return (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v16M4 12h16" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6.5 6.5l11 11m0-11l-11 11" />
      </svg>
    );
  }

  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 19h16M7 16V9m5 7V5m5 11v-4" />
    </svg>
  );
}

export function InteractiveFronts({ fronts }: InteractiveFrontsProps) {
  const tabGroupId = useId();
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const focusTab = (index: number) => {
    const normalizedIndex = (index + fronts.length) % fronts.length;
    setActiveIndex(normalizedIndex);
    tabRefs.current[normalizedIndex]?.focus();
  };

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const nextIndexByKey: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowDown: index + 1,
      ArrowLeft: index - 1,
      ArrowUp: index - 1,
      Home: 0,
      End: fronts.length - 1
    };
    const nextIndex = nextIndexByKey[event.key];
    if (nextIndex === undefined) return;
    event.preventDefault();
    focusTab(nextIndex);
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-2" role="tablist" aria-label="Frentes do programa">
        {fronts.map((front, index) => {
          const isActive = index === activeIndex;
          const tabId = `${tabGroupId}-${front.id}-tab`;
          const panelId = `${tabGroupId}-${front.id}-panel`;

          return (
            <SurfaceCard
              key={front.id}
              role="presentation"
              className={[
                "group overflow-hidden rounded-[1.75rem] border p-0 transition-all duration-200",
                isActive
                  ? "border-brand-primary/20 bg-gradient-to-br from-white via-white to-brand-primary-soft/45 shadow-[0_22px_48px_rgba(17,38,59,0.12)]"
                  : "border-border-subtle bg-white hover:-translate-y-1 hover:border-brand-primary/18 hover:shadow-[0_18px_36px_rgba(17,38,59,0.08)]"
              ].join(" ")}
            >
              <button
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                id={tabId}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={panelId}
                aria-expanded={isActive}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveIndex(index)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                className="w-full p-5 text-left md:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <IconShell tone={front.accent} className="h-11 w-11 rounded-2xl">
                        <FrontIcon accent={front.accent} />
                      </IconShell>
                      <Chip tone={isActive ? "active" : "default"}>{front.shortLabel}</Chip>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-2xl font-black leading-tight text-text-primary">{front.title}</h3>
                      <p className="max-w-[48ch] text-sm leading-relaxed text-slate-700 md:text-base">{front.objective}</p>
                    </div>
                  </div>

                  <span
                    className={[
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border text-brand-primary transition-transform duration-200",
                      isActive ? "rotate-45 border-brand-primary/20 bg-brand-primary-soft" : "border-border-subtle bg-surface-2 group-hover:translate-x-0.5"
                    ].join(" ")}
                    aria-hidden="true"
                  >
                    +
                  </span>
                </div>

                <p className="mt-5 text-sm leading-relaxed text-slate-700">{front.description}</p>
              </button>
            </SurfaceCard>
          );
        })}
      </div>

      {fronts.map((front, index) => {
        const isActive = index === activeIndex;
        const tabId = `${tabGroupId}-${front.id}-tab`;
        const panelId = `${tabGroupId}-${front.id}-panel`;

        return (
          <SurfaceCard
            key={panelId}
            id={panelId}
            role="tabpanel"
            aria-labelledby={tabId}
            hidden={!isActive}
            className="grid overflow-hidden rounded-[1.75rem] border border-divider-subtle p-0 md:grid-cols-2"
          >
            <div className="bg-brand-primary-soft/60 p-5 md:p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-primary-dark">Entregas-chave</p>
              <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-text-primary">
                {front.deliveries.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-brand-primary" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#fff8ee] p-5 md:p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent-brown">Impacto esperado</p>
              <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-text-primary">
                {front.impact.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-accent-yellow" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </SurfaceCard>
        );
      })}
    </div>
  );
}
