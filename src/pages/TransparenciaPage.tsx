import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { SkeletonCard } from "../components/SkeletonCard";
import { SurfaceCard } from "../components/BrandSystem";
import { PortalHero, PortalPageShell, PortalSectionHeader } from "../components/portal";
import {
  listConversations,
  listLiveTransparencyReports,
  type Conversation,
  type LiveTransparencyCountItem,
  type LiveTransparencyMonthlyReport
} from "../lib/api";
import { LIVE_TRANSPARENCIA_REPORTS } from "../content/transparencyLive";

const FEC_TRANSPARENCIA_URL = "https://conveniar.somosfec.org.br/PortalTransparencia/Default.aspx?txtNomeProjeto=&txtNomePessoaResponsavel=Carlos+Eduardo&txtNomePessoaFinanciador=&txtDataAssinatura=2025&ddlCodStatusConvenio=10&ddlFiltroTipoProjeto=0&ddlFiltroCategoriaProjeto=0&ddlFiltroInstrumentoJuridico=0&ddlFiltroEmendaParlamentar=Sim&pagina=projetos#projetos";

const TransparencyTerritoryMap = lazy(() =>
  import("../components/maps/TransparencyTerritoryMap").then((module) => ({
    default: module.TransparencyTerritoryMap
  }))
);

const TERRITORY_COORDINATES: Record<string, [number, number]> = {
  aterrado: [-22.5268, -44.1024],
  "agua limpa": [-22.4986, -44.0872],
  conforto: [-22.5158, -44.0912],
  "dom bosco": [-22.5038, -44.1114],
  eucaliptal: [-22.512, -44.1188],
  minerlandia: [-22.5077, -44.1312],
  retiro: [-22.5025, -44.1219],
  "santa cruz": [-22.4888, -44.1085],
  "santo agostinho": [-22.5141, -44.0818],
  sessenta: [-22.5215, -44.0959],
  "vila rica": [-22.5008, -44.0996],
  "vila santa cecilia": [-22.5204, -44.0954],
  zoologico: [-22.5186, -44.1077]
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function isActivity(item: Conversation) {
  return item.meta?.kind === "activity";
}

function formatDateLabel(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value);
}

function formatShortMonth(value: string) {
  const parts = value.split("-");
  if (parts.length !== 2) return value;
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
  return date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
}

function formatPublishedPeriod(reports: LiveTransparencyMonthlyReport[]) {
  if (reports.length === 0) return "Sem fechamento";
  if (reports.length === 1) return reports[0].month_label;

  const sorted = [...reports].sort((a, b) => a.month_key.localeCompare(b.month_key));
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const firstYear = first.month_label.match(/\d{4}/)?.[0];
  const lastYear = last.month_label.match(/\d{4}/)?.[0];
  const firstMonth = first.month_label.replace(/\s+de\s+\d{4}$/i, "");

  if (firstYear && firstYear === lastYear) {
    return `${firstMonth} e ${last.month_label}`;
  }

  return `${first.month_label} a ${last.month_label}`;
}

function mergeMonthlyReports(
  primaryReports: LiveTransparencyMonthlyReport[],
  fallbackReports: LiveTransparencyMonthlyReport[]
) {
  const byMonth = new Map<string, LiveTransparencyMonthlyReport>();

  fallbackReports.forEach((report) => {
    byMonth.set(report.month_key, report);
  });

  primaryReports.forEach((report) => {
    byMonth.set(report.month_key, report);
  });

  return Array.from(byMonth.values()).sort((a, b) => b.month_key.localeCompare(a.month_key));
}

function getLocationLabel(item: Conversation) {
  return typeof item.meta?.location === "string" ? item.meta.location.trim() : "";
}

function getActivityDate(item: Conversation) {
  if (typeof item.meta?.activity_date === "string" && item.meta.activity_date.trim()) {
    return item.meta.activity_date;
  }
  return item.created_at;
}

type TerritoryCount = {
  name: string;
  count: number;
  coordinates: [number, number] | null;
};

function getTerritoryCoordinates(name: string): [number, number] | null {
  const normalized = normalizeText(name);
  return TERRITORY_COORDINATES[normalized] || null;
}

function getCoverageTone(status: LiveTransparencyMonthlyReport["territorial_status"]) {
  if (status === "adequada") {
    return {
      bar: "bg-emerald-500",
      chip: "border-emerald-200 bg-emerald-50 text-emerald-800",
      label: "Cobertura adequada"
    };
  }
  if (status === "atencao") {
    return {
      bar: "bg-amber-500",
      chip: "border-amber-200 bg-amber-50 text-amber-800",
      label: "Cobertura em atenção"
    };
  }
  return {
    bar: "bg-rose-500",
    chip: "border-rose-200 bg-rose-50 text-rose-800",
    label: "Cobertura crítica"
  };
}

