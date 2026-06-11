import { assertAll, ok, readWorkspaceFile } from "./admin-smoke-lib.mjs";

const label = "UPLOAD CURATION REPORT SMOKE";
const script = readWorkspaceFile("scripts/upload-curation-queue-report.ts");
const packageJson = readWorkspaceFile("package.json");

assertAll(script, [
  'from("media_assets")',
  'from("acervo_items")',
  'from("blog_posts")',
  'from("reports")',
  'from("events")',
  'withoutOrigin',
  'withoutSourceName',
  'orphan',
  'readyToPreserve',
  'estado-da-nacao-upload-acervo-fila-curadoria.md',
  'estado-da-nacao-upload-acervo-fila-curadoria.csv',
  'getQueueCategory',
  'sem_link_origem',
  'sem_nome_fonte',
  'pronto_preservar',
  '/admin/uploads?queue=without_origin',
  '/admin/uploads?queue=without_source_name',
  '/admin/uploads?queue=orphan',
  '/admin/uploads?queue=ready_to_preserve',
], label);

assertAll(packageJson, [
  '"uploads:report:curation": "tsx scripts/upload-curation-queue-report.ts"',
], label);

ok(label, "Relatório operacional de uploads cruza assets recentes com usos públicos e filas de curadoria.");
