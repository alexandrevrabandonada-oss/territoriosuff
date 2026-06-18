import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { AqiExplainer } from "../../../components/air/AqiExplainer";
import { HistoricalRawEvidenceBox } from "../../../components/air/HistoricalRawEvidenceBox";
import { AIR_PUBLIC_DOWNLOADS, getAirPublicDataPath } from "../../../data/air/public-downloads";
import {
  RADAR_EXPERIMENTAL_COMPARISON_NOTE,
  RADAR_OFFICIAL_RECORD_QAQC_NOTE,
  RADAR_EXPERIMENTAL_WEBLAKES_SEAL,
  RADAR_NO_DATA_NOT_CLEAN_AIR
} from "../../../data/air/radar-copy";
import { gases2024StationSummary } from "../../../data/air/gases-2024-station-summary";
import { RadarConfidenceSnapshot } from "./RadarConfidenceSnapshot";
import { getEvidenceStateLabel, RadarEvidenceStateBlock } from "./RadarEvidenceStateBlock";
import { RadarEvidenceBadge } from "./RadarEvidenceBadge";
import { RadarEvidenceActionGuide } from "./RadarEvidenceActionGuide";
import { RadarEvidenceDictionary } from "./RadarEvidenceDictionary";
import { RadarGovernanceBoard } from "./RadarGovernanceBoard";
import { PARAMETER_GOVERNANCE_ITEMS } from "./RadarGovernanceModel";
import { RadarGovernanceScoreboard } from "./RadarGovernanceScoreboard";
import { RadarHistoricalResearchPanel } from "./RadarHistoricalResearchPanel";
import { RadarMaturityScorecard } from "./RadarMaturityScorecard";
import { RadarNextReadingCard } from "./RadarNextReadingCard";
import { RadarImplementationStatus } from "./RadarImplementationStatus";
import { RadarPublicPendingLedger } from "./RadarPublicPendingLedger";
import { RadarRevisionHistory } from "./RadarRevisionHistory";
import { RadarTransparencyRoadmap } from "./RadarTransparencyRoadmap";
import { fetchRadarJson } from "./radarApi";
import type { RadarComparisonTab, RadarMode, StationMetadataItem, SummaryStats } from "./RadarTypes";
import { RadarModeFooter } from "./RadarModeFooter";
import { RadarVisualNotice } from "./RadarVisualNotice";

interface RadarMethodologyModeProps {
  displaySummary: SummaryStats;
  onNavigate: (mode: RadarMode, tab?: RadarComparisonTab) => void;
  onOpenLai: () => void;
  stationMetadata: StationMetadataItem[];
  onTop: () => void;
}

interface ExportCatalogYearPartition {
  year: number;
  from: string;
  to: string;
  url: string;
}

interface ExportCatalogStationPartition {
  station_id: string;
  station_name: string;
  city: string | null;
  neighborhood: string | null;
  url: string;
}

interface ExportCatalogResponse {
  available_years?: {
    partitions?: ExportCatalogYearPartition[];
  };
  available_stations?: ExportCatalogStationPartition[];
}

type RadarEvidenceBadgeLevel = "strong" | "experimental" | "interpretive" | "insufficient";

const FAQ_ITEMS = [
  {
    icon: "📊",
    title: "1. O que é o IQAr?",
    content:
      "O Índice de Qualidade do Ar consolida múltiplos poluentes e poeiras em uma escala única de 5 classificações (Boa a Péssima). Ele simplifica a leitura técnica para que qualquer pessoa compreenda a condição respiratória geral."
  },
  {
    icon: "🔇",
    title: "2. Ausência de dado não é ar bom",
    content:
      "Se os sensores falharem ou entrarem em manutenção, a falta de registros não significa que o ar está limpo. Significa silêncio de informação. A transparência exige que reconheçamos as falhas de captação."
  },
  {
    icon: "🏥",
    title: "3. Não mede risco individual",
    content:
      "O monitoramento oficial estima a exposição média de uma região urbana, não o risco respiratório imediato de um indivíduo em sua casa. Fatores como asma prévia ou exercícios físicos em picos de poeira mudam o impacto real."
  },
  {
    icon: "🔬",
    title: "4. Não prova causalidade direta",
    content:
      "Os dados apontam poluição atmosférica crônica correlacionada a sintomas, mas não servem como prova jurídica de nexo causal individual direto. São ferramentas epidemiológicas e de priorização de fiscalização pública."
  },
  {
    icon: "⚖️",
    title: "5. Diferença entre OMS e CONAMA",
    content:
      "A Organização Mundial da Saúde adota limites muito mais restritos visando à saúde pública de longo prazo. A legislação federal brasileira (CONAMA 506) estabelece metas intermediárias, permitindo maiores concentrações regulatórias."
  },
  {
    icon: "⏱️",
    title: "6. Dado horário vs. Média diária",
    content:
      "O padrão regulatório diário baseia-se em médias de 24 horas. Picos instantâneos indicam episódios de poluição aguda ou poeira suspensa decorrente de ventos, mas diferem da média diária consolidada do dia."
  }
];

