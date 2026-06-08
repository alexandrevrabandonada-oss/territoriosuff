interface RadarMicroguideProps {
  whatYouSee: string;
  howToRead: string;
  whyItMatters: string;
}

export function RadarMicroguide({ whatYouSee, howToRead, whyItMatters }: RadarMicroguideProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200/60 bg-slate-50/60 p-5 shadow-xs">
      <div className="flex items-center gap-2 border-b border-slate-150 pb-2.5">
        <span className="text-sm">🧭</span>
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0e2c45]">
          Microguia de Leitura e Interpretação
        </h3>
      </div>

      <div className="grid gap-5 text-xs leading-relaxed text-slate-600 md:grid-cols-3">
        <div className="space-y-1">
          <h4 className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wide text-[#0e2c45]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            O que você está vendo
          </h4>
          <p className="font-medium text-slate-600">{whatYouSee}</p>
        </div>

        <div className="space-y-1">
          <h4 className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wide text-[#0e2c45]">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Como ler
          </h4>
          <p className="font-medium text-slate-600">{howToRead}</p>
        </div>

        <div className="space-y-1">
          <h4 className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wide text-[#0e2c45]">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
            Por que importa
          </h4>
          <p className="font-medium text-slate-600">{whyItMatters}</p>
        </div>
      </div>
    </div>
  );
}
