import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { SurfaceCard } from "../../components/BrandSystem";
import { usePageMetadata } from "../../hooks/usePageMetadata";
import { supabase } from "../../lib/supabase/client";

const STATIONS = [
  { id: 46560, name: "UFF", neighborhood: "Vila Santa Cecília", detail: "Campus da UFF" },
  { id: 46561, name: "IFRJ", neighborhood: "Nossa Senhora das Graças", detail: "Estação IFRJ" },
  { id: 46562, name: "CRIAAD", neighborhood: "Vila Mury", detail: "Estação CRIAAD" }
] as const;

type PublicMeasurement = {
  station_id: number;
  measured_at: string;
  averaging_period_seconds: number;
  pm25_ug_m3: number | null;
  pm10_ug_m3: number | null;
  temperature_c: number | null;
  relative_humidity_pct: number | null;
  published_at: string | null;
  source_response_sha256: string;
  reviewer_reference: string | null;
  unit_validation_reference: string | null;
  methodology_reference: string | null;
};

type Pollutant = "pm25_ug_m3" | "pm10_ug_m3";
const POLLUTANT_LABELS: Record<Pollutant, string> = {
  pm25_ug_m3: "PM2,5",
  pm10_ug_m3: "PM10"
};
const DAYS = [1, 7, 30] as const;
type Days = typeof DAYS[number];

const DATE_FORMAT = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit"
});
const NUMBER_FORMAT = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
const PAGE_SIZE = 500;
const MAX_PAGES = 10;

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "horário indisponível" : DATE_FORMAT.format(date);
}

function formatNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? NUMBER_FORMAT.format(value) : "—";
}

function buildSegments(points: PublicMeasurement[], pollutant: Pollutant, timeFrom: number, timeTo: number, maxValue: number) {
  const left = 62;
  const top = 24;
  const width = 868;
  const height = 240;
  const paths: string[] = [];
  let current: string[] = [];
  let lastTime: number | null = null;
  for (const point of points) {
    const time = new Date(point.measured_at).getTime();
    const value = point[pollutant];
    if (!Number.isFinite(time) || value === null || !Number.isFinite(value)) {
      if (current.length) paths.push(current.join(" "));
      current = [];
      lastTime = null;
      continue;
    }
    if (lastTime !== null && time - lastTime > 90 * 60_000) {
      if (current.length) paths.push(current.join(" "));
      current = [];
    }
    const x = left + ((time - timeFrom) / Math.max(timeTo - timeFrom, 1)) * width;
    const y = top + (1 - value / Math.max(maxValue, 1)) * height;
    current.push((current.length ? "L" : "M") + x.toFixed(2) + " " + y.toFixed(2));
    lastTime = time;
  }
  if (current.length) paths.push(current.join(" "));
  return paths;
}

function TrendChart({ points, pollutant }: { points: PublicMeasurement[]; pollutant: Pollutant }) {
  const valid = useMemo(
    () => points.filter((point) => {
      const value = point[pollutant];
      return value !== null && Number.isFinite(value) && Number.isFinite(new Date(point.measured_at).getTime());
    }),
    [points, pollutant]
  );
  if (valid.length < 2) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
        <span className="text-3xl" aria-hidden="true">◌</span>
        <p className="max-w-md font-semibold text-slate-800">Ainda não há uma série aprovada para este recorte.</p>
        <p className="max-w-md text-sm text-slate-600">
          A integração já recebe informações da Aurassure, mas a publicação de concentrações depende de revisão técnica, unidades e metodologia verificadas.
        </p>
      </div>
    );
  }
  const minTime = new Date(valid[0].measured_at).getTime();
  const maxTime = new Date(valid[valid.length - 1].measured_at).getTime();
  const maxValue = Math.max(...valid.map((point) => point[pollutant] || 0), 1) * 1.12;
  const segments = buildSegments(valid, pollutant, minTime, maxTime, maxValue);
  const last = valid[valid.length - 1];
  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox="0 0 960 325" className="min-w-[540px] w-full" role="img"
        aria-label={"Série temporal aprovada de " + POLLUTANT_LABELS[pollutant] + " em microgramas por metro cúbico"}>
        <defs>
          <linearGradient id="aurassureTrendStroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#047857" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
          const y = 264 - fraction * 240;
          return (
            <g key={fraction}>
              <line x1="62" x2="930" y1={y} y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray={fraction === 0 ? undefined : "3 7"} />
              <text x="54" y={y + 5} textAnchor="end" fontSize="13" fill="#64748b">{formatNumber(maxValue * fraction)}</text>
            </g>
          );
        })}
        {segments.map((path, index) => (
          <path key={index} d={path} fill="none" stroke="url(#aurassureTrendStroke)"
            strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        ))}
        <text x="62" y="307" fill="#475569" fontSize="14">{formatDate(valid[0].measured_at)}</text>
        <text x="930" y="307" textAnchor="end" fill="#475569" fontSize="14">{formatDate(last.measured_at)}</text>
        <text x="62" y="15" fill="#475569" fontSize="12">µg/m³ · médias do período informado</text>
      </svg>
    </div>
  );
}

