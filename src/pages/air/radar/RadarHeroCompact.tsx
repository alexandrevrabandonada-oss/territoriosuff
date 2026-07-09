import { SurfaceCard } from "../../../components/BrandSystem";
import { PARTICULATE_TIMELINE } from "../../../data/air/particulate-timeline-2020-2026";
import { RADAR_PUBLIC_EXPERIMENTAL_TAG } from "../../../data/air/radar-copy";
import { useRadarReleaseMetadata } from "../../../data/air/useRadarReleaseMetadata";
import type { RadarComparisonTab, RadarMode, SummaryStats } from "./RadarTypes";

interface RadarHeroCompactProps {
  onNavigate: (mode: RadarMode, tab?: RadarComparisonTab) => void;
  summary: SummaryStats;
  activeStations: number;
}

const historicalRows = PARTICULATE_TIMELINE.filter((row) => row.coveragePct > 0);
const historicalYears = Array.from(new Set(historicalRows.map((row) => row.year))).sort((a, b) => a - b);
const historicalStations = new Set(historicalRows.map((row) => row.station_name));
const strongCoverageRows = historicalRows.filter((row) => row.coveragePct >= 75).length;

function formatYearRange(summary: SummaryStats) {
  const startYear = summary.timeRange.minDate?.slice(0, 4);
  const endYear = summary.timeRange.maxDate?.slice(0, 4);
  if (startYear && endYear) return `${startYear}–${endYear}`;
  return `${historicalYears[0] ?? 2020}–${historicalYears[historicalYears.length - 1] ?? 2026} parcial`;
}

function formatBaseStatus(summary: SummaryStats) {
  if (!summary.latest_ingested_at) return "Base histórica auditada";
  const parsed = new Date(summary.latest_ingested_at);
  return Number.isNaN(parsed.getTime())
    ? "Base histórica auditada"
    : `Atualizada em ${parsed.toLocaleDateString("pt-BR")}`;
}

export function RadarHeroCompact({ onNavigate, summary, activeStations }: RadarHeroCompactProps) {
  const releaseMetadata = useRadarReleaseMetadata();
  const stationCount = summary.totalStations || activeStations || historicalStations.size;
  const coverageLabel = `${strongCoverageRows}/${historicalRows.length}`;

  return (
    <SurfaceCard className="relative overflow-hidden rounded-[2.25rem] border border-[#10344f] bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.22),transparent_30%),radial-gradient(circle_at_88%_16%,rgba(245,158,11,0.14),transparent_24%),linear-gradient(135deg,#041521_0%,#082031_28%,#0c2f46_68%,#041521_100%)] p-0 shadow-[0_28px_80px_-24px_rgba(4,21,33,0.72)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff07_1px,transparent_1px)] bg-[size:22px_22px]" />
      <div className="relative z-10 grid gap-5 p-5 md:grid-cols-[minmax(0,1.15fr)_minmax(17rem,0.85fr)] md:items-center md:p-7 xl:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)] xl:p-8">
        <div className="min-w-0 space-y-5 text-white">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-300/35 bg-amber-300/10 px-3.5 py-2 text-xs font-black uppercase tracking-[0.14em] text-amber-200">
            <i className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-300" />
            {RADAR_PUBLIC_EXPERIMENTAL_TAG}
          </span>

          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300/85">Justiça ambiental em dados públicos</p>
            <h1 className="max-w-3xl text-[2.35rem] font-black leading-[0.94] tracking-[-0.04em] text-white sm:text-5xl xl:text-6xl">
              Observatório do Ar <span className="text-emerald-300">Volta Redonda</span>
            </h1>
          </div>

          <p className="max-w-3xl text-sm font-semibold leading-relaxed text-slate-200 md:text-base">
            Localize estações, compare o histórico e confira cobertura e território com metodologia aberta.
          </p>

          <div className="flex flex-wrap gap-2.5">
            <button type="button" onClick={() => onNavigate("MAP")} className="inline-flex min-h-11 items-center rounded-2xl bg-emerald-400 px-5 py-3 text-xs font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-emerald-300">
              Explorar mapa
            </button>
            <button type="button" onClick={() => onNavigate("TIME", "TREND")} className="inline-flex min-h-11 items-center rounded-2xl border border-white/15 bg-white/[0.08] px-4 py-3 text-xs font-bold text-white transition hover:bg-white/[0.14]">
              Ver histórico
            </button>
            <button type="button" onClick={() => onNavigate("TERRITORY")} className="inline-flex min-h-11 items-center rounded-2xl border border-white/15 bg-white/[0.08] px-4 py-3 text-xs font-bold text-white transition hover:bg-white/[0.14]">
              Ver territórios
            </button>
          </div>
        </div>

        <aside className="grid grid-cols-2 gap-3 rounded-[1.75rem] border border-white/12 bg-white/[0.06] p-4 text-white backdrop-blur-sm" aria-label="Situação da base pública">
          <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
            <strong className="block text-2xl font-black">{stationCount}</strong>
            <span className="mt-1 block text-xs font-bold text-slate-300">Estações auditadas</span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
            <strong className="block text-xl font-black">{formatYearRange(summary)}</strong>
            <span className="mt-1 block text-xs font-bold text-slate-300">Série pública</span>
          </div>
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
            <strong className="block text-2xl font-black text-emerald-300">{coverageLabel}</strong>
            <span className="mt-1 block text-xs font-bold text-emerald-100/85">Cobertura forte</span>
          </div>
          <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.08] p-4">
            <strong className="block text-sm font-black text-amber-100">{formatBaseStatus(summary)}</strong>
            <span className="mt-1 block text-xs font-bold text-amber-50/80">Status dos dados</span>
          </div>
          <p className="col-span-2 border-t border-white/10 pt-3 text-xs font-semibold leading-relaxed text-slate-300">
            Ciclo {releaseMetadata.cycleVersion}. Confirme cobertura e metodologia antes de citar resultados.
          </p>
        </aside>
      </div>
    </SurfaceCard>
  );
}
