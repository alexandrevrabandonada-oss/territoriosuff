import { useRadarReleaseMetadata } from "../../../data/air/useRadarReleaseMetadata";
import { RADAR_EXPERIMENTAL_COMPARISON_NOTE, RADAR_NO_DATA_NOT_CLEAN_AIR } from "../../../data/air/radar-copy";
import { RadarConfidenceSnapshot } from "./RadarConfidenceSnapshot";
import type { LatestResult, RadarComparisonTab, RadarMode, SummaryStats } from "./RadarTypes";
import { getIneaClassificationStyle } from "./RadarTypes";
import { RadarVisualNotice } from "./RadarVisualNotice";
import type { StationMetadataItem } from "./RadarTypes";

type RadarDataNotice =
  | { kind: "validation"; message: string }
  | { kind: "partial"; message: string; failedBlocks?: string[] }
  | null;

interface RadarQuickSummaryProps {
  compact?: boolean;
  notice: RadarDataNotice;
  latestData: LatestResult[];
  sortedRankings: unknown[];
  displaySummary: SummaryStats;
  stationMetadata: StationMetadataItem[];
  onRetry: () => void;
  onNavigate: (mode: RadarMode, tab?: RadarComparisonTab) => void;
  onScrollToRecommendations: () => void;
}

export function RadarQuickSummary({
  compact = false,
  notice,
  latestData,
  sortedRankings: _sortedRankings,
  displaySummary,
  stationMetadata,
  onRetry,
  onNavigate,
  onScrollToRecommendations
}: RadarQuickSummaryProps) {
  const releaseMetadata = useRadarReleaseMetadata();
  const activeStations = latestData.filter((item) => item.measured_at !== null).length;

  if (compact) {
    const startYear = displaySummary.timeRange.minDate?.slice(0, 4) || "2020";
    const endYear = displaySummary.timeRange.maxDate?.slice(0, 4) || "2026 parcial";
    return (
      <div className="space-y-4">
        {notice ? (
          <RadarVisualNotice
            type={notice.kind === "validation" ? "info" : "warning"}
            title={notice.kind === "validation" ? "Dados históricos disponíveis" : "Atualização parcial da base"}
            description={notice.message}
            badges={[`ciclo ${releaseMetadata.cycleVersion}`, `dataset ${releaseMetadata.datasetVersion}`]}
            nextStep="A navegação por mapa, histórico e metodologia continua disponível. Confira o estado da base antes de citar os resultados."
            action={onRetry}
            actionLabel="Tentar atualizar"
          />
        ) : null}

        <section className="grid gap-4 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_20px_55px_-42px_rgba(15,23,42,0.45)] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="space-y-3">
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-950">Comece pela pergunta que deseja responder</h2>
              <p className="mt-1 max-w-3xl text-sm font-semibold leading-relaxed text-slate-600">
                A base reúne {stationMetadata.length || displaySummary.totalStations || 3} estações no recorte {startYear}–{endYear}. Ausência de dado não representa ar bom.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-600">
              <span className="rounded-full bg-slate-100 px-3 py-2">{activeStations} com leitura nesta carga</span>
              <span className="rounded-full bg-emerald-50 px-3 py-2 text-emerald-800">Base {displaySummary.source_system || "pública"}</span>
              <span className="rounded-full bg-amber-50 px-3 py-2 text-amber-900">Uso para triagem pública</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 lg:max-w-sm lg:justify-end">
            <button type="button" className="cta-primary" onClick={() => onNavigate("MAP")}>Localizar no mapa</button>
            <button type="button" className="cta-secondary" onClick={() => onNavigate("TIME", "COVERAGE")}>Conferir cobertura</button>
            <button type="button" className="cta-secondary" onClick={onScrollToRecommendations}>Ver ações públicas</button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <>
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

      <section className="space-y-6 rounded-[2.25rem] border border-slate-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(240,253,250,0.82))] p-5 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.38)] md:p-7">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-sky-800">
                ciclo {releaseMetadata.cycleVersion}
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-800">
                dataset {releaseMetadata.datasetVersion}
              </span>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-amber-800">
                leitura consolidada
              </span>
            </div>
            <div className="space-y-2">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Leitura pública em 3 passos</div>
              <h2 className="max-w-3xl text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
                Use o Radar como triagem auditável, não como conclusão automática.
              </h2>
              <p className="max-w-3xl text-sm font-semibold leading-relaxed text-slate-600">
                A página agora começa pelo essencial: o que existe na base, quais cuidados impedem leitura precipitada e onde abrir a camada certa para aprofundar.
              </p>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-relaxed text-amber-950">
            <strong className="block text-[11px] font-black uppercase tracking-[0.16em] text-amber-800">Regra de cautela</strong>
            <span className="mt-2 block">
              {RADAR_NO_DATA_NOT_CLEAN_AIR} {RADAR_EXPERIMENTAL_COMPARISON_NOTE}
            </span>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <button
            type="button"
            onClick={() => onNavigate("MAP")}
            className="group rounded-[1.5rem] border border-slate-200 bg-white p-4 text-left shadow-[0_18px_40px_-34px_rgba(15,23,42,0.32)] transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_24px_44px_-34px_rgba(14,116,144,0.45)]"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-700">1. Localizar</span>
            <strong className="mt-2 block text-base font-black leading-tight text-slate-950">Comece pelo mapa e pelas estações.</strong>
            <span className="mt-2 block text-xs font-semibold leading-relaxed text-slate-600">Veja onde há leitura, onde há silêncio e qual território fica fora da malha visível.</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate("TIME", "COVERAGE")}
            className="group rounded-[1.5rem] border border-slate-200 bg-white p-4 text-left shadow-[0_18px_40px_-34px_rgba(15,23,42,0.32)] transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_24px_44px_-34px_rgba(5,150,105,0.4)]"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">2. Conferir</span>
            <strong className="mt-2 block text-base font-black leading-tight text-slate-950">Cheque cobertura antes de comparar.</strong>
            <span className="mt-2 block text-xs font-semibold leading-relaxed text-slate-600">Uma comparação só é defensável quando janela temporal, unidade e lacunas estão explícitas.</span>
          </button>

          <button
            type="button"
            onClick={onScrollToRecommendations}
            className="group rounded-[1.5rem] border border-slate-200 bg-white p-4 text-left shadow-[0_18px_40px_-34px_rgba(15,23,42,0.32)] transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-[0_24px_44px_-34px_rgba(217,119,6,0.34)]"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">3. Agir</span>
            <strong className="mt-2 block text-base font-black leading-tight text-slate-950">Transforme achado em pedido público.</strong>
            <span className="mt-2 block text-xs font-semibold leading-relaxed text-slate-600">Use a leitura para priorizar manutenção, transparência, LAI ou investigação técnica rastreável.</span>
          </button>
        </div>
      </section>

      {latestData.length > 0 && (
        <div className="space-y-3 pt-2">
          <h2 className="pl-1 text-xs font-black uppercase tracking-widest text-slate-700">Últimas leituras consolidadas por estação</h2>
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

      <RadarConfidenceSnapshot compact summary={displaySummary} stationMetadata={stationMetadata} />

      <div className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h3 className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Auditoria e dados abertos</h3>
            <p className="text-xs font-semibold leading-relaxed text-slate-600">
              A reprodução externa não deve depender apenas da interface visual. Use manifesto, CSV e metadados para conferir a base por fora do portal.
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

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">Base auditável</div>
            <p className="mt-2 text-xs font-semibold leading-relaxed text-emerald-950">
              Manifesto, CSV bruto e catálogo sustentam conferência pública independente.
            </p>
          </div>
          <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-700">Recorte visível</div>
            <p className="mt-2 text-xs font-semibold leading-relaxed text-sky-950">
              {activeStations > 0 ? `${activeStations} estações com leitura consolidada nesta carga.` : "Sem estação com leitura consolidada nesta carga."}
            </p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-700">Limite declarado</div>
            <p className="mt-2 text-xs font-semibold leading-relaxed text-amber-950">
              O Radar orienta triagem pública e cobrança institucional; conclusões fortes exigem checagem metodológica.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
