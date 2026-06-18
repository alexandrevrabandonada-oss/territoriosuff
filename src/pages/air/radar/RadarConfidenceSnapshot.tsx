import { RadarEvidenceStateBlock } from "./RadarEvidenceStateBlock";
import type { StationMetadataItem, SummaryStats } from "./RadarTypes";
import { useRadarReleaseMetadata } from "../../../data/air/useRadarReleaseMetadata";
import { RADAR_EXPERIMENTAL_OBSERVATION_NOTE } from "../../../data/air/radar-copy";

interface RadarConfidenceSnapshotProps {
  summary: SummaryStats;
  stationMetadata: StationMetadataItem[];
  compact?: boolean;
}

function formatDate(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString("pt-BR");
}

export function RadarConfidenceSnapshot({
  summary,
  stationMetadata,
  compact = false
}: RadarConfidenceSnapshotProps) {
  const releaseMetadata = useRadarReleaseMetadata();
  const totalStations = stationMetadata.length || summary.totalStations || 0;
  const activeStations = stationMetadata.filter((item) => item.active).length;
  const explicitWindowStations = stationMetadata.filter((item) => !item.operation_window.is_inferred).length;
  const inferredWindowStations = stationMetadata.filter((item) => item.operation_window.is_inferred).length;
  const methodologyVersion = releaseMetadata.methodologyVersion || stationMetadata[0]?.provenance.methodology_version || "2026-06-16";
  const latestMeasuredAt = formatDate(summary.latest_measured_at);
  const latestIngestedAt = formatDate(summary.latest_ingested_at);
  const sourceSystem = summary.source_system || "CKAN_XLSX";
  const freshnessLabel = summary.data_freshness_label || "Última base pública disponível";

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f8fafc)] p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.35)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Camada de confiança pública</div>
          <h3 className="text-base font-black tracking-tight text-slate-900">
            {compact ? "Como confiar nesta rodada" : "Rastreabilidade metodológica desta rodada"}
          </h3>
          <p className="max-w-3xl text-[11px] font-semibold leading-relaxed text-slate-600">
            O Radar explicita a origem da base, a força dos metadados operacionais e o limite de uso público adequado. Transparência forte não é só publicar número:
            é publicar o quanto aquele número pode ser defendido.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-700">
            ciclo {releaseMetadata.cycleVersion}
          </div>
          <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-800">
            metodologia {methodologyVersion}
          </div>
          {releaseMetadata.datasetVersion && (
            <div className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-sky-800">
              dataset {releaseMetadata.datasetVersion}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Origem da base</div>
          <div className="mt-2 text-sm font-black text-slate-900">{sourceSystem}</div>
          <p className="mt-1 text-[11px] font-semibold leading-relaxed text-slate-500">{freshnessLabel}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">Janela explícita</div>
          <div className="mt-2 text-2xl font-black text-emerald-950">
            {explicitWindowStations}/{totalStations || "--"}
          </div>
          <p className="mt-1 text-[11px] font-semibold leading-relaxed text-emerald-800/80">
            estações com lastro operacional suficiente para cobertura sem inferência.
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-700">Janela inferida</div>
          <div className="mt-2 text-2xl font-black text-amber-950">{inferredWindowStations}</div>
          <p className="mt-1 text-[11px] font-semibold leading-relaxed text-amber-800/80">
            estações que ainda dependem de inferência controlada em parte dos indicadores.
          </p>
        </div>
        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-700">Recorte observável</div>
          <div className="mt-2 text-sm font-black text-sky-950">{activeStations || totalStations || "--"} estações ativas</div>
          <p className="mt-1 text-[11px] font-semibold leading-relaxed text-sky-800/80">
            {latestMeasuredAt ? `última medição pública em ${latestMeasuredAt}` : "última medição pública indisponível"}
            {latestIngestedAt ? ` · ingestão do portal em ${latestIngestedAt}` : ""}
          </p>
        </div>
      </div>

      <div className={`mt-4 grid gap-3 ${compact ? "lg:grid-cols-2" : "lg:grid-cols-3"}`}>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Pode sustentar</div>
          <p className="mt-2 text-[11px] font-semibold leading-relaxed text-slate-700">
            triagem territorial, cobrança pública, comparação histórica, leitura de cobertura e reprodução independente por jornalistas e pesquisadores.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Não pode sustentar sozinho</div>
          <p className="mt-2 text-[11px] font-semibold leading-relaxed text-slate-700">
            diagnóstico clínico individual, nexo causal jurídico isolado, leitura em tempo real minuto a minuto ou equivalência automática com {RADAR_EXPERIMENTAL_OBSERVATION_NOTE}.
          </p>
        </div>
        {!compact && (
          <RadarEvidenceStateBlock
            state={inferredWindowStations > 0 ? "partial" : "published"}
            title={inferredWindowStations > 0 ? "Prova parcial" : "Prova publicada"}
            description={
              inferredWindowStations > 0
                ? "A rodada já tem rastreabilidade metodológica pública, mas ainda depende parcialmente de inferência operacional em parte da malha."
                : "A rodada já tem rastreabilidade operacional explícita para a malha publicada nesta carga."
            }
          />
        )}
      </div>
    </div>
  );
}
