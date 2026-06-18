import { useEffect, useMemo, useState } from 'react';
import { SurfaceCard } from '../BrandSystem';
import { SITES, PARAMETERS } from '../../lib/inea/weblakesDictionary';
import { THRESHOLDS } from '../../lib/air/thresholds';
import { AUDIT_MODE_2024 } from '../../lib/inea/auditFlags';
import seedFindings from '../../../data/inea_historical_sources/seed-public-findings.json';
import { loadIneaSummaryYear, type SummaryPayload } from '../../lib/inea/summaryLoader';
import { RADAR_EXPERIMENTAL_COMPARISON_NOTE } from '../../data/air/radar-copy';
import { useRadarReleaseMetadata } from '../../data/air/useRadarReleaseMetadata';
import { RadarEvidenceStateBlock } from '../../pages/air/radar/RadarEvidenceStateBlock';

export function ThresholdComparisonPanel() {
  const releaseMetadata = useRadarReleaseMetadata();
  const [selectedPollutantId, setSelectedPollutantId] = useState<string>("18"); // Default PM10
  const [selectedStationId, setSelectedStationId] = useState<string>("70"); // Default Retiro
  const [selectedYear, setSelectedYear] = useState<string>("2024"); // Default 2024
  const [summary, setSummary] = useState<SummaryPayload | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const isInsufficient = selectedYear === "2021" && selectedStationId === "71";

  useEffect(() => {
    let cancelled = false;
    const requiresSummary = ["2020", "2021", "2022", "2023", "2024", "2025", "2026"].includes(selectedYear);

    if (!requiresSummary) {
      setSummary(null);
      setLoadingSummary(false);
      return () => {
        cancelled = true;
      };
    }

    setLoadingSummary(true);
    loadIneaSummaryYear(selectedYear)
      .then((data) => {
        if (!cancelled) {
          setSummary(data);
        }
      })
      .catch((err) => {
        console.error("Failed to load threshold comparison summary:", err);
        if (!cancelled) {
          setSummary(null);
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
  }, [selectedYear]);


  // Get active pollutant and station info
  const activePollutant = PARAMETERS[selectedPollutantId] ?? PARAMETERS["18"];
  const activeStationName = SITES[selectedStationId]?.name || "Estação";

  // Filter thresholds for active pollutant
  const activeThresholds = useMemo(() => {
    return THRESHOLDS.filter(t => t.pollutant === activePollutant.pollutant);
  }, [activePollutant.pollutant]);

  // Extract observed data for selection
  const observedData = useMemo(() => {
    if (summary) {
      if (selectedPollutantId !== "18" && selectedPollutantId !== "20") return null;
      const stationData = summary[selectedStationId];
      const pData = stationData?.pollutants[selectedPollutantId];
      if (pData && pData.totalHours > 0) {
        return {
          mean: pData.mean,
          max: pData.max,
          exceedancesWho: pData.exceedances?.WHO_24H ?? 0,
          exceedancesBr: pData.exceedances?.BR_24H_FINAL ?? 0,
          unit: pData.unit,
          tier: "RAW_PUBLIC_PLATFORM",
          confidence: selectedYear === "2026" ? "Provisório (Parcial)" : "Média (Sem QA/QC)",
          notes: selectedYear === "2026"
            ? "Extraído via WebLakes. Acumulado parcial de Jan a Mai."
            : "Extraído via WebLakes/INEAPublico."
        };
      }
    } else {
      // Search in seedFindings for historical aggregates
      const pollutantName = activePollutant.pollutant;
      // Map station short name to matches in historical sources
      const searchStation = SITES[selectedStationId]?.shortName || "";
      
      const matchMean = seedFindings.find(f => 
        f.pollutant === pollutantName && 
        f.metric.includes("MEAN") &&
        f.station_name.includes(searchStation) &&
        (selectedYear === "2015" ? f.year === 2015 : f.year === null) // null is triênio 2013-2015
      );

      const matchMax = seedFindings.find(f => 
        f.pollutant === pollutantName && 
        (f.metric.includes("MAX") || f.metric.includes("PEAK")) &&
        f.station_name.includes(searchStation) &&
        (selectedYear === "2015" ? f.year === 2015 : f.year === null)
      );

      const matchExceed = seedFindings.find(f => 
        f.pollutant === pollutantName && 
        f.metric.includes("EXCEEDANCE") &&
        f.station_name.includes(searchStation) &&
        (selectedYear === "2015" ? f.year === 2015 : f.year === null)
      );

      if (matchMean || matchMax) {
        return {
          mean: matchMean ? matchMean.value : null,
          max: matchMax ? matchMax.value : null,
          exceedancesWho: matchExceed ? matchExceed.value : 0,
          exceedancesBr: 0, // No BR exceedance data in historical aggregates
          unit: matchMean?.unit || matchMax?.unit || "µg/m³",
          tier: "HISTORICAL_AGGREGATE",
          confidence: "Alta (Relatório Consolidado / Artigo)",
          notes: matchMean?.notes || matchMax?.notes || "Compilado de fontes históricas."
        };
      }
    }
    return null;
  }, [selectedPollutantId, selectedStationId, selectedYear, activePollutant.pollutant]);

  // Group thresholds for visual comparison
  const whoThresholds = activeThresholds.filter(t => t.regime === "WHO");
  const brThresholds = activeThresholds.filter(t => t.regime === "BR");

  return (
    <div id="comparar" className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          Comparador OMS e Lei Brasileira
        </h3>
        <p className="text-slate-400 text-sm mt-1">
          Selecione o poluente, a estação e o período para cruzar as leituras locais com os limites vigentes.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-slate-100">
            ciclo {releaseMetadata.cycleVersion}
          </span>
          <span className="rounded-full border border-emerald-900/40 bg-emerald-950/30 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-emerald-300">
            metodologia {releaseMetadata.methodologyVersion}
          </span>
          <span className="rounded-full border border-amber-900/40 bg-amber-950/30 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-amber-300">
            comparação pública
          </span>
        </div>
      </div>

      {/* Selectors card */}
      <SurfaceCard className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-xs text-slate-400 font-bold block mb-1.5">Poluente de Interesse</label>
            <select
              value={selectedPollutantId}
              onChange={(e) => setSelectedPollutantId(e.target.value)}
              className="w-full bg-slate-800 text-slate-200 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
            >
              {Object.entries(PARAMETERS).map(([id, p]) => (
                <option key={id} value={id}>{p.fullName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-bold block mb-1.5">Estação de Monitoramento</label>
            <select
              value={selectedStationId}
              onChange={(e) => setSelectedStationId(e.target.value)}
              className="w-full bg-slate-800 text-slate-200 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
            >
              {Object.entries(SITES).filter(([id]) => id !== "72").map(([id, s]) => (
                <option key={id} value={id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-bold block mb-1.5">Ano / Período</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-slate-800 text-slate-200 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="2026">2026 (Parcial)* (Dado Bruto WebLakes)</option>
              <option value="2025">2025 (Dado Bruto WebLakes)</option>
              <option value="2024">2024 (Dado Bruto WebLakes)</option>
              <option value="2023">2023 (Histórico) (Dado Bruto WebLakes)</option>
              <option value="2022">2022 (Histórico) (Dado Bruto WebLakes)</option>
              <option value="2021">2021 (Histórico) (Dado Bruto WebLakes)</option>
              <option value="2020">2020 (Histórico) (Dado Bruto WebLakes)</option>
              <option value="2015">2015 (Dado Agregado INEA)</option>
              <option value="2013-2015">2013-2015 (Estudo Científico)</option>
            </select>
          </div>
        </div>
      </SurfaceCard>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Observed Value Card */}
        <SurfaceCard className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">
              Registro Observado em Volta Redonda
            </span>
            <h4 className="text-sm font-bold text-slate-300 mt-1">{activeStationName} ({selectedYear})</h4>

            {selectedYear === "2026" && (
              <div className="bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs rounded-xl p-3.5 flex items-start gap-2.5 animate-pulse mb-3 mt-3">
                <span className="text-amber-400 font-bold shrink-0 mt-0.5">⚠️</span>
                <div>
                  <strong>Ano parcial/em andamento:</strong> Dado provisório acumulado até maio de 2026.
                </div>
              </div>
            )}

            {selectedYear === "2024" && selectedPollutantId !== "18" ? (
              <div className="mt-4 p-4 bg-amber-950/20 border border-amber-900/40 rounded-xl space-y-2 text-xs">
                <span className="font-bold text-amber-400 block flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                  Poluente em Auditoria
                </span>
                <p className="text-slate-300 leading-relaxed font-medium">
                  Este poluente ainda está em auditoria para comparação anual.
                </p>
              </div>
            ) : selectedYear === "2024" && AUDIT_MODE_2024 ? (
              <div className="mt-4 p-4 bg-amber-950/20 border border-amber-900/40 rounded-xl space-y-2 text-xs">
                <span className="font-bold text-amber-400 block flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  Dados Sob Auditoria
                </span>
                <p className="text-slate-300 leading-relaxed font-medium">
                  Os dados de 2024 para esta estação estão passando por uma auditoria de consistência devido à detecção de divergência nos relatórios sequenciais e foram temporariamente suspensos de exibição pública.
                </p>
              </div>
            ) : selectedYear === "2020" && selectedPollutantId === "20" ? (
              <div className="mt-8 text-center py-6 bg-slate-950/20 border border-slate-800 rounded-xl">
                <p className="text-xs text-amber-400 font-bold">Dados de PM2.5 indisponíveis em 2020</p>
                <p className="text-[11px] text-slate-400 mt-1.5 max-w-xs mx-auto px-4">
                  O sensor para monitoramento de PM2.5 não retornou dados públicos na plataforma INEA/WebLakes no recorte analisado no ano de 2020.
                </p>
              </div>
            ) : loadingSummary ? (
              <div className="mt-8 text-center py-6 bg-slate-950/20 border border-slate-800 rounded-xl">
                <p className="text-xs text-slate-400 italic">Carregando dados comparativos...</p>
              </div>
            ) : observedData ? (
              <div className="mt-4 space-y-4">
                {isInsufficient && (
                  <div className="bg-amber-950/40 border border-amber-900/40 text-amber-400 text-xs rounded-xl p-3.5 flex items-start gap-2.5">
                    <span className="text-amber-500 font-bold shrink-0 mt-0.5">⚠️</span>
                    <div>
                      <strong>Cobertura insuficiente para comparação anual:</strong> Este recorte possui leituras públicas disponíveis, mas a cobertura anual ficou abaixo do patamar metodológico de 75%. Por isso, a média deve ser lida como média do período disponível, não como comparação anual plena.
                    </div>
                  </div>
                )}

                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block font-semibold">
                    Média do Período {isInsufficient && "*(Sob ressalva)"}:
                  </span>
                  <div className="text-2xl font-black text-slate-100 font-mono mt-0.5">
                    {observedData.mean !== null ? `${observedData.mean.toFixed(2)} ${observedData.unit}` : 'N/A'}
                  </div>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block font-semibold">Pico Horário Pontual de Concentração:</span>
                  <div className="text-xl font-black text-slate-200 font-mono mt-0.5">
                    {observedData.max !== null ? `${observedData.max.toFixed(2)} ${observedData.unit}` : 'N/A'}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Ultrapassagens OMS:</span>
                    <strong className="text-rose-400 font-bold">{observedData.exceedancesWho} dias</strong>
                  </div>
                  {selectedYear === "2024" && (
                    <div className="flex justify-between">
                      <span>Ultrapassagens CONAMA:</span>
                      <strong className="text-orange-400 font-bold">{observedData.exceedancesBr} dias</strong>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-8 text-center py-6 bg-slate-950/20 border border-slate-800 rounded-xl">
                <p className="text-xs text-slate-400 italic">Nenhum registro físico disponível na base para esta combinação.</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-500">Nível de Confiança:</span>
              <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${(selectedYear === "2024" && AUDIT_MODE_2024) ? 'bg-amber-950/20 text-amber-400' : observedData?.tier === 'HISTORICAL_AGGREGATE' ? 'bg-blue-950/30 text-blue-400' : observedData ? 'bg-amber-950/20 text-amber-400' : 'bg-slate-900 text-slate-500'}`}>
                {(selectedYear === "2024" && AUDIT_MODE_2024) ? 'EM_AUDITORIA' : observedData?.tier ?? 'N/A'}
              </span>
            </div>
            {(selectedYear === "2024" && AUDIT_MODE_2024) ? (
              <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                * Coleta suspensa até revalidação do comportamento de estado da plataforma de origem.
              </p>
            ) : observedData ? (
              <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                * {observedData.notes}
              </p>
            ) : null}
          </div>

        </SurfaceCard>
        <div className="lg:col-span-3">
          <RadarEvidenceStateBlock
            state={observedData?.tier === 'HISTORICAL_AGGREGATE' ? "external" : "partial"}
            title={observedData?.tier === 'HISTORICAL_AGGREGATE' ? "Memória técnica" : "Prova parcial"}
            description={observedData?.tier === 'HISTORICAL_AGGREGATE'
              ? `Este comparador cruza o release ${releaseMetadata.cycleVersion} com agregados históricos e literatura. O resultado serve como lastro de contexto, não como emissão operacional horária da base.`
              : `Este comparador ajuda a confrontar a leitura pública com OMS e CONAMA no release ${releaseMetadata.cycleVersion}, mas continua dependente de comparação experimental. ${RADAR_EXPERIMENTAL_COMPARISON_NOTE}`}
          />
        </div>

        {/* WHO 2021 Limits Card */}
        <SurfaceCard className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div>
            <span className="text-[10px] text-rose-400 font-black uppercase tracking-widest block">
              Diretrizes de Saúde da OMS (2021)
            </span>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Critérios estritamente médicos de proteção à saúde humana definidos pela OMS.
            </p>

            <div className="mt-4 space-y-3">
              {whoThresholds.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Sem diretriz recomendada pela OMS para este poluente.</p>
              ) : (
                whoThresholds.map((t, idx) => {
                  const isExceeded = observedData && observedData.mean !== null && t.averaging_period === "YEAR" && observedData.mean > t.threshold_value;

                  return (
                    <div key={idx} className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <strong className="text-slate-200">{t.averaging_period === "YEAR" ? "Anual" : t.averaging_period === "DAY" ? "Diário (24h)" : "8 Horas"}</strong>
                        <span className="font-mono font-bold text-rose-400 bg-rose-950/20 border border-rose-900/30 px-2 py-0.5 rounded text-[10px]">
                          OMS: {t.threshold_value} {t.unit}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">{t.notes}</p>
                      {isExceeded && (
                        <span className="inline-block text-[9px] font-bold bg-rose-900/30 text-rose-400 px-2 py-0.5 rounded border border-rose-800/40">
                          {isInsufficient ? "Média Excedeu Diretriz (Ressalva de Cobertura)" : "Exposição Anual Excedeu Diretriz Crônica"}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </SurfaceCard>

        {/* BR CONAMA 491/2018 Limits Card */}
        <SurfaceCard className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div>
            <span className="text-[10px] text-orange-400 font-black uppercase tracking-widest block">
              Legislação Nacional (CONAMA)
            </span>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Limites legais de transição (PI-1 a PI-3) e padrão final (PF) da Resolução 491/2018.
            </p>

            <div className="mt-4 space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {brThresholds.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Sem padrão nacional registrado para este poluente.</p>
              ) : (
                brThresholds.map((t, idx) => {
                  return (
                    <div key={idx} className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <strong className="text-slate-300">{t.label.replace("CONAMA ", "")}</strong>
                        <span className="font-mono font-bold text-orange-400 bg-orange-950/20 border border-orange-900/30 px-2 py-0.5 rounded text-[10px]">
                          {t.threshold_value} {t.unit}
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-500 leading-relaxed">{t.notes}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
}
