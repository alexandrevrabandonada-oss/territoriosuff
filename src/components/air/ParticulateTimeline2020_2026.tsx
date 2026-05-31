import { useState } from 'react';
import { SurfaceCard } from '../BrandSystem';
import summary2020 from '../../../data/inea_weblakes_normalized/summary-2020.json';
import summary2021 from '../../../data/inea_weblakes_normalized/summary-2021.json';
import summary2022 from '../../../data/inea_weblakes_normalized/summary-2022.json';
import summary2023 from '../../../data/inea_weblakes_normalized/summary-2023.json';
import summary2024 from '../../../data/inea_weblakes_normalized/summary-2024.json';
import summary2025 from '../../../data/inea_weblakes_normalized/summary-2025.json';
import summary2026 from '../../../data/inea_weblakes_normalized/summary-2026.json';

const SUMMARIES: Record<string, any> = {
  "2020": summary2020,
  "2021": summary2021,
  "2022": summary2022,
  "2023": summary2023,
  "2024": summary2024,
  "2025": summary2025,
  "2026": summary2026
};

const STATIONS = [
  { id: "69", name: "VR - Belmonte", shortName: "Belmonte", desc: "Região residencial próxima à divisa municipal." },
  { id: "70", name: "VR - Retiro", shortName: "Retiro", desc: "Região residencial de fluxo viário expressivo." },
  { id: "71", name: "VR - Santa Cecília", shortName: "Santa Cecília", desc: "Região residencial com perfil topográfico distinto." }
];

