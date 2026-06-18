import { Suspense, lazy } from "react";

import { RadarPanelConfidenceNote } from "./RadarPanelConfidenceNote";
import { RadarEvidenceStateBlock } from "./RadarEvidenceStateBlock";
import { SurfaceCard } from "../../../components/BrandSystem";
import { RadarEvidenceBadge } from "./RadarEvidenceBadge";
import type {
  ControllerFrequencyItem,
  DataGapItem,
  LatestResult,
  MonthlyProfileItem,
  RadarChartPoint,
  RadarComparisonTab,
  RadarMode,
  RadarTimeseriesResponse,
  StationMetadataItem
} from "./RadarTypes";
import { RADAR_TIME_TABS } from "./RadarTypes";
import { RadarMicroguide } from "./RadarMicroguide";
import { RadarModeFooter } from "./RadarModeFooter";
import { RadarNextReadingCard } from "./RadarNextReadingCard";
import { RadarVisualNotice } from "./RadarVisualNotice";
import {
  RADAR_CONTROLLER_SHORT_LABEL,
  RADAR_EXPERIMENTAL_COMPARISON_NOTE,
  RADAR_EXPERIMENTAL_OBSERVATION_NOTE,
  RADAR_EXPERIMENTAL_OMS_CONAMA_LABEL,
  RADAR_LOW_COVERAGE_WARNING,
  RADAR_NO_DATA_NOT_CLEAN_AIR
} from "../../../data/air/radar-copy";

const AqiChart = lazy(() => import("../../../components/air/AqiChart").then((module) => ({ default: module.AqiChart })));
const AttentionEpisodesPanel = lazy(() =>
  import("../../../components/air/AttentionEpisodesPanel").then((module) => ({ default: module.AttentionEpisodesPanel }))
);
const IneaHistoricalTimeline = lazy(() =>
  import("../../../components/air/IneaHistoricalTimeline").then((module) => ({ default: module.IneaHistoricalTimeline }))
);
const ParticulateTimeline2020_2026 = lazy(() =>
  import("../../../components/air/ParticulateTimeline2020_2026").then((module) => ({ default: module.ParticulateTimeline2020_2026 }))
);
const ThresholdComparisonPanel = lazy(() =>
  import("../../../components/air/ThresholdComparisonPanel").then((module) => ({ default: module.ThresholdComparisonPanel }))
);
const YearExplorer = lazy(() => import("../../../components/air/YearExplorer").then((module) => ({ default: module.YearExplorer })));

function RadarPanelLoadingFallback() {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5 shadow-xs">
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-40 rounded-full bg-slate-200/80" />
        <div className="h-24 rounded-[1rem] bg-slate-200/70" />
        <div className="h-24 rounded-[1rem] bg-slate-100/90" />
      </div>
    </div>
  );
}

interface RadarTimeModeProps {
  comparisonTab: RadarComparisonTab;
  setComparisonTab: (tab: RadarComparisonTab) => void;
  chartPoints: RadarChartPoint[];
  controllerFreq: ControllerFrequencyItem[];
  dataGaps: DataGapItem[];
  latestData: LatestResult[];
  latestIngestedAt: string | null | undefined;
  monthlyProfile: MonthlyProfileItem[];
  selectedStationMetadata: StationMetadataItem | null;
  selectedStationChart: string;
  setSelectedStationChart: (stationId: string) => void;
  timeseriesMeta: Pick<RadarTimeseriesResponse, "limit" | "total" | "truncated"> | null;
  onNavigate: (mode: RadarMode, tab?: RadarComparisonTab) => void;
  onTop: () => void;
}

