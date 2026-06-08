import type { ReactNode } from "react";

type PortalEmptyStateProps = {
  title: ReactNode;
  description: ReactNode;
  actions?: ReactNode;
};

export function PortalEmptyState({ title, description, actions }: PortalEmptyStateProps) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f8fafc)] p-6 shadow-[0_20px_45px_-34px_rgba(15,23,42,0.45)]">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
          Estado pedagógico
        </div>
        <h3 className="text-xl font-black tracking-tight text-slate-900">{title}</h3>
        <p className="max-w-2xl text-sm font-semibold leading-relaxed text-slate-600">{description}</p>
      </div>
      {actions ? <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{actions}</div> : null}
    </div>
  );
}
