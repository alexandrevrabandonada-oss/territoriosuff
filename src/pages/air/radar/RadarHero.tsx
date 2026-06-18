import { IconShell, SurfaceCard } from "../../../components/BrandSystem";
import { ATTENTION_EPISODES } from "../../../data/air/attention-episodes-2020-2026";
import { PARTICULATE_TIMELINE } from "../../../data/air/particulate-timeline-2020-2026";
import { AIR_PUBLIC_DOWNLOADS } from "../../../data/air/public-downloads";
import { RADAR_PUBLIC_EXPERIMENTAL_TAG } from "../../../data/air/radar-copy";
import { useRadarReleaseMetadata } from "../../../data/air/useRadarReleaseMetadata";
import { RadarEvidenceStateBlock } from "./RadarEvidenceStateBlock";
import type { SummaryStats } from "./RadarTypes";
import type { RadarComparisonTab, RadarMode } from "./RadarTypes";

interface RadarHeroProps {
  onNavigate: (mode: RadarMode, tab?: RadarComparisonTab) => void;
  summary: SummaryStats;
  activeStations: number;
}

function buildHistoricalAudit() {
  const rows = PARTICULATE_TIMELINE.filter((row) => row.coveragePct > 0);
  const years = Array.from(new Set(rows.map((row) => row.year))).sort((a, b) => a - b);
  const stations = Array.from(new Set(rows.map((row) => row.station_name))).sort((a, b) => a.localeCompare(b, "pt-BR"));
  const pollutants = Array.from(new Set(rows.map((row) => row.pollutant))).sort();
  const highCoverageRows = rows.filter((row) => row.coveragePct >= 75).length;
  const mediumCoverageRows = rows.filter((row) => row.coveragePct >= 50 && row.coveragePct < 75).length;
  const lowCoverageRows = rows.filter((row) => row.coveragePct < 50).length;
  const monthsWithAttention = ATTENTION_EPISODES.filter((episode) => episode.who_exceedance_days > 0 || episode.conama_exceedance_days > 0).length;
  const downloadableFiles = AIR_PUBLIC_DOWNLOADS.filter((item) => item.file.endsWith(".csv")).length;
  const auditedLayers = [
    rows.length > 0,
    ATTENTION_EPISODES.length > 0,
    AIR_PUBLIC_DOWNLOADS.length > 0,
    stations.length > 0,
    pollutants.length > 0,
    highCoverageRows > 0
  ].filter(Boolean).length;

  return {
    stationsCount: stations.length,
    stationNames: stations,
    pollutantsLabel: pollutants.join(" e "),
    startYear: years[0] ?? 2020,
    endYear: years[years.length - 1] ?? 2026,
    totalRows: rows.length,
    highCoverageRows,
    mediumCoverageRows,
    lowCoverageRows,
    monthsWithAttention,
    downloadableFiles,
    auditedLayers,
    totalLayers: 6
  };
}

const historicalAudit = buildHistoricalAudit();

function formatYearRange(summary: SummaryStats) {
  const startYear = summary.timeRange.minDate ? summary.timeRange.minDate.slice(0, 4) : null;
  const endYear = summary.timeRange.maxDate ? summary.timeRange.maxDate.slice(0, 4) : null;

  if (startYear && endYear) return `${startYear}–${endYear}`;
  if (startYear) return `${startYear}–...`;
  return `${historicalAudit.startYear}–${historicalAudit.endYear} parcial`;
}

function formatLatestBase(summary: SummaryStats) {
  if (!summary.latest_ingested_at) return "base histórica auditada";
  const parsed = new Date(summary.latest_ingested_at);
  if (Number.isNaN(parsed.getTime())) return "base histórica auditada";
  return `base atualizada em ${parsed.toLocaleDateString("pt-BR")}`;
}

