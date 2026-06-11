import { assertAll, ok, readWorkspaceFile } from "./admin-smoke-lib.mjs";

const label = "ADMIN PRESERVED STORY UPLOAD SMOKE";
const uploadsPage = readWorkspaceFile("src/pages/admin/AdminUploadsPage.tsx");
const acervoEditPage = readWorkspaceFile("src/pages/admin/AdminAcervoEditPage.tsx");
const pressPreservationPage = readWorkspaceFile("src/pages/admin/AdminPressPreservationPage.tsx");

assertAll(uploadsPage, [
  'const ACERVO_EDITORIAL_TYPES = [',
  'value: "noticia"',
  'label: "Notícia ou matéria"',
  'function buildPreservedStoryLink(assetId: string, type = "noticia")',
  '`/admin/acervo/novo?assetId=${assetId}&type=${type}&autocapture=1`',
  'sourceName',
  'sourceUrl',
  'Prontos p/ preservar',
  'Criar matéria preservada com autocaptura',
  'hasOriginLink(asset)',
  'hasSourceName(asset)',
], label);

assertAll(acervoEditPage, [
  'searchParams.get("assetId")',
  'searchParams.get("type")',
  'searchParams.get("autocapture") === "1"',
  'if (!autoCaptureFromUrl || autoCaptureTriggered || loading) return;',
  'setSourceUrl((current) => current || asset.source_url || "");',
  'setSourceName((current) => current || asset.source_name || "");',
  'setIsCapturingArticle(true)',
  'source_capture: nextSourceCapture',
  'source_capture_history',
], label);

assertAll(pressPreservationPage, [
  'source_kind: "media_asset" as const',
  'candidate: "Pronta no upload"',
  'buildCandidateCaptureLink',
  'Criar item com autocaptura',
], label);

ok(label, "Upload de notícia/matéria preservada mantém link de origem, fonte e rota de autocaptura para o Acervo.");
