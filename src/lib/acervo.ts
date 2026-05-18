// acervo.ts — thin adapter over api.ts for the Acervo pages
// The pages use AcervoArea ("artigos" | "noticias" | "midias") to filter by kind groups.

export type { AcervoItem, AcervoKind, ListAcervoParams } from "./api";
export { listAcervoItems, getAcervoBySlug } from "./api";

import type { AcervoKind } from "./api";

export type AcervoArea = "artigos" | "noticias" | "midias" | "documentos";

export const ACERVO_KIND_LABELS: Record<AcervoKind, string> = {
    artigo_cientifico: "Artigo científico",
    noticia: "Notícia",
    materia: "Matéria",
    midia: "Mídia",
    foto: "Fotografia",
    video: "Vídeo",
    documento: "Documento",
    relatorio_tecnico: "Relatório técnico",
    memoria: "Memória",
    outro: "Link externo",
    paper: "Artigo científico",
    news: "Notícia",
    photo: "Fotografia",
    report: "Relatório",
    link: "Link externo"
};

// Map UI area → DB kind values
export const AREA_KINDS: Record<AcervoArea, AcervoKind[]> = {
    artigos: ["artigo_cientifico", "paper"],
    noticias: ["noticia", "materia", "news", "link", "outro"],
    midias: ["midia", "video", "foto", "memoria", "photo"],
    documentos: ["documento", "relatorio_tecnico", "report"]
};