export function RadarHero({ onNavigate, summary, activeStations }: RadarHeroProps) {
  const releaseMetadata = useRadarReleaseMetadata();
  const yearRange = formatYearRange(summary);
  const freshnessLabel = formatLatestBase(summary);
  const stationCount = summary.totalStations || activeStations || historicalAudit.stationsCount;
  const auditedLayerLabel = `${historicalAudit.auditedLayers}/${historicalAudit.totalLayers}`;
  const strongCoverageLabel = `${historicalAudit.highCoverageRows}/${historicalAudit.totalRows}`;

  return (
    <SurfaceCard className="relative overflow-hidden rounded-[2.75rem] border border-[#10344f] bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.22),transparent_28%),radial-gradient(circle_at_88%_16%,rgba(245,158,11,0.18),transparent_22%),linear-gradient(135deg,#041521_0%,#082031_22%,#0c2f46_58%,#041521_100%)] p-0 shadow-[0_28px_80px_-24px_rgba(4,21,33,0.72)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff07_1px,transparent_1px)] bg-[size:22px_22px]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[36%] bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.22),transparent_70%)] blur-2xl" />

      <div className="relative z-10 flex flex-col justify-between gap-5 p-5 md:p-6 lg:flex-row lg:items-stretch lg:p-8">
        <div className="relative flex max-w-3xl flex-1 flex-col justify-between gap-6 rounded-[2.15rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 text-white backdrop-blur-xl md:p-7">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#f59e0b]/35 bg-[#f59e0b]/12 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#fbbf24] shadow-[0_10px_30px_-18px_rgba(245,158,11,0.8)]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#f59e0b]" />
            {RADAR_PUBLIC_EXPERIMENTAL_TAG}
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="rounded-full border border-white/14 bg-white/[0.06] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-100">
              ciclo {releaseMetadata.cycleVersion}
            </div>
            <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-200">
              metodologia {releaseMetadata.methodologyVersion}
            </div>
            {releaseMetadata.datasetVersion && (
              <div className="rounded-full border border-sky-300/20 bg-sky-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-sky-100">
                dataset {releaseMetadata.datasetVersion}
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
            <div className="rounded-[1.6rem] border border-emerald-400/20 bg-emerald-400/10 p-1.5 shadow-[0_20px_40px_-26px_rgba(16,185,129,1)]">
              <IconShell tone="lab" className="portal-stage-icon border-0 bg-transparent shadow-none">
                <svg className="h-6 w-6 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </IconShell>
            </div>
            <div className="min-w-0 space-y-3">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300/80">Justiça ambiental em dados públicos</div>
              <h1 className="max-w-full text-[2rem] font-black leading-[0.92] tracking-[-0.035em] text-white min-[390px]:text-[2.35rem] sm:text-5xl md:text-6xl">
                <span className="block">Observatório</span>
                <span className="block">do Ar</span>
                <span className="mt-2 block text-emerald-300">Volta Redonda</span>
              </h1>
            </div>
          </div>

          <p className="max-w-2xl text-sm font-semibold leading-relaxed text-slate-200 md:text-base">
            Explore dados públicos de qualidade do ar, meteorologia, território e exposição social com metodologia aberta e foco em justiça ambiental.
          </p>

          <p className="max-w-2xl text-[11px] font-semibold leading-relaxed text-slate-300">
            Este release público está publicado como <span className="font-black text-white">{releaseMetadata.cycleVersion}</span>. A auditoria histórica já consolidou
            {` ${historicalAudit.stationsCount} estações, ${historicalAudit.pollutantsLabel || "MP10 e MP2.5"} e ${historicalAudit.downloadableFiles} arquivos CSV públicos`}; os blocos de tempo real não são pré-condição para ler a série histórica.
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 shadow-[0_18px_40px_-30px_rgba(15,23,42,1)]">
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Estações</div>
              <div className="mt-3 text-3xl font-black text-white">{stationCount}</div>
              <div className="mt-1 text-[11px] font-semibold text-slate-300">estações com série histórica consolidada</div>
              </div>
              <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.07] p-4 shadow-[0_18px_40px_-30px_rgba(16,185,129,0.8)]">
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-200/80">Série histórica</div>
              <div className="mt-3 text-3xl font-black text-white">{yearRange}</div>
              <div className="mt-1 text-[11px] font-semibold text-emerald-50/85">janela pública efetivamente consolidada</div>
              </div>
              <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.08] p-4 shadow-[0_18px_40px_-30px_rgba(245,158,11,0.8)]">
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-200/85">Auditoria histórica</div>
              <div className="mt-3 text-3xl font-black text-white">{auditedLayerLabel}</div>
              <div className="mt-1 text-[11px] font-semibold text-amber-50/90">camadas consolidadas verificadas</div>
              </div>
            </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              onClick={() => onNavigate("MAP")}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-2xl bg-emerald-500 px-5 py-3 text-xs font-black text-slate-950 shadow-[0_16px_40px_-20px_rgba(16,185,129,0.95)] transition-all hover:scale-[1.02] hover:bg-emerald-400"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Explorar mapa
            </button>

            <button
              onClick={() => onNavigate("TIME", "TREND")}
              className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-2xl border border-white/12 bg-white/[0.07] px-4 py-3 text-xs font-bold text-slate-100 transition-colors hover:bg-white/[0.12]"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ver por ano / histórico
            </button>

            <button
              onClick={() => onNavigate("TERRITORY")}
              className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-2xl border border-white/12 bg-white/[0.07] px-4 py-3 text-xs font-bold text-slate-100 transition-colors hover:bg-white/[0.12]"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Quem respira esse ar?
            </button>

            <button
              onClick={() => onNavigate("METHODOLOGY")}
              className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-2xl border border-white/12 bg-white/[0.07] px-4 py-3 text-xs font-bold text-slate-100 transition-colors hover:bg-white/[0.12]"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Metodologia
            </button>
          </div>
        </div>

        <div className="flex w-full flex-col justify-between gap-4 lg:max-w-[21rem] lg:pt-1">
          <div className="rounded-[2rem] border border-emerald-500/20 bg-[linear-gradient(180deg,rgba(4,21,33,0.32),rgba(4,21,33,0.72))] p-5 shadow-[0_26px_50px_-34px_rgba(0,0,0,1)] backdrop-blur-sm">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-300">Painel de situação</div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                <span className="block text-3xl font-black text-white">{stationCount}</span>
                <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">estações</span>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                <span className="block text-2xl font-black text-white">{yearRange}</span>
                <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">série pública</span>
              </div>
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.09] p-4">
                <span className="block text-3xl font-black text-emerald-300">{strongCoverageLabel}</span>
                <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-emerald-100/80">cobertura forte</span>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                <span className="block text-xl font-black text-white">{freshnessLabel}</span>
                <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">status auditado</span>
              </div>
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.05] p-4 text-slate-200 shadow-[0_20px_40px_-32px_rgba(15,23,42,1)] backdrop-blur-sm">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300/85">Leitura recomendada</div>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-100">
              Comece pela síntese histórica, avance para a linha do tempo e feche com os territórios prioritários.
            </p>
            <div className="mt-3 text-[11px] font-semibold text-slate-300">
              Auditoria atual: {historicalAudit.highCoverageRows} linhas com cobertura forte, {historicalAudit.mediumCoverageRows} intermediárias e {historicalAudit.lowCoverageRows} cautelares. Lacunas permanecem visíveis.
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.05] p-4 backdrop-blur-sm">
            <RadarEvidenceStateBlock
              state="partial"
              description={
                "O hero agora expõe a auditoria dos dados históricos consolidados. A leitura forte ainda depende de mapa, séries, cobertura e metodologia, mas não fica bloqueada por ausência de API ou ingestão recente."
              }
            />
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}
