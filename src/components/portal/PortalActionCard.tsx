import type { ReactNode } from "react";

import { PortalCard } from "./PortalCard";

type PortalActionCardProps = {
  eyebrow: ReactNode;
  title: ReactNode;
  description: ReactNode;
  actionNote?: ReactNode;
  cta?: ReactNode;
};

export function PortalActionCard({ eyebrow, title, description, actionNote, cta }: PortalActionCardProps) {
  return (
    <PortalCard variant="acao" className="flex h-full flex-col justify-between gap-4">
      <div className="space-y-3">
        <div className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-700">{eyebrow}</div>
        <h3 className="text-sm font-black text-[#064e3b] md:text-base">{title}</h3>
        <p className="text-xs font-semibold leading-relaxed text-[#064e3b]/90">{description}</p>
        {actionNote ? (
          <div className="rounded-xl border border-emerald-200 bg-white/60 p-3 text-xs font-bold text-[#064e3b]">
            {actionNote}
          </div>
        ) : null}
      </div>
      {cta ? <div>{cta}</div> : null}
    </PortalCard>
  );
}
