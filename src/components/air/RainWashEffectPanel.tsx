import { SurfaceCard } from "../BrandSystem";
import { RAIN_WASHING_STATS } from "../../data/air/weather-analytics-summary";

export function RainWashEffectPanel() {
  const { dry, rainy, washReductionPct } = RAIN_WASHING_STATS;

  return (
    <SurfaceCard className="p-6 border border-slate-100 rounded-3xl space-y-6 hover:shadow-md transition-all">
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-slate-800">Chuva e Lavagem Atmosférica</h3>
        <p className="text-xs text-slate-500 font-medium">
          O papel da precipitação hídrica na limpeza e remoção física de material particulado.
        </p>
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[10px] font-black text-indigo-900">
          <span className="h-2 w-2 rounded-full bg-indigo-500" />
          <span className="uppercase tracking-[0.16em]">Condição estimada</span>
          <span className="hidden font-semibold normal-case text-indigo-800/80 md:inline">interpretação auxiliar; a leitura de chuva não deve ser tratada como medição local equivalente ao vento observado</span>
        </div>
      </div>

      {/* Main visual side-by-side comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PM10 Washout Card */}
        <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Partículas Inaláveis (PM10)</span>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
              -{washReductionPct.pm10}% de Queda
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 divide-x divide-slate-200">
            <div className="space-y-1">
              <span className="text-[9px] text-slate-400 font-bold uppercase">Período Seco</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-700">{dry.pm10}</span>
                <span className="text-[10px] text-slate-500 font-bold">µg/m³</span>
              </div>
            </div>
            <div className="pl-4 space-y-1">
              <span className="text-[9px] text-slate-400 font-bold uppercase">Sob Chuva &gt;2mm</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-emerald-600">{rainy.pm10}</span>
                <span className="text-[10px] text-emerald-500 font-bold">µg/m³</span>
              </div>
            </div>
          </div>
          
          <div className="text-[10px] text-slate-500 leading-normal font-semibold">
            O material particulado grosso sedimentável (pó preto) é o primeiro a ser precipitado mecanicamente pelas gotas de chuva devido ao seu maior peso e diâmetro físico.
          </div>
        </div>

        {/* PM2.5 Washout Card */}
        <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Partículas Finas (PM2.5)</span>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
              -{washReductionPct.pm25}% de Queda
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 divide-x divide-slate-200">
            <div className="space-y-1">
              <span className="text-[9px] text-slate-400 font-bold uppercase">Período Seco</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-700">{dry.pm25}</span>
                <span className="text-[10px] text-slate-500 font-bold">µg/m³</span>
              </div>
            </div>
            <div className="pl-4 space-y-1">
              <span className="text-[9px] text-slate-400 font-bold uppercase">Sob Chuva &gt;2mm</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-emerald-600">{rainy.pm25}</span>
                <span className="text-[10px] text-emerald-500 font-bold">µg/m³</span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 leading-normal font-semibold">
            Partículas mais finas (PM2.5) também sofrem redução considerável através da captura de aerossóis na nuvem (*rainout*) e sob a nuvem (*washout*).
          </div>
        </div>
      </div>

      {/* Explainer paragraph */}
      <div className="p-4 bg-emerald-50/30 rounded-2xl text-xs leading-relaxed text-slate-600 font-medium border border-emerald-100/50 space-y-2">
        <p>
          🌧️ <strong>Lavagem atmosférica pela chuva (*Wet Deposition*):</strong> A precipitação pluvial atua como um coletor físico natural. As gotas de água colidem com as partículas em suspensão, limpando a coluna de ar e depositando os compostos no solo e corpos d'água. 
        </p>
        <p>
          📉 <strong>Redução de picos como leitura auxiliar:</strong> Durante períodos chuvosos, a série sugere queda dos índices horários médios de poluição. Esta interpretação ajuda a entender a remoção hídrica de partículas, mas deve ser lida como apoio analítico, não como prova isolada de causa e efeito em cada episódio.
        </p>
      </div>
    </SurfaceCard>
  );
}