export function ParticulateTimeline2020_2026() {
  const [selectedYear, setSelectedYear] = useState<string>("2025");
  const [selectedPollutant, setSelectedPollutant] = useState<string>("18"); // 18 = PM10, 20 = PM2.5
  const [selectedStation, setSelectedStation] = useState<string>("69"); // Highlighted station

  const yearSummary = SUMMARIES[selectedYear];
  const isPM10 = selectedPollutant === "18";
  const unit = "µg/m³";

  // Max values for relative bar chart sizing
  const maxMean = isPM10 ? 50 : 20;
  const maxExceedWHO = isPM10 ? 100 : 100;
  const maxExceedConama = isPM10 ? 60 : 25;
  const maxPeak = isPM10 ? 500 : 250;

  return (
    <div id="linha-tempo-plurianual" className="space-y-6">
      {/* 1. Header & Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-primary"></span>
            Linha do Tempo 2020–2026
          </h3>
          <p className="text-slate-500 text-xs mt-1">
            Veja como PM10 e PM2.5 se comportaram nas estações de Volta Redonda, ano a ano, em comparação experimental com OMS e CONAMA 506.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap gap-2.5">
          {/* Year Buttons */}
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200/40">
            {["2020", "2021", "2022", "2023", "2024", "2025", "2026"].map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${selectedYear === yr ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {yr}{yr === "2026" ? "*" : ""}
              </button>
            ))}
          </div>

          {/* Pollutant Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200/40">
            <button
              onClick={() => setSelectedPollutant("18")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${isPM10 ? 'bg-brand-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              PM10
            </button>
            <button
              onClick={() => setSelectedPollutant("20")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${!isPM10 ? 'bg-brand-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              PM2.5
            </button>
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
      {selectedYear === "2026" && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl p-3.5 flex items-start gap-2.5 animate-pulse">
          <span className="text-amber-500 font-bold shrink-0 mt-0.5">⚠️</span>
          <div>
            <strong>Ano parcial/em andamento (acumulado até maio de 2026):</strong> Os indicadores de 2026 representam apenas os dados disponíveis e não devem ser comparados com anos completos fechados.
          </div>
        </div>
      )}

      {/* 2020 PM2.5 Warning */}
      {selectedYear === "2020" && !isPM10 && (
        <div className="bg-slate-50 border border-slate-200 text-slate-600 text-xs rounded-xl p-3.5 flex items-start gap-2.5">
          <span className="text-slate-400 font-bold shrink-0 mt-0.5">ℹ️</span>
          <div>
            <strong>Sensor PM2.5 indisponível em 2020:</strong> Não há dados públicos disponíveis de PM2.5 para 2020 na plataforma INEA/WebLakes segundo a matriz de disponibilidade. Os gráficos abaixo refletem a ausência de dados para esse poluente no período.
          </div>
        </div>
      )}

      {/* 2021 Santa Cecília Warning */}
      {selectedYear === "2021" && (selectedStation === "71" || selectedStation === "all") && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl p-3.5 flex items-start gap-2.5">
          <span className="text-amber-500 font-bold shrink-0 mt-0.5">⚠️</span>
          <div>
            <strong>Cobertura insuficiente para comparação anual plena (Santa Cecília - 2021):</strong> Este recorte possui leituras públicas disponíveis, mas a cobertura anual ficou abaixo do patamar metodológico de 75% ({isPM10 ? "PM10: 74.2%" : "PM2.5: 71.2%"}). Por isso, a média deve ser lida como média do período disponível, não como comparação anual plena.
          </div>
        </div>
      )}

      {/* 2. Visual Comparative Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Card: Média Anual e Cobertura */}
        <SurfaceCard className="p-5 md:p-6 bg-white border border-slate-100 rounded-2xl space-y-5 shadow-sm">
          <div>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Exposição Crônica Anual</span>
            <h4 className="text-sm font-bold text-slate-800 mt-1">Média Anual por Estação ({selectedYear}{selectedYear === "2026" ? " parcial" : ""})</h4>
          </div>

          <div className="space-y-4">
            {STATIONS.map((st) => {
              const pData = yearSummary[st.id]?.pollutants[selectedPollutant];
              const mean = pData?.mean ?? 0;
              const widthPct = Math.min((mean / maxMean) * 100, 100);
              const isHighlighted = selectedStation === st.id;

              const isInsufficient = selectedYear === "2021" && st.id === "71";

              return (
                <div key={st.id} className={`space-y-1.5 p-2 rounded-xl transition-all ${isHighlighted ? 'bg-slate-50/85 border border-slate-200/45' : ''}`}>
                  <div className="flex justify-between items-center text-xs">
                    <span className={`font-bold ${isHighlighted ? 'text-slate-900 font-extrabold' : 'text-slate-700'}`}>
                      {st.shortName}
                      {isInsufficient && <span className="ml-1.5 px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[9px] uppercase tracking-wider">Insuficiente</span>}
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {pData?.mean !== null && pData?.mean !== undefined ? `${pData.mean.toFixed(2)} ${unit}${isInsufficient ? " *" : ""}` : "N/A"}
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
                const pData = yearSummary[st.id]?.pollutants[selectedPollutant];
                const peak = pData?.max ?? 0;
                const widthPct = Math.min((peak / maxPeak) * 100, 100);
                const isHighlighted = selectedStation === st.id;

                return (
                  <div key={st.id} className={`space-y-1 p-1 rounded-lg transition-all ${isHighlighted ? 'bg-slate-50/50' : ''}`}>
                    <div className="flex justify-between items-center text-xs">
                      <span className={`font-bold ${isHighlighted ? 'text-slate-900 font-extrabold' : 'text-slate-650'}`}>{st.shortName}</span>
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

          {selectedYear === "2021" && (
            <div className="text-[10px] text-amber-600 font-semibold mt-2.5 border-t border-slate-100 pt-2.5">
              * Santa Cecília possui cobertura anual insuficiente (&lt;75%) em 2021. A média mostrada representa apenas o período disponível, não comparação anual plena.
            </div>
          )}
        </SurfaceCard>

        {/* Card: Excedências Diárias e Cobertura */}
        <SurfaceCard className="p-5 md:p-6 bg-white border border-slate-100 rounded-2xl space-y-5 shadow-sm">
          <div>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Excedências e Cobertura</span>
            <h4 className="text-sm font-bold text-slate-800 mt-1">Comparação de Dias Acima do Recomendado ({selectedYear}{selectedYear === "2026" ? " parcial" : ""})</h4>
          </div>

          <div className="space-y-5">
            {/* OMS Exceedances */}
            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-1">
                <span className="font-black text-slate-500 uppercase tracking-wider">Acima da Diretriz OMS 24h ({isPM10 ? ">45" : ">15"} {unit})</span>
              </div>
              <div className="space-y-3">
                {STATIONS.map((st) => {
                  const pData = yearSummary[st.id]?.pollutants[selectedPollutant];
                  const whoExceed = pData?.exceedances?.WHO_24H ?? 0;
                  const widthPct = Math.min((whoExceed / maxExceedWHO) * 100, 100);
                  const isHighlighted = selectedStation === st.id;
                  const isInsufficient = selectedYear === "2021" && st.id === "71";

                  return (
                    <div key={st.id} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className={`font-bold ${isHighlighted ? 'text-slate-900 font-extrabold' : 'text-slate-600'}`}>
                          {st.shortName}
                          {isInsufficient && <span className="ml-1.5 text-amber-600 font-extrabold text-[10px]" title="Cobertura de dados insuficiente para o ano">*</span>}
                        </span>
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
                <span className="font-black text-slate-500 uppercase tracking-wider">Acima do Padrão CONAMA 506 24h ({isPM10 ? ">50" : ">25"} {unit})</span>
              </div>
              <div className="space-y-3">
                {STATIONS.map((st) => {
                  const pData = yearSummary[st.id]?.pollutants[selectedPollutant];
                  const brExceed = pData?.exceedances?.BR_24H_FINAL ?? 0;
                  const widthPct = Math.min((brExceed / maxExceedConama) * 100, 100);
                  const isHighlighted = selectedStation === st.id;
                  const isInsufficient = selectedYear === "2021" && st.id === "71";

                  return (
                    <div key={st.id} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className={`font-bold ${isHighlighted ? 'text-slate-900 font-extrabold' : 'text-slate-600'}`}>
                          {st.shortName}
                          {isInsufficient && <span className="ml-1.5 text-amber-600 font-extrabold text-[10px]" title="Cobertura de dados insuficiente para o ano">*</span>}
                        </span>
                        <span className="font-mono font-bold text-orange-500">
                          {pData ? `${brExceed} dias` : "N/A"}
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
                  const pData = yearSummary[st.id]?.pollutants[selectedPollutant];
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

          {selectedYear === "2021" && (
            <div className="text-[10px] text-amber-600 font-semibold mt-2.5 border-t border-slate-100 pt-2.5">
              * Santa Cecília possui cobertura anual insuficiente (&lt;75%) em 2021. Picos e excedências válidas são mostrados, mas a comparação anual crônica da média está sob ressalva.
            </div>
          )}
        </SurfaceCard>
      </div>

      {/* 3. Narrative Cards (2x2 Grid) */}
      <div className="grid gap-4 sm:grid-cols-2">
        <SurfaceCard className={`p-4 border rounded-xl transition-all ${selectedStation === "69" ? 'border-amber-300 bg-amber-50/10' : 'border-slate-100 bg-white'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <h5 className="font-bold text-slate-800 text-sm">VR - Belmonte</h5>
          </div>
          <p className="text-slate-600 text-xs leading-relaxed">
            {selectedYear === "2025" ? (
              <><strong>Em 2025, Belmonte continuou registrando níveis de atenção elevados.</strong> A estação manteve a tendência histórica, apresentando médias anuais expressivas de particulados e ultrapassagens recorrentes das diretrizes da OMS e da CONAMA 506.</>
            ) : selectedYear === "2026" ? (
              <><strong>No acumulado parcial de 2026, Belmonte apresenta episódios críticos.</strong> Mesmo sendo um período parcial, a estação já demonstra uma quantidade significativa de ultrapassagens sob a métrica experimental da OMS.</>
            ) : selectedYear === "2020" ? (
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
            {selectedYear === "2025" ? (
              <><strong>Retiro destacou-se por picos notáveis de PM2.5 em 2025.</strong> O fluxo veicular e as condições locais contribuíram para dias de atenção concentrados, apresentando picos horários expressivos no meio do ano.</>
            ) : selectedYear === "2026" ? (
              <><strong>Picos pontuais em Retiro já chamam a atenção em 2026.</strong> A análise preliminar indica eventos isolados de alta concentração nas primeiras horas do dia, necessitando de acompanhamento.</>
            ) : selectedYear === "2020" ? (
              <><strong>Registros de PM10 em Retiro em 2020 apontam padrão de tráfego.</strong> A exposição diária ao material particulado grosso manteve-se correlacionada com períodos secos e de fluxo viário intenso, com picos pontuais severos.</>
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
            {selectedYear === "2021" ? (
              <><strong>Em 2021, Santa Cecília registrou cobertura insuficiente para comparação anual plena ({isPM10 ? "PM10: 74.2%" : "PM2.5: 71.2%"}).</strong> Este recorte possui leituras públicas disponíveis, mas a cobertura anual ficou abaixo do patamar metodológico de 75%. Por isso, a média deve ser lida como média do período disponível, não como comparação anual plena.</>
            ) : selectedYear === "2025" ? (
              <><strong>Santa Cecília registrou menores índices em 2025, mas excede a OMS.</strong> A estação apresentou as menores médias do trio, contudo as diretrizes da OMS foram frequentemente ultrapassadas nos meses de seca.</>
            ) : selectedYear === "2026" ? (
              <><strong>Comportamento moderado em Santa Cecília no ano de 2026.</strong> A média parcial segue abaixo das demais estações, mas dias de ultrapassagem da OMS continuam a ser computados experimentalmente.</>
            ) : selectedYear === "2020" ? (
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
            <strong>Inverno e estiagem concentram as ultrapassagens experimentais.</strong> A dispersão atmosférica desfavorável e a falta de chuva nos meses de seca elevam drasticamente o registro de dias de atenção na cidade.
          </p>
        </SurfaceCard>
      </div>

      {/* 4. Salvaguardas Metodológicas */}
      <div className="bg-slate-50 border border-slate-150 p-4.5 rounded-2xl text-slate-500 text-[11px] leading-relaxed space-y-2.5">
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
        <div className="border-t border-slate-200/60 pt-2 font-mono text-[9px] text-slate-450 text-right">
          Selo Metodológico: Dado horário público WebLakes — comparação experimental — sem QA/QC oficial explícito
        </div>
      </div>
    </div>
  );
}
