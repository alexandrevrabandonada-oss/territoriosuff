import type { ReactNode } from "react";

import { SurfaceCard } from "../BrandSystem";

type PortalHeroProps = {
  badge?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  metrics?: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
  tone?: "default" | "warm" | "seed" | "lab" | "social";
};

const toneClassMap: Record<NonNullable<PortalHeroProps["tone"]>, string> = {
  default: "portal-stage-hero-documental",
  warm: "portal-stage-hero-warm",
  seed: "portal-stage-hero-seed",
  lab: "portal-stage-hero-lab",
  social: "portal-stage-hero-social"
};

export function PortalHero({ badge, title, subtitle, metrics, actions, aside, tone = "default" }: PortalHeroProps) {
  return (
    <SurfaceCard className={`portal-stage-hero ${toneClassMap[tone]} overflow-hidden p-0`}>
      <div className="portal-stage-hero-inner portal-hero-split">
        <div className="portal-stage-copy space-y-4">
          {badge ? <div className="flex flex-wrap items-center gap-2.5">{badge}</div> : null}
          <div className="space-y-3">
            <h1>{title}</h1>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          {metrics ? <div className="portal-hero-metrics">{metrics}</div> : null}
          {actions ? <div className="flex flex-wrap items-center gap-3 pt-1">{actions}</div> : null}
        </div>
        {aside ? <div className="portal-hero-aside">{aside}</div> : null}
      </div>
    </SurfaceCard>
  );
}
