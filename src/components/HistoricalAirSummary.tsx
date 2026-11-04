import { useState } from "react";
import { Link } from "react-router-dom";

import { PARTICULATE_TIMELINE } from "../data/air/particulate-timeline-2020-2026";
import type { SummaryPayload } from "../lib/inea/summaryLoader";
import partial2026 from "../../data/inea_weblakes_normalized/summary-2026.json";

const stations = [
  { id: "69", name: "Belmonte" },
  { id: "70", name: "Retiro" },
  { id: "71", name: "Santa Cecília" }
];
const years = Array.from(new Set(PARTICULATE_TIMELINE.map((item) => item.year))).sort((a, b) => a - b);
const format = (value: number) => value.toLocaleString("pt-BR", { maximumFractionDigits: 1 });

export function HistoricalAirSummary() {
  const [station, setStation] = useState("69");
  const [pollutant, setPollutant] = useState<"PM2.5" | "PM10">("PM2.5");
  const [period, setPeriod] = useState("5");
  const rows = PARTICULATE_TIMELINE.filter((item) => item.station_id === station && item.pollutant === pollutant);
  const latestComplete = [...rows].filter((item) => !item.partial && item.mean !== null && item.coveragePct >= 75).sort((a, b) => b.year - a.year)[0];
  const selectedYears = period === "all" ? years : years.slice(-Number(period));
  const chartRows = selectedYears.map((year) => ({ year, row: rows.find((item) => item.year === year) }));
  const max = Math.max(1, ...chartRows.map(({ row }) => row?.mean ?? 0));
  const label = pollutant === "PM2.5" ? "MP2,5" : "MP10";
  const name = stations.find((item) => item.id === station)?.name;
  const partialMonths = (partial2026 as SummaryPayload)[station]?.pollutants[pollutant === "PM2.5" ? "20" : "18"]?.months;
  const availableMonths = Object.entries(partialMonths ?? {}).filter(([, value]) => value.mean !== null).map(([month]) => month).sort();
  const lastPartialMonth = availableMonths[availableMonths.length - 1];
  const partialEnd = lastPartialMonth ? `${lastPartialMonth.slice(5, 7)}/${lastPartialMonth.slice(0, 4)}` : null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5" aria-labelledby="historical-summary-title">
      <p className="text-xs font-bold uppercase tracking-wide text-teal-800">Dados históricos · INEA / WebLakes</p>
      <h2 id="historical-summary-title" className="mt-2 text-xl font-black text-slate-950">O que o histórico mostra</h2>
      <p className="mt-2 text-sm leading-6 text-slate-700">São registros de anos anteriores, não uma indicação da qualidade do ar agora.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-bold text-slate-800">Estação histórica
          <select value={station} onChange={(event) => setStation(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 font-normal">
            {stations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label className="text-sm font-bold text-slate-800">Poluente
          <select value={pollutant} onChange={(event) => setPollutant(event.target.value as "PM2.5" | "PM10")} className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 font-normal">
            <option value="PM2.5">MP2,5 · partículas finas</option>
            <option value="PM10">MP10 · partículas inaláveis</option>
          </select>
        </label>
      </div>
      <div className="mt-4 rounded-xl bg-teal-50 p-4 text-sm leading-6 text-slate-800" aria-live="polite">
        {latestComplete ? <>
          <p>Em <strong>{latestComplete.year}</strong>, a média registrada em <strong>{name}</strong> para <strong>{label}</strong> foi <strong>{format(latestComplete.mean!)} µg/m³</strong>.</p>
          <p className="mt-1">Cobertura de dados: {format(latestComplete.coveragePct)}% do ano. Último ano completo com cobertura de pelo menos 75% nesta série.</p>
        </> : <p>Sem dados suficientes para resumir um ano completo nesta estação e poluente.</p>}
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-600">MP2,5 e MP10 são partículas presentes no ar. µg/m³ indica sua concentração. A série é uma análise experimental, sem controle de qualidade oficial informado por registro; ausência de dados não significa ar limpo.</p>
      <details className="mt-4 border-t border-slate-200 pt-4">
        <summary className="cursor-pointer font-bold text-teal-800">Ver gráfico e dados por ano</summary>
        <div className="mt-4">
          <label className="block text-sm font-bold text-slate-800">Período
            <select value={period} onChange={(event) => setPeriod(event.target.value)} className="mt-1 block w-full rounded-xl border border-slate-300 bg-white p-3 font-normal sm:max-w-xs">
              <option value="3">Últimos 3 anos da série</option>
              <option value="5">Últimos 5 anos da série</option>
              <option value="all">Todos os anos da série</option>
            </select>
          </label>
          <p className="mt-4 text-sm font-bold text-slate-900">Média anual de {label} · {name} · µg/m³</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">Cada barra representa uma média; a cobertura e anos parciais aparecem em cada linha. Não compare diretamente anos parciais com anos completos.</p>
          <div className="mt-3 space-y-3" role="list" aria-label={`Médias anuais de ${label} em ${name}`}>
            {chartRows.map(({ year, row }) => {
              const valid = row && row.mean !== null && row.coveragePct > 0;
              return <div key={year} role="listitem" className="grid grid-cols-[4rem_1fr] gap-x-3 text-sm">
                <span className="font-bold">{year}{row?.partial ? "*" : ""}</span>
                <div>
                  {valid ? <><div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-teal-700" style={{ width: `${Math.max(1, (row.mean! / max) * 100)}%` }} /></div><p className="mt-1 text-xs text-slate-700">{format(row.mean!)} µg/m³ · cobertura {format(row.coveragePct)}%{row.coveragePct < 75 ? " · cobertura baixa" : ""}{row.partial ? ` · ano parcial${year === 2026 && partialEnd ? `, dados até ${partialEnd}` : ""}` : ""}</p></> : <p className="text-xs text-slate-600">Sem dados suficientes</p>}
                </div>
              </div>;
            })}
          </div>
          <p className="mt-3 text-xs text-slate-600">* Ano parcial. A cobertura indica a presença de dados no recorte; não substitui a avaliação de qualidade das medições.</p>
          <Link className="mt-4 inline-block font-bold text-teal-800 underline underline-offset-2" to="/qualidade-ar/inea?modo=metodologia">Entender a metodologia e acessar os dados</Link>
        </div>
      </details>
    </section>
  );
}
