import type { ReactNode } from "react";

type PortalSectionHeaderProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  hint?: ReactNode;
  action?: ReactNode;
  tone?: "light" | "dark";
};

export function PortalSectionHeader({ eyebrow, title, subtitle, hint, action, tone = "light" }: PortalSectionHeaderProps) {
  const titleColor = tone === "dark" ? "text-white" : "text-slate-900";
  const subtitleColor = tone === "dark" ? "text-white/75" : "text-slate-600";
  const hintColor = tone === "dark" ? "text-white/65" : "text-slate-500";

  return (
    <div className="portal-section-header">
      <div className="space-y-2.5">
        {eyebrow ? <div className="flex flex-wrap items-center gap-2.5">{eyebrow}</div> : null}
        <h2 className={`text-xl font-black tracking-tight md:text-2xl ${titleColor}`}>{title}</h2>
        {subtitle ? <p className={`max-w-3xl text-sm font-medium leading-relaxed ${subtitleColor}`}>{subtitle}</p> : null}
        {hint ? <p className={`text-xs font-semibold ${hintColor}`}>{hint}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
