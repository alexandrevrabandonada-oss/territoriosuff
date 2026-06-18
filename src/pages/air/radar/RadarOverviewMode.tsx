import { Link } from "react-router-dom";
import { RADAR_NO_DATA_NOT_CLEAN_AIR, RADAR_EXPERIMENTAL_OBSERVATION_NOTE } from "../../../data/air/radar-copy";
import { ATTENTION_EPISODES } from "../../../data/air/attention-episodes-2020-2026";
import { PARTICULATE_TIMELINE } from "../../../data/air/particulate-timeline-2020-2026";

import { summarizeStationGovernance } from "./RadarGovernanceModel";
import { RadarEvidenceStateBlock } from "./RadarEvidenceStateBlock";
import { RadarEvidenceBadge } from "./RadarEvidenceBadge";
import { RadarNextReadingCard } from "./RadarNextReadingCard";
import type { BreakdownItem, LatestResult, SummaryStats, RadarComparisonTab, RadarMode, StationMetadataItem } from "./RadarTypes";
import { getIneaClassificationStyle } from "./RadarTypes";
import { RadarModeFooter } from "./RadarModeFooter";

interface RankingRow extends BreakdownItem {
  id: string;
  name: string;
}

interface RadarOverviewModeProps {
  latestData: LatestResult[];
  sortedRankings: RankingRow[];
  displaySummary: SummaryStats;
  stationMetadata: StationMetadataItem[];
  onOpenLai: () => void;
  onNavigate: (mode: RadarMode, tab?: RadarComparisonTab) => void;
  onTop: () => void;
  onScrollToRecommendations: () => void;
}

function buildHistoricalSynthesis() {
  const rows = PARTICULATE_TIMELINE.filter((row) => row.coveragePct > 0);
  const years = Array.from(new Set(rows.map((row) => row.year))).sort((a, b) => a - b);
  const stations = Array.from(new Set(rows.map((row) => row.station_name)));
  const pollutants = Array.from(new Set(rows.map((row) => row.pollutant))).sort();
  const highCoverageRows = rows.filter((row) => row.coveragePct >= 75);
  const totalWhoExceedances = rows.reduce((sum, row) => sum + row.exceedances_who, 0);
  const totalConamaExceedances = rows.reduce((sum, row) => sum + row.exceedances_conama, 0);
  const stationExceedances = new Map<string, { station: string; who: number; conama: number; rows: number }>();
  const pollutantExceedances = new Map<string, number>();

  for (const row of rows) {
    const current = stationExceedances.get(row.station_name) ?? { station: row.station_name, who: 0, conama: 0, rows: 0 };
    current.who += row.exceedances_who;
    current.conama += row.exceedances_conama;
    current.rows += 1;
    stationExceedances.set(row.station_name, current);
    pollutantExceedances.set(row.pollutant, (pollutantExceedances.get(row.pollutant) ?? 0) + row.exceedances_who);
  }

  const stationRanking = Array.from(stationExceedances.values()).sort((a, b) => b.who - a.who);
  const pollutantRanking = Array.from(pollutantExceedances.entries()).sort((a, b) => b[1] - a[1]);
  const peakRow = rows
    .filter((row) => typeof row.max === "number")
    .sort((a, b) => (b.max ?? 0) - (a.max ?? 0))[0];
  const attentionMonths = ATTENTION_EPISODES.filter((episode) => episode.who_exceedance_days > 0 || episode.conama_exceedance_days > 0);
  const lowCoverageMonths = ATTENTION_EPISODES.filter((episode) => episode.data_quality_tier === "LOW").length;

  return {
    startYear: years[0] ?? 2020,
    endYear: years[years.length - 1] ?? 2026,
    stationsCount: stations.length,
    pollutantsLabel: pollutants.join(" e "),
    highCoverageRows: highCoverageRows.length,
    totalRows: rows.length,
    totalWhoExceedances,
    totalConamaExceedances,
    topHistoricalStation: stationRanking[0],
    topHistoricalPollutant: pollutantRanking[0]?.[0] ?? "MP2.5/MP10",
    stationRanking: stationRanking.slice(0, 4),
    peakRow,
    attentionMonths: attentionMonths.length,
    lowCoverageMonths
  };
}

