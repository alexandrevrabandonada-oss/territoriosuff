import type { ReactNode } from "react";

type PortalSectionHeaderProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  hint?: ReactNode;
  action?: ReactNode;
};

export function PortalSectionHeader({ eyebrow, title, subtitle, hint, action }: PortalSectionHeaderProps) {
  return (
    <div className="portal-section-header">
      <div className="space-y-2.5">
        {eyebrow ? <div className="flex flex-wrap items-center gap-2.5">{eyebrow}</div> : null}
        <h2 className="text-xl font-black tracking-tight text-slate-900 md:text-2xl">{title}</h2>
        {subtitle ? <p className="max-w-3xl text-sm font-medium leading-relaxed text-slate-600">{subtitle}</p> : null}
        {hint ? <p className="text-xs font-semibold text-slate-500">{hint}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
