import { useState } from 'react';
import { SurfaceCard, Chip } from '../BrandSystem';
import { SITES } from '../../lib/inea/weblakesDictionary';
import { AUDIT_MODE_2024 } from '../../lib/inea/auditFlags';
import summary2022 from '../../../data/inea_weblakes_normalized/summary-2022.json';
import summary2023 from '../../../data/inea_weblakes_normalized/summary-2023.json';
import summary2024 from '../../../data/inea_weblakes_normalized/summary-2024.json';
import summary2025 from '../../../data/inea_weblakes_normalized/summary-2025.json';
import summary2026 from '../../../data/inea_weblakes_normalized/summary-2026.json';

interface MonthStat {
  mean: number | null;
  max: number | null;
  coveragePct: number;
  zeroHours: number;
  missingHours: number;
  exceedances: {
    WHO_24H?: number;
    BR_24H_FINAL?: number;
  };
}

interface PollutantStat {
  pollutant: string;
  unit: string;
  totalHours: number;
  coveragePct: number;
  mean: number | null;
  max: number | null;
  zeroHours: number;
  exceedances: {
    WHO_24H?: number;
    BR_24H_FINAL?: number;
  };
  months?: Record<string, MonthStat>;
}

interface StationData {
  name: string;
  pollutants: Record<string, PollutantStat>;
}

const SUMMARIES: Record<string, Record<string, StationData>> = {
  "2022": summary2022 as any,
  "2023": summary2023 as any,
  "2024": summary2024 as any,
  "2025": summary2025 as any,
  "2026": summary2026 as any
};

