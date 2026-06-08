import type { ReactNode } from "react";

import { PortalCard } from "./PortalCard";

type PortalMetricCardProps = {
  label: ReactNode;
  value: ReactNode;
  description?: ReactNode;
  tone?: "leitura" | "tecnico" | "social" | "acao";
};

export function PortalMetricCard({ label, value, description, tone = "leitura" }: PortalMetricCardProps) {
  return (
    <PortalCard variant={tone} className="flex min-h-[11rem] flex-col justify-between gap-4">
      <div>
        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-current/70">{label}</div>
        <div className="mt-3 text-4xl font-black tracking-tight text-current">{value}</div>
      </div>
      {description ? <p className="text-[12px] font-semibold leading-relaxed text-current/80">{description}</p> : null}
    </PortalCard>
  );
}
