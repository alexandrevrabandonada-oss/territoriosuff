import { useRadarReleaseMetadata } from "../../../data/air/useRadarReleaseMetadata";
import { RADAR_EXPERIMENTAL_COMPARISON_NOTE, RADAR_NO_DATA_NOT_CLEAN_AIR } from "../../../data/air/radar-copy";
import { RadarConfidenceSnapshot } from "./RadarConfidenceSnapshot";
import { RadarEvidenceStateBlock } from "./RadarEvidenceStateBlock";
import { summarizeStationGovernance } from "./RadarGovernanceModel";
import type { LatestResult, SummaryStats } from "./RadarTypes";
import { getIneaClassificationStyle } from "./RadarTypes";
import { RadarVisualNotice } from "./RadarVisualNotice";
import type { StationMetadataItem } from "./RadarTypes";

type RadarDataNotice =
  | { kind: "validation"; message: string }
  | { kind: "partial"; message: string; failedBlocks?: string[] }
  | null;

interface RadarQuickSummaryProps {
  notice: RadarDataNotice;
  latestData: LatestResult[];
  sortedRankings: unknown[];
  displaySummary: SummaryStats;
  stationMetadata: StationMetadataItem[];
  onRetry: () => void;
}

export function RadarQuickSummary({
  notice,
  latestData,
  sortedRankings: _sortedRankings,
  displaySummary,
  stationMetadata,
  onRetry
}: RadarQuickSummaryProps) {
  const releaseMetadata = useRadarReleaseMetadata();
  const governance = summarizeStationGovernance(stationMetadata);

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
            badges={[
              `ciclo ${releaseMetadata.cycleVersion}`,
              `metodologia ${releaseMetadata.methodologyVersion}`,
              `revisão ${releaseMetadata.plannedReviewDate}`
            ]}
            nextStep={
              notice.kind === "validation"
                ? "Use mapa, histórico e metodologia para validar o shell visual antes de tratar este ciclo como leitura pública fechada."
                : notice.failedBlocks?.length
                  ? `Blocos afetados: ${notice.failedBlocks.join(", ")}. Consulte mapa, séries históricas e metodologia enquanto a atualização completa do ciclo ${releaseMetadata.cycleVersion} não retorna.`
                  : `Consulte mapa, séries históricas e metodologia enquanto a atualização completa do ciclo ${releaseMetadata.cycleVersion} não retorna.`
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
            <p className="text-[11px] font-semibold leading-normal text-slate-500">Use a trilha guiada logo abaixo para escolher a ordem certa conforme seu papel: morador, jornalista/pesquisador ou gestão pública.</p>
          </div>

          <div className="card-leitura space-y-2 rounded-2xl p-5 transition-all duration-300 hover:scale-[1.01] hover:shadow-md">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/10 text-sm text-amber-600">⚠️</div>
            <strong className="block text-xs font-black text-slate-800">O que exige cuidado?</strong>
            <p className="text-[11px] font-semibold leading-normal text-slate-500">{RADAR_NO_DATA_NOT_CLEAN_AIR} {RADAR_EXPERIMENTAL_COMPARISON_NOTE}</p>
          </div>

          <div className="card-leitura space-y-2 rounded-2xl p-5 transition-all duration-300 hover:scale-[1.01] hover:shadow-md">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-500/10 text-sm text-purple-600">🌱</div>
            <strong className="block text-xs font-black text-slate-800">Por que importa?</strong>
            <p className="text-[11px] font-semibold leading-normal text-slate-500">Ajuda a orientar saúde pública, fiscalização, arborização e manutenção das estações.</p>
          </div>
        </div>
      </div>

      {governance.total > 0 && (
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-[1.4rem] border border-sky-200 bg-sky-50/70 p-4 md:col-span-2">
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-700">Prontidão da malha pública</div>
            <p className="mt-2 text-[11px] font-semibold leading-relaxed text-sky-900/80">
              Score médio {governance.averageScore}/100. O Radar já informa quão forte é a rede que sustenta as leituras desta rodada.
            </p>
          </div>
          <div className="rounded-[1.4rem] border border-emerald-200 bg-emerald-50/70 p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">Fortes</div>
            <div className="mt-2 text-2xl font-black text-emerald-950">{governance.strong}</div>
          </div>
          <div className="rounded-[1.4rem] border border-amber-200 bg-amber-50/70 p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-700">Cautelares</div>
            <div className="mt-2 text-2xl font-black text-amber-950">{governance.experimental}</div>
          </div>
        </div>
      )}

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
        badges={[
          `ciclo ${releaseMetadata.cycleVersion}`,
          `dataset ${releaseMetadata.datasetVersion}`,
          `revisão ${releaseMetadata.plannedReviewDate}`
        ]}
        nextStep="Navegue pelas abas abaixo para analisar dados específicos por mapa, tempo ou de exposição territorial."
      />

      <RadarConfidenceSnapshot compact summary={displaySummary} stationMetadata={stationMetadata} />

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h3 className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Transparência da API</h3>
            <p className="text-xs font-semibold leading-relaxed text-slate-600">
              A auditoria pública já pode usar exportação CSV bruta, manifesto legível por máquina e paginação da série histórica sem depender só dos cards visuais.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href="/api/air/inea/export-manifest"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-700 transition-colors hover:border-slate-300"
            >
              Manifesto da API
            </a>
            <a
              href="/api/air/inea/export?metricType=GENERAL_AQI"
              className="inline-flex min-h-11 items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-800 transition-colors hover:border-emerald-300"
            >
              Exportação bruta
            </a>
            <a
              href="/api/air/inea/export-catalog"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-sky-800 transition-colors hover:border-sky-300"
            >
              Catálogo de partições
            </a>
            <a
              href="/api/air/inea/stations-metadata"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-800 transition-colors hover:border-emerald-300"
            >
              Metadados das estações
            </a>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <RadarEvidenceStateBlock
            state="published"
            description="Manifesto público, CSV bruto, catálogo de partições e metadados das estações já permitem auditar a base sem depender apenas da interface visual."
          />
          <RadarEvidenceStateBlock
            state={latestData.length > 0 ? "partial" : "missing"}
            description={
              latestData.length > 0
                ? "Os cards de últimas leituras ajudam na triagem pública, mas ainda exigem checagem posterior de cobertura, série histórica e regra metodológica."
                : "Sem leituras recentes consolidadas neste carregamento, o resumo não deve ser usado como base suficiente para conclusão pública forte."
            }
          />
        </div>
      </div>
    </>
  );
}
