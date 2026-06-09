import { assertAll, ok, readWorkspaceFile } from "./admin-smoke-lib.mjs";

const label = "ADMIN PRESS PRESERVATION SMOKE";
const content = readWorkspaceFile("src/pages/admin/AdminPressPreservationPage.tsx");

assertAll(content, [
  'from("acervo_items")',
  'from("media_assets")',
  'source_kind?: "acervo_item" | "media_asset"',
  'candidate: "Pronta no upload"',
  'if (item.source_kind === "media_asset") return "candidate";',
  'buildCandidateCaptureLink',
  '.not("source_name", "is", null)',
  '.not("source_url", "is", null)',
  'linkedAssetIds',
  'source_kind: "media_asset" as const',
  'state === "candidate"',
  'topUploadCandidatesWithSource',
  'topExistingItemsWithSource',
  'openBatch',
  'focusBatchQueue',
  'uploadCandidatesCount',
  'existingRecaptureCount',
  'mixedBatchCount',
  'upload_candidates',
  'recapture_ready',
  'mixed_batch',
  'Operação em lote',
  'Volumes prontos por tipo de ação',
  'Uploads prontos',
  'Para recaptura',
  'Lote misto',
  'Abrir 3 uploads prontos',
  'Abrir 3 para recaptura',
  'Abrir lote misto',
  'Veio do upload',
  'Criar item com autocaptura',
], label);

ok(label, "Press preservation queue merges acervo backlog with ready upload candidates and routes them into autocapture creation.");
