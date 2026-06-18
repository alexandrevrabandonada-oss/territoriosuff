import type { RadarComparisonTab, RadarMode } from "./RadarTypes";

type NextAction = {
  label: string;
  mode: RadarMode;
  tab?: RadarComparisonTab;
};

interface RadarNextReadingCardProps {
  eyebrow: string;
  title: string;
  description: string;
  caution: string;
  primary: NextAction;
  secondary?: NextAction;
  onNavigate: (mode: RadarMode, tab?: RadarComparisonTab) => void;
  dark?: boolean;
}

export function RadarNextReadingCard({
  eyebrow,
  title,
  description,
  caution,
  primary,
  secondary,
  onNavigate,
  dark = false
}: RadarNextReadingCardProps) {
  return (
    <section
      className={`rounded-[2rem] border p-5 shadow-[0_22px_50px_-36px_rgba(15,23,42,0.42)] md:p-6 ${
        dark
          ? "border-[#18435e] bg-[linear-gradient(180deg,rgba(7,26,40,0.95),rgba(10,34,52,0.96))] text-slate-100"
          : "border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f8fafc)] text-slate-900"
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-2">
          <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${dark ? "text-emerald-200/80" : "text-slate-400"}`}>{eyebrow}</div>
          <h3 className="text-xl font-black tracking-tight">{title}</h3>
          <p className={`text-sm font-semibold leading-relaxed ${dark ? "text-slate-300" : "text-slate-600"}`}>{description}</p>
        </div>
        <div
          className={`rounded-2xl border px-4 py-3 text-[11px] font-semibold leading-relaxed lg:max-w-sm ${
            dark
              ? "border-amber-400/20 bg-amber-400/10 text-amber-100"
              : "border-amber-200 bg-amber-50 text-amber-900"
          }`}
        >
          {caution}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          onClick={() => onNavigate(primary.mode, primary.tab)}
          className={`rounded-2xl px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.12em] transition-colors ${
            dark ? "bg-emerald-400 text-slate-950 hover:bg-emerald-300" : "bg-slate-900 text-white hover:bg-slate-800"
          }`}
        >
          {primary.label}
        </button>
        {secondary && (
          <button
            onClick={() => onNavigate(secondary.mode, secondary.tab)}
            className={`rounded-2xl border px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.12em] transition-colors ${
              dark
                ? "border-[#29516a] bg-[#0d2e46] text-slate-100 hover:bg-[#123650]"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {secondary.label}
          </button>
        )}
      </div>
    </section>
  );
}
