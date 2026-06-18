import type { EvidenceState } from "./RadarEvidenceStateBlock";
import type { StationMetadataItem } from "./RadarTypes";
import { RADAR_EXPERIMENTAL_OBSERVATION_NOTE, RADAR_OFFICIAL_RECORD_QAQC_NOTE } from "../../../data/air/radar-copy";

export type ParameterGovernanceLevel = "strong" | "advancing" | "experimental" | "insufficient" | "interpretive";
export type StationGovernanceLevel = "strong" | "advancing" | "experimental";

export interface ParameterGovernanceItem {
  parameter: string;
  scope: string;
  status: string;
  level: ParameterGovernanceLevel;
  description: string;
  releaseRule: string;
  evidenceState: EvidenceState;
  evidenceDescription: string;
}

export const PARAMETER_GOVERNANCE_ITEMS: ParameterGovernanceItem[] = [
  {
    parameter: "PM10",
    scope: "Série histórica principal",
    status: "Liberado com cautela experimental",
    level: "experimental",
    description: "É a camada mais madura do Radar em série pública, com leitura plurianual, cobertura por estação e comparação OMS/CONAMA.",
    releaseRule: `Pode sustentar triagem pública e leitura histórica, sem se apresentar como ${RADAR_OFFICIAL_RECORD_QAQC_NOTE}.`,
    evidenceState: "partial",
    evidenceDescription: `Série pública consolidada, comparação normativa e cobertura por estação já estão visíveis, mas falta cadeia oficial explícita de ${RADAR_EXPERIMENTAL_OBSERVATION_NOTE}.`
  },
  {
    parameter: "PM2.5",
    scope: "Série histórica desde 2021",
    status: "Liberado com cautela experimental",
    level: "experimental",
    description: "Sustenta leitura relevante de exposição respiratória fina, mas a série pública começa depois do PM10 e tem janelas de cobertura mais curtas.",
    releaseRule: "Pode sustentar leitura pública comparativa, sempre com aviso de cobertura e experimentalidade.",
    evidenceState: "partial",
    evidenceDescription: "A camada já tem publicação auditável suficiente para comparação pública, mas a janela histórica menor ainda exige cautela reforçada."
  },
  {
    parameter: "SO2",
    scope: "Expansão plurianual publicada",
    status: "Experimental expandido",
    level: "experimental",
    description: "Já possui série no portal e ajuda a identificar episódios ligados a combustão industrial, mas ainda em regime de publicação cautelosa.",
    releaseRule: "Usar como observação experimental; não superdimensionar causalidade nem equivalência com validação oficial fechada.",
    evidenceState: "partial",
    evidenceDescription: "Há publicação funcional e útil para observação pública, mas a cadeia de validação oficial ainda não está integralmente exposta."
  },
  {
    parameter: "CO",
    scope: "Expansão plurianual publicada",
    status: "Experimental expandido",
    level: "experimental",
    description: "É útil para leitura complementar da mistura atmosférica, inclusive em janela móvel de 8 horas.",
    releaseRule: "Usar como camada complementar experimental, não como eixo isolado de conclusão pública.",
    evidenceState: "partial",
    evidenceDescription: "A série já pode ser auditada no portal, mas o uso correto ainda é complementar e dependente de contexto metodológico explícito."
  },
  {
    parameter: "NO2",
    scope: "Base retida",
    status: "Bloqueado em auditoria crítica",
    level: "insufficient",
    description: "Foi segurado corretamente por provável anomalia de linha de base e não deve reentrar na UI antes de auditoria concluída.",
    releaseRule: "Só liberar com critério técnico público, relatório de auditoria e regra clara de correção ou exclusão.",
    evidenceState: "missing",
    evidenceDescription: "Não existe hoje prova pública suficiente para uso operacional responsável dessa camada no Radar."
  },
  {
    parameter: "PTS",
    scope: "Memória técnica",
    status: "Histórico técnico em auditoria",
    level: "interpretive",
    description: "Tem valor para memória de engenharia e debate público histórico, mas não deve ser confundido com a lógica atual do IQAr e dos particulados finos.",
    releaseRule: "Manter fora da camada operacional do Radar até revisão técnica específica.",
    evidenceState: "external",
    evidenceDescription: "A sustentação atual é de memória técnica e trilha externa de pesquisa, não de camada operacional consolidada."
  },
  {
    parameter: "Meteorologia",
    scope: "Camada auxiliar",
    status: "Mista: vento observado, demais variáveis estimadas",
    level: "interpretive",
    description: "O manifesto já diferencia ventos reais de variáveis simuladas por médias locais, o que exige leitura separada.",
    releaseRule: "Separar visualmente vento observado de condições atmosféricas estimadas.",
    evidenceState: "partial",
    evidenceDescription: "A separação metodológica já está declarada, mas a camada continua exigindo leitura distinta entre observação e estimativa."
  }
];

export function scoreStationGovernance(station: StationMetadataItem) {
  const hasExplicitWindow = !station.operation_window.is_inferred;
  const hasPublishedWindowBounds = Boolean(station.operation_window.start_date && station.operation_window.end_date);
  const hasPublishedSource = Boolean(station.operation_window.source);
  const hasProvenanceNotes = station.provenance.notes.length > 0;

  const score =
    (hasExplicitWindow ? 40 : 15) +
    (station.active ? 25 : 10) +
    (hasPublishedWindowBounds ? 15 : 0) +
    (hasPublishedSource ? 10 : 0) +
    (hasProvenanceNotes ? 10 : 0);

  let level: StationGovernanceLevel = "experimental";
  if (score >= 85) {
    level = "strong";
  } else if (score >= 60) {
    level = "advancing";
  }

  return {
    score,
    level,
    hasExplicitWindow,
    hasPublishedWindowBounds,
    hasPublishedSource,
    hasProvenanceNotes
  };
}

export function getStationGovernanceLabel(level: StationGovernanceLevel) {
  switch (level) {
    case "strong":
      return "forte";
    case "advancing":
      return "em avanço";
    default:
      return "experimental";
  }
}

export function summarizeStationGovernance(stationMetadata: StationMetadataItem[]) {
  const scored = stationMetadata.map((item) => scoreStationGovernance(item));
  const total = scored.length;
  const strong = scored.filter((item) => item.level === "strong").length;
  const advancing = scored.filter((item) => item.level === "advancing").length;
  const experimental = scored.filter((item) => item.level === "experimental").length;
  const averageScore = total > 0 ? Math.round(scored.reduce((sum, item) => sum + item.score, 0) / total) : 0;

  return {
    total,
    strong,
    advancing,
    experimental,
    averageScore
  };
}

export function scoreParameterGovernance(item: ParameterGovernanceItem) {
  const levelPoints: Record<ParameterGovernanceLevel, number> = {
    strong: 40,
    advancing: 30,
    experimental: 24,
    interpretive: 18,
    insufficient: 8
  };

  const evidencePoints: Record<EvidenceState, number> = {
    published: 45,
    partial: 28,
    external: 18,
    missing: 5
  };

  const operationalBonus = item.scope.toLowerCase().includes("série") || item.scope.toLowerCase().includes("expansão") ? 15 : 5;
  const score = Math.min(100, levelPoints[item.level] + evidencePoints[item.evidenceState] + operationalBonus);

  return {
    score,
    level: item.level,
    evidenceState: item.evidenceState
  };
}