function mergeTerritoryCount(
  map: Map<string, { label: string; count: number }>,
  territoryName: string
) {
  const label = territoryName.trim();
  if (!label) return;

  const key = normalizeText(label);
  const current = map.get(key);
  map.set(key, {
    label: current?.label ?? label,
    count: (current?.count ?? 0) + 1
  });
}

function MetricCard({
  label,
  value,
  helper,
  tone = "default"
}: {
  label: string;
  value: string | number;
  helper: string;
  tone?: "default" | "green" | "blue" | "amber";
}) {
  const toneClass =
    tone === "green"
      ? "border-emerald-200 bg-emerald-50/80"
      : tone === "blue"
        ? "border-cyan-200 bg-cyan-50/80"
        : tone === "amber"
          ? "border-amber-200 bg-amber-50/80"
          : "border-slate-200 bg-white";

  return (
    <div className={`rounded-[1.5rem] border p-5 shadow-sm ${toneClass}`}>
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">{helper}</p>
    </div>
  );
}

function MonthlyVolumeChart({
  reports
}: {
  reports: LiveTransparencyMonthlyReport[];
}) {
  const reversed = [...reports].reverse();
  const maxValue = Math.max(
    1,
    ...reversed.flatMap((report) => [report.hearings_count, report.actions_count * 10])
  );

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Volume mensal</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Escutas e ações ao longo dos meses</h3>
        </div>
        <div className="flex flex-wrap gap-3 text-[11px] font-black uppercase tracking-widest text-slate-500">
          <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-emerald-500" /> Escutas</span>
          <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-slate-900" /> Ações x10</span>
        </div>
      </div>
      <div className="grid min-h-[280px] grid-cols-2 gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-4 xl:grid-cols-6">
        {reversed.map((report) => {
          const hearingHeight = `${Math.max(14, (report.hearings_count / maxValue) * 190)}px`;
          const actionHeight = `${Math.max(14, ((report.actions_count * 10) / maxValue) * 190)}px`;

          return (
            <div key={report.id} className="flex min-h-[220px] flex-col justify-end rounded-[1.25rem] border border-slate-100 bg-slate-50/80 p-3">
              <div className="flex items-end justify-center gap-2">
                <div className="flex w-10 flex-col items-center">
                  <div className="mb-2 text-[11px] font-black text-slate-500">{report.hearings_count}</div>
                  <div className="w-full rounded-t-xl bg-emerald-500" style={{ height: hearingHeight }} />
                </div>
                <div className="flex w-10 flex-col items-center">
                  <div className="mb-2 text-[11px] font-black text-slate-500">{report.actions_count}</div>
                  <div className="w-full rounded-t-xl bg-slate-900" style={{ height: actionHeight }} />
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{formatShortMonth(report.month_key)}</p>
                <p className="mt-2 text-xs font-semibold text-slate-600">
                  {report.territorial_status === "critica"
                    ? "Cobertura crítica"
                    : report.territorial_status === "adequada"
                      ? "Cobertura adequada"
                      : "Cobertura parcial"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CoverageMeter({
  report,
  coverageDelta
}: {
  report: LiveTransparencyMonthlyReport;
  coverageDelta: number | null;
}) {
  const tone = getCoverageTone(report.territorial_status);
  const clampedValue = Math.max(0, Math.min(100, report.territorial_coverage_pct));
  const deltaLabel =
    coverageDelta === null
      ? "Sem base comparativa anterior."
      : coverageDelta === 0
        ? "Cobertura estável em relação ao mês anterior."
        : `${coverageDelta > 0 ? "+" : ""}${formatPercent(coverageDelta)} p.p. frente ao mês anterior.`;

  return (
    <SurfaceCard className="overflow-hidden border-0 bg-slate-950 p-6 text-white shadow-none md:p-7">
      <PortalSectionHeader
        eyebrow="Qualidade da leitura"
        title="Quanto desse ciclo já virou leitura territorial utilizável"
        subtitle="Cobertura territorial não mede participação total. Mede quanto do material publicado já permite localizar a escuta com utilidade pública."
      />
      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_220px]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className={`rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wide ${tone.chip}`}>
              {tone.label}
            </span>
            <span className="text-sm font-semibold text-white/65">{deltaLabel}</span>
          </div>
          <div className="mt-5 h-5 overflow-hidden rounded-full bg-white/10">
            <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${clampedValue}%` }} />
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 text-xs font-semibold text-white/55">
            <span>0%</span>
            <span>território ainda ausente</span>
            <span>100%</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-white/72">{report.methodological_alert}</p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 text-white">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">Cobertura atual</p>
          <p className="mt-3 text-4xl font-black tracking-tight">{formatPercent(report.territorial_coverage_pct)}%</p>
          <p className="mt-3 text-sm leading-relaxed text-white/75">
            Percentual do fechamento mensal que já tem base territorial suficiente para leitura por bairro ou território.
          </p>
        </div>
      </div>
    </SurfaceCard>
  );
}

function HorizontalCountList({
  title,
  subtitle,
  items,
  colorClass
}: {
  title: string;
  subtitle: string;
  items: LiveTransparencyCountItem[];
  colorClass: string;
}) {
  const max = Math.max(1, ...items.map((item) => item.count));

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{subtitle}</p>
      <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{title}</h3>
      <div className="mt-5 space-y-3">
        {items.length === 0 ? (
          <div className="rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm leading-relaxed text-slate-600">
            Este fechamento ainda não trouxe contagens consolidadas para este bloco. O painel continua mostrando interpretação territorial, escutas recentes e encaminhamentos públicos.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                <span className="text-sm font-black text-slate-950">{item.count}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${(item.count / max) * 100}%` }} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function TerritoryMap({
  territories
}: {
  territories: TerritoryCount[];
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [shouldLoadMap, setShouldLoadMap] = useState(false);
  const mapped = territories.filter(
    (item): item is TerritoryCount & { coordinates: [number, number] } => Boolean(item.coordinates)
  );

  useEffect(() => {
    if (mapped.length === 0 || shouldLoadMap) return;
    if (!("IntersectionObserver" in window)) {
      setShouldLoadMap(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setShouldLoadMap(true);
        observer.disconnect();
      },
      { rootMargin: "320px 0px" }
    );

    if (mapContainerRef.current) observer.observe(mapContainerRef.current);
    return () => observer.disconnect();
  }, [mapped.length, shouldLoadMap]);

  if (mapped.length === 0) {
    return (
      <EmptyState
        title="Sem territórios mapeáveis ainda"
        description="Assim que as escutas publicadas vierem com bairro ou localização, o mapa passa a mostrar o espalhamento territorial."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Mapa aproximado</p>
        <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Onde as escutas e atividades têm acontecido</h3>
        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
          Posicionamento aproximado por bairro ou território quando essa informação aparece nas publicações do portal.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-[11px] font-black uppercase tracking-wide text-slate-500">
          <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-emerald-500" /> Mais registros, maior círculo</span>
          <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full border-2 border-slate-900 bg-emerald-500/60" /> Posição aproximada por território</span>
        </div>
      </div>
      <div ref={mapContainerRef} className="h-[420px]">
        {shouldLoadMap ? (
          <Suspense fallback={<SkeletonCard className="h-full rounded-none border-0 shadow-none" />}>
            <TransparencyTerritoryMap territories={mapped} />
          </Suspense>
        ) : (
          <div className="flex h-full items-center justify-center bg-slate-50 px-6 text-center text-sm font-semibold text-slate-600" role="status">
            O mapa interativo será carregado ao se aproximar desta seção.
          </div>
        )}
      </div>
    </div>
  );
}

function MonthlyPulsePanel({
  latest,
  hearingsDelta,
  actionsDelta
}: {
  latest: LiveTransparencyMonthlyReport;
  hearingsDelta: number | null;
  actionsDelta: number | null;
}) {
  const dominantTheme = latest.dominant_themes[0] ?? "Sem eixo dominante";
  const firstPriority = latest.grouped_priorities[0];
  const firstSignal = latest.qualitative_signals[0];

  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))]">
      <div className="rounded-[1.75rem] border-0 bg-slate-950 p-6 text-white shadow-none">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-300">Mês mais recente</p>
        <p className="mt-3 text-4xl font-black tracking-tight">{latest.month_label}</p>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-white/72">Fechamento mais recente dentro da série de devolutivas mensais já publicadas.</p>
      </div>
      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Escutas consolidadas no mês</p>
        <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{latest.hearings_count}</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {hearingsDelta === null ? "Sem comparação com mês anterior." : `${hearingsDelta > 0 ? "+" : ""}${hearingsDelta} em relação ao fechamento anterior.`}
        </p>
      </div>
      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Foco dominante</p>
        <p className="mt-3 text-2xl font-black tracking-tight text-slate-950">{dominantTheme}</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {firstPriority ? `${firstPriority.label} apareceu ${firstPriority.count} vez(es) entre as prioridades agrupadas.` : "O fechamento ainda não consolidou prioridades quantitativas."}
        </p>
      </div>
      <div className="rounded-[1.5rem] border border-emerald-900/40 bg-emerald-950 p-5 text-white shadow-sm">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-300">Sinal de interpretação</p>
        <p className="mt-3 text-2xl font-black tracking-tight">{firstSignal?.label ?? "Sem sinal consolidado"}</p>
        <p className="mt-2 text-sm leading-relaxed text-white/72">
          {actionsDelta === null
            ? `${latest.actions_count} ação(ões) registradas neste fechamento.`
            : `${latest.actions_count} ação(ões) no mês, com variação de ${actionsDelta > 0 ? "+" : ""}${actionsDelta} frente ao ciclo anterior.`}
        </p>
      </div>
    </section>
  );
}

function ActionsTimeline({
  actions
}: {
  actions: string[];
}) {
  return (
    <SurfaceCard className="p-6 md:p-7">
      <PortalSectionHeader
        eyebrow="Linha de campo"
        title="Ações que sustentam o fechamento"
        subtitle="Uma linha do tempo simples para ligar escuta, presença territorial e devolutiva."
      />
      <div className="mt-5 grid gap-3">
        {actions.length === 0 ? (
          <EmptyState
            title="Sem ações detalhadas neste fechamento"
            description="Quando o mês consolidado trouxer agenda de campo detalhada, esta linha do tempo aparece aqui."
          />
        ) : (
          actions.map((action, index) => (
            <div key={`${index}-${action}`} className="grid gap-3 rounded-[1.25rem] border border-slate-100 bg-slate-50/80 p-4 md:grid-cols-[44px_minmax(0,1fr)] md:items-start">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-sm font-black text-white">
                {index + 1}
              </span>
              <p className="text-sm font-medium leading-relaxed text-slate-700">{action}</p>
            </div>
          ))
        )}
      </div>
    </SurfaceCard>
  );
}

function ListeningJourneyStrip({
  totalItems,
  locatedItems,
  narrativeItems,
  nextSteps
}: {
  totalItems: number;
  locatedItems: number;
  narrativeItems: number;
  nextSteps: number;
}) {
  const stages = [
    {
      label: "1. Registro público",
      value: totalItems,
      helper: "escutas e atividades já publicadas"
    },
    {
      label: "2. Com território",
      value: locatedItems,
      helper: "itens que já permitem leitura territorial"
    },
    {
      label: "3. Com narrativa",
      value: narrativeItems,
      helper: "publicações com devolutiva ou texto de contexto"
    },
    {
      label: "4. Próximo passo",
      value: nextSteps,
      helper: "encaminhamentos públicos do fechamento atual"
    }
  ];

  return (
    <SurfaceCard className="border-slate-200 bg-gradient-to-br from-white via-slate-50 to-emerald-50/70 p-6 md:p-7">
      <PortalSectionHeader
        eyebrow="Percurso da transparência"
        title="Como uma escuta vira devolutiva pública"
        subtitle="A ideia desta página é mostrar a travessia completa: publicar, localizar, interpretar e devolver um próximo passo."
      />
      <div className="mt-5 grid gap-4 xl:grid-cols-4">
        {stages.map((stage, index) => (
          <div key={stage.label} className="relative rounded-[1.5rem] border border-white/80 bg-white/90 p-5 shadow-sm backdrop-blur">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-xs font-black text-white">
              {index + 1}
            </span>
            <p className="mt-4 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{stage.label}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{stage.value}</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{stage.helper}</p>
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}

function TerritorySpotlight({
  territories,
  latest
}: {
  territories: TerritoryCount[];
  latest: LiveTransparencyMonthlyReport | null;
}) {
  const featured = territories.slice(0, 3);
  const latestSet = new Set(
    latest ? [...latest.action_territories, ...latest.hearing_territories].map((item) => normalizeText(item)) : []
  );

  return (
    <SurfaceCard className="border-0 bg-slate-950 p-6 text-white shadow-none md:p-7">
      <PortalSectionHeader
        eyebrow="Territórios em foco"
        title="Onde a leitura pública pede mais atenção"
        subtitle="Este bloco combina recorrência territorial e presença no fechamento mais recente para orientar a leitura de prioridade."
      />
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {featured.length === 0 ? (
          <EmptyState
            title="Sem territórios suficientes para destaque"
            description="Assim que mais registros territoriais forem publicados, esta leitura de foco aparece aqui."
          />
        ) : (
          featured.map((territory, index) => {
            const inLatest = latestSet.has(normalizeText(territory.name));
            return (
              <div key={territory.name} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/55">Prioridade {index + 1}</p>
                    <h3 className="mt-2 text-2xl font-black tracking-tight text-white">{territory.name}</h3>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-800">
                    {territory.count} registros
                  </span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-white/72">
                  {inLatest
                    ? "Este território continua presente no fechamento mensal mais recente e merece leitura cruzada entre escutas, ações e encaminhamentos."
                    : "Este território aparece com frequência histórica nas publicações e merece acompanhamento, mesmo quando não lidera o último fechamento."}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ${inLatest ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}>
                    {inLatest ? "Presente no último fechamento" : "Fora do último fechamento"}
                  </span>
                  {territory.coordinates ? (
                    <span className="rounded-full bg-cyan-100 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-cyan-800">
                      Mapeável
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-amber-800">
                      Sem coordenada aproximada
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </SurfaceCard>
  );
}

function PublishedMonthsStrip({
  reports
}: {
  reports: LiveTransparencyMonthlyReport[];
}) {
  return (
    <SurfaceCard className="border-slate-200 bg-white p-6 md:p-7">
      <PortalSectionHeader
        eyebrow="Fechamentos publicados"
        title="Meses já disponíveis para leitura pública"
        subtitle="O painel trabalha com fechamentos mensais publicados. O mês mais recente ganha destaque, mas os anteriores continuam públicos e comparáveis."
      />
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {reports.map((report) => {
          const tone = getCoverageTone(report.territorial_status);
          return (
            <article key={report.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{report.month_key}</p>
                  <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{report.month_label}</h3>
                </div>
                <span className={`rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wide ${tone.chip}`}>
                  {tone.label}
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.25rem] border border-slate-200 bg-white p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Escutas</p>
                  <p className="mt-2 text-2xl font-black text-slate-950">{report.hearings_count}</p>
                </div>
                <div className="rounded-[1.25rem] border border-slate-200 bg-white p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Ações</p>
                  <p className="mt-2 text-2xl font-black text-slate-950">{report.actions_count}</p>
                </div>
                <div className="rounded-[1.25rem] border border-slate-200 bg-white p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Cobertura</p>
                  <p className="mt-2 text-2xl font-black text-slate-950">{formatPercent(report.territorial_coverage_pct)}%</p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-600">{report.executive_summary}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {report.dominant_themes.slice(0, 4).map((theme) => (
                  <span key={`${report.id}-${theme}`} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-800">
                    {theme}
                  </span>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {report.source_url ? (
                  <a href={report.source_url} target="_blank" rel="noreferrer" className="ui-btn-ghost motion-focus motion-action px-4">
                    Abrir fechamento
                  </a>
                ) : null}
                <Link to="/conversar" className="ui-btn-ghost motion-focus motion-action px-4">
                  Ver publicações relacionadas
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </SurfaceCard>
  );
}

export function TransparenciaPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [monthlyReports, setMonthlyReports] = useState<LiveTransparencyMonthlyReport[]>(LIVE_TRANSPARENCIA_REPORTS);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const [conversationResult, monthlyResult] = await Promise.allSettled([
          listConversations(),
          listLiveTransparencyReports()
        ]);

        if (cancelled) return;

        if (conversationResult.status === "fulfilled") {
          setConversations(conversationResult.value);
        }

        if (monthlyResult.status === "fulfilled") {
          setMonthlyReports(mergeMonthlyReports(monthlyResult.value, LIVE_TRANSPARENCIA_REPORTS));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Falha ao carregar dados.");
        }
      }
    }

    void fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  const liveTransparency = useMemo(() => {
    const activities = conversations.filter(isActivity);
    const hearings = conversations.filter((item) => !isActivity(item));
    const recentCutoff = new Date();
    recentCutoff.setDate(recentCutoff.getDate() - 30);

    const recentItems = conversations.filter((item) => new Date(item.created_at).getTime() >= recentCutoff.getTime());
    const recentActivities = recentItems.filter(isActivity);
    const recentHearings = recentItems.filter((item) => !isActivity(item));
    const withLocation = conversations.filter((item) => Boolean(getLocationLabel(item)));
    const withNarrative = conversations.filter((item) => Boolean(item.excerpt?.trim() || item.body_md?.trim()));

    const territoryCountMap = new Map<string, { label: string; count: number }>();
    withLocation.forEach((item) => {
      mergeTerritoryCount(territoryCountMap, getLocationLabel(item));
    });

    monthlyReports.forEach((report) => {
      report.action_territories.forEach((territory) => {
        mergeTerritoryCount(territoryCountMap, territory);
      });
      report.hearing_territories.forEach((territory) => {
        mergeTerritoryCount(territoryCountMap, territory);
      });
    });

    const territoryCounts = Array.from(territoryCountMap.values())
      .map(({ label, count }) => ({
        name: label,
        count,
        coordinates: getTerritoryCoordinates(label)
      }))
      .sort((a, b) => b.count - a.count);

    return {
      activities,
      hearings,
      recentItems,
      recentActivities,
      recentHearings,
      withLocation,
      withNarrative,
      territoryCounts,
      territoryNames: territoryCounts.map((item) => item.name),
      latestItems: [...conversations]
        .sort((a, b) => new Date(getActivityDate(b)).getTime() - new Date(getActivityDate(a)).getTime())
        .slice(0, 6)
    };
  }, [conversations, monthlyReports]);

  const monthlyTransparency = useMemo(() => {
    const reports = mergeMonthlyReports(monthlyReports, LIVE_TRANSPARENCIA_REPORTS);
    const latest = reports[0] ?? null;
    const previous = reports[1] ?? null;

    return {
      reports,
      latest,
      previous,
      hearingsDelta: latest && previous ? latest.hearings_count - previous.hearings_count : null,
      actionsDelta: latest && previous ? latest.actions_count - previous.actions_count : null,
      coverageDelta: latest && previous ? latest.territorial_coverage_pct - previous.territorial_coverage_pct : null
    };
  }, [monthlyReports]);

  const pedagogicCards = useMemo(() => {
    const locationPct = conversations.length > 0 ? (liveTransparency.withLocation.length / conversations.length) * 100 : 0;
    const narrativePct = conversations.length > 0 ? (liveTransparency.withNarrative.length / conversations.length) * 100 : 0;
    const latest = monthlyTransparency.latest;

    return [
      {
        title: "1. Onde escutamos",
        description: `${liveTransparency.territoryCounts.length} territórios já aparecem nas publicações. ${formatPercent(locationPct)}% dos registros saem com localização explícita.`
      },
      {
        title: "2. O que apareceu",
        description: latest
          ? `${latest.dominant_themes.slice(0, 3).join(", ")} puxam a leitura do fechamento mais recente.`
          : "Os temas recorrentes passam a aparecer aqui à medida que os fechamentos mensais forem publicados."
      },
      {
        title: "3. O que virou encaminhamento",
        description: latest
          ? `${latest.recommended_next_steps.length} encaminhamento(s) já foram registrados. ${formatPercent(narrativePct)}% das publicações trazem devolutiva ou contexto editorial.`
          : "A devolutiva pública aparece quando a equipe consolida a interpretação mensal e publica os próximos passos."
      }
    ];
  }, [conversations.length, liveTransparency.territoryCounts.length, liveTransparency.withLocation.length, liveTransparency.withNarrative.length, monthlyTransparency.latest]);

  const territorialCoverageSummary = useMemo(() => {
    if (monthlyTransparency.latest) {
      return {
        label: "Cobertura territorial",
        value: `${formatPercent(monthlyTransparency.latest.territorial_coverage_pct)}%`,
        helper: "Percentual do fechamento publicado que já sustenta leitura territorial."
      };
    }

    const rawLocationPct = conversations.length > 0 ? (liveTransparency.withLocation.length / conversations.length) * 100 : 0;
    return {
      label: "Localização explícita",
      value: `${formatPercent(rawLocationPct)}%`,
      helper: "Publicações que já trazem território informado no registro bruto."
    };
  }, [conversations.length, liveTransparency.withLocation.length, monthlyTransparency.latest]);

  if (error) {
    return (
      <ErrorState
        description={error}
        action={
          <button onClick={() => window.location.reload()} className="ui-btn-primary motion-focus motion-action px-5">
            Tentar novamente
          </button>
        }
      />
    );
  }

  return (
    <PortalPageShell className="transparency-stage">
      <PortalHero
        badge={<span className="badge-metodologia">Transparência viva</span>}
        title="Escutas, território e devolutiva pública"
        subtitle="Uma leitura pública e pedagógica do que o SEMEAR escutou, onde esteve presente e quais encaminhamentos surgiram das atividades e escutas publicadas."
        tone="lab"
        metrics={
          <>
            <div className="portal-kpi-card portal-kpi-card-lab">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Registros individuais de escuta</p>
              <p className="mt-2 text-3xl font-black text-brand-primary">{liveTransparency.hearings.length}</p>
              <p className="mt-1 text-sm text-text-secondary">publicações classificadas como escuta</p>
            </div>
            <div className="portal-kpi-card">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Atividades de campo</p>
              <p className="mt-2 text-3xl font-black text-success">{liveTransparency.activities.length}</p>
              <p className="mt-1 text-sm text-text-secondary">com memória pública registrada</p>
            </div>
          </>
        }
      />

      <SurfaceCard className="border-0 bg-slate-950 px-6 py-7 text-white shadow-none md:px-8">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Leitura cívica</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
              Transparência aqui significa mostrar o território, não só publicar números
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/78 md:text-base">
              Esta página organiza o ciclo completo das escutas: presença territorial, interpretação do que apareceu, consolidação mensal e próximos passos.
              O objetivo é permitir leitura pública do que foi escutado, onde isso aconteceu e como a equipe está respondendo.
            </p>
          </div>
          <div className="grid gap-3">
            {pedagogicCards.map((card) => (
              <div key={card.title} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-black text-white">{card.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/72">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </SurfaceCard>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Últimos 30 dias"
          value={liveTransparency.recentItems.length}
          helper="Entradas novas no ciclo recente."
          tone="blue"
        />
        <MetricCard
          label="Territórios citados"
          value={liveTransparency.territoryCounts.length}
          helper="Bairros ou territórios já visíveis no portal."
          tone="green"
        />
        <MetricCard
          label={territorialCoverageSummary.label}
          value={territorialCoverageSummary.value}
          helper={territorialCoverageSummary.helper}
          tone="amber"
        />
        <MetricCard
          label="Fechamentos publicados"
          value={formatPublishedPeriod(monthlyTransparency.reports)}
          helper={`${monthlyTransparency.reports.length} devolutiva(s) mensal(is) disponíveis para leitura.`}
          tone="default"
        />
      </section>

      {monthlyTransparency.latest ? (
        <MonthlyPulsePanel
          latest={monthlyTransparency.latest}
          hearingsDelta={monthlyTransparency.hearingsDelta}
          actionsDelta={monthlyTransparency.actionsDelta}
        />
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)]">
        <TerritoryMap territories={liveTransparency.territoryCounts.slice(0, 12)} />

        <div className="grid gap-6">
          <SurfaceCard className="p-6 md:p-7">
            <PortalSectionHeader
              eyebrow="Leitura territorial"
              title="Onde olhar primeiro"
              subtitle="Territórios mais recorrentes nas publicações e no fechamento mais recente."
            />
            <div className="mt-5 space-y-3">
              {liveTransparency.territoryCounts.slice(0, 8).map((territory, index) => (
                <div key={territory.name} className="rounded-[1.25rem] border border-slate-100 bg-slate-50/80 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-black text-white">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-black text-slate-950">{territory.name}</p>
                        <p className="mt-1 text-xs font-medium text-slate-500">Leitura territorial recorrente</p>
                      </div>
                    </div>
                    <span className="text-xl font-black text-emerald-600">{territory.count}</span>
                  </div>
                </div>
              ))}
              {liveTransparency.territoryCounts.length === 0 ? (
                <EmptyState
                  title="Sem territórios publicados ainda"
                  description="Assim que as escutas vierem com bairro ou localização no portal, esta leitura territorial fica disponível."
                />
              ) : null}
            </div>
          </SurfaceCard>

          {monthlyTransparency.latest ? (
            <SurfaceCard className="p-6 md:p-7">
              <PortalSectionHeader
                eyebrow="Interpretação do mês"
                title={`Leitura consolidada de ${monthlyTransparency.latest.month_label}`}
                subtitle="O resumo mensal organiza a leitura executiva, os limites metodológicos e o próximo passo público."
              />
              <div className="mt-5 space-y-4">
                <div className="rounded-[1.25rem] border border-slate-100 bg-slate-50/80 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Leitura executiva</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">{monthlyTransparency.latest.executive_summary}</p>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[1.25rem] border border-amber-200 bg-amber-50/80 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Cautela metodológica</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700">{monthlyTransparency.latest.methodological_alert}</p>
                  </div>
                  <div className="rounded-[1.25rem] border border-emerald-200 bg-emerald-50/80 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Próximo passo</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700">{monthlyTransparency.latest.operational_recommendation}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {monthlyTransparency.latest.dominant_themes.map((theme) => (
                    <span key={theme} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-800">
                      {theme}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  {monthlyTransparency.latest.source_url ? (
                    <a href={monthlyTransparency.latest.source_url} target="_blank" rel="noreferrer" className="ui-btn-ghost motion-focus motion-action px-4">
                      Abrir relatório mensal
                    </a>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500">
                      Relatório mensal sem link público
                    </span>
                  )}
                  <Link to="/conversar" className="ui-btn-ghost motion-focus motion-action px-4">
                    Ver publicações de campo
                  </Link>
                </div>
              </div>
            </SurfaceCard>
          ) : null}
        </div>
      </section>

      {monthlyTransparency.latest ? (
        <CoverageMeter
          report={monthlyTransparency.latest}
          coverageDelta={monthlyTransparency.coverageDelta}
        />
      ) : null}

      <ListeningJourneyStrip
        totalItems={conversations.length}
        locatedItems={liveTransparency.withLocation.length}
        narrativeItems={liveTransparency.withNarrative.length}
        nextSteps={monthlyTransparency.latest?.recommended_next_steps.length ?? 0}
      />

      {monthlyTransparency.reports.length > 0 ? (
        <MonthlyVolumeChart reports={monthlyTransparency.reports.slice(0, 6)} />
      ) : null}

      {monthlyTransparency.reports.length > 0 ? (
        <PublishedMonthsStrip reports={monthlyTransparency.reports} />
      ) : null}

      {monthlyTransparency.latest ? (
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)]">
          <HorizontalCountList
            title="Prioridades mais citadas"
            subtitle="Recorrência quantitativa"
            items={monthlyTransparency.latest.grouped_priorities}
            colorClass="bg-slate-900"
          />
          <HorizontalCountList
            title="Sinais qualitativos"
            subtitle="Leitura interpretativa"
            items={monthlyTransparency.latest.qualitative_signals}
            colorClass="bg-emerald-500"
          />
          <SurfaceCard className="p-6 md:p-7">
            <PortalSectionHeader
              eyebrow="Encaminhamentos"
              title="O que a equipe disse que precisa fazer"
              subtitle="Os próximos passos públicos ajudam a separar escuta, interpretação e resposta institucional."
            />
            <div className="mt-5 grid gap-3">
              {monthlyTransparency.latest.recommended_next_steps.map((step) => (
                <div key={step} className="rounded-[1.25rem] border border-slate-100 bg-slate-50/80 p-4 text-sm font-medium leading-relaxed text-slate-700">
                  {step}
                </div>
              ))}
            </div>
          </SurfaceCard>
        </section>
      ) : null}

      {monthlyTransparency.latest ? (
        <ActionsTimeline actions={monthlyTransparency.latest.actions_performed} />
      ) : null}

      <TerritorySpotlight
        territories={liveTransparency.territoryCounts}
        latest={monthlyTransparency.latest}
      />

      <SurfaceCard className="p-6 md:p-8">
        <PortalSectionHeader
          eyebrow="Fluxo recente"
          title="Escutas e atividades mais recentes"
          subtitle="Publicações em fluxo contínuo antes da consolidação mensal."
        />
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {liveTransparency.latestItems.length === 0 ? (
            <EmptyState
              title="Sem escutas publicadas ainda"
              description="Assim que as atividades e rodas de conversa forem publicadas, esta área passa a refletir o movimento territorial em fluxo contínuo."
            />
          ) : (
            liveTransparency.latestItems.map((item) => {
              const activity = isActivity(item);
              const location = getLocationLabel(item);

              return (
                <article key={item.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ${activity ? "bg-emerald-100 text-emerald-800" : "bg-cyan-100 text-cyan-800"}`}>
                      {activity ? "Atividade" : "Escuta"}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{formatDateLabel(getActivityDate(item))}</span>
                    {location ? <span className="text-xs font-semibold text-slate-500">{location}</span> : null}
                  </div>
                  <h3 className="mt-3 text-xl font-black tracking-tight text-slate-950">{item.title}</h3>
                  {item.excerpt ? <p className="mt-3 text-sm leading-relaxed text-slate-700">{item.excerpt}</p> : null}
                  {!item.excerpt && item.body_md ? <p className="mt-3 line-clamp-5 text-sm leading-relaxed text-slate-700">{item.body_md}</p> : null}
                  <div className="mt-4">
                    <Link to="/conversar" className="inline-flex min-h-11 items-center text-sm font-black text-emerald-700 hover:underline">
                      Ver fluxo completo das publicações
                    </Link>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </SurfaceCard>

      <SurfaceCard className="border-slate-200 bg-slate-50 px-6 py-6 md:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Transparência financeira</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Prestação de contas financeira disponível no portal da FEC</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              A leitura principal desta página está focada em escutas, território e devolutiva pública. A prestação financeira oficial do projeto permanece disponível no Portal da Transparência da FEC.
            </p>
          </div>
          <a href={FEC_TRANSPARENCIA_URL} target="_blank" rel="noreferrer" className="ui-btn-primary motion-focus motion-action px-5">
            Abrir transparência financeira da FEC
          </a>
        </div>
      </SurfaceCard>
    </PortalPageShell>
  );
}
