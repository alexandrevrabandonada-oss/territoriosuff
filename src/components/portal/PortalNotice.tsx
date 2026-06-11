import type { ReactNode } from "react";

type PortalNoticeProps = {
  type: "info" | "cautela" | "alerta" | "validacao" | "metodologia" | "sem-dado";
  title: ReactNode;
  description: ReactNode;
  nextStep?: ReactNode;
  action?: ReactNode;
};

const typeClassMap: Record<PortalNoticeProps["type"], { shell: string; badge: string; label: string }> = {
  info: {
    shell: "border-emerald-300/70 bg-[linear-gradient(135deg,#ecfdf5,#dcfce7)] text-slate-900 shadow-[0_18px_38px_-30px_rgba(16,185,129,0.75)]",
    badge: "bg-emerald-600 text-white",
    label: "Info"
  },
  cautela: {
    shell: "border-amber-300/70 bg-[linear-gradient(135deg,#fffbeb,#fff1cc)] text-amber-950 shadow-[0_18px_38px_-30px_rgba(217,119,6,0.9)]",
    badge: "bg-amber-500 text-white",
    label: "Cautela"
  },
  alerta: {
    shell: "border-red-300/70 bg-[linear-gradient(135deg,#fff1f2,#ffe4e6)] text-red-950 shadow-[0_18px_38px_-30px_rgba(220,38,38,0.8)]",
    badge: "bg-red-600 text-white",
    label: "Alerta"
  },
  validacao: {
    shell: "border-cyan-300/70 bg-[linear-gradient(135deg,#ecfeff,#cffafe)] text-cyan-950 shadow-[0_18px_38px_-30px_rgba(8,145,178,0.75)]",
    badge: "bg-cyan-700 text-white",
    label: "Validação"
  },
  metodologia: {
    shell: "border-indigo-300/70 bg-[linear-gradient(135deg,#eef2ff,#e0e7ff)] text-indigo-950 shadow-[0_18px_38px_-30px_rgba(79,70,229,0.75)]",
    badge: "bg-indigo-600 text-white",
    label: "Metodologia"
  },
  "sem-dado": {
    shell: "border-slate-300/70 bg-[linear-gradient(135deg,#f8fafc,#eef2f7)] text-slate-900 shadow-[0_18px_38px_-30px_rgba(100,116,139,0.5)]",
    badge: "bg-slate-700 text-white",
    label: "Sem dado"
  }
};

export function PortalNotice({ type, title, description, nextStep, action }: PortalNoticeProps) {
  const tone = typeClassMap[type];
  return (
    <div className={`space-y-3 rounded-[1.7rem] border p-4 text-xs font-semibold leading-relaxed ${tone.shell}`}>
      <div className="flex items-center gap-3">
        <div className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] ${tone.badge}`}>
          {tone.label}
        </div>
        <h4 className="text-[11px] font-extrabold uppercase tracking-wider">{title}</h4>
      </div>
      <p className="font-medium leading-normal text-current/85">{description}</p>
      {nextStep || action ? (
        <div className="flex flex-col gap-3 border-t border-slate-900/5 pt-3 md:flex-row md:items-center md:justify-between">
          {nextStep ? <span className="text-[10px] font-bold text-current/75">Próximo passo: {nextStep}</span> : <span />}
          {action ? <div>{action}</div> : null}
        </div>
      ) : null}
    </div>
  );
}
