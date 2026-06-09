import { assertAll, ok, readWorkspaceFile } from "./admin-smoke-lib.mjs";

const label = "TRANSPARENCIA VIVA SMOKE";
const content = readWorkspaceFile("src/pages/TransparenciaPage.tsx");
const packageJson = readWorkspaceFile("package.json");
const parserScript = readWorkspaceFile("tools/transparency-live-parse-pdf.py");
const importScript = readWorkspaceFile("tools/transparency-live-import.mjs");
const seedScript = readWorkspaceFile("tools/transparency-live-seed-from-pdfs.mjs");
const adminEditor = readWorkspaceFile("src/pages/admin/AdminTransparencyLiveEditPage.tsx");
const parserUtil = readWorkspaceFile("src/lib/transparencyLiveParser.ts");

assertAll(content, [
  "listConversations",
  "Transparência viva",
  "Escutas, território e devolutiva pública",
  "Onde as escutas e atividades têm acontecido",
  "Transparência aqui significa mostrar o território, não só publicar números",
  "Escutas e ações ao longo dos meses",
  "Prioridades mais citadas",
  "Sinais qualitativos",
  "Prestação de contas financeira disponível no portal da FEC",
  "Abrir transparência financeira da FEC",
  "FEC_TRANSPARENCIA_URL",
  "liveTransparency.hearings.length",
  "liveTransparency.activities.length",
  "liveTransparency.territoryCounts.length",
  'to="/conversar"',
  "LIVE_TRANSPARENCIA_REPORTS",
  "monthlyTransparency.latest"
], label);

assertAll(packageJson, [
  '"transparency-live:seed": "node tools/transparency-live-seed-from-pdfs.mjs"',
  '"transparency-live:import": "node tools/transparency-live-import.mjs"',
  '"pdfjs-dist":'
], label);

assertAll(parserScript, [
  "from pypdf import PdfReader",
  "def parse_report(pdf_path: Path) -> dict:",
  '"status": "published"'
], label);

assertAll(importScript, [
  'from("transparency_live_reports")',
  'upsert(item, { onConflict: "month_key" })'
], label);

assertAll(seedScript, [
  "tools/transparency-live-parse-pdf.py",
  "Nenhum interpretador Python com pypdf disponivel"
], label);

assertAll(adminEditor, [
  "Colar texto do relatório mensal",
  "Ler PDF e preencher",
  "Preencher a partir do texto",
  "extractPdfText",
  "extractPdfTextFromBlob",
  "duplicateMonthReport",
  "Duplicidade detectada",
  "Já existe um fechamento para este mês",
  "Abrir fechamento existente",
  "source_asset_id",
  "Documento de origem",
  "Nenhum PDF de origem vinculado.",
  "PDFs recentes do acervo",
  "Use um PDF já enviado ao portal",
  "handleUseRecentPdf",
  "O PDF é lido no navegador",
  "parseLiveTransparencyReportText",
  "Cole aqui o texto bruto do relatório mensal exportado ou use Ler PDF e preencher."
], label);

assertAll(readWorkspaceFile("src/pages/admin/AdminTransparencyLiveListPage.tsx"), [
  "source_asset_id",
  "source_url",
  "Continuar mês atual",
  "Continuar edição",
  "Abrir novo mês",
  "Rastreabilidade",
  "Com PDF-base",
  "Sem vínculo",
  "PDF rastreado",
  "sem vínculo",
  "abrir origem",
  "Novo fechamento a partir de PDF",
  "assetId=",
  "Usar agora"
], label);

assertAll(readWorkspaceFile("src/pages/admin/AdminDashboardPage.tsx"), [
  "transparencyLiveWithoutSourceAsset",
  "transparency_live_reports",
  "source_asset_id.is.null,source_asset_id.eq.''",
  "fechamento(s) sem PDF de origem",
  "TV sem PDF-base"
], label);

assertAll(parserUtil, [
  "export function parseLiveTransparencyReportText",
  "Encaminhamentos recomendados",
  "Pendências de revisão"
], label);

ok(label, "Transparency page presents escutas, território e devolutiva pública com rodapé financeiro externo.");
