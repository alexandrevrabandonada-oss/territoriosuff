import { useEffect, useState } from 'react';
import { SurfaceCard } from '../BrandSystem';
import { loadIneaSummaryYear } from '../../lib/inea/summaryLoader';

const STATIONS = [
  { id: "69", name: "VR - Belmonte", shortName: "Belmonte", desc: "Região residencial próxima à divisa municipal." },
  { id: "70", name: "VR - Retiro", shortName: "Retiro", desc: "Região residencial de fluxo viário expressivo." },
  { id: "71", name: "VR - Santa Cecília", shortName: "Santa Cecília", desc: "Região residencial com perfil topográfico distinto." }
];

const POLLUTANTS_INFO = {
  "18": { name: "PM10", unit: "µg/m³" },
  "20": { name: "PM2.5", unit: "µg/m³" },
  "23": { name: "SO₂", unit: "µg/m³" },
  "3": { name: "CO", unit: "ppm" }
};

export function ParticulateTimeline2020_2026() {
  const [selectedYear, setSelectedYear] = useState<string>("2025");
  const [selectedPollutant, setSelectedPollutant] = useState<string>("18"); // 18 = PM10, 20 = PM2.5, 23 = SO2, 3 = CO
  const [selectedStation, setSelectedStation] = useState<string>("69"); // Highlighted station
  const [yearSummary, setYearSummary] = useState<any | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  const handleSelectPollutant = (pollutantId: string) => {
    setSelectedPollutant(pollutantId);
    if (pollutantId === "20") {
      const yearNum = parseInt(selectedYear);
      if (isNaN(yearNum) || yearNum < 2021) {
        setSelectedYear("2025");
      }
    }
  };

  const availableYears = selectedPollutant === "20"
    ? ["2021", "2022", "2023", "2024", "2025", "2026"]
    : ["2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026"];

  // Safeguard in case state got out of bounds
  let activeYear = selectedYear;
  if (!availableYears.includes(activeYear)) {
    activeYear = availableYears[0];
  }

  useEffect(() => {
    let cancelled = false;

    setLoadingSummary(true);
    loadIneaSummaryYear(activeYear)
      .then((data) => {
        if (!cancelled) {
          setYearSummary(data);
        }
      })
      .catch((err) => {
        console.error("Failed to load multiyear timeline summary:", err);
        if (!cancelled) {
          setYearSummary(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingSummary(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeYear]);

  const polInfo = POLLUTANTS_INFO[selectedPollutant as keyof typeof POLLUTANTS_INFO] || { name: "", unit: "" };
  const unit = polInfo.unit;

  // Max values for relative bar chart sizing
  let maxMean = 50;
  let maxExceedWHO = 100;
  let maxExceedConama = 60;
  let maxPeak = 500;

  if (selectedPollutant === "20") { // PM2.5
    maxMean = 20;
    maxExceedWHO = 100;
    maxExceedConama = 25;
    maxPeak = 250;
  } else if (selectedPollutant === "23") { // SO2
    maxMean = 40;
    maxExceedWHO = 50;
    maxExceedConama = 50;
    maxPeak = 100;
  } else if (selectedPollutant === "3") { // CO
    maxMean = 5;
    maxExceedWHO = 10;
    maxExceedConama = 200;
    maxPeak = 20;
  }

  const isInsufficient = (yr: string, stId: string) => {
    if (yr === "2021" && stId === "71") return true;
    const summaryData = yr === activeYear ? yearSummary : null;
    if (!summaryData) return false;
    const coverage = summaryData[stId]?.pollutants?.[selectedPollutant]?.coveragePct;
    return coverage !== undefined && coverage < 75 && yr !== "2026";
  };

  return (
    <div id="linha-tempo-plurianual" className="space-y-6">
      {/* 1. Header & Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-primary"></span>
            Linha do Tempo Multianual
          </h3>
          <p className="text-slate-500 text-xs mt-1">
            Histórico das estações de Volta Redonda, em comparação experimental com OMS e CONAMA 506.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap gap-2.5">
          {/* Year Buttons */}
          <div className="bg-slate-100 p-1 rounded-xl flex flex-wrap gap-1 border border-slate-200/40">
            {availableYears.map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${activeYear === yr ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {yr}{yr === "2026" ? "*" : ""}
              </button>
            ))}
          </div>

          {/* Pollutant Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200/40">
            {Object.entries(POLLUTANTS_INFO).map(([id, info]) => (
              <button
                key={id}
                onClick={() => handleSelectPollutant(id)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${selectedPollutant === id ? 'bg-brand-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {info.name}
              </button>
            ))}
          </div>

          {/* Station Selector */}
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200/40">
            {STATIONS.map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStation(st.id)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${selectedStation === st.id ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {st.shortName}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Partial Year Warning for 2026 */}
      {activeYear === "2026" && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl p-3.5 flex items-start gap-2.5 animate-pulse">
          <span className="text-amber-500 font-bold shrink-0 mt-0.5">⚠️</span>
          <div>
            <strong>Ano parcial/em andamento (acumulado até maio de 2026):</strong> Os indicadores de 2026 representam apenas os dados disponíveis e não devem ser comparados com anos completos fechados.
          </div>
        </div>
      )}

      {/* Historical Caution Warning */}
      {parseInt(activeYear) < 2020 && (
        <div className="bg-amber-50/60 border border-amber-200/60 text-amber-850 text-xs rounded-xl p-3.5 flex items-start gap-2.5">
          <span className="text-amber-500 font-bold shrink-0 mt-0.5">⚠️</span>
          <div>
            <strong>Série Histórica Reconstruída (2013–2019):</strong> Dados obtidos da plataforma histórica WebLakes do INEA. Recomenda-se a publicação com cautela. A comparação com limites de saúde pública diários é experimental e deve considerar a cobertura de dados da estação escolhida.
          </div>
        </div>
      )}

      {/* 2. Visual Comparative Charts */}
      {loadingSummary ? (
        <SurfaceCard className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-52 rounded-full bg-slate-200/80" />
            <div className="h-32 rounded-2xl bg-slate-100/90" />
            <div className="h-32 rounded-2xl bg-slate-50" />
          </div>
        </SurfaceCard>
      ) : (
      <div className="grid gap-6 md:grid-cols-2">
        {/* Card: Média Anual e Cobertura */}
        <SurfaceCard className="p-5 md:p-6 bg-white border border-slate-100 rounded-2xl space-y-5 shadow-sm">
          <div>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Exposição Crônica Anual</span>
            <h4 className="text-sm font-bold text-slate-800 mt-1">Média Anual por Estação ({activeYear}{activeYear === "2026" ? " parcial" : ""})</h4>
          </div>

          <div className="space-y-4">
            {STATIONS.map((st) => {
              const pData = yearSummary?.[st.id]?.pollutants[selectedPollutant];
              const mean = pData?.mean ?? 0;
              const widthPct = Math.min((mean / maxMean) * 100, 100);
              const isHighlighted = selectedStation === st.id;
              const isLowCoverage = isInsufficient(activeYear, st.id);

              return (
                <div key={st.id} className={`space-y-1.5 p-2 rounded-xl transition-all ${isHighlighted ? 'bg-slate-50/85 border border-slate-200/45' : ''}`}>
                  <div className="flex justify-between items-center text-xs">
                    <span className={`font-bold ${isHighlighted ? 'text-slate-900 font-extrabold' : 'text-slate-700'}`}>
                      {st.shortName}
                      {isLowCoverage && <span className="ml-1.5 px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[9px] uppercase tracking-wider">Cuidado / Cobertura Baixa</span>}
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {pData?.mean !== null && pData?.mean !== undefined ? `${pData.mean.toFixed(2)} ${unit}` : "N/A"}
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isHighlighted ? 'bg-brand-primary' : 'bg-slate-400'}`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Destaque de Picos Horários */}
          <div className="border-t border-slate-100 pt-4 space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Picos Horários Pontuais de Concentração</h4>
            <div className="space-y-4">
              {STATIONS.map((st) => {
                const pData = yearSummary?.[st.id]?.pollutants[selectedPollutant];
                const peak = pData?.max ?? 0;
                const widthPct = Math.min((peak / maxPeak) * 100, 100);
                const isHighlighted = selectedStation === st.id;

                return (
                  <div key={st.id} className={`space-y-1 p-1 rounded-lg transition-all ${isHighlighted ? 'bg-slate-50/50' : ''}`}>
                    <div className="flex justify-between items-center text-xs">
                      <span className={`font-bold ${isHighlighted ? 'text-slate-900 font-extrabold' : 'text-slate-600'}`}>{st.shortName}</span>
                      <span className="font-mono font-bold text-slate-750">
                        {pData?.max !== null && pData?.max !== undefined ? `${pData.max.toFixed(2)} ${unit}` : "N/A"}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isHighlighted ? 'bg-indigo-600' : 'bg-slate-300'}`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </SurfaceCard>

        {/* Card: Excedências Diárias e Cobertura */}
        <SurfaceCard className="p-5 md:p-6 bg-white border border-slate-100 rounded-2xl space-y-5 shadow-sm">
          <div>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Excedências e Cobertura</span>
            <h4 className="text-sm font-bold text-slate-800 mt-1">Comparação de Excedências ({activeYear}{activeYear === "2026" ? " parcial" : ""})</h4>
          </div>

          <div className="space-y-5">
            {/* OMS Exceedances */}
            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-1">
                <span className="font-black text-slate-500 uppercase tracking-wider">
                  {selectedPollutant === "18" && "Acima da Diretriz OMS 24h (>45 µg/m³)"}
                  {selectedPollutant === "20" && "Acima da Diretriz OMS 24h (>15 µg/m³)"}
                  {selectedPollutant === "23" && "Acima da Diretriz OMS 24h (>40 µg/m³)"}
                  {selectedPollutant === "3" && "Acima da Diretriz OMS 24h (>4 mg/m³)"}
                </span>
              </div>
              <div className="space-y-3">
                {STATIONS.map((st) => {
                  const pData = yearSummary?.[st.id]?.pollutants[selectedPollutant];
                  const whoExceed = pData?.exceedances?.WHO_24H ?? 0;
                  const widthPct = Math.min((whoExceed / maxExceedWHO) * 100, 100);
                  const isHighlighted = selectedStation === st.id;

                  return (
                    <div key={st.id} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className={`font-bold ${isHighlighted ? 'text-slate-900 font-extrabold' : 'text-slate-600'}`}>{st.shortName}</span>
                        <span className="font-mono font-bold text-rose-500">
                          {pData ? `${whoExceed} dias` : "N/A"}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isHighlighted ? 'bg-rose-500' : 'bg-rose-300'}`}
                          style={{ width: pData ? `${widthPct}%` : '0%' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CONAMA 506 Exceedances */}
            <div className="space-y-3.5 pt-2">
              <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-1">
                <span className="font-black text-slate-500 uppercase tracking-wider">
                  {selectedPollutant === "18" && "Acima do Padrão CONAMA 506 24h (>50 µg/m³)"}
                  {selectedPollutant === "20" && "Acima do Padrão CONAMA 506 24h (>25 µg/m³)"}
                  {selectedPollutant === "23" && "Acima do Padrão CONAMA 506 24h (>20 µg/m³)"}
                  {selectedPollutant === "3" && "Acima do Padrão CONAMA 506 8h (>9 ppm)"}
                </span>
              </div>
              <div className="space-y-3">
                {STATIONS.map((st) => {
                  const pData = yearSummary?.[st.id]?.pollutants[selectedPollutant];
                  const brExceed = pData?.exceedances?.BR_24H_FINAL ?? 0;
                  const widthPct = Math.min((brExceed / maxExceedConama) * 100, 100);
                  const isHighlighted = selectedStation === st.id;
                  const exceedLabel = selectedPollutant === "3" ? `${brExceed} horas` : `${brExceed} dias`;

                  return (
                    <div key={st.id} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className={`font-bold ${isHighlighted ? 'text-slate-900 font-extrabold' : 'text-slate-600'}`}>{st.shortName}</span>
                        <span className="font-mono font-bold text-orange-500">
                          {pData ? exceedLabel : "N/A"}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isHighlighted ? 'bg-orange-500' : 'bg-orange-300'}`}
                          style={{ width: pData ? `${widthPct}%` : '0%' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cobertura de Dados */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Cobertura de Dados Anual</h4>
              <div className="space-y-2">
                {STATIONS.map((st) => {
                  const pData = yearSummary?.[st.id]?.pollutants[selectedPollutant];
                  const coverage = pData?.coveragePct ?? 0;
                  const isHighlighted = selectedStation === st.id;

                  return (
                    <div key={st.id} className="flex items-center justify-between gap-4 text-xs">
                      <span className={`font-bold w-24 shrink-0 ${isHighlighted ? 'text-slate-900 font-extrabold' : 'text-slate-500'}`}>{st.shortName}</span>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${coverage}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-slate-700 w-12 text-right">
                        {pData ? `${pData.coveragePct.toFixed(1)}%` : "0.0%"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </SurfaceCard>
      </div>
      )}

      {/* 3. Narrative Cards (2x2 Grid) */}
      <div className="grid gap-4 sm:grid-cols-2">
        <SurfaceCard className={`p-4 border rounded-xl transition-all ${selectedStation === "69" ? 'border-amber-300 bg-amber-50/10' : 'border-slate-100 bg-white'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <h5 className="font-bold text-slate-800 text-sm">VR - Belmonte</h5>
          </div>
          <p className="text-slate-600 text-xs leading-relaxed">
            {isInsufficient(activeYear, "69") && (
              <span className="block mb-2 text-amber-800 bg-amber-50/85 border border-amber-200/40 p-2.5 rounded-lg font-semibold">
                Este recorte possui leituras públicas disponíveis, mas a cobertura anual ficou abaixo de 75%. Por isso, a média deve ser lida como média do período disponível, não como comparação anual plena.
              </span>
            )}
            {parseInt(activeYear) < 2020 ? (
              <><strong>VR - Belmonte no período histórico ({activeYear}):</strong> A estação Belmonte registrou comportamento de base importante para os poluentes clássicos, mantendo séries contínuas para PM10, SO₂ e CO.</>
            ) : activeYear === "2025" ? (
              <><strong>Em 2025, Belmonte continuou registrando níveis de atenção elevados.</strong> A estação manteve a tendência histórica, apresentando médias anuais expressivas de particulados e ultrapassagens recorrentes das diretrizes da OMS e da CONAMA 506.</>
            ) : activeYear === "2026" ? (
              <><strong>No acumulado parcial de 2026, Belmonte apresenta episódios críticos.</strong> Mesmo sendo um período parcial, a estação já demonstra uma quantidade significativa de ultrapassagens sob a métrica experimental da OMS.</>
            ) : activeYear === "2020" ? (
              <><strong>Em 2020, Belmonte registrou média anual de PM10 sob atenção.</strong> A média no período alcançou níveis que ultrapassam a recomendação de exposição de longo prazo, confirmando a criticidade histórica da área urbana próxima à usina siderúrgica.</>
            ) : (
              <><strong>Belmonte concentra os maiores sinais de atenção no período.</strong> A estação registra de forma recorrente as maiores médias anuais tanto para PM10 quanto para PM2.5, liderando as excedências diárias às diretrizes da OMS e da CONAMA 506.</>
            )}
          </p>
        </SurfaceCard>

        <SurfaceCard className={`p-4 border rounded-xl transition-all ${selectedStation === "70" ? 'border-indigo-300 bg-indigo-50/10' : 'border-slate-100 bg-white'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <h5 className="font-bold text-slate-800 text-sm">VR - Retiro</h5>
          </div>
          <p className="text-slate-600 text-xs leading-relaxed">
            {isInsufficient(activeYear, "70") && (
              <span className="block mb-2 text-amber-800 bg-amber-50/85 border border-amber-200/40 p-2.5 rounded-lg font-semibold">
                Este recorte possui leituras públicas disponíveis, mas a cobertura anual ficou abaixo de 75%. Por isso, a média deve ser lida como média do período disponível, não como comparação anual plena.
              </span>
            )}
            {parseInt(activeYear) < 2020 ? (
              <><strong>VR - Retiro no período histórico ({activeYear}):</strong> Registrou de forma experimental as médias de particulados grossos e gases, sofrendo variações pontuais decorrentes do fluxo local.</>
            ) : activeYear === "2025" ? (
              <><strong>Retiro destacou-se por picos notáveis de PM2.5 in 2025.</strong> O fluxo veicular e as condições locais contribuíram para dias de atenção concentrados, apresentando picos horários expressivos no meio do ano.</>
            ) : activeYear === "2026" ? (
              <><strong>Picos pontuais em Retiro já chamam a atenção in 2026.</strong> A análise preliminar indica eventos isolados de alta concentração nas primeiras horas do dia, necessitando de acompanhamento.</>
            ) : activeYear === "2020" ? (
              <><strong>Registros de PM10 in Retiro em 2020 apontam padrão de tráfego.</strong> A exposição diária ao material particulado grosso manteve-se correlacionada com períodos secos e de fluxo viário intenso, com picos pontuais severos.</>
            ) : (
              <><strong>Retiro aparece com episódios relevantes, especialmente em picos.</strong> A estação destaca-se por registrar picos horários pontuais de concentração de material particulado no ano, acumulando múltiplos dias de atenção.</>
            )}
          </p>
        </SurfaceCard>

        <SurfaceCard className={`p-4 border rounded-xl transition-all ${selectedStation === "71" ? 'border-teal-300 bg-teal-50/10' : 'border-slate-100 bg-white'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
            <h5 className="font-bold text-slate-800 text-sm">VR - Santa Cecília</h5>
          </div>
          <p className="text-slate-600 text-xs leading-relaxed">
            {isInsufficient(activeYear, "71") && (
              <span className="block mb-2 text-amber-800 bg-amber-50/85 border border-amber-200/40 p-2.5 rounded-lg font-semibold">
                Este recorte possui leituras públicas disponíveis, mas a cobertura anual ficou abaixo de 75%. Por isso, a média deve ser lida como média do período disponível, não como comparação anual plena.
              </span>
            )}
            {parseInt(activeYear) < 2020 ? (
              <><strong>VR - Santa Cecília no período histórico ({activeYear}):</strong> Registrou menor volume absoluto comparado ao Belmonte, porém com o comportamento de fundo típico de Volta Redonda.</>
            ) : activeYear === "2021" ? (
              <><strong>Em 2021, Santa Cecília registrou cobertura insuficiente para comparação anual plena.</strong> Este recorte possui leituras públicas disponíveis, mas a cobertura anual ficou abaixo do patamar metodológico de 75%. Por isso, a média deve ser lida como média do período disponível, não como comparação anual plena.</>
            ) : activeYear === "2025" ? (
              <><strong>Santa Cecília registrou menores índices em 2025, mas excede a OMS.</strong> A estação apresentou as menores médias do trio, contudo as diretrizes da OMS foram frequentemente ultrapassadas nos meses de seca.</>
            ) : activeYear === "2026" ? (
              <><strong>Comportamento moderado em Santa Cecília no ano de 2026.</strong> A média parcial segue abaixo das demais estações, mas dias de ultrapassagem da OMS continuam a ser computados experimentalmente.</>
            ) : activeYear === "2020" ? (
              <><strong>Santa Cecília apresentou as menores médias de PM10 em 2020.</strong> Apesar do perfil residencial com maior dispersão, a estação ainda acumulou alguns registros de ultrapassagens das diretrizes mais exigentes da OMS.</>
            ) : (
              <><strong>Santa Cecília tem menores médias, mas não ausência de atenção.</strong> Embora registre historicamente os menores índices médios anuais do trio de estações, ainda excede frequentemente as recomendações de saúde humana da OMS.</>
            )}
          </p>
        </SurfaceCard>

        <SurfaceCard className="p-4 border border-slate-100 bg-white rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <h5 className="font-bold text-slate-800 text-sm">Sazonalidade e Clima</h5>
          </div>
          <p className="text-slate-600 text-xs leading-relaxed">
            <strong>Inverno e estiagem concentram as ultrapassagens.</strong> A dispersão atmosférica desfavorável e a falta de chuva nos meses de seca elevam drasticamente o registro de dias de atenção na cidade.
          </p>
        </SurfaceCard>
      </div>

      {/* 4. Salvaguardas Metodológicas */}
      <div className="bg-slate-50 border border-slate-200 p-4.5 rounded-2xl text-slate-500 text-[11px] leading-relaxed space-y-2.5">
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <span className="w-2 h-2 rounded-full bg-slate-400" />
          Salvaguardas Metodológicas e Notas Técnicas
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2 text-[10px]">
          <div>
            • <strong>Comparação Experimental:</strong> As análises plurianuais são baseadas em dados horários públicos secundários, não constituindo emissão oficial de relatórios do órgão regulador.
          </div>
          <div>
            • <strong>Sem QA/QC Oficial Explícito:</strong> A plataforma WebLakes não fornece flags técnicas e detalhadas de controle de qualidade, sendo a limpeza de inconsistências realizada pela equipe SEMEAR de forma experimental.
          </div>
          <div>
            • <strong>Ausência de Dado Não Representa Ar Bom:</strong> Períodos com falha de transmissão ou lacuna instrumental não representam qualidade do ar em conformidade com as diretrizes.
          </div>
          <div>
            • <strong>Exposição Periódica:</strong> As leituras resumem a exposição histórica acumulada no período e não representam monitoramento ao vivo ou leitura minuto a minuto.
          </div>
        </div>
        <div className="border-t border-slate-200/60 pt-2 font-mono text-[9px] text-slate-400 text-right">
          Selo Metodológico: Dado horário público WebLakes — comparação experimental — sem QA/QC oficial explícito
        </div>
      </div>
    </div>
  );
}
