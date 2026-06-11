import type { LatestResult, SummaryStats } from "./RadarTypes";
import { getIneaClassificationStyle } from "./RadarTypes";
import { RadarVisualNotice } from "./RadarVisualNotice";

type RadarDataNotice =
  | { kind: "validation"; message: string }
  | { kind: "partial"; message: string }
  | null;

interface RadarQuickSummaryProps {
  notice: RadarDataNotice;
  latestData: LatestResult[];
  sortedRankings: unknown[];
  displaySummary: SummaryStats;
  onRetry: () => void;
}

export function RadarQuickSummary({
  notice,
  latestData,
  sortedRankings: _sortedRankings,
  displaySummary: _displaySummary,
  onRetry
}: RadarQuickSummaryProps) {
  return (
    <>
      <div className="rounded-r-2xl border-l-4 border-[#d97706] bg-[#fffbeb] p-5 font-serif italic text-[#78350f] shadow-xs">
        <blockquote className="text-sm font-semibold tracking-wide md:text-base">
          "O dado que aparece importa. O dado que some também. E a ausência de dados nunca deve ser interpretada como qualidade boa do ar."
        </blockquote>
      </div>

      {notice && (
        <div className="rounded-2xl">
          <RadarVisualNotice
            type={notice.kind === "validation" ? "info" : "warning"}
            title={notice.kind === "validation" ? "Ambiente de Validação" : "Atualização Parcial da Base"}
            description={notice.message}
            nextStep={
              notice.kind === "validation"
                ? "Use mapa, histórico e metodologia para validar o shell visual antes da publicação pública."
                : "Consulte mapa, séries históricas e metodologia enquanto a atualização completa não retorna."
            }
            action={onRetry}
            actionLabel="Tentar novamente"
          />
        </div>
      )}

      <div className="space-y-4">
        <h2 className="pl-1 text-xs font-black uppercase tracking-widest text-slate-400">Resumo Rápido — Em 30 segundos</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card-leitura space-y-2 rounded-2xl p-5 transition-all duration-300 hover:scale-[1.01] hover:shadow-md">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-sm text-emerald-600">💡</div>
            <strong className="block text-xs font-black text-slate-800">O que há aqui?</strong>
            <p className="text-[11px] font-semibold leading-normal text-slate-500">Dados públicos de qualidade do ar, meteorologia e exposição territorial.</p>
          </div>

          <div className="card-leitura space-y-2 rounded-2xl p-5 transition-all duration-300 hover:scale-[1.01] hover:shadow-md">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/10 text-sm text-indigo-600">🧭</div>
            <strong className="block text-xs font-black text-slate-800">O que olhar primeiro?</strong>
            <p className="text-[11px] font-semibold leading-normal text-slate-500">Comece pelo mapa, depois compare no tempo e veja os territórios prioritários.</p>
          </div>

          <div className="card-leitura space-y-2 rounded-2xl p-5 transition-all duration-300 hover:scale-[1.01] hover:shadow-md">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/10 text-sm text-amber-600">⚠️</div>
            <strong className="block text-xs font-black text-slate-800">O que exige cuidado?</strong>
            <p className="text-[11px] font-semibold leading-normal text-slate-500">Ausência de dado não significa ar bom. Comparações são experimentais.</p>
          </div>

          <div className="card-leitura space-y-2 rounded-2xl p-5 transition-all duration-300 hover:scale-[1.01] hover:shadow-md">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-500/10 text-sm text-purple-600">🌱</div>
            <strong className="block text-xs font-black text-slate-800">Por que importa?</strong>
            <p className="text-[11px] font-semibold leading-normal text-slate-500">Ajuda a orientar saúde pública, fiscalização, arborização e manutenção das estações.</p>
          </div>
        </div>
      </div>

      {latestData.length > 0 && (
        <div className="space-y-3 pt-2">
          <h2 className="pl-1 text-xs font-black uppercase tracking-widest text-slate-400">Últimas leituras consolidadas por estação</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {latestData.map((d) => {
              const latestAqi = d.measurements.find((m) => m.metric_type === "GENERAL_AQI");
              const classification = latestAqi?.air_quality_classification || "Sem Leitura";
              const value = typeof latestAqi?.value === "number" ? Math.round(latestAqi.value) : "-";
              const colorClass = getIneaClassificationStyle(classification);

              return (
                <div key={d.station.id} className="card-leitura flex items-center justify-between rounded-2xl p-4 shadow-xs transition-all duration-300 hover:scale-[1.01] hover:shadow-md">
                  <div className="space-y-0.5">
                    <span className="block truncate text-xs font-black text-slate-800">{d.station.name}</span>
                    <span className="block text-[9px] font-semibold text-slate-450">
                      {d.measured_at ? new Date(d.measured_at).toLocaleDateString("pt-BR") : "-"}
                    </span>
                  </div>
                  <div className="text-right">
                    <strong className="block text-sm font-black text-slate-800">
                      {value} <span className="text-[9px] font-bold text-slate-400">IQAr</span>
                    </strong>
                    <span className={`inline-block rounded-full px-1.5 py-0.5 text-[8px] font-black leading-none ${colorClass}`}>{classification}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <RadarVisualNotice
        type="warning"
        title="Aviso Metodológico Unificado"
        description="Este portal baseia-se em séries históricas consolidadas em lotes periódicos. Não representa monitoramento ao vivo e não representa tempo real. As análises servem para priorização territorial e suporte à cobrança pública, não medindo risco de saúde individual imediato ou provando causalidade direta isolada."
        nextStep="Navegue pelas abas abaixo para analisar dados específicos por mapa, tempo ou de exposição territorial."
      />
    </>
  );
}
