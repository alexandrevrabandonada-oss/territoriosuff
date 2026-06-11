import { Link } from "react-router-dom";

import { SurfaceCard } from "../../components/BrandSystem";
import {
  historicalMemoryPollutants,
  historicalMemoryReports,
  historicalMemoryStationYears,
  type HistoricalMemoryStatus
} from "../../data/air/historical-memory-2013-2015";

function statusClass(status: HistoricalMemoryStatus) {
  if (status === "ready") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (status === "technical") return "border-amber-200 bg-amber-50 text-amber-900";
  return "border-rose-200 bg-rose-50 text-rose-800";
}

function formatNumber(value: number | null) {
  return value === null ? "-" : value.toLocaleString("pt-BR", { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

export function IneaHistoryPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef7f5_45%,#ffffff_100%)] pb-16">
      <section className="mx-auto max-w-7xl px-4 pt-10 md:px-6 md:pt-16">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
          <div className="relative overflow-hidden rounded-[2.25rem] bg-slate-950 p-7 text-white shadow-[0_28px_70px_-42px_rgba(15,23,42,0.75)] md:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(16,185,129,0.28),transparent_34%),radial-gradient(circle_at_85%_15%,rgba(14,165,233,0.24),transparent_30%)]" />
            <div className="relative z-10 max-w-3xl space-y-6">
              <div className="inline-flex rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200">
                Memoria historica em auditoria
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-black leading-[0.95] tracking-tight md:text-6xl">
                  Qualidade do ar em Volta Redonda, 2013-2015
                </h1>
                <p className="max-w-2xl text-base font-semibold leading-relaxed text-slate-250 md:text-lg">
                  Uma leitura publica do periodo recuperado a partir de dados horarios INEA/WebLakes, comparado com evidencias cientificas.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-300">Dias validos</div>
                  <div className="mt-2 text-3xl font-black">9.358</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-300">Agregados</div>
                  <div className="mt-2 text-3xl font-black">27</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-300">Status</div>
                  <div className="mt-2 text-xl font-black">Preview</div>
                </div>
              </div>
            </div>
          </div>

          <SurfaceCard className="flex flex-col justify-between rounded-[2.25rem] border border-slate-200 bg-white p-6 shadow-[0_22px_52px_-40px_rgba(15,23,42,0.45)] md:p-8">
            <div className="space-y-4">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Como ler</div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Esta pagina nao publica nova base oficial.</h2>
              <p className="text-sm font-semibold leading-relaxed text-slate-600">
                Ela organiza uma evidencia tecnica em revisao: PM10 esta consistente com o artigo cientifico; PTS aparece como memoria tecnica; O3 permanece em auditoria de metrica.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/qualidade-ar/inea"
                className="rounded-2xl bg-slate-950 px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-white transition-colors hover:bg-emerald-700"
              >
                Voltar ao Radar
              </Link>
              <Link
                to="/qualidade-ar/inea/metodologia"
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-slate-700 transition-colors hover:bg-slate-50"
              >
                Ver metodologia
              </Link>
            </div>
          </SurfaceCard>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-7xl space-y-6 px-4 md:px-6">
        <div className="grid gap-5 lg:grid-cols-3">
          {historicalMemoryPollutants.map((item) => (
            <SurfaceCard key={item.pollutant} className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.4)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{item.label}</div>
                  <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-950">{item.pollutant}</h2>
                </div>
                <span className={`rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[0.12em] ${statusClass(item.status)}`}>
                  {item.statusLabel}
                </span>
              </div>

              <p className="mt-4 min-h-[72px] text-sm font-semibold leading-relaxed text-slate-600">{item.publicReading}</p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">Artigo</div>
                  <div className="mt-1 text-xl font-black text-slate-950">{formatNumber(item.articleMean)}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">Preview</div>
                  <div className="mt-1 text-xl font-black text-slate-950">{formatNumber(item.previewMean)}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">Dias validos</div>
                  <div className="mt-1 text-xl font-black text-slate-950">{item.validDays.toLocaleString("pt-BR")}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">Cobertura</div>
                  <div className="mt-1 text-xl font-black text-slate-950">
                    {formatNumber(item.minCoverage)}-{formatNumber(item.maxCoverage)}%
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-[11px] font-bold leading-relaxed text-slate-600">
                {item.decision}
              </div>
            </SurfaceCard>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-7xl px-4 md:px-6">
        <SurfaceCard className="overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white shadow-[0_18px_40px_-34px_rgba(15,23,42,0.4)]">
          <div className="border-b border-slate-100 p-6">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Media diaria validada por estacao</div>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Onde a memoria historica aparece com mais forca</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                <tr>
                  <th className="px-5 py-3">Estacao</th>
                  <th className="px-5 py-3">Ano</th>
                  <th className="px-5 py-3">PM10</th>
                  <th className="px-5 py-3">PTS</th>
                  <th className="px-5 py-3">O3</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historicalMemoryStationYears.map((row) => (
                  <tr key={`${row.station}-${row.year}`} className="text-xs font-semibold text-slate-700">
                    <td className="px-5 py-3 font-black text-slate-950">{row.station}</td>
                    <td className="px-5 py-3">{row.year}</td>
                    <td className="px-5 py-3">{formatNumber(row.pm10)}</td>
                    <td className="px-5 py-3">{formatNumber(row.pts)}</td>
                    <td className="px-5 py-3">{formatNumber(row.o3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SurfaceCard>
      </section>

      <section className="mx-auto mt-8 max-w-7xl px-4 md:px-6">
        <div className="grid gap-4 md:grid-cols-4">
          {historicalMemoryReports.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-[1.4rem] border border-slate-200 bg-white p-5 text-sm font-black text-slate-800 shadow-[0_14px_32px_-28px_rgba(15,23,42,0.4)] transition-colors hover:bg-emerald-50"
            >
              {item.label}
              <span className="mt-2 block text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700">Abrir evidencia</span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}

export default IneaHistoryPage;