const historicalSynthesis = buildHistoricalSynthesis();

export function RadarOverviewMode({
  latestData,
  stationMetadata,
  onOpenLai,
  onNavigate,
  onTop,
  onScrollToRecommendations
}: RadarOverviewModeProps) {
  const governance = summarizeStationGovernance(stationMetadata);
  const topPollutantShort = historicalSynthesis.topHistoricalPollutant;
  const primaryStationName = historicalSynthesis.topHistoricalStation?.station || "base histórica consolidada";
  const primaryStationDays = historicalSynthesis.topHistoricalStation?.who ?? 0;
  const historicalRange = `${historicalSynthesis.startYear}-${historicalSynthesis.endYear}${historicalSynthesis.endYear === 2026 ? " parcial" : ""}`;

  return (
    <div className="animate-fade-in space-y-8 pt-4">
      <div className="space-y-2 border-b border-slate-200 pb-5">
        <h2 className="flex items-center gap-2 text-xl font-black tracking-tight text-slate-800">
          <span>📊 Visão Geral do Monitoramento</span>
        </h2>
        <p className="text-sm font-medium text-slate-600">
          Síntese didática da base histórica consolidada que o SEMEAR já organizou a partir de arquivos públicos, sem depender de API do INEA.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <RadarEvidenceBadge
            level="interpretive"
            label="Síntese histórica"
            detail="resume padrões de atenção, cobertura e excedências; não substitui auditoria completa por estação"
          />
          <RadarEvidenceBadge
            level="experimental"
            label="Sem API do INEA"
            detail="leitura baseada em arquivos históricos consolidados, dicionário de dados e metodologia pública"
          />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr_1fr]">
        <div className="relative overflow-hidden rounded-[2rem] border border-[#d97706]/25 bg-[linear-gradient(135deg,#fff8eb,#fff0cf_55%,#fff8eb)] p-6 shadow-[0_24px_48px_-34px_rgba(217,119,6,0.65)] xl:row-span-2">
          <div className="pointer-events-none absolute right-0 top-0 h-36 w-36 rounded-full bg-amber-300/35 blur-3xl" />
          <div className="relative z-10 flex h-full flex-col justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#d97706]/20 bg-white/70 px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-[#b45309]">
                Painel de situação
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#d97706]">Síntese histórica principal</span>
                <h3 className="mt-3 text-3xl font-black leading-tight tracking-tight text-[#78350f] md:text-4xl">
                  {primaryStationName}
                </h3>
              </div>
              <p className="max-w-md text-[13px] font-semibold leading-relaxed text-[#92400e]">
                Na janela {historicalRange}, a base consolidada aponta {primaryStationDays.toLocaleString("pt-BR")} ocorrências/dias de atenção na estação com maior sinal histórico. Leia como prioridade de investigação pública, não como diagnóstico fechado.
              </p>
              <RadarEvidenceBadge
                level="interpretive"
                label="Onde olhar primeiro"
                detail="priorização baseada na série histórica processada e na cobertura disponível, não em monitoramento em tempo real"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#d97706]/15 bg-white/80 p-4">
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#92400e]">Janela histórica</div>
                <div className="mt-2 text-3xl font-black tracking-tight text-[#78350f]">
                  {historicalRange}
                </div>
                <div className="mt-1 text-[11px] font-semibold text-[#92400e]/80">
                  {historicalSynthesis.pollutantsLabel || "MP10 e MP2.5"} por estação/ano
                </div>
              </div>
              <div className="rounded-2xl border border-[#d97706]/15 bg-white/80 p-4">
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#92400e]">Excedências OMS</div>
                <div className="mt-2 text-3xl font-black tracking-tight text-[#78350f]">{historicalSynthesis.totalWhoExceedances.toLocaleString("pt-BR")}</div>
                <div className="mt-1 text-[11px] font-semibold text-[#92400e]/80">soma anual em linhas com cobertura disponível</div>
              </div>
            </div>

            <RadarEvidenceStateBlock
              state="partial"
              description={
                "A visão geral resume a base histórica consolidada. Para concluir com força pública, cruze este resumo com cobertura, território, metodologia e documentos originais."
              }
            />
          </div>
        </div>

        <div className="card-tecnico flex min-h-[13rem] flex-col justify-between space-y-4 rounded-[2rem] p-6 transition-all duration-300 hover:scale-[1.01] hover:shadow-md">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300/80">Cobertura forte</span>
            <div
              className="mt-3 text-4xl font-black tracking-tight text-white"
              title="Linhas estação-ano com cobertura igual ou superior a 75%"
            >
              {historicalSynthesis.highCoverageRows}/{historicalSynthesis.totalRows}
            </div>
          </div>
          <p className="text-[12px] font-semibold leading-relaxed text-slate-300">
            Linhas estação-ano de MP10/MP2.5 com cobertura suficiente para leitura comparativa mais defensável. Lacunas continuam explícitas.
          </p>
        </div>

        <div className="card-social flex min-h-[13rem] flex-col justify-between space-y-4 rounded-[2rem] p-6 transition-all duration-300 hover:scale-[1.01] hover:shadow-md">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-red-700">Meses de atenção</span>
            <div className="mt-3 text-4xl font-black tracking-tight text-[#7f1d1d]">{historicalSynthesis.attentionMonths}</div>
          </div>
          <p className="text-[12px] font-semibold leading-relaxed opacity-90">
            Meses em que a base mensal registrou excedência por referência OMS ou CONAMA. É um sinal histórico para priorizar leitura, prevenção e cobrança pública.
          </p>
        </div>

        <div className="rounded-[2rem] border border-emerald-200 bg-[linear-gradient(180deg,#ffffff,#ecfdf5)] p-5 shadow-[0_20px_45px_-34px_rgba(16,185,129,0.35)] xl:col-span-3">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">O que a base histórica permite dizer, de forma resumida</div>
              <h3 className="mt-2 text-xl font-black tracking-tight text-emerald-950">Há sinal recorrente de atenção por particulados, mas a leitura precisa respeitar cobertura e lacunas.</h3>
              <p className="mt-2 max-w-4xl text-sm font-semibold leading-relaxed text-emerald-900/80">
                O recorte consolidado reúne {historicalSynthesis.stationsCount} estações, {historicalSynthesis.pollutantsLabel || "MP10 e MP2.5"}, anos de 2020 a 2026 parcial e soma {historicalSynthesis.totalWhoExceedances.toLocaleString("pt-BR")} excedências pela régua OMS, além de {historicalSynthesis.totalConamaExceedances.toLocaleString("pt-BR")} pela régua CONAMA. A ausência de dado em alguns meses não deve ser lida como ar limpo.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("TIME", "EXCEEDANCE")}
              className="rounded-full border border-emerald-300 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-emerald-800 transition hover:bg-emerald-50"
            >
              Ver excedências
            </button>
          </div>
        </div>

        {governance.total > 0 && (
          <div className="rounded-[2rem] border border-sky-200 bg-[linear-gradient(180deg,#ffffff,#f0f9ff)] p-5 shadow-[0_20px_45px_-34px_rgba(14,165,233,0.35)] xl:col-span-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-700">Defensabilidade operacional da rodada</div>
                <h3 className="text-base font-black tracking-tight text-slate-900">Antes de concluir, veja a força pública da malha que sustenta esta triagem</h3>
                <p className="max-w-3xl text-[11px] font-semibold leading-relaxed text-slate-600">
                  A visão geral organiza prioridade, mas a força da prioridade depende do quanto a rede já publica janelas, fontes e proveniência operacional.
                </p>
              </div>
              <div className="rounded-full border border-sky-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-sky-800">
                score médio da malha {governance.averageScore}/100
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">Estações fortes</div>
                <div className="mt-2 text-2xl font-black text-emerald-950">{governance.strong}</div>
              </div>
              <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-700">Estações em avanço</div>
                <div className="mt-2 text-2xl font-black text-sky-950">{governance.advancing}</div>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-700">Estações cautelares</div>
                <div className="mt-2 text-2xl font-black text-amber-950">{governance.experimental}</div>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_45px_-34px_rgba(15,23,42,0.45)] xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Ranking histórico por atenção</h2>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                Estações com maior soma de excedências OMS em MP10/MP2.5 na base consolidada 2020-2026 parcial.
              </p>
              <div className="mt-2">
                <RadarEvidenceBadge level="experimental" detail="ranking histórico depende da cobertura publicada e não representa exposição individual" />
              </div>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-bold text-slate-600">
              Cobertura cautelar: <strong className="text-[#0e2c45]">{historicalSynthesis.lowCoverageMonths.toLocaleString("pt-BR")} meses com baixa cobertura</strong>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {historicalSynthesis.stationRanking.map((r, idx) => (
                <div
                  key={r.station}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 transition-colors hover:border-slate-200 hover:bg-white"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-xs font-black text-white">
                      #{idx + 1}
                    </span>
                    <div className="space-y-0.5">
                      <span className="text-sm font-black text-slate-800">{r.station}</span>
                      <span className="block text-[10px] font-medium text-slate-400">{r.rows} linhas estação-ano auditadas</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <strong className="block text-sm font-extrabold text-amber-700">{r.who}</strong>
                    <span className="block text-[9px] font-semibold text-slate-450">excedências OMS</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f8fafc)] p-5 shadow-[0_20px_45px_-34px_rgba(15,23,42,0.45)]">
          <div className="space-y-3">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Leitura rápida</div>
            <h3 className="text-xl font-black tracking-tight text-slate-900">Onde pressionar primeiro</h3>
            <p className="text-xs font-semibold leading-relaxed text-slate-600">
              Use este painel como triagem: veja quem concentrou mais sinal histórico, compare cobertura e só depois mergulhe em séries e territórios.
            </p>
            <RadarEvidenceBadge level="interpretive" detail="use como porta de entrada; confirme a leitura nos modos Tempo, Território e Metodologia" />
          </div>

          <div className="mt-4 grid gap-3">
            <button
              onClick={() => onNavigate("MAP")}
              className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left transition-colors hover:bg-emerald-100"
            >
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">Explorar cidade</div>
                <div className="mt-1 text-sm font-black text-emerald-950">Abrir mapa das estações</div>
              </div>
              <span className="text-emerald-700">→</span>
            </button>
            <button
              onClick={() => onNavigate("TIME", "TREND")}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition-colors hover:bg-slate-50"
            >
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Ler tendência</div>
                <div className="mt-1 text-sm font-black text-slate-900">Ir para o histórico temporal</div>
              </div>
              <span className="text-slate-500">→</span>
            </button>
            <button
              onClick={() => onNavigate("TERRITORY")}
              className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-left transition-colors hover:bg-rose-100"
            >
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-rose-700">Justiça ambiental</div>
                <div className="mt-1 text-sm font-black text-rose-950">Ver territórios prioritários</div>
              </div>
              <span className="text-rose-700">→</span>
            </button>
            <button
              onClick={() => onNavigate("METHODOLOGY")}
              className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-left transition-colors hover:bg-amber-100"
            >
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-700">Confiar na leitura</div>
                <div className="mt-1 text-sm font-black text-amber-950">Abrir metodologia e comparação</div>
              </div>
              <span className="text-amber-700">→</span>
            </button>
          </div>
        </div>

        {latestData.length > 0 ? (
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f8fafc)] shadow-[0_20px_45px_-34px_rgba(15,23,42,0.45)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 md:px-6">
              <div>
                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Leitura de situação</h2>
                <p className="mt-1 text-xs font-semibold text-slate-500">Últimos dados consolidados transformados em quadro de atenção pública.</p>
                <div className="mt-2">
                  <RadarEvidenceBadge level="experimental" label="Últimas leituras consolidadas" detail="quadro operacional útil para atenção pública, sem substituir auditoria de cobertura e séries" />
                </div>
              </div>
              <div className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white">
                Painel operacional
              </div>
            </div>

            <div className="grid gap-3 border-b border-slate-100 px-5 py-4 md:grid-cols-3 md:px-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Onde olhar primeiro</div>
                <div className="mt-2 text-base font-black text-slate-900">{primaryStationName}</div>
                <p className="mt-1 text-[11px] font-semibold leading-relaxed text-slate-500">
                  Concentrou mais dias de atenção na base consolidada e deve abrir a leitura desta rodada.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Qual poluente aparece mais</div>
                <div className="mt-2 text-base font-black text-slate-900">{topPollutantShort}</div>
                <p className="mt-1 text-[11px] font-semibold leading-relaxed text-slate-500">
                  Controlador mais recorrente da classificação diária final do IQAr.
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">Qual próximo passo</div>
                <div className="mt-2 text-base font-black text-emerald-950">Comparar com território e séries</div>
                <p className="mt-1 text-[11px] font-semibold leading-relaxed text-emerald-800/80">
                  Não pare na última leitura: valide padrão histórico, cobertura e exposição social.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto px-2 py-2 md:px-3">
              <table className="min-w-[500px] w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th scope="col" className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-455">Estação</th>
                    <th scope="col" className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-455">Última Leitura</th>
                    <th scope="col" className="px-4 py-3 text-center text-[9px] font-bold uppercase tracking-widest text-slate-455">Índice IQAr</th>
                    <th scope="col" className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-455">Classificação</th>
                    <th scope="col" className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-455">Controlador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {latestData.map((d) => {
                    const latestAqi = d.measurements.find((m) => m.metric_type === "GENERAL_AQI");
                    const classification = latestAqi?.air_quality_classification || "Sem Leitura";
                    const value = typeof latestAqi?.value === "number" ? Math.round(latestAqi.value) : "-";
                    const colorClass = getIneaClassificationStyle(classification);

                    return (
                      <tr key={d.station.id} className="transition-colors hover:bg-slate-50/60">
                        <td className="px-4 py-3 font-bold text-slate-800">
                          <Link to={`/qualidade-ar/inea/estacoes/${d.station.id}`} className="hover:underline">
                            {d.station.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-500">
                          {d.measured_at ? new Date(d.measured_at).toLocaleString("pt-BR") : "-"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex min-w-[4.5rem] items-center justify-center rounded-2xl bg-slate-900 px-3 py-2 text-lg font-black text-white">
                            {value}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block rounded-full border px-2.5 py-0.5 font-bold ${colorClass}`}>{classification}</span>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-650">{latestAqi?.controlling_pollutant || "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f8fafc)] p-6 shadow-[0_20px_45px_-34px_rgba(15,23,42,0.45)]">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                Leitura assistida
              </div>
              <h3 className="text-xl font-black tracking-tight text-slate-900">Ainda sem leituras recentes consolidadas neste painel</h3>
              <p className="max-w-2xl text-sm font-semibold leading-relaxed text-slate-600">
                Você ainda pode usar o Radar para entender o território, ler o histórico, comparar referências de qualidade do ar e verificar a metodologia pública.
              </p>
              <RadarEvidenceBadge level="insufficient" label="Sem rodada recente consolidada" detail="quando falta leitura recente, a interpretação deve migrar para histórico, cobertura e metodologia" />
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <button
                onClick={() => onNavigate("MAP")}
                className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-left transition-colors hover:bg-emerald-100"
              >
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">Abrir mapa</div>
                <div className="mt-2 text-sm font-black text-emerald-950">Veja estações e distribuição espacial</div>
              </button>
              <button
                onClick={() => onNavigate("TIME", "TREND")}
                className="rounded-2xl border border-slate-200 bg-white p-4 text-left transition-colors hover:bg-slate-50"
              >
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Ver histórico</div>
                <div className="mt-2 text-sm font-black text-slate-900">Leia tendência, sazonalidade e cobertura</div>
              </button>
              <button
                onClick={() => onNavigate("TIME", "EXCEEDANCE")}
                className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left transition-colors hover:bg-amber-100"
              >
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-700">Comparar com OMS</div>
                <div className="mt-2 text-sm font-black text-amber-950">Acesse excedências e réguas de comparação</div>
              </button>
              <button
                onClick={() => onNavigate("METHODOLOGY")}
                className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-left transition-colors hover:bg-indigo-100"
              >
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-indigo-700">Acessar metodologia</div>
                <div className="mt-2 text-sm font-black text-indigo-950">Entenda limites, base e confiança pública</div>
              </button>
            </div>
          </div>
        )}
      </div>

      <section id="encaminhamentos" className="space-y-6 border-t border-slate-200/60 pt-4">
        <div className="space-y-2">
          <h3 className="flex items-center gap-2 text-lg font-black tracking-tight text-slate-800">
            <span>📢 Dado público precisa virar ação pública</span>
          </h3>
          <p className="max-w-2xl text-xs font-semibold text-slate-500">
            Como mobilizar a sociedade, fiscalizar e cobrar medidas concretas de justiça ambiental para Volta Redonda.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="card-acao animate-scale-up flex flex-col justify-between space-y-4 rounded-2xl p-6">
            <div className="space-y-2">
              <span className="block text-[9px] font-black uppercase tracking-wider text-emerald-700">Eixo 1 · Ação Coletiva</span>
              <h3 className="flex items-center gap-1.5 text-sm font-black text-[#064e3b]"><span>📡</span> MONITORAR: Ampliar a Rede de Estações</h3>
              <p className="text-xs font-semibold leading-relaxed text-[#064e3b] opacity-90">
                Solicitar a expansão da malha operacional para novos setores e a inclusão de bairros desatendidos com dados certificados.
              </p>
              <div className="rounded-xl border border-emerald-200 bg-white/60 p-3 text-xs font-bold text-[#064e3b]">
                🎯 <strong>Ação Direta:</strong> Protocolar pedidos formais no órgão fiscalizador cobrando a expansão da malha de sensores e a publicação de dados com {RADAR_EXPERIMENTAL_OBSERVATION_NOTE}.
              </div>
            </div>
            <button
              onClick={onOpenLai}
              className="inline-flex min-h-[38px] w-full cursor-pointer items-center justify-center rounded-xl bg-emerald-600 text-xs font-black uppercase text-white shadow-md shadow-emerald-700/20 transition-all hover:scale-[1.02] hover:bg-emerald-700"
            >
              Solicitar Ampliação via LAI
            </button>
          </div>

          <div className="card-acao animate-scale-up flex flex-col justify-between space-y-4 rounded-2xl p-6">
            <div className="space-y-2">
              <span className="block text-[9px] font-black uppercase tracking-wider text-emerald-700">Eixo 2 · Fiscalização</span>
              <h3 className="flex items-center gap-1.5 text-sm font-black text-[#064e3b]"><span>🔧</span> MANTER: Cobrar Calibração e Continuidade</h3>
              <p className="text-xs font-semibold leading-relaxed text-[#064e3b] opacity-90">
                Evitar longos períodos de silêncio de dados e lacunas inexplicáveis nas séries oficiais. {RADAR_NO_DATA_NOT_CLEAN_AIR} Exigir calibragem pública.
              </p>
              <div className="rounded-xl border border-emerald-200 bg-white/60 p-3 text-xs font-bold text-[#064e3b]">
                🎯 <strong>Ação Direta:</strong> Exigir a publicação transparente de relatórios de manutenção dos sensores e auditorias externas regulares nas estações.
              </div>
            </div>
            <button
              onClick={() => onNavigate("TIME", "COVERAGE")}
              className="inline-flex min-h-[38px] w-full cursor-pointer items-center justify-center rounded-xl bg-emerald-600 text-xs font-black uppercase text-white shadow-md shadow-emerald-700/20 transition-all hover:scale-[1.02] hover:bg-emerald-700"
            >
              Analisar Silêncio de Dados →
            </button>
          </div>

          <div className="card-acao animate-scale-up flex flex-col justify-between space-y-4 rounded-2xl p-6">
            <div className="space-y-2">
              <span className="block text-[9px] font-black uppercase tracking-wider text-emerald-700">Eixo 3 · Saúde Coletiva</span>
              <h3 className="flex items-center gap-1.5 text-sm font-black text-[#064e3b]"><span>🏥</span> CUIDAR: Reforçar UBS nos Territórios Críticos</h3>
              <p className="text-xs font-semibold leading-relaxed text-[#064e3b] opacity-90">
                Reforçar equipes médicas e insumos respiratórios nas UBS e UPAs localizadas nos recortes urbanos de maior prioridade territorial.
              </p>
              <div className="rounded-xl border border-emerald-200 bg-white/60 p-3 text-xs font-bold text-[#064e3b]">
                🎯 <strong>Ação Direta:</strong> Priorizar atendimentos e exames preventivos voltados a grupos de alta vulnerabilidade nos bairros com maior convergência entre sensibilidade social, cobertura pública e pressão ambiental.
              </div>
            </div>
            <button
              onClick={() => onNavigate("TERRITORY")}
              className="inline-flex min-h-[38px] w-full cursor-pointer items-center justify-center rounded-xl bg-emerald-600 text-xs font-black uppercase text-white shadow-md shadow-emerald-700/20 transition-all hover:scale-[1.02] hover:bg-emerald-700"
            >
              Ver Bairros Prioritários →
            </button>
          </div>

          <div className="card-acao animate-scale-up flex flex-col justify-between space-y-4 rounded-2xl p-6">
            <div className="space-y-2">
              <span className="block text-[9px] font-black uppercase tracking-wider text-emerald-700">Eixo 4 · Blindagem Física</span>
              <h3 className="flex items-center gap-1.5 text-sm font-black text-[#064e3b]"><span>🌳</span> PROTEGER: Arborização e Cortinas Verdes</h3>
              <p className="text-xs font-semibold leading-relaxed text-[#064e3b] opacity-90">
                Criar cinturões arbóreos e cortinas verdes para proteger fisicamente equipamentos sociais em áreas prioritárias.
              </p>
              <div className="rounded-xl border border-emerald-200 bg-white/60 p-3 text-xs font-bold text-[#064e3b]">
                🎯 <strong>Ação Direta:</strong> Exigir o plantio de cortinas verdes no entorno de creches, escolas, CRAS e postos de saúde nas áreas priorizadas pelo cruzamento territorial do Radar.
              </div>
            </div>
            <button
              onClick={() => onNavigate("TERRITORY")}
              className="inline-flex min-h-[38px] w-full cursor-pointer items-center justify-center rounded-xl bg-emerald-600 text-xs font-black uppercase text-white shadow-md shadow-emerald-700/20 transition-all hover:scale-[1.02] hover:bg-emerald-700"
            >
              Mapear Equipamentos Sensíveis →
            </button>
          </div>
        </div>

        <div className="card-tecnico relative space-y-4 overflow-hidden rounded-2xl border border-[#0d2e46] p-6 shadow-lg md:p-8">
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 max-w-3xl space-y-2">
            <h3 className="text-lg font-black tracking-tight text-white md:text-xl">Queremos a série completa de dados históricos</h3>
            <p className="text-xs font-semibold leading-relaxed text-slate-300">
              Com amparo na Lei de Acesso à Informação (LAI), solicite a liberação dos arquivos públicos em formato aberto de monitoramento de 2010 a 2021.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpenLai}
              className="cursor-pointer rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-emerald-600/10 transition-all hover:scale-[1.02] hover:bg-emerald-500"
            >
              Ver minuta de LAI
            </button>
            <Link
              to="/qualidade-ar/inea/metodologia"
              className="rounded-xl border border-slate-700/60 bg-slate-800 px-5 py-2.5 text-xs font-bold text-slate-100 transition-colors hover:bg-slate-750"
            >
              Ver análise técnica completa
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-6 border-t border-slate-200/60 pt-4">
        <div className="space-y-2">
          <h3 className="flex items-center gap-2 text-base font-black tracking-tight text-slate-800">
            <span>💡 Três Formas de Usar Este Observatório</span>
          </h3>
          <p className="max-w-2xl text-xs font-semibold text-slate-500">
            Seja você morador, pesquisador ou gestor público, veja como direcionar o uso desses dados abertos.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="card-leitura flex flex-col justify-between space-y-3 rounded-2xl p-5 transition-all duration-300 hover:scale-[1.01] hover:shadow-md">
            <div className="space-y-2">
              <h3 className="flex items-center gap-1.5 text-sm font-black text-slate-800"><span>👥</span> Como cidadão</h3>
              <p className="text-xs font-semibold leading-relaxed text-slate-500">
                Explore o mapa interativo para conferir os indicadores de poluição no seu bairro. Compartilhe as análises com vizinhos para fomentar a conscientização local e cobrar melhorias.
              </p>
            </div>
            <button
              onClick={() => onNavigate("MAP")}
              className="inline-flex min-h-[32px] w-full cursor-pointer items-center justify-center rounded-xl bg-slate-100 text-[10px] font-black uppercase text-slate-700 transition-all hover:bg-slate-200/80"
            >
              Ir para o Mapa
            </button>
          </div>

          <div className="card-leitura flex flex-col justify-between space-y-3 rounded-2xl p-5 transition-all duration-300 hover:scale-[1.01] hover:shadow-md">
            <div className="space-y-2">
              <h3 className="flex items-center gap-1.5 text-sm font-black text-slate-800"><span>📝</span> Como pesquisador/jornalista</h3>
              <p className="text-xs font-semibold leading-relaxed text-slate-500">
                Baixe as planilhas históricas consolidadas em formato aberto (CSV). Consulte as notas metodológicas, atente-se às limitações instrumentais e cite as fontes de forma honesta.
              </p>
            </div>
            <button
              onClick={() => onNavigate("METHODOLOGY")}
              className="inline-flex min-h-[32px] w-full cursor-pointer items-center justify-center rounded-xl bg-slate-100 text-[10px] font-black uppercase text-slate-700 transition-all hover:bg-slate-200/80"
            >
              Acessar Dados Abertos
            </button>
          </div>

          <div className="card-leitura flex flex-col justify-between space-y-3 rounded-2xl p-5 transition-all duration-300 hover:scale-[1.01] hover:shadow-md">
            <div className="space-y-2">
              <h3 className="flex items-center gap-1.5 text-sm font-black text-slate-800"><span>🏛️</span> Como poder público</h3>
              <p className="text-xs font-semibold leading-relaxed text-slate-500">
                Use os mapeamentos de vulnerabilidade social para priorizar o atendimento de saúde nas UBS. Planeje cortinas de vegetação urbana e audite o funcionamento operacional dos sensores.
              </p>
            </div>
            <button
              onClick={onScrollToRecommendations}
              className="inline-flex min-h-[32px] w-full cursor-pointer items-center justify-center rounded-xl bg-slate-100 text-[10px] font-black uppercase text-slate-700 transition-all hover:bg-slate-200/80"
            >
              Ver Recomendações
            </button>
          </div>
        </div>
      </section>

      <RadarNextReadingCard
        eyebrow="Próxima leitura recomendada"
        title="A visão geral só vale como triagem; agora confirme se o sinal resiste ao espaço, ao tempo e à cobertura."
        description="Use este painel para decidir onde começar. Em seguida, valide o padrão no mapa, no histórico temporal e na cobertura da base antes de transformar a leitura em conclusão pública forte."
        caution="Ranking e última leitura sem checagem de cobertura e metodologia podem induzir simplificação indevida."
        primary={{ label: "Validar no mapa", mode: "MAP" }}
        secondary={{ label: "Abrir histórico temporal", mode: "TIME", tab: "TREND" }}
        onNavigate={onNavigate}
      />

      <RadarModeFooter
        nextStep="Próximo passo recomendado: Explore a distribuição espacial no mapa de Volta Redonda."
        primaryLabel="Ver no Mapa Interativo →"
        onPrimary={() => onNavigate("MAP")}
        onTop={onTop}
      />
    </div>
  );
}
