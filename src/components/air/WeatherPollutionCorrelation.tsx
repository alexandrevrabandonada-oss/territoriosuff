import { SurfaceCard } from "../BrandSystem";
import { CALM_DAYS_STATS, WEATHER_METADATA } from "../../data/air/weather-analytics-summary";
import { useRadarReleaseMetadata } from "../../data/air/useRadarReleaseMetadata";
import { RadarEvidenceStateBlock } from "../../pages/air/radar/RadarEvidenceStateBlock";

export function WeatherPollutionCorrelation() {
  const releaseMetadata = useRadarReleaseMetadata();
  // Sort stats descending by year
  const sortedStats = [...CALM_DAYS_STATS].sort((a, b) => b.year - a.year);

  return (
    <SurfaceCard className="p-6 border border-slate-100 rounded-3xl space-y-6 hover:shadow-md transition-all">
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-slate-800">Dias de Calmaria e Estagnação</h3>
        <p className="text-xs text-slate-500 font-medium">
          Série histórica de estagnação de ventos e eventos de baixa dispersão atmosférica.
        </p>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-800">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="uppercase tracking-[0.16em]">Vento observado</span>
          <span className="hidden font-semibold normal-case text-emerald-700/80 md:inline">calmaria e dispersão usam a camada de vento como base mais forte</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-700">
            ciclo {releaseMetadata.cycleVersion}
          </span>
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-700">
            metodologia {releaseMetadata.methodologyVersion}
          </span>
          <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-amber-800">
            evidência parcial
          </span>
        </div>
      </div>

      {/* High-level metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estagnação do Ar</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-800">
              {WEATHER_METADATA.maxConsecutiveDryDays} dias
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-semibold">
            Maior período consecutivo de estiagem e ar seco registrado na série.
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Baixa Dispersão Noturna</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-800">
              {WEATHER_METADATA.lowDispersionEventsTotal.toLocaleString()}h
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-semibold">
            Horas sob efeito acumulado de ventos &lt; 1 m/s, sem chuva, durante a noite/manhã.
          </p>
        </div>
      </div>

      {/* Main explanation */}
      <div className="text-xs leading-relaxed text-slate-600 font-medium space-y-2">
        <p>
          💨 <strong>O Fenômeno da Calmaria:</strong> A calmaria (ventos abaixo de 1.5 m/s) reduz drasticamente a taxa de dispersão horizontal de poluentes urbanos e industriais. Quando o ar se move lentamente, a poluição gerada localmente se acumula sobre a cidade em vez de ser transportada para longe da mancha urbana.
        </p>
        <p>
          🌡️ <strong>Efeito noturno como hipótese física:</strong> Durante a noite e nas primeiras horas da manhã, a calmaria pode coincidir com condições favoráveis à inversão térmica, aprisionando material particulado perto do solo. Esta leitura deve ser entendida como interpretação atmosférica plausível, não como prova instrumental direta de cada episódio.
        </p>
        <p className="text-slate-500">
          No ciclo {releaseMetadata.cycleVersion}, a utilidade pública deste quadro é indicar janela de maior risco de acúmulo e orientar checagem posterior em séries, episódios e documentação metodológica.
        </p>
      </div>

      {/* Historical calm days grid/table */}
      <div className="space-y-3">
        <h4 className="font-extrabold text-slate-700 text-xs uppercase tracking-wider">Histórico Anual de Calmaria</h4>
        
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                <th className="p-3">Ano</th>
                <th className="p-3 text-center">Horas de Calmaria</th>
                <th className="p-3 text-center">Proporção Anual</th>
                <th className="p-3 text-center">Equivalente em Dias</th>
                <th className="p-3">Tendência de Dispersão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {sortedStats.map((item) => {
                const isPartial = item.year === 2026;
                const calmPct = item.calmPercentage;
                let trendBadge = "bg-green-50 text-green-800 border-green-200";
                let trendText = "Dispersão Boa";
                
                if (calmPct > 45) {
                  trendBadge = "bg-red-50 text-red-800 border-red-200";
                  trendText = "Altamente Estagnante";
                } else if (calmPct > 35) {
                  trendBadge = "bg-amber-50 text-amber-800 border-amber-200";
                  trendText = "Estabilidade Moderada";
                }
                
                return (
                  <tr key={item.year} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 font-bold text-slate-900">
                      {item.year} {isPartial && <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1 py-0.5 rounded ml-1">Parcial</span>}
                    </td>
                    <td className="p-3 text-center text-slate-500">{item.calmHours}h</td>
                    <td className="p-3 text-center text-slate-800 font-bold">{calmPct}%</td>
                    <td className="p-3 text-center font-bold text-slate-800">{item.calmDaysEquivalent} dias</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 border rounded-md font-bold text-[10px] ${trendBadge}`}>
                        {trendText}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <RadarEvidenceStateBlock
        state="partial"
        title="Calmaria é contexto atmosférico, não veredito emissor"
        description={`A série de calmaria sustenta leitura meteorológica relevante no release ${releaseMetadata.cycleVersion}, mas não fecha sozinha causalidade, infração ou equivalência regulatória. Use junto com cobertura, estações e metodologia antes de qualquer conclusão pública forte.`}
      />
    </SurfaceCard>
  );
}