export function YearExplorer() {
  const [selectedYear, setSelectedYear] = useState<string>("2024");

  const getExposureNotePM10 = (stationId: string, year: string, pData: any) => {
    if (!pData) return null;
    const coverage = pData.coveragePct.toFixed(1);
    const mean = pData.mean !== null ? pData.mean.toFixed(2) : "N/A";
    const whoExceed = pData.exceedances?.WHO_24H || 0;
    const brExceed = pData.exceedances?.BR_24H_FINAL || 0;
    const isPartial = year === "2026";
    const coverageText = isPartial ? `cobertura parcial` : `cobertura anual`;
    const periodText = isPartial ? `de janeiro a maio em` : `em`;

    if (stationId === "69") {
      return (
        <p>
          A {coverageText} de PM10 de {coverage}% {periodText} {year} revelou média de {mean} µg/m³, com {whoExceed} dias com médias diárias superiores ao limite de saúde da OMS (45 µg/m³) e {brExceed} dias excedendo o padrão legal CONAMA 506/2024 (50 µg/m³), caracterizando eventos de atenção em comparação experimental com as réguas OMS e CONAMA.
        </p>
      );
    }
    if (stationId === "70") {
      return (
        <p>
          Registrou {coverageText} de PM10 de {coverage}% {periodText} {year} com média de {mean} µg/m³. Identificaram-se {whoExceed} dias acima da referência OMS e {brExceed} dias de excedência CONAMA 506/2024, indicando múltiplos eventos de atenção em comparação experimental com as réguas OMS e CONAMA.
        </p>
      );
    }
    if (stationId === "71") {
      return (
        <p>
          Apresentou a menor média registrada entre as três estações analisadas {periodText} {year}, com {coverageText} de {coverage}%, média de {mean} µg/m³, registrando {whoExceed} excedências diárias da OMS e {brExceed} excedências diárias do padrão CONAMA nesta comparação experimental.
        </p>
      );
    }
    return null;
  };

  const renderYearData = (year: string) => {
    if (year === "2024" && AUDIT_MODE_2024) {
      return (
        <div className="space-y-6">
          <div className="bg-amber-950/20 border border-amber-900/40 p-5 rounded-2xl text-xs text-slate-350 leading-relaxed space-y-3">
            <p className="font-bold text-amber-400 flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Coleta Anual 2024 em Auditoria Metodológica
            </p>
            <p>
              Por motivos de rigor científico, transparência e respeito à governança de dados, os resultados consolidados de 2024 foram temporariamente retirados de exibição pública. A equipe técnica do SEMEAR identificou uma divergência no comportamento de estado (stateful session) do endpoint público original que pode ter gerado contaminação cruzada entre poluentes durante a extração sequencial em lote.
            </p>
            <p>
              Para garantir a fidelidade das informações, os dados estão passando por recoleta e cruzamento. A visualização das médias anuais e excedências para o ano de 2024 será restabelecida assim que a auditoria for concluída.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <SurfaceCard className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5">
              <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-lg font-bold text-slate-100">Piloto Mensal Validado — Volta Redonda - Retiro</h4>
                  <span className="text-[10px] text-emerald-450 font-bold uppercase tracking-wider block mt-0.5">
                    Estação ID: 70 | Período: Julho de 2024 (01/07 a 31/07)
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Cobertura:</span>
                  <span className="text-sm font-mono font-bold text-emerald-450">
                    96.6% (719h/744h)
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="text-xs font-black text-slate-450 uppercase tracking-widest">Poluente Auditado e Validado</h5>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-200">PM10 (Partículas Inaláveis)</span>
                    <span className="text-emerald-400 font-mono font-bold bg-emerald-950/20 border border-emerald-900/30 px-2 py-0.5 rounded text-[10px]">
                      Piloto Verificado
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-850">
                    <div>
                      <span className="text-[10px] text-slate-500 block font-semibold">Média Mensal:</span>
                      <span className="text-xs font-mono font-bold text-slate-300">
                        35.09 µg/m³
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block font-semibold">Pico Horário:</span>
                      <span className="text-xs font-mono font-bold text-slate-300">
                        177.71 µg/m³
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-500 block font-bold">Ultrapassagens OMS:</span>
                      <span className="text-[10px] font-bold block text-rose-400">
                        OMS 24h: 4 dias
                      </span>
                      <span className="text-[10px] font-bold block text-orange-400">
                        CONAMA 24h: 3 dias
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 text-xs space-y-2">
                <span className="font-black text-[10px] text-slate-450 uppercase tracking-wider block">
                  Nota Editorial
                </span>
                <p className="text-slate-300 leading-relaxed font-medium">
                  Este piloto mensal foi coletado de forma estritamente controlada (dia a dia, com sessões limpas) e cruzado com amostras manuais coletadas diretamente pela interface pública, servindo como nossa referência de calibração técnica de confiança.
                </p>
              </div>
            </SurfaceCard>
          </div>
        </div>
      );
    }

    const isPartial2026 = year === "2026";

    return (
      <div className="space-y-8">
        {isPartial2026 && (
          <div className="bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs rounded-xl p-3.5 flex items-start gap-2.5 animate-pulse">
            <span className="text-amber-400 font-bold shrink-0 mt-0.5">⚠️</span>
            <div>
              <strong>Ano parcial/em andamento (acumulado até maio de 2026):</strong> Os indicadores do ano de 2026 representam dados provisórios parciais e não devem ser diretamente comparados com séries anuais completas fechadas.
            </div>
          </div>
        )}

        <div className="bg-slate-850/80 border border-slate-800 p-5 rounded-2xl text-xs text-slate-300 leading-relaxed space-y-3 shadow-md">
          <p className="font-bold text-slate-100 flex items-center gap-1.5 text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Como ler esses números
          </p>
          <p>
            Os valores vêm de dados horários públicos exibidos pela plataforma INEA/WebLakes. Como a tabela não traz uma flag oficial de QA/QC por registro, tratamos as comparações com OMS e CONAMA como experimentais. Ainda assim, a alta cobertura horária permite identificar sinais fortes de atenção.
          </p>
          <div className="text-[10px] text-slate-450 border-t border-slate-800 pt-2.5 font-semibold">
            Selo Metodológico: Dado horário público WebLakes — comparação experimental — sem QA/QC oficial explícito
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              PM10 validado experimentalmente
            </h4>
            <span className="text-[9px] bg-emerald-950 text-emerald-450 border border-emerald-900/25 px-2 py-0.5 rounded font-bold">
              PM10 Único Validado
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {Object.entries(SITES).map(([stationId, site]) => {
              if (stationId === "72") {
                return (
                  <SurfaceCard key={stationId} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between min-h-[260px] shadow-lg">
                    <div className="border-b border-slate-800 pb-3">
                      <h4 className="text-base font-bold text-slate-100">{site.name}</h4>
                      <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block mt-0.5">
                        Estação ID: {stationId} | Volta Redonda
                      </span>
                    </div>
                    <div className="py-6 px-4 text-center text-xs font-semibold text-slate-500 italic bg-slate-950/40 border border-slate-850 rounded-xl my-4">
                      Estação meteorológica / sem PM10 disponível nesta camada.
                    </div>
                    <div className="text-[10px] text-slate-500 leading-normal">
                      * Esta estação de ID 72 registra ventos e clima para análise de dispersão de poluentes, não dispondo de sensores de material particulado nesta base.
                    </div>
                  </SurfaceCard>
                );
              }

              const stationData = SUMMARIES[year]?.[stationId];
              if (!stationData) return null;
              const pData = stationData.pollutants["18"]; // PM10 only
              if (!pData) return null;

              const whoExceed = pData.exceedances?.WHO_24H || 0;
              const brExceed = pData.exceedances?.BR_24H_FINAL || 0;

              return (
                <SurfaceCard key={stationId} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5 shadow-lg">
                  <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                    <div>
                      <h4 className="text-base font-bold text-slate-100">{site.name}</h4>
                      <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block mt-0.5">
                        Estação ID: {stationId} | Volta Redonda
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-450 block">Cobertura:</span>
                      <span className="text-sm font-mono font-bold text-emerald-450">
                        {pData.coveragePct.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-200">PM10 (Material Particulado Inalável)</span>
                      <span className="text-emerald-400 font-bold bg-emerald-950/20 border border-emerald-900/30 px-2 py-0.5 rounded text-[10px]">
                        ✓ Validado Experimentalmente
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-850">
                      <div>
                        <span className="text-[10px] text-slate-500 block font-semibold">Média Anual:</span>
                        <span className="text-xs font-mono font-bold text-slate-300">
                          {pData.mean !== null ? `${pData.mean.toFixed(2)} ${pData.unit}` : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block font-semibold">Pico Horário:</span>
                        <span className="text-xs font-mono font-bold text-slate-300">
                          {pData.max !== null ? `${pData.max.toFixed(2)} ${pData.unit}` : 'N/A'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-500 block font-bold">Ultrapassagens:</span>
                        <span className="text-[10px] font-bold block text-rose-400">
                          OMS 24h: {whoExceed}d
                        </span>
                        <span className="text-[10px] font-bold block text-orange-400">
                          CONAMA: {brExceed}d
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 text-xs space-y-2">
                    <span className="font-black text-[9px] text-slate-450 uppercase tracking-wider block">
                      Nota de Exposição ({year})
                    </span>
                    <div className="text-slate-350 leading-relaxed font-medium text-[11px]">
                      {getExposureNotePM10(stationId, year, pData)}
                    </div>
                  </div>
                </SurfaceCard>
              );
            })}

            {/* Consolidated PM2.5 Card */}
            <SurfaceCard className="bg-slate-900 border border-slate-800 p-6 rounded-2xl md:col-span-2 space-y-6 shadow-lg">
              <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-base font-bold text-slate-100">Material Particulado Fino (PM2.5) — {year}</h4>
                  <span className="text-[10px] text-emerald-450 font-bold uppercase tracking-wider block mt-0.5">
                    Comparação Experimental Validada | Três Estações Operacionais
                  </span>
                </div>
                <span className="text-[9px] bg-emerald-950 text-emerald-450 border border-emerald-900/25 px-2 py-0.5 rounded font-bold">
                  PM2.5 Validado
                </span>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {["69", "70", "71"].map((stationId) => {
                  const stationData = SUMMARIES[year]?.[stationId];
                  const pData = stationData?.pollutants["20"];
                  const site = SITES[stationId];

                  if (!pData) return null;

                  const whoExceed = pData.exceedances?.WHO_24H || 0;
                  const brExceed = pData.exceedances?.BR_24H_FINAL || 0;

                  return (
                    <div key={stationId} className="space-y-3 border-r border-slate-800 last:border-r-0 pr-4 last:pr-0">
                      <div className="border-b border-slate-800/60 pb-1.5">
                        <span className="text-xs font-bold text-slate-100 block">{site?.name || `Estação ${stationId}`}</span>
                        <span className="text-[9px] text-slate-450 font-mono">Cobertura: {pData.coveragePct.toFixed(1)}%</span>
                      </div>

                      <div className="grid grid-cols-1 gap-1.5 bg-slate-950/40 p-2 rounded-lg border border-slate-850">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] text-slate-500 font-semibold">Média Anual:</span>
                          <span className="text-xs font-mono font-bold text-slate-350">
                            {pData.mean !== null ? `${pData.mean.toFixed(2)} ${pData.unit}` : "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] text-slate-500 font-semibold">Pico Horário:</span>
                          <span className="text-xs font-mono font-bold text-slate-350">
                            {pData.max !== null ? `${pData.max.toFixed(2)} ${pData.unit}` : "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-800/40 pt-1 mt-0.5">
                          <span className="text-[9px] text-slate-500 font-semibold">Exced. OMS:</span>
                          <span className="text-[10px] font-bold text-rose-400">{whoExceed}d</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] text-slate-500 font-semibold">Exced. CONAMA:</span>
                          <span className="text-[10px] font-bold text-orange-400">{brExceed}d</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 text-xs space-y-2">
                <span className="font-black text-[9px] text-slate-450 uppercase tracking-wider block">
                  Nota Metodológica e de Exposição (PM2.5) — {year}
                </span>
                <div className="text-slate-350 leading-relaxed font-medium text-[11px] space-y-1.5">
                  <p>
                    O material particulado fino (PM2.5) representa as partículas mais finas em suspensão. Os dados foram recalculados a partir das leituras horárias públicas fornecidas pela plataforma INEA/WebLakes para o ano de {year}.
                  </p>
                  <p>
                    Registrou-se a maior média anual de PM2.5 nesta camada analisada na estação <strong>Belmonte</strong>, enquanto a estação <strong>Santa Cecília</strong> registrou a menor média anual registrada entre as três estações analisadas em {year}. As comparações com as diretrizes da OMS e CONAMA 506/2024 são de caráter experimental e servem como indicativos de exposição por não possuírem flag de QA/QC oficial no banco original. Ausência de dado não representa ar de boa qualidade.
                  </p>
                </div>
              </div>
            </SurfaceCard>
          </div>
        </div>
      </div>
    );
  };

  const renderPre2024 = (period: string) => {
    // 2013-2015 or 2015
    const isTrienio = period === "2013-2015";

    return (
      <div className="space-y-6">
        <div className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-xl text-xs text-slate-300 leading-relaxed space-y-2">
          <p className="font-semibold text-slate-100 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Origem e Metodologia ({period}):
          </p>
          <p>
            Dados provenientes da camada <code className="text-blue-400 bg-slate-900 px-1 py-0.5 rounded font-mono">HISTORICAL_AGGREGATE</code> (Dado agregado de relatório).
            Eles foram copilados a partir de relatórios anuais oficiais do INEA (RQAr) e estudos científicos revisados por pares. 
            Nível de confiança <strong>Alto</strong> devido ao processo de consolidação de publicações oficiais, porém não contêm as séries horárias abertas originais (as quais permanecem em silêncio governamental).
          </p>
        </div>

        <SurfaceCard className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
          <div className="flex justify-between items-start border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-lg font-bold text-slate-100">
                {isTrienio 
                  ? "Estudo Clínico e Epidemiológico de Volta Redonda" 
                  : "Relatório Estadual de Qualidade do Ar (INEA)"}
              </h4>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mt-1">
                Período: {isTrienio ? "Triênio 2013 a 2015" : "Ano de 2015"}
              </span>
            </div>
            <Chip tone="lab" className="text-xs uppercase tracking-wider">Histórico Consolidado</Chip>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h5 className="text-xs font-black text-slate-450 uppercase tracking-widest">Valores de Referência Coletados</h5>
              <div className="space-y-3">
                {isTrienio ? (
                  <>
                    <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-850 flex justify-between items-center text-xs">
                      <div>
                        <strong className="text-slate-200 block">PM10 (Partículas Inaláveis)</strong>
                        <span className="text-[10px] text-slate-500">Média Trienal / Pico Diário</span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="block font-bold text-slate-300">29.45 µg/m³</span>
                        <span className="text-[10px] text-rose-400">Pico: 132.76 µg/m³</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-850 flex justify-between items-center text-xs">
                      <div>
                        <strong className="text-slate-200 block">PTS (Partículas Totais)</strong>
                        <span className="text-[10px] text-slate-500">Média Trienal / Pico Diário</span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="block font-bold text-slate-300">43.28 µg/m³</span>
                        <span className="text-[10px] text-rose-400">Pico: 172.39 µg/m³</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-850 flex justify-between items-center text-xs">
                      <div>
                        <strong className="text-slate-200 block">O3 (Ozônio)</strong>
                        <span className="text-[10px] text-slate-500">Média Trienal / Pico Diário</span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="block font-bold text-slate-300">41.34 µg/m³</span>
                        <span className="text-[10px] text-rose-400">Pico: 108.12 µg/m³</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-850 flex justify-between items-center text-xs">
                      <div>
                        <strong className="text-slate-200 block">O3 - VR Belmonte</strong>
                        <span className="text-[10px] text-slate-500">Máximo Horário</span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="block font-bold text-rose-400">198.00 µg/m³</span>
                        <span className="text-[10px] text-slate-500">Limite OMS 8h: 100</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-850 flex justify-between items-center text-xs">
                      <div>
                        <strong className="text-slate-200 block">PTS - VR Santa Cecília</strong>
                        <span className="text-[10px] text-slate-500">Máximo Diário (24h)</span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="block font-bold text-rose-400">156.00 µg/m³</span>
                        <span className="text-[10px] text-slate-500">Padrão Histórico: 240</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-xs font-black text-slate-450 uppercase tracking-widest">Excedências e Impacto OMS</h5>
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-850 space-y-3 text-xs">
                {isTrienio ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Dias excedentes OMS (PM10):</span>
                      <strong className="text-rose-500 font-mono">60 dias</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Dias excedentes OMS (Ozônio):</span>
                      <strong className="text-rose-500 font-mono">2 dias</strong>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-slate-800">
                      Estudo publicado na RBCIamb demonstrou forte associação estatística entre estes picos de poluição atmosférica registrada em Volta Redonda e as internações por doenças respiratórias de crianças e idosos locais.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Padrão CONAMA Excedido (O3):</span>
                      <strong className="text-amber-500 font-mono">Sim (198 µg/m³ vs 140 µg/m³ PI-1)</strong>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-slate-800">
                      Os picos horários de Ozônio de 198 µg/m³ na estação Belmonte ultrapassaram significativamente a referência de saúde pública recomendada para o período de 8 horas móveis.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </SurfaceCard>
      </div>
    );
  };

  return (
    <div id="anos" className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            Histórico Consolidado por Ano
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            Compare o comportamento geral anual dos poluentes e a cobertura técnica da rede oficial.
          </p>
        </div>

        {/* Year picker button group */}
        <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-xl flex flex-wrap gap-1">
          <button
            onClick={() => setSelectedYear("2026")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${selectedYear === "2026" ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Ano 2026*
          </button>
          <button
            onClick={() => setSelectedYear("2025")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${selectedYear === "2025" ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Ano 2025
          </button>
          <button
            onClick={() => setSelectedYear("2024")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${selectedYear === "2024" ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Ano 2024
          </button>
          <button
            onClick={() => setSelectedYear("2023")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${selectedYear === "2023" ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Ano 2023
          </button>
          <button
            onClick={() => setSelectedYear("2022")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${selectedYear === "2022" ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Ano 2022
          </button>
          <button
            onClick={() => setSelectedYear("2015")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${selectedYear === "2015" ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Ano 2015
          </button>
          <button
            onClick={() => setSelectedYear("2013-2015")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${selectedYear === "2013-2015" ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Triênio 13–15
          </button>
        </div>
      </div>

      {selectedYear === "2026" && renderYearData("2026")}
      {selectedYear === "2025" && renderYearData("2025")}
      {selectedYear === "2024" && renderYearData("2024")}
      {selectedYear === "2023" && renderYearData("2023")}
      {selectedYear === "2022" && renderYearData("2022")}
      {selectedYear === "2015" && renderPre2024("2015")}
      {selectedYear === "2013-2015" && renderPre2024("2013-2015")}
    </div>
  );
}
