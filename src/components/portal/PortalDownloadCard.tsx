import type { ReactNode } from "react";

import { PortalCard } from "./PortalCard";

type PortalDownloadCardProps = {
  format: ReactNode;
  title: ReactNode;
  description: ReactNode;
  meta?: ReactNode;
  action?: ReactNode;
};

export function PortalDownloadCard({ format, title, description, meta, action }: PortalDownloadCardProps) {
  return (
    <PortalCard variant="download" className="flex h-full flex-col justify-between gap-4">
      <div className="space-y-2">
        <span className="inline-block rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-[8px] font-black tracking-[0.16em] text-emerald-700">
          {format}
        </span>
        <h3 className="text-base font-black text-slate-900">{title}</h3>
        <p className="text-xs font-semibold leading-relaxed text-slate-600">{description}</p>
      </div>
      <div className="space-y-3">
        {meta ? <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">{meta}</div> : null}
        {action ? <div>{action}</div> : null}
      </div>
    </PortalCard>
  );
}
