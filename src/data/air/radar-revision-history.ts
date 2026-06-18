import { RADAR_RELEASE_METADATA } from "./radar-release-metadata";

export const RADAR_REVISION_HISTORY_FILE = "radar-revision-history-2026-06.json";

export type RadarRevisionEntry = {
  cycle: string;
  referenceDate: string;
  status: "published" | "active" | "archived";
  scope: string;
  changes: string[];
  publicImpact: string;
  evidenceState: "published" | "partial" | "missing" | "external";
  proofs: Array<{
    label: string;
    href: string;
    external?: boolean;
  }>;
};

const CURRENT_RELEASE_ENTRY: RadarRevisionEntry = {
  cycle: RADAR_RELEASE_METADATA.cycleVersion,
  referenceDate: "16/06/2026",
  status: RADAR_RELEASE_METADATA.releaseStatus,
  scope: RADAR_RELEASE_METADATA.releaseScope,
  changes: RADAR_RELEASE_METADATA.releaseHighlights,
  publicImpact: "O Radar deixa de ser só painel de leitura e passa a expor o estado de qualidade institucional da própria base pública.",
  evidenceState: "published",
  proofs: [
    { label: "Manifesto da API", href: "/api/air/inea/export-manifest", external: true },
    { label: "Catálogo de partições", href: "/api/air/inea/export-catalog", external: true },
    { label: "Metodologia pública", href: "/qualidade-ar/inea/metodologia" }
  ]
};

const NEXT_RELEASE_ENTRY: RadarRevisionEntry = {
  cycle: "próximo ciclo",
  referenceDate: RADAR_RELEASE_METADATA.plannedReviewDate,
  status: "active",
  scope: "Fechamento de changelog operacional e próxima rodada de revisão pública do módulo.",
  changes: [
    "Publicar histórico público de mudanças com evidência por entrega institucional.",
    "Registrar o próximo movimento da malha e dos metadados operacionais.",
    "Preparar lastro para futura trilha de QA/QC e follow-up institucional."
  ],
  publicImpact: "Transforma revisão metodológica em compromisso contínuo, legível e auditável a cada rodada pública.",
  evidenceState: "partial",
  proofs: [
    { label: "Painel de pendências", href: "/qualidade-ar/inea/metodologia" },
    { label: "Metadados das estações", href: "/api/air/inea/stations-metadata", external: true }
  ]
};

export const RADAR_REVISION_HISTORY: RadarRevisionEntry[] = [
  CURRENT_RELEASE_ENTRY,
  {
    cycle: "2026.06-prior",
    referenceDate: "10/06/2026",
    status: "archived",
    scope: "Auditoria de fontes históricas e consolidação da base metodológica do módulo.",
    changes: [
      "Mapa de fontes, limites e trilhas históricas do Radar documentados.",
      "Camadas experimentais e limites de leitura pública explicitados.",
      "Primeira versão do relatório de auditoria do módulo consolidada."
    ],
    publicImpact: "Cria a base argumentativa para cobrança pública mais forte sobre séries históricas, QA/QC e completude da malha.",
    evidenceState: "external",
    proofs: [
      { label: "Relatório de auditoria", href: "/reports/estado-da-nacao-radar-inea-fontes-historicas-metodologia-20260610.md", external: true },
      { label: "Ver metodologia", href: "/qualidade-ar/inea/metodologia" }
    ]
  },
  NEXT_RELEASE_ENTRY
];
