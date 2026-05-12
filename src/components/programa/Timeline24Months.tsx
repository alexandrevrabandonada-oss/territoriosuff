import { Chip, SurfaceCard } from "../BrandSystem";
import type { TimelinePhase } from "../../content/programaUffTerritorio";

type Timeline24MonthsProps = {
  phases: TimelinePhase[];
};

export function Timeline24Months({ phases }: Timeline24MonthsProps) {
  return (
    <div className="relative space-y-5">
      <div className="pointer-events-none absolute bottom-0 left-[1.1rem] top-0 w-px bg-gradient-to-b from-brand-primary/10 via-brand-primary/25 to-accent-lab/20 md:left-1/2 md:-translate-x-1/2" aria-hidden="true" />
      {phases.map((phase, index) => (
        <div key={phase.phase} className="relative grid gap-3 md:grid-cols-2 md:gap-8">
          <div className={index % 2 === 0 ? "md:pr-10" : "md:order-2 md:pl-10"}>
            <SurfaceCard className="rounded-[1.75rem] border-border-subtle bg-white p-5 md:p-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Chip tone="active">{phase.phase}</Chip>
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-text-secondary">{phase.period}</span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black leading-tight text-text-primary md:text-2xl">{phase.title}</h3>
                  <p className="text-sm leading-relaxed text-text-secondary md:text-base">{phase.description}</p>
                </div>

                <div className="rounded-[1.25rem] border border-border-subtle bg-surface-2/80 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-primary-dark">Entregas do ciclo</p>
                  <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-text-primary">
                    {phase.deliverables.map((item) => (
                      <li key={item} className="flex gap-2.5">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-accent-lab" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </SurfaceCard>
          </div>

          <div className={index % 2 === 0 ? "md:order-2" : ""} />

          <div className="absolute left-0 top-8 flex w-9 items-center justify-center md:left-1/2 md:top-10 md:-translate-x-1/2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-brand-primary/20 bg-white text-sm font-black text-brand-primary shadow-[0_10px_24px_rgba(17,38,59,0.08)] md:h-12 md:w-12 md:text-base">
              {index + 1}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}