async function fetchApproved(stationId: number, days: Days): Promise<PublicMeasurement[]> {
  if (!supabase) throw new Error("Cliente de dados indisponível.");
  const from = new Date(Date.now() - days * 86_400_000).toISOString();
  const result: PublicMeasurement[] = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const start = page * PAGE_SIZE;
    const { data, error } = await supabase
      .from("aurassure_public_measurements")
      .select("station_id,measured_at,averaging_period_seconds,pm25_ug_m3,pm10_ug_m3,temperature_c,relative_humidity_pct,published_at,source_response_sha256,reviewer_reference,unit_validation_reference,methodology_reference")
      .eq("station_id", stationId)
      .eq("averaging_period_seconds", 900)
      .gte("measured_at", from)
      .order("measured_at", { ascending: true })
      .range(start, start + PAGE_SIZE - 1);
    if (error) throw new Error("Não foi possível carregar a série pública revisada.");
    const pageRows = (data || []) as PublicMeasurement[];
    result.push(...pageRows);
    if (pageRows.length < PAGE_SIZE) break;
  }
  return result;
}

export function AurassureUffPage() {
  usePageMetadata({
    title: "Estações UFF e Aurassure | SEMEAR",
    description: "Acompanhe a rede complementar de três estações em Volta Redonda, o estágio de validação e, quando liberadas, as séries revisadas de qualidade do ar."
  });
  const [stationId, setStationId] = useState<number>(46560);
  const [pollutant, setPollutant] = useState<Pollutant>("pm25_ug_m3");
  const [days, setDays] = useState<Days>(1);
  const [rows, setRows] = useState<PublicMeasurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let canceled = false;
    setLoading(true);
    setError(null);
    setRows([]);
    void fetchApproved(stationId, days)
      .then((data) => { if (!canceled) setRows(data); })
      .catch((cause: unknown) => {
        if (!canceled) setError(cause instanceof Error ? cause.message : "Não foi possível consultar a série.");
      })
      .finally(() => { if (!canceled) setLoading(false); });
    return () => { canceled = true; };
  }, [stationId, days, retry]);

  const selectedStation = STATIONS.find((station) => station.id === stationId) || STATIONS[0];
  const latest = rows.length ? rows[rows.length - 1] : undefined;
  const valid = rows.filter((row) => row[pollutant] !== null);
  const peak = valid.length ? Math.max(...valid.map((row) => row[pollutant] || 0)) : null;
  const average = valid.length ? valid.reduce((sum, row) => sum + (row[pollutant] || 0), 0) / valid.length : null;
  const isStale = latest ? (Date.now() - new Date(latest.measured_at).getTime() > 2 * 3600_000) : true;

  function exportCsv() {
    if (!rows.length) return;
    const header = ["estacao","medido_em_utc","periodo_segundos","pm25_ug_m3","pm10_ug_m3","temperatura_c","umidade_pct","publicado_em_utc","sha256_fonte","referencia_revisao","referencia_unidades","referencia_metodologia"];
    const values = rows.map((row) => [
      row.station_id,row.measured_at,row.averaging_period_seconds,row.pm25_ug_m3 ?? "",
      row.pm10_ug_m3 ?? "",row.temperature_c ?? "",row.relative_humidity_pct ?? "",row.published_at ?? "",
      row.source_response_sha256,row.reviewer_reference ?? "",row.unit_validation_reference ?? "",row.methodology_reference ?? ""
    ].join(","));
    const blob = new Blob(["\uFEFF" + [header.join(","), ...values].join("\r\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "semear-uff-aurassure-aprovado-" + stationId + "-" + days + "d.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="portal-stage space-y-8 md:space-y-10">
      <SurfaceCard className="relative overflow-hidden border border-emerald-900 bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 p-7 text-white md:p-10">
        <div className="relative z-10 max-w-4xl space-y-5">
          <p className="text-xs font-black uppercase tracking-[0.23em] text-emerald-200">SEMEAR UFF · REDE COMPLEMENTAR DE MONITORAMENTO</p>
          <h1 className="max-w-3xl text-3xl font-black leading-tight tracking-tight md:text-5xl">
            O ar do território, observado por três estações.
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-emerald-50/90">
            Conexão técnica entre SEMEAR, UFF e a plataforma Aurassure. Dados capturados e auditados por estação, com publicação condicionada à revisão das unidades, do método e da qualidade de cada leitura.
          </p>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full border border-emerald-300/40 bg-white/10 px-3 py-2">Três pontos de observação</span>
            <span className="rounded-full border border-emerald-300/40 bg-white/10 px-3 py-2">Médias a cada 15 min</span>
            <span className="rounded-full border border-amber-200/40 bg-amber-300/10 px-3 py-2 text-amber-100">Publicação sob validação</span>
          </div>
        </div>
      </SurfaceCard>

      <div className="grid gap-4 md:grid-cols-3" role="group" aria-label="Selecionar estação da rede UFF">
        {STATIONS.map((station) => (
          <button key={station.id} type="button" onClick={() => setStationId(station.id)}
            aria-pressed={station.id === stationId}
            className={"min-h-40 rounded-2xl border p-5 text-left shadow-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 " +
              (station.id === stationId ? "border-emerald-700 bg-emerald-50 shadow-md" : "border-slate-200 bg-white hover:border-emerald-300")}>
            <span className="mb-3 block text-xs font-black uppercase tracking-widest text-emerald-800">{station.name} · #{station.id}</span>
            <strong className="block text-xl font-black text-slate-900">{station.neighborhood}</strong>
            <span className="mt-1 block text-sm text-slate-500">{station.detail}</span>
            <span className="mt-4 inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
              Série em validação técnica
            </span>
          </button>
        ))}
      </div>

      <SurfaceCard className="overflow-hidden border border-slate-200 bg-white p-5 md:p-8">
        <div className="flex flex-col gap-5 border-b border-slate-100 pb-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-700">Série revisada · {selectedStation.neighborhood}</p>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">Histórico das partículas</h2>
            <p className="max-w-xl text-sm leading-relaxed text-slate-600">
              O gráfico apresenta exclusivamente registros que já passaram pela aprovação técnica para divulgação.
              A ausência de pontos não significa ausência de poluição.
            </p>
          </div>
          <button type="button" onClick={() => setRetry((value) => value + 1)}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
            Atualizar consulta
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 py-6">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Poluente do gráfico">
            {(["pm25_ug_m3","pm10_ug_m3"] as const).map((key) => (
              <button type="button" key={key} onClick={() => setPollutant(key)} aria-pressed={pollutant === key}
                className={"rounded-xl px-4 py-2.5 text-sm font-bold transition-colors " +
                  (pollutant === key ? "bg-emerald-800 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200")}>
                {POLLUTANT_LABELS[key]}
              </button>
            ))}
          </div>
          <div className="flex gap-2" role="group" aria-label="Intervalo do histórico">
            {DAYS.map((period) => (
              <button type="button" key={period} onClick={() => setDays(period)} aria-pressed={days === period}
                className={"rounded-xl px-3 py-2.5 text-sm font-bold " +
                  (days === period ? "border border-emerald-700 bg-emerald-50 text-emerald-900" : "border border-slate-200 text-slate-600 hover:bg-slate-50")}>
                {period === 1 ? "24h" : period === 7 ? "7 dias" : "30 dias"}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-900">
            Não foi possível carregar dados revisados: {error}
          </div>
        ) : loading ? (
          <div className="flex min-h-72 items-center justify-center rounded-2xl bg-slate-50 text-sm font-semibold text-slate-600" role="status">
            Consultando registros aprovados…
          </div>
        ) : (
          <TrendChart points={rows} pollutant={pollutant} />
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Média do recorte</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{formatNumber(average)} <span className="text-xs font-semibold text-slate-500">µg/m³</span></p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Maior média de 15 min</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{formatNumber(peak)} <span className="text-xs font-semibold text-slate-500">µg/m³</span></p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Último registro aprovado</p>
            <p className="mt-2 text-sm font-bold text-slate-900">{latest ? formatDate(latest.measured_at) : "Aguardando revisão"}</p>
            {latest && isStale ? <p className="mt-1 text-xs text-amber-700">O registro não é recente.</p> : null}
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <span>{rows.length.toLocaleString("pt-BR")} registros aprovados exibidos neste recorte.
            {latest ? " Origem auditável · SHA-256 " + latest.source_response_sha256.slice(0, 16) + "…" : ""}
          </span>
          <button type="button" onClick={exportCsv} disabled={!rows.length}
            className="rounded-lg border border-slate-200 px-3 py-2 font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50">
            Exportar CSV aprovado
          </button>
        </div>
      </SurfaceCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <SurfaceCard className="border border-slate-200 bg-white p-6">
          <p className="text-xs font-black uppercase tracking-widest text-emerald-700">Proveniência e método</p>
          <h2 className="mt-2 text-xl font-black text-slate-900">O que é medido e o que pode ser publicado</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            A integração armazena respostas originais da Aurassure em área protegida, preserva a origem de cada medição e trata duplicações.
            Só concentrações com unidade e método verificados podem ser liberadas nesta interface.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            A leitura de sensores complementares não equivale à rede regulatória do INEA e não determina, isoladamente, a fonte da poluição.
          </p>
        </SurfaceCard>
        <SurfaceCard className="border border-slate-200 bg-white p-6">
          <p className="text-xs font-black uppercase tracking-widest text-cyan-700">Entenda a diferença</p>
          <h2 className="mt-2 text-xl font-black text-slate-900">Duas fontes, duas metodologias</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            O Radar INEA apresenta dados oficiais históricos. Esta página trata exclusivamente das três estações UFF integradas via Aurassure.
            Não transformamos automaticamente o AQI do fornecedor em IQAr brasileiro.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/qualidade-ar/inea" className="inline-flex min-h-11 items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700">
              Abrir Radar INEA
            </Link>
            <Link to="/qualidade-ar" className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
              Voltar às redes
            </Link>
          </div>
        </SurfaceCard>
      </div>
    </section>
  );
}
