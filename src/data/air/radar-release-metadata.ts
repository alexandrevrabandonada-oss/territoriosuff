export const RADAR_RELEASE_METADATA_FILE = "radar-release-metadata.json";

export type RadarReleaseMetadata = {
  cycleVersion: string;
  datasetVersion: string;
  methodologyVersion: string;
  plannedReviewDate: string;
  releaseStatus: "published" | "active";
  releaseScope: string;
  releaseHighlights: string[];
  generatedAt?: string;
  commitHash?: string;
};

export const RADAR_RELEASE_METADATA: RadarReleaseMetadata = {
  cycleVersion: "2026.06-a",
  datasetVersion: "1.6.2",
  methodologyVersion: "2026-06-16",
  plannedReviewDate: "30/06/2026",
  releaseStatus: "published",
  releaseScope: "Blindagem metodológica, governança comparável e transparência operacional do Radar INEA.",
  releaseHighlights: [
    "Manifesto, exportação bruta, catálogo de partições e contratos públicos validados.",
    "Régua comparável de governança por estação e por parâmetro publicada no módulo.",
    "Defensabilidade projetada para visão geral, tempo, território, estações e metodologia."
  ]
};