export function RadarTimeMode({
  comparisonTab,
  setComparisonTab,
  chartPoints,
  controllerFreq,
  dataGaps,
  latestData,
  latestIngestedAt,
  monthlyProfile,
  selectedStationMetadata,
  selectedStationChart,
  setSelectedStationChart,
  timeseriesMeta,
  onNavigate,
  onTop
}: RadarTimeModeProps) {
  const formatWindowDate = (value?: string | null) => {
    if (!value) return "-";
    const parsed = new Date(`${value}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString("pt-BR");
  };

  const nextReadingByTab: Record<
    RadarComparisonTab,
    {
      title: string;
      description: string;
      caution: string;
      primary: { label: string; mode: RadarMode; tab?: RadarComparisonTab };
      secondary: { label: string; mode: RadarMode; tab?: RadarComparisonTab };
    }
  > = {
    TREND: {
      title: "Depois da tendência, verifique se o que você leu não está distorcido por silêncio de dados.",
      description:
        "A série histórica explica ritmo e persistência, mas a aba de cobertura mostra se houve monitoramento suficiente para sustentar comparação justa entre anos e estações.",
      caution: "Tendência sem checagem de cobertura pode exagerar ou esconder padrão real.",
      primary: { label: "Abrir cobertura", mode: "TIME", tab: "COVERAGE" },
      secondary: { label: "Cruzar com território", mode: "TERRITORY" }
    },
    EXCEEDANCE: {
      title: "Depois dos episódios de atenção, veja quem estava mais exposto e onde o monitoramento falhou.",
      description:
        "Excedência ajuda na pressão pública, mas ela ganha densidade quando é lida junto com vulnerabilidade territorial e com a cobertura real das estações.",
      caution: "Um episódio forte não descreve sozinho todo o risco do território.",
      primary: { label: "Ver territórios", mode: "TERRITORY" },
      secondary: { label: "Checar cobertura", mode: "TIME", tab: "COVERAGE" }
    },
    COVERAGE: {
      title: "Depois de medir o silêncio da base, volte ao território e à metodologia com mais rigor.",
      description:
        "Agora você já sabe onde a leitura pública é mais frágil. O próximo passo é usar isso para priorizar bairros sensíveis e para interpretar os outros painéis com a cautela correta.",
      caution: "Cobertura insuficiente reduz confiança analítica, mas não reduz a importância pública do território.",
      primary: { label: "Cruzar com território", mode: "TERRITORY" },
      secondary: { label: "Abrir metodologia", mode: "METHODOLOGY" }
    }
  };

  const nextReading = nextReadingByTab[comparisonTab];

  return (
    <div className="animate-fade-in space-y-8 pt-4">
      <div className="space-y-2 border-b border-slate-200 pb-5">
        <h2 className="flex items-center gap-2 text-xl font-black tracking-tight text-slate-800">
          <span>⏱️ Histórico Temporal & Tendências</span>
        </h2>
        <p className="text-sm font-medium text-slate-600">
          Compare e explore o comportamento de poeiras (PM10, PM2.5) e gases (SO₂, CO) no tempo através de múltiplas análises agrupadas por modo.
        </p>
        <p className="text-xs font-bold text-brand-primary">
          💡 Este modo responde: Como a qualidade do ar variou ao longo dos anos, meses e dias dentro da base pública disponível, e em quais períodos apareceram os sinais mais fortes de atenção?
        </p>
        <RadarEvidenceBadge
          level="experimental"
          label="Leitura histórica experimental"
          detail="útil para tendência e sazonalidade, com cautela sobre cobertura e ausência de QA/QC oficial explícito por registro"
        />
      </div>

      <RadarMicroguide
        whatYouSee="Gráficos de tendências plurianuais, linhas do tempo de poluentes e estatísticas de excedência aos limites regulamentares."
        howToRead="Use as subabas para alternar entre a evolução dos poluentes ao longo dos anos, os episódios em que as metas da OMS/CONAMA foram ultrapassadas, e a cobertura/lacunas instrumentais de cada estação."
        whyItMatters="Ajuda a identificar se a qualidade do ar está melhorando ou piorando no longo prazo e se o silêncio de dados impede uma avaliação justa."
      />

      <div className="grid gap-3 md:grid-cols-3">
        <RadarEvidenceStateBlock
          state="partial"
          description="A leitura temporal já se apoia em série pública ampla e comparações úteis, mas continua dependente de cobertura suficiente e de ausência de truncamento relevante."
        />
        <RadarEvidenceStateBlock
          state="partial"
          description={`OMS e CONAMA fortalecem a leitura pública, mas a cadeia atual ainda não equivale a ${RADAR_EXPERIMENTAL_OBSERVATION_NOTE}.`}
        />
        <RadarEvidenceStateBlock
          state="published"
          description="Cobertura, lacunas e janela esperada já formam um dos blocos mais auditáveis do Radar para medir onde a observação pública falhou."
        />
      </div>

      <div className="space-y-8">
        <div className="no-scrollbar mb-2 flex overflow-x-auto border-b border-slate-200 pb-px">
          {RADAR_TIME_TABS.map((tab) => {
            const isActive = comparisonTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setComparisonTab(tab.id)}
                className={`-mb-px flex shrink-0 cursor-pointer items-center gap-2 border-b-2 px-4 py-3 text-xs font-black transition-all ${
                  isActive
                    ? "border-emerald-600 text-emerald-800"
                    : "border-transparent text-slate-500 hover:border-slate-200 hover:text-slate-700"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {comparisonTab === "TREND" && (
          <div className="space-y-10">
            <section id="anos" className="space-y-6">
              <RadarPanelConfidenceNote
                title="Força da inferência temporal"
                summary="A aba de tendência é boa para ritmo, persistência e comparação histórica inicial. Ela perde força quando a cobertura entre estações e anos não é homogênea ou quando a janela operacional ainda depende de inferência."
                level="experimental"
                truncated={false}
              />
              <Suspense fallback={<RadarPanelLoadingFallback />}>
                <YearExplorer />
              </Suspense>
            </section>

            <section id="timeline-plurianual" className="space-y-6 border-t border-slate-100 pt-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-lg font-black text-slate-800">Série histórica ampliada 2013–2026</h2>
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-900 shadow-xs">
                    Alguns anos possuem cobertura insuficiente para comparação anual plena.
                  </span>
                  <RadarEvidenceBadge level="experimental" detail="série pública ampliada, ainda dependente da cobertura instrumental disponível" />
                </div>
                <p className="text-xs font-semibold leading-relaxed text-slate-500">
                  Veja como PM10, SO₂ e CO (2013–2026) e PM2.5 (2021–2026) se comportaram nas estações de Volta Redonda, ano a ano, em {RADAR_EXPERIMENTAL_OMS_CONAMA_LABEL}, sem tratar a série como completude homogênea.
                </p>
              </div>
              <Suspense fallback={<RadarPanelLoadingFallback />}>
                <ParticulateTimeline2020_2026 />
              </Suspense>
            </section>

            <section id="historia" className="space-y-6 border-t border-slate-100 pt-4">
              <div className="space-y-2">
                <h2 className="text-lg font-black text-slate-800">A linha do tempo da base pública</h2>
                <p className="max-w-3xl text-xs font-semibold leading-relaxed text-slate-500">
                  A linha mostra o período coberto pela base pública disponível, não todo o histórico possível de monitoramento.
                </p>
                <RadarEvidenceBadge level="strong" label="Cobertura observada" detail="esta visualização mostra o que está publicado na base atual do portal" />
              </div>

              <Suspense fallback={<RadarPanelLoadingFallback />}>
                <IneaHistoricalTimeline lastIngestedAt={latestIngestedAt} />
              </Suspense>

              {latestData.length > 0 && (
                <SurfaceCard className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <strong className="block text-xs font-black uppercase tracking-widest text-slate-400">Gráfico de Série Histórica do Índice Geral IQAr</strong>
                      <p className="text-[11px] text-slate-400">Acompanhe a variação diária registrada por estação física.</p>
                    </div>
                    <div>
                      <select
                        value={selectedStationChart}
                        onChange={(e) => setSelectedStationChart(e.target.value)}
                        className="cursor-pointer rounded-xl border border-slate-200 bg-white p-2 text-xs font-bold text-slate-700 outline-none focus:border-brand-primary"
                      >
                        {latestData.map((d) => (
                          <option key={d.station.id} value={d.station.id}>
                            {d.station.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <RadarPanelConfidenceNote
                    title="Leitura histórica por estação"
                    summary="Este gráfico é forte para tendência pública quando a estação já tem janela operacional explícita. Se a janela ainda for inferida, a leitura segue útil, mas com cautela adicional sobre cobertura e comparabilidade."
                    level={selectedStationMetadata?.operation_window.is_inferred ? "experimental" : "strong"}
                    stationMetadata={selectedStationMetadata}
                    truncated={Boolean(timeseriesMeta?.truncated)}
                  />

                  <Suspense fallback={<RadarPanelLoadingFallback />}>
                    <AqiChart data={chartPoints} />
                  </Suspense>
                  {timeseriesMeta?.truncated && (
                    <RadarVisualNotice
                      type="warning"
                      title="Histórico parcial nesta visualização"
                      description={`Este gráfico mostra ${timeseriesMeta.limit.toLocaleString("pt-BR")} pontos de ${timeseriesMeta.total.toLocaleString("pt-BR")} disponíveis para a estação selecionada. Use recortes por período para leitura completa sem truncamento silencioso.`}
                    />
                  )}
                </SurfaceCard>
              )}
            </section>
          </div>
        )}

        {comparisonTab === "EXCEEDANCE" && (
          <div className="space-y-10">
            <section id="episodios" className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-lg font-black text-slate-800">Episódios de atenção</h2>
                <p className="text-xs font-semibold leading-relaxed text-slate-500">
                  Veja quando PM10 e PM2.5 mais se destacaram na série pública respondida, por ano, mês, estação e régua de comparação.
                </p>
                <RadarEvidenceBadge level="experimental" detail="episódios dependem de cobertura diária mínima e comparação experimental OMS/CONAMA" />
              </div>
              <RadarPanelConfidenceNote
                title="Força da inferência dos episódios"
                summary="Os episódios ajudam a localizar momentos de pressão ambiental e a sustentar cobrança pública. Eles não descrevem sozinhos exposição contínua, risco territorial acumulado ou causalidade específica."
                level="experimental"
                truncated={false}
              />
              <Suspense fallback={<RadarPanelLoadingFallback />}>
                <AttentionEpisodesPanel />
              </Suspense>
            </section>

            <section id="comparar" className="space-y-6 border-t border-slate-100 pt-4">
              <RadarPanelConfidenceNote
                title="Comparação com OMS e CONAMA"
                summary={`Esta comparação é metodologicamente útil para pressão pública e leitura regulatória, mas continua experimental quando ${RADAR_EXPERIMENTAL_COMPARISON_NOTE.toLowerCase()}`}
                level="experimental"
                truncated={false}
              />
              <Suspense fallback={<RadarPanelLoadingFallback />}>
                <ThresholdComparisonPanel />
              </Suspense>
            </section>

            <section id="alertas" className="space-y-6 border-t border-slate-100 pt-4">
              <div className="space-y-2">
                <h2 className="text-lg font-black text-slate-800">Quando o alerta apareceu</h2>
                <p className="max-w-3xl text-xs font-semibold leading-relaxed text-slate-600">
                  Aqui não estamos dizendo que o ar foi ruim todos os dias. Estamos mostrando, entre os dias com registro disponível, quando a classificação apareceu como MODERADA ou pior.
                </p>
                <RadarEvidenceBadge level="interpretive" label="Leitura de triagem" detail="interpretação pública dos dias medidos; silêncio de dados não equivale a condição boa" />
              </div>

              {monthlyProfile.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-xs font-bold leading-relaxed text-slate-500 shadow-xs">
                  Não foi possível carregar esta análise agora. A explicação metodológica e os links continuam disponíveis.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {monthlyProfile.map((m) => (
                      <div key={m.month} className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4 shadow-xs">
                        <div className="flex items-center justify-between text-xs">
                          <strong className="font-extrabold text-slate-800">{m.month_name}</strong>
                          <span className="rounded border border-amber-200/40 bg-amber-50 px-2 py-0.5 text-[10px] font-black text-amber-900">
                            {m.degraded_percent_of_measured_days}%
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                          <div style={{ width: `${m.degraded_percent_of_measured_days}%` }} className="h-full rounded-full bg-amber-500" />
                        </div>
                        <span className="block text-[9px] font-semibold text-slate-400">
                          {m.degraded_days} dias de atenção entre {m.measured_days} dias medidos
                        </span>
                      </div>
                    ))}
                  </div>
                  <RadarVisualNotice
                    type="warning"
                    title="Ressalva Metodológica"
                    description={RADAR_LOW_COVERAGE_WARNING}
                  />
                </div>
              )}
            </section>

            <section id="controladores" className="space-y-6 border-t border-slate-100 pt-4">
              <div className="space-y-2">
                <h2 className="text-lg font-black text-slate-800">Quem puxou o índice</h2>
                <p className="text-xs font-semibold leading-relaxed text-slate-600">
                  {RADAR_CONTROLLER_SHORT_LABEL}
                </p>
                <RadarEvidenceBadge level="experimental" detail="o controlador ajuda na leitura de mistura atmosférica, não substitui atribuição causal fechada" />
              </div>

              {controllerFreq.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-xs font-bold leading-relaxed text-slate-500 shadow-xs">
                  Não foi possível carregar esta análise agora. A explicação metodológica e os links continuam disponíveis.
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="flex flex-col justify-center space-y-4">
                    {controllerFreq.map((item) => (
                      <div key={item.pollutant} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <strong className="font-extrabold text-slate-700">{item.pollutant}</strong>
                          <span className="font-semibold text-slate-500">
                            {item.count} registros ({item.percentage}%)
                          </span>
                        </div>
                        <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div style={{ width: `${item.percentage}%` }} className="h-full rounded-full bg-emerald-500 transition-all duration-500" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col justify-center space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-xs">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">Por que isso importa?</h4>
                    <p className="text-[11px] font-semibold leading-relaxed text-slate-600">
                      Saber qual poluente é o "controlador" ajuda a identificar qual componente mais pesou no índice público. Frequências altas de SO₂ ou materiais particulados podem sugerir padrões compatíveis com processos industriais e poeiras urbanas, mas não equivalem sozinhas a atribuição causal fechada.
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {comparisonTab === "COVERAGE" && (
          <div className="space-y-10">
            <section id="lacunas" className="space-y-6">
              <div className="space-y-3">
                <h2 className="text-lg font-black text-slate-800">Onde a série fica em silêncio</h2>
                <div className="flex flex-col gap-2">
                  <strong className="block text-xl font-black tracking-tight text-amber-700 md:text-2xl">
                    {`"${RADAR_NO_DATA_NOT_CLEAN_AIR}"`}
                  </strong>
                  <p className="text-xs font-semibold leading-relaxed text-slate-600">
                    Quando a estação fica sem registro público, a população perde o direito de acompanhar o que respirou naquele período.
                  </p>
                  <RadarEvidenceBadge level="strong" label="Regra transversal do Radar" detail="lacuna de dado é perda de monitoramento, não melhora implícita da qualidade do ar" />
                </div>
              </div>

              <RadarPanelConfidenceNote
                title="Cobertura e silêncio de dados"
                summary="Este é um dos blocos mais defensáveis do Radar, porque ele mede presença ou ausência de observação e explicita quando a janela esperada ainda depende de inferência controlada."
                level="strong"
                truncated={false}
              />

              {dataGaps.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-xs font-bold leading-relaxed text-slate-500 shadow-xs">
                  Não foi possível carregar esta análise agora. A explicação metodológica e os links continuam disponíveis.
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {dataGaps.map((gap) => (
                      <div key={gap.station_id} className="flex flex-col justify-between space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4 shadow-xs">
                        <div>
                          <strong className="block text-xs font-extrabold text-slate-800">{gap.station_name}</strong>
                          <span className="mt-0.5 block text-[9px] font-bold text-slate-400">Cobertura: {gap.coverage_percent}%</span>
                          {gap.window_is_inferred && (
                            <span className="mt-1 inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-amber-800">
                              janela esperada inferida
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 pt-2">
                          <div className="flex justify-between gap-3 text-[10px] font-semibold text-slate-600">
                            <span>Janela esperada:</span>
                            <strong className="text-right text-slate-800">
                              {formatWindowDate(gap.expected_start_date)} - {formatWindowDate(gap.expected_end_date)}
                            </strong>
                          </div>
                          <div className="flex justify-between text-[10px] font-semibold text-slate-600">
                            <span>Lacunas &gt; 24h:</span>
                            <strong className="text-slate-800">{gap.gap_count} ocorrências</strong>
                          </div>
                          <div className="flex justify-between text-[10px] font-semibold text-slate-600">
                            <span>Maior Lacuna:</span>
                            <strong className="text-amber-800">{gap.max_gap_hours} horas</strong>
                          </div>
                          {gap.operation_window_source && (
                            <div className="rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-[9px] font-semibold leading-relaxed text-slate-500">
                              Base da janela: {gap.operation_window_source}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <RadarVisualNotice
                    type="warning"
                    title="Cobertura de Dados"
                    description={`${RADAR_LOW_COVERAGE_WARNING} Quando a janela esperada estiver inferida, ela ainda precisa ser substituída por metadata operacional explícita da estação; quando houver fonte exibida, a janela já possui lastro técnico/editorial.`}
                  />
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      <RadarNextReadingCard
        eyebrow="Próxima leitura recomendada"
        title={nextReading.title}
        description={nextReading.description}
        caution={nextReading.caution}
        primary={nextReading.primary}
        secondary={nextReading.secondary}
        onNavigate={onNavigate}
      />

      <RadarModeFooter
        nextStep="Próximo passo recomendado: Analise o cruzamento de vulnerabilidade territorial e exposição social."
        primaryLabel="Ver Exposição Territorial →"
        onPrimary={() => onNavigate("TERRITORY")}
        onTop={onTop}
      />
    </div>
  );
}
