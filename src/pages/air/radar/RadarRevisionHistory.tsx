import { useMemo } from "react";
import { Link } from "react-router-dom";
import { getAirPublicDataPath } from "../../../data/air/public-downloads";
import { RADAR_RELEASE_METADATA_FILE } from "../../../data/air/radar-release-metadata";
import { RADAR_REVISION_HISTORY, RADAR_REVISION_HISTORY_FILE } from "../../../data/air/radar-revision-history";
import { useRadarReleaseMetadata } from "../../../data/air/useRadarReleaseMetadata";
import { getEvidenceStateLabel, RadarEvidenceStateBlock } from "./RadarEvidenceStateBlock";
import type { StationMetadataItem } from "./RadarTypes";

interface RadarRevisionHistoryProps {
  stationMetadata: StationMetadataItem[];
}

function getStatusTone(status: "published" | "active" | "archived") {
  switch (status) {
    case "published":
      return {
        badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
        card: "border-emerald-200 bg-emerald-50/70"
      };
    case "active":
      return {
        badge: "border-sky-200 bg-sky-50 text-sky-800",
        card: "border-sky-200 bg-sky-50/70"
      };
    default:
      return {
        badge: "border-slate-200 bg-slate-100 text-slate-700",
        card: "border-slate-200 bg-slate-50/80"
      };
  }
}

export function RadarRevisionHistory({ stationMetadata }: RadarRevisionHistoryProps) {
  const releaseMetadata = useRadarReleaseMetadata();
  const methodologyVersion = releaseMetadata.methodologyVersion || stationMetadata[0]?.provenance.methodology_version || "2026-06-16";

  const revisionEntries = useMemo(() => {
    const [currentEntry, ...remainingEntries] = RADAR_REVISION_HISTORY;
    const runtimeCurrentEntry = {
      ...currentEntry,
      cycle: releaseMetadata.cycleVersion,
      status: releaseMetadata.releaseStatus,
      scope: releaseMetadata.releaseScope,
      changes: releaseMetadata.releaseHighlights
    };

    return [runtimeCurrentEntry, ...remainingEntries.map((entry) => (entry.cycle === "próximo ciclo" ? { ...entry, referenceDate: releaseMetadata.plannedReviewDate } : entry))];
  }, [releaseMetadata]);

  return (
    <section className="space-y-5 rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f8fafc)] p-5 shadow-[0_20px_45px_-34px_rgba(15,23,42,0.35)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Histórico público de revisão</div>
          <h3 className="text-lg font-black tracking-tight text-slate-900">O que mudou no Radar, em qual ciclo e com qual evidência publicada</h3>
          <p className="max-w-3xl text-[11px] font-semibold leading-relaxed text-slate-600">
            Transparência de referência mundial também exige versionar o próprio observatório. Este quadro registra releases, mudanças metodológicas e o impacto público de cada rodada.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-700">
            ciclo atual {releaseMetadata.cycleVersion}
          </div>
          <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-800">
            metodologia {methodologyVersion}
          </div>
          {releaseMetadata.datasetVersion && (
            <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-700">
              dataset {releaseMetadata.datasetVersion}
            </div>
          )}
          <a
            href={getAirPublicDataPath(RADAR_REVISION_HISTORY_FILE)}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-sky-800 transition-colors hover:border-sky-300"
          >
            baixar changelog json
          </a>
          <a
            href={getAirPublicDataPath(RADAR_RELEASE_METADATA_FILE)}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-800 transition-colors hover:border-emerald-300"
          >
            baixar release json
          </a>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {revisionEntries.map((entry) => {
          const tone = getStatusTone(entry.status);
          return (
            <article key={entry.cycle} className={`rounded-[1.6rem] border p-5 ${tone.card}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Ciclo</div>
                  <div className="mt-1 text-sm font-black text-slate-900">{entry.cycle}</div>
                </div>
                <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] ${tone.badge}`}>
                  {entry.status === "published" ? "publicado" : entry.status === "active" ? "em revisão" : "arquivo"}
                </span>
              </div>

              <div className="mt-3 space-y-3">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Data de referência</div>
                  <p className="mt-1 text-[11px] font-semibold text-slate-700">{entry.referenceDate}</p>
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Escopo da revisão</div>
                  <p className="mt-1 text-[11px] font-semibold leading-relaxed text-slate-700">{entry.scope}</p>
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Mudanças registradas</div>
                  <div className="mt-2 space-y-2">
                    {entry.changes.map((change) => (
                      <div key={change} className="rounded-xl border border-white/80 bg-white/80 px-3 py-2 text-[10px] font-semibold leading-relaxed text-slate-700">
                        {change}
                      </div>
                    ))}
                  </div>
                </div>

                <RadarEvidenceStateBlock
                  state={entry.evidenceState}
                  title={getEvidenceStateLabel(entry.evidenceState)}
                  description={entry.publicImpact}
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {entry.proofs.map((proof) =>
                  proof.external ? (
                    <a
                      key={`${entry.cycle}-${proof.label}`}
                      href={proof.href}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-white/80 bg-white/90 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-700 transition-colors hover:border-slate-300 hover:bg-white"
                    >
                      {proof.label}
                    </a>
                  ) : (
                    <Link
                      key={`${entry.cycle}-${proof.label}`}
                      to={proof.href}
                      className="rounded-full border border-white/80 bg-white/90 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-700 transition-colors hover:border-slate-300 hover:bg-white"
                    >
                      {proof.label}
                    </Link>
                  )
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