const AUDIT_STEPS = [
  {
    step: "1. Identifique o recorte",
    description: "Defina se sua pergunta é espacial, temporal, territorial ou operacional antes de abrir o painel."
  },
  {
    step: "2. Verifique a cobertura",
    description: "Confirme se a estação e o período possuem dados suficientes e se a janela operacional é explícita ou inferida."
  },
  {
    step: "3. Separe observação de interpretação",
    description: "Diferencie dado observado, processamento do portal e hipótese pública que você está formulando."
  },
  {
    step: "4. Só então pressione por ação",
    description: "Depois da checagem, transforme a leitura em cobrança por manutenção, expansão da rede, saúde territorial ou transparência adicional."
  }
];

function toEvidenceBadgeLevel(level: string): RadarEvidenceBadgeLevel {
  return level === "advancing" ? "strong" : (level as RadarEvidenceBadgeLevel);
}

export function RadarMethodologyMode({ displaySummary, onNavigate, onOpenLai, stationMetadata, onTop }: RadarMethodologyModeProps) {
  const [exportCatalog, setExportCatalog] = useState<ExportCatalogResponse | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadCatalog = async () => {
      try {
        setCatalogError(null);
        const response = await fetchRadarJson<ExportCatalogResponse>("/api/air/inea/export-catalog");
        if (!active) {
          return;
        }
        setExportCatalog(response);
      } catch (error) {
        if (!active) {
          return;
        }
        setCatalogError(error instanceof Error ? error.message : "Nao foi possivel carregar o catalogo publico de particoes.");
      }
    };

    void loadCatalog();

    return () => {
      active = false;
    };
  }, []);

  const topYearPartitions = exportCatalog?.available_years?.partitions?.slice(0, 6) ?? [];
  const topStationPartitions = exportCatalog?.available_stations?.slice(0, 6) ?? [];

  return (
    <div className="animate-fade-in space-y-8 pt-4">
      <div className="space-y-3 rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f8fafc)] p-6 shadow-[0_20px_45px_-34px_rgba(15,23,42,0.45)]">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Biblioteca pública do radar</div>
        <h2 className="flex items-center gap-2 text-xl font-black tracking-tight text-slate-800">
          <span>📚 Metodologia e Dados Abertos</span>
        </h2>
        <p className="text-sm font-medium text-slate-600">
          Entenda a procedência dos dados abertos, as réguas de validação e as limitações das plataformas públicas.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <RadarEvidenceBadge
            level="experimental"
            label="Base pública processada"
            detail="leituras abertas do ecossistema INEA/WebLakes com validação cívico-técnica do portal"
          />
          <RadarEvidenceBadge
            level="interpretive"
            label="Leituras territoriais"
            detail="priorização pública e justiça ambiental, não causalidade individual"
          />
        </div>
      </div>

      <div className="space-y-10">
        <section className="space-y-4 rounded-[2rem] border border-sky-200 bg-[linear-gradient(180deg,#ffffff,#f0f9ff)] p-5 shadow-[0_20px_45px_-34px_rgba(14,165,233,0.35)]">
          <div className="space-y-2">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-700">Roteiro de auditoria pública</div>
            <h3 className="text-lg font-black tracking-tight text-slate-900">Como usar o Radar sem pular etapas de confiança</h3>
            <p className="max-w-3xl text-xs font-semibold leading-relaxed text-slate-600">
              Esta metodologia não existe só para consulta. Ela organiza a ordem mínima de auditoria para qualquer leitura pública séria do monitoramento.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {AUDIT_STEPS.map((item) => (
              <div key={item.step} className="rounded-[1.5rem] border border-sky-100 bg-white p-4 shadow-[0_14px_30px_-26px_rgba(15,23,42,0.22)]">
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-700">{item.step}</div>
                <p className="mt-2 text-[11px] font-semibold leading-relaxed text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="governanca-parametros" className="space-y-6">
          <RadarGovernanceBoard summary={displaySummary} stationMetadata={stationMetadata} />
          <RadarGovernanceScoreboard stationMetadata={stationMetadata} />
          <RadarConfidenceSnapshot summary={displaySummary} stationMetadata={stationMetadata} />
          <RadarMaturityScorecard summary={displaySummary} stationMetadata={stationMetadata} />
          <RadarEvidenceDictionary />
          <RadarEvidenceActionGuide onNavigate={onNavigate} onOpenLai={onOpenLai} />
          <RadarTransparencyRoadmap />
          <RadarImplementationStatus />
          <RadarRevisionHistory stationMetadata={stationMetadata} />
          <RadarPublicPendingLedger onNavigate={onNavigate} onOpenLai={onOpenLai} />

          <div className="space-y-2">
            <h3 className="text-lg font-black text-slate-800">Quadro público de governança por parâmetro</h3>
            <p className="max-w-4xl text-xs font-semibold leading-relaxed text-slate-600">
              Nem todo dado do Radar tem o mesmo peso metodológico. Este quadro organiza o que já está liberado para leitura pública, o que está em regime
              experimental e o que permanece fora da camada operacional.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {PARAMETER_GOVERNANCE_ITEMS.map((item) => (
              <div
                key={item.parameter}
                className="space-y-4 rounded-[1.75rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f8fafc)] p-5 shadow-[0_16px_34px_-28px_rgba(15,23,42,0.35)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{item.scope}</div>
                    <h4 className="mt-1 text-base font-black tracking-tight text-slate-900">{item.parameter}</h4>
                  </div>
                  <RadarEvidenceBadge level={toEvidenceBadgeLevel(item.level)} label={item.status} detail={item.scope} />
                </div>

                <p className="text-xs font-semibold leading-relaxed text-slate-600">{item.description}</p>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Regra de liberação pública</div>
                  <p className="mt-1 text-[11px] font-semibold leading-relaxed text-slate-700">{item.releaseRule}</p>
                </div>

                <RadarEvidenceStateBlock
                  state={item.evidenceState}
                  title={getEvidenceStateLabel(item.evidenceState)}
                  description={item.evidenceDescription}
                />
              </div>
            ))}
          </div>
        </section>

        <RadarHistoricalResearchPanel />

        <div className="space-y-4">
          <h3 className="pl-1 text-xs font-black uppercase tracking-widest text-slate-400">
            Como Ler Sem Cair em Erro — Guia de Confiança
          </h3>

          <div className="max-w-4xl space-y-3">
            {FAQ_ITEMS.map((item, idx) => (
              <details
                key={idx}
                className="group overflow-hidden rounded-[1.6rem] border border-slate-200/80 bg-white shadow-[0_18px_40px_-34px_rgba(15,23,42,0.35)] transition-all duration-300 open:border-emerald-200 open:bg-emerald-50/30"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between p-4 text-xs font-black text-slate-800 select-none hover:bg-slate-50/40">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-700 group-open:bg-emerald-100 group-open:text-emerald-700">
                      {item.icon}
                    </span>
                    <span>{item.title}</span>
                  </div>
                  <span className="shrink-0 transition-transform duration-300 group-open:rotate-180">
                    <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="border-t border-slate-100 p-4 pt-0 text-[11px] font-semibold leading-relaxed text-slate-650">{item.content}</div>
              </details>
            ))}
          </div>
        </div>

        <section id="iqar" className="space-y-6 border-t border-slate-100 pt-4">
          <div className="space-y-2">
            <h2 className="text-lg font-black text-slate-800">Como o INEA classifica o ar</h2>
            <p className="text-xs font-semibold leading-relaxed text-slate-500">
              Entenda o cálculo do IQAr, os subíndices de cada poluente e as 5 classificações oficiais adotadas pelo órgão de fiscalização.
            </p>
            <RadarEvidenceBadge level="strong" label="Camada normativa" detail="explicação do índice e das réguas oficiais de classificação" />
          </div>
          <AqiExplainer />
        </section>

        <section id="novos-parametros" className="space-y-6 border-t border-slate-100 pt-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-black text-slate-800">SO₂ e CO — camada experimental 2024</h2>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Fase Experimental · Publicação Cautelosa
              </span>
            </div>
            <p className="max-w-3xl text-xs font-semibold leading-relaxed text-slate-500">
              Publicação controlada de novos gases atmosféricos para o ano de 2024. As comparações com OMS e CONAMA 506 são experimentais.{" "}
              <span className="font-black text-slate-700">{RADAR_EXPERIMENTAL_WEBLAKES_SEAL}.</span>
            </p>
            <RadarEvidenceBadge level="experimental" label="Expansão cautelosa" detail={`dados úteis para observação pública, ainda sem cadeia oficial explícita de ${RADAR_OFFICIAL_RECORD_QAQC_NOTE}`} />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {gases2024StationSummary.map((item, idx) => (
              <div key={idx} className="card-tecnico flex flex-col justify-between space-y-4 rounded-2xl p-5 shadow-md transition-all duration-300 hover:shadow-lg">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <strong className="text-base font-black text-white">{item.pollutant}</strong>
                      <span className="block text-[10px] font-bold text-slate-400">{item.station_name}</span>
                    </div>
                    <span className="shrink-0 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[9px] font-black uppercase text-emerald-300">
                      {item.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-t border-slate-800 pt-2 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Média Período</span>
                      <strong className="block font-black text-white">
                        {item.period_mean.toFixed(3)} {item.pollutant === "CO" ? "ppm" : "µg/m³"}
                      </strong>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Pico Horário</span>
                      <strong className="block font-black text-white">
                        {item.hourly_peak.toFixed(3)} {item.pollutant === "CO" ? "ppm" : "µg/m³"}
                      </strong>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Cobertura</span>
                      <strong className="block font-black text-white">{item.coverage_percent.toFixed(2)}%</strong>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Dias Válidos</span>
                      <strong className="block font-black text-white">{item.valid_days} dias</strong>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Exced. OMS</span>
                      <strong className="block font-black text-white">
                        {item.who_exceedance_days} {item.who_exceedance_days === 1 ? "dia" : "dias"}
                      </strong>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Exced. CONAMA</span>
                      <strong className="block font-black text-white">
                        {item.conama_exceedance_events} {item.conama_exceedance_events === 1 ? "evento" : "eventos"}
                      </strong>
                    </div>
                    {item.pollutant === "CO" && (
                      <div className="col-span-2 space-y-0.5 border-t border-dashed border-slate-800 pt-1.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Máxima Média Móvel 8h (CONAMA)</span>
                        <strong className="block font-black text-white">{item.moving_8h_max?.toFixed(3)} ppm</strong>
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-3 font-sans text-[10px] font-medium leading-normal text-slate-300">
                    {item.methodology_note}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-[10px] font-bold">
                  <span className="text-slate-400">Preview 2024</span>
                  <a
                    href={
                      item.pollutant === "SO2"
                        ? "/reports/estado-da-nacao-inea-so2-2024-publicacao-cautelosa.md"
                        : "/reports/estado-da-nacao-inea-co-2024-unidade-janela8h.md"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-0.5 text-emerald-400 hover:text-emerald-350 hover:underline"
                  >
                    Ver Relatório Analítico →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="parametros-bloqueados" className="space-y-6 border-t border-slate-100 pt-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-black text-slate-800">Parâmetros ainda em auditoria</h2>
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-600">
                Quarentena Técnica
              </span>
            </div>
            <p className="max-w-3xl text-xs font-semibold leading-relaxed text-slate-500">
              Esses parâmetros não foram liberados como camada pública ativa. A decisão evita conclusões acima do que os dados sustentam.
            </p>
            <RadarEvidenceBadge level="insufficient" label="Quarentena técnica" detail="dados retidos por anomalia, indisponibilidade ou insuficiência metodológica" />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="card-tecnico flex flex-col justify-between space-y-3 rounded-2xl p-4 opacity-75 transition-all duration-300 hover:shadow-sm">
              <div>
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-black text-white">NO₂</strong>
                  <span className="rounded border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[9px] font-black uppercase text-amber-300">
                    Em Auditoria Crítica
                  </span>
                </div>
                <p className="mt-1 text-[11px] font-semibold text-slate-350">
                  Dióxido de Nitrogênio: em auditoria crítica por provável anomalia de linha de base no Retiro.
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800 pt-2 text-[10px] font-bold">
                <a href="/reports/estado-da-nacao-inea-no2-retiro-2024-auditoria-critica.md" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 hover:underline">
                  Ver Relatório Analítico →
                </a>
              </div>
            </div>

            <div className="card-tecnico flex flex-col justify-between space-y-3 rounded-2xl p-4 opacity-75 transition-all duration-300 hover:shadow-sm">
              <div>
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-black text-white">PTS</strong>
                  <span className="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-[9px] font-black uppercase text-slate-400">
                    Somente Histórico-Técnico
                  </span>
                </div>
                <p className="mt-1 text-[11px] font-semibold text-slate-350">
                  Partículas Totais em Suspensão: somente histórico-técnico em auditoria por provável anomalia de escala no Retiro.
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800 pt-2 text-[10px] font-bold">
                <a href="/reports/estado-da-nacao-inea-pts-retiro-2024-auditoria-critica.md" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 hover:underline">
                  Ver Relatório Analítico →
                </a>
              </div>
            </div>

            <div className="card-tecnico flex flex-col justify-between space-y-3 rounded-2xl p-4 opacity-75 transition-all duration-300 hover:shadow-sm">
              <div>
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-black text-white">O₃</strong>
                  <span className="rounded border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[9px] font-black uppercase text-rose-300">
                    Em Auditoria
                  </span>
                </div>
                <p className="mt-1 text-[11px] font-semibold text-slate-350">
                  Ozônio: sem transmissão no recorte de 2024, mas recuperado no triênio 2013-2015 com métrica ainda divergente da validação cruzada.
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800 pt-2 text-[10px] font-bold">
                <a href="/reports/estado-da-nacao-inea-o3-2024-indisponivel.md" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 hover:underline">
                  Ver Relatório Analítico →
                </a>
              </div>
            </div>
          </div>

          <RadarVisualNotice
            type="quarantine"
            title="Auditoria e Garantia Metodológica"
            description="Verifique o relatório final de garantia metodológica do Lote C para o ano bissexto 2024. Essa validação é interna ao Observatório e não substitui QA/QC oficial por registro."
            nextStep="Acesse o relatório analítico no link ao lado."
            action={() => window.open("/reports/estado-da-nacao-observatorio-lote-c-qa-final.md", "_blank")}
            actionLabel="Ver Relatório de QA Lote C →"
          />
        </section>

        <section id="sedimentaveis" className="space-y-6 border-t border-slate-100 pt-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-black text-slate-800">Partículas sedimentáveis / “pó preto”</h2>
              <RadarEvidenceBadge
                level="interpretive"
                label="Eixo paralelo em preparação"
                detail="tema público relevante para Volta Redonda, mas fora da lógica do IQAr"
              />
            </div>
            <p className="max-w-3xl text-xs font-semibold leading-relaxed text-slate-500">
              O Radar deve tratar partículas sedimentáveis como camada própria de deposição material e incômodo ambiental. Essa leitura não deve ser misturada
              automaticamente com PM10, PM2.5, OMS ou IQAr.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-[0_16px_34px_-28px_rgba(15,23,42,0.35)]">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">O que é</div>
              <h4 className="mt-2 text-base font-black text-slate-900">Deposição material</h4>
              <p className="mt-2 text-[11px] font-semibold leading-relaxed text-slate-600">
                Camada voltada a material sedimentável, poeira fugitiva, deposição seca e incômodo ambiental percebido pela população.
              </p>
            </div>
            <div className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-[0_16px_34px_-28px_rgba(15,23,42,0.35)]">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">O que não é</div>
              <h4 className="mt-2 text-base font-black text-slate-900">Não é IQAr</h4>
              <p className="mt-2 text-[11px] font-semibold leading-relaxed text-slate-600">
                Não deve ser apresentado como continuação direta da régua de saúde respiratória usada para particulados inaláveis e gases.
              </p>
            </div>
            <div className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-[0_16px_34px_-28px_rgba(15,23,42,0.35)]">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Próxima entrega</div>
              <h4 className="mt-2 text-base font-black text-slate-900">Memória pública própria</h4>
              <p className="mt-2 text-[11px] font-semibold leading-relaxed text-slate-600">
                O caminho correto é criar um eixo com evidências, documentos, ciclos de coleta e leitura territorial específica, separado do painel respiratório.
              </p>
            </div>
          </div>

          <RadarVisualNotice
            type="quarantine"
            title="Separação metodológica obrigatória"
            description="Partículas sedimentáveis podem fortalecer o observatório, mas só como eixo paralelo de deposição material, fiscalização e incômodo ambiental. Misturar essa camada com IQAr enfraquece a defensabilidade técnica do Radar."
          />
        </section>

        <div className="space-y-4 border-t border-slate-100 pt-4">
          <div className="rounded-[1.8rem] border border-sky-200 bg-[linear-gradient(180deg,#ffffff,#f0f9ff)] p-5 shadow-[0_20px_45px_-34px_rgba(14,165,233,0.35)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-700">Contrato público da exportação</div>
                <h3 className="text-base font-black tracking-tight text-slate-900">Manifesto, CSV bruto e rota paginada</h3>
                <p className="max-w-3xl text-[11px] font-semibold leading-relaxed text-slate-600">
                  O Radar já publica um manifesto legível por máquina com colunas, filtros, limites e sinalização de truncamento, além da rota de exportação CSV
                  bruta e da série paginada via `offset`.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href="/api/air/inea/export-manifest"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[38px] items-center justify-center rounded-2xl border border-sky-200 bg-white px-4 text-[10px] font-black uppercase tracking-[0.16em] text-sky-800 transition-colors hover:border-sky-300"
                >
                  Abrir manifesto
                </a>
                <a
                  href="/api/air/inea/export?metricType=GENERAL_AQI"
                  className="inline-flex min-h-[38px] items-center justify-center rounded-2xl bg-slate-950 px-4 text-[10px] font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-sky-700"
                >
                  Baixar CSV bruto
                </a>
                <a
                  href="/api/air/inea/export-catalog"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[38px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[10px] font-black uppercase tracking-[0.16em] text-slate-700 transition-colors hover:border-slate-300"
                >
                  Ver catálogo de partições
                </a>
                <a
                  href="/api/air/inea/stations-metadata"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[38px] items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 px-4 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-800 transition-colors hover:border-emerald-300"
                >
                  Metadados das estações
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.35)]">
            <div className="space-y-2">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Centro de downloads particionados</div>
              <h3 className="text-base font-black tracking-tight text-slate-900">Recortes prontos para auditoria reproduzível</h3>
              <p className="max-w-3xl text-[11px] font-semibold leading-relaxed text-slate-600">
                Em vez de depender de uma exportação massiva única, o catálogo público já organiza fatias anuais e por estação. Isso reduz atrito para
                jornalistas, pesquisadores e controle social repetirem a análise.
              </p>
            </div>

            {catalogError ? (
              <div className="pt-4">
                <RadarVisualNotice
                  type="warning"
                  title="Catálogo público temporariamente indisponível"
                  description={catalogError}
                  nextStep="Enquanto isso, use o manifesto da API e a exportação bruta direta para manter a auditoria ativa."
                />
              </div>
            ) : (
              <div className="grid gap-4 pt-4 lg:grid-cols-2">
                <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Partições anuais</div>
                  <div className="mt-3 space-y-2">
                    {topYearPartitions.length > 0 ? (
                      topYearPartitions.map((partition) => (
                        <a
                          key={partition.year}
                          href={partition.url}
                          className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-700 transition-colors hover:border-sky-300 hover:text-sky-800"
                        >
                          <span>{partition.year}</span>
                          <span>
                            {partition.from} a {partition.to}
                          </span>
                        </a>
                      ))
                    ) : (
                      <p className="text-[11px] font-semibold leading-relaxed text-slate-500">O catálogo ainda não publicou partições anuais disponíveis.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Partições por estação</div>
                  <div className="mt-3 space-y-2">
                    {topStationPartitions.length > 0 ? (
                      topStationPartitions.map((partition) => (
                        <a
                          key={partition.station_id}
                          href={partition.url}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-700 transition-colors hover:border-emerald-300 hover:text-emerald-800"
                        >
                          <span>{partition.station_name}</span>
                          <span className="text-right text-[10px] uppercase tracking-[0.12em] text-slate-500">
                            {[partition.neighborhood, partition.city].filter(Boolean).join(" · ") || partition.station_id}
                          </span>
                        </a>
                      ))
                    ) : (
                      <p className="text-[11px] font-semibold leading-relaxed text-slate-500">O catálogo ainda não publicou partições por estação disponíveis.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between gap-4 rounded-2xl border-2 border-emerald-500/30 bg-emerald-50 p-4 text-emerald-950 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-base">🛡️</span>
                <strong className="text-xs font-black uppercase tracking-wider text-emerald-800">Dados Abertos Auditáveis</strong>
              </div>
              <p className="text-[11px] font-semibold leading-normal text-emerald-700">
                Garantia de Transparência e Acessibilidade. Todas as planilhas disponibilizadas correspondem integralmente aos dados consolidados das APIs oficiais.
              </p>
            </div>
            <div className="shrink-0 rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1.5 text-center text-[9px] font-black uppercase tracking-widest text-emerald-800">
              Manifesto público versionado
            </div>
          </div>

          <h3 className="pl-1 pt-2 text-xs font-black uppercase tracking-widest text-slate-400">
            Atalhos de Downloads (Formatos Livres)
          </h3>
          <p className="pl-1 text-[11px] font-semibold leading-relaxed text-slate-500">
            Estes são atalhos principais. A lista completa e versionada fica no manifesto público, que deve ser usado como fonte de verdade para auditoria.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {AIR_PUBLIC_DOWNLOADS.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between space-y-4 rounded-[1.8rem] border border-emerald-200 bg-[linear-gradient(180deg,#ffffff,#f0fdf4)] p-5 shadow-[0_20px_45px_-34px_rgba(16,185,129,0.45)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_24px_52px_-34px_rgba(16,185,129,0.6)]"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-block rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-[8px] font-black tracking-[0.16em] text-emerald-700">{item.format}</span>
                    <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">versionado</span>
                  </div>
                  <h4 className="text-sm font-black leading-snug text-slate-900">{item.title}</h4>
                  <p className="text-[10px] font-semibold leading-relaxed text-slate-600">{item.desc}</p>
                </div>
                <a
                  href={getAirPublicDataPath(item.file)}
                  download={item.file.endsWith(".csv") ? item.file : undefined}
                  className="inline-flex min-h-[38px] w-full items-center justify-center rounded-2xl bg-slate-950 text-[10px] font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-emerald-600"
                >
                  {item.file.endsWith(".csv") ? "📥 Baixar arquivo" : "Ver manifesto"}
                </a>
              </div>
            ))}
          </div>
        </div>

        <div id="evidencias" className="border-t border-slate-100 pt-4">
          <HistoricalRawEvidenceBox />
        </div>

        <section id="metodologia" className="space-y-6 border-t border-slate-100 pt-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-black text-slate-800">Metodologia e Nível de Confiança</h2>
              <Link
                to="/qualidade-ar/inea/metodologia"
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-600 shadow-sm transition-colors hover:bg-emerald-100"
              >
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Dados abertos versionados · verificação operacional registrada
              </Link>
            </div>
            <p className="text-xs font-semibold leading-relaxed text-slate-500">
              Entenda a procedência dos dados, as réguas de validação e as limitações das plataformas públicas.
            </p>
            <RadarEvidenceBadge level="interpretive" label="Força da evidência" detail="separe dado observado, dado processado e hipótese de interpretação" />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="card-leitura space-y-3 rounded-2xl p-5">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">As Três Camadas de Dados</h4>
              <div className="space-y-2 text-xs font-semibold leading-relaxed text-slate-650">
                <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /><span><strong>Dado bruto horário público:</strong> WebLakes/INEAPublico (2024).</span></div>
                <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /><span><strong>Índice oficial:</strong> Planilhas IQAr do INEA/Dados Abertos (2022-2025).</span></div>
                <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" /><span><strong>Dado agregado de relatório:</strong> Artigos e relatórios consolidados.</span></div>
              </div>
            </div>

            <div className="card-leitura space-y-3 rounded-2xl p-5">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Limitações do WebLakes</h4>
              <p className="text-xs font-semibold leading-relaxed text-slate-600">
                Os dados brutos coletados da plataforma do INEA não contam com sinalização técnica de validação (QA/QC) explícita. Valores picos ou sequências de zeros persistentes podem representar anomalias instrumentais sem verificação oficial. Por isso, {RADAR_EXPERIMENTAL_COMPARISON_NOTE.toLowerCase()}
              </p>
            </div>

            <div className="card-leitura space-y-3 rounded-2xl p-5">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Regras de Cálculo</h4>
              <p className="text-xs font-semibold leading-relaxed text-slate-600">
                <strong>Validade diária:</strong> Para calcular a média diária de um poluente, exige-se no mínimo 18 horas válidas (75% de representatividade). <strong>Cobertura:</strong> Mede a quantidade de leituras válidas recebidas em relação à cadência esperada do sensor no período. {RADAR_NO_DATA_NOT_CLEAN_AIR}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/qualidade-ar/inea/metodologia"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-xs font-black uppercase tracking-[0.1em] text-white shadow-md shadow-brand-primary/10 transition-all hover:bg-brand-primary-dark"
            >
              Entender metodologia →
            </Link>
            <Link
              to="/qualidade-ar/inea/metodologia#baixar-dados"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-black uppercase tracking-[0.1em] text-slate-700 transition-all hover:bg-slate-50"
            >
              Baixar dados
            </Link>
            <Link
              to="/qualidade-ar/inea/metodologia#dicionario"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-black uppercase tracking-[0.1em] text-slate-700 transition-all hover:bg-slate-50"
            >
              Ver dicionário de dados
            </Link>
          </div>
        </section>

        <div className="card-tecnico relative space-y-6 overflow-hidden rounded-3xl border border-[#0d2e46] p-6 shadow-xl md:p-8">
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 max-w-3xl space-y-3">
            <h2 className="text-xl font-black tracking-tight text-white md:text-2xl">Queremos a série completa</h2>
            <p className="text-sm font-medium leading-relaxed text-slate-300">
              Se as estações já mediam antes de 2022, os dados anteriores também precisam estar disponíveis em formato aberto.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpenLai}
              className="cursor-pointer rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-black text-slate-950 shadow-md shadow-emerald-600/10 transition-colors hover:bg-emerald-400"
            >
              Ver minuta de LAI
            </button>
            <Link
              to="/qualidade-ar/inea/metodologia"
              className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-xs font-bold text-slate-100 transition-colors hover:bg-slate-750"
            >
              Ver análise técnica completa
            </Link>
            <Link
              to="/dados"
              className="rounded-xl border border-slate-700/60 bg-slate-800 px-5 py-2.5 text-xs font-bold text-slate-300 transition-colors hover:bg-slate-750"
            >
              Voltar para Dados
            </Link>
          </div>
        </div>
      </div>

      <RadarNextReadingCard
        eyebrow="Próxima leitura recomendada"
        title="Com a regra metodológica clara, volte ao Radar para testar se cada painel está sendo lido com a cautela correta."
        description="A metodologia fecha o circuito de confiança. O melhor uso agora é retornar à visão geral ou à cobertura das estações e reler os achados já sabendo distinguir evidência forte, interpretação e limite operacional."
        caution="Metodologia lida e não reaplicada nos painéis vira documentação decorativa, não transparência efetiva."
        primary={{ label: "Voltar à visão geral", mode: "OVERVIEW" }}
        secondary={{ label: "Reabrir cobertura", mode: "TIME", tab: "COVERAGE" }}
        onNavigate={onNavigate}
      />

      <RadarModeFooter
        nextStep="Próximo passo recomendado: Volte à Visão Geral para ver as atualizações e rankings de atenção."
        primaryLabel="Voltar à Visão Geral →"
        onPrimary={() => onNavigate("OVERVIEW")}
        onTop={onTop}
      />
    </div>
  );
}
