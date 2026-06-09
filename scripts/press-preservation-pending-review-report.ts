import * as fs from "node:fs";
import * as path from "node:path";
import { createClient } from "@supabase/supabase-js";

type PressItem = {
  id: string;
  title: string;
  slug: string;
  source_name?: string | null;
  source_url?: string | null;
  meta?: Record<string, unknown> | null;
};

const ENV_FILE = fs.existsSync(".env.local") ? ".env.local" : ".env";

function parseEnvFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) return {};
  const raw = fs.readFileSync(filePath, "utf8");
  const env: Record<string, string> = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function getSourceCapture(meta: Record<string, unknown> | null | undefined) {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return null;
  const candidate = meta.source_capture;
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return null;
  return candidate as Record<string, unknown>;
}

function getEditorialStatus(meta: Record<string, unknown> | null | undefined) {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return "pending_review";
  const candidate = meta.editorial_preservation_status;
  if (candidate === "ready" || candidate === "needs_recapture" || candidate === "pending_review") return candidate;
  return "pending_review";
}

function hasSnapshot(meta: Record<string, unknown> | null | undefined) {
  const sourceCapture = getSourceCapture(meta);
  return typeof sourceCapture?.snapshot_url === "string" && sourceCapture.snapshot_url.trim().length > 0;
}

function hasCapture(meta: Record<string, unknown> | null | undefined) {
  const sourceCapture = getSourceCapture(meta);
  return Boolean(sourceCapture?.captured_at);
}

async function main() {
  const env = parseEnvFile(ENV_FILE);
  process.env.SUPABASE_URL = env.SUPABASE_URL || env.VITE_SUPABASE_URL || "";
  process.env.SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY || "";

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing Supabase configuration in env.");
    process.exit(1);
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await supabase
    .from("acervo_items")
    .select("id, title, slug, source_name, source_url, meta")
    .in("type", ["noticia", "materia"])
    .limit(500);

  if (error) {
    console.error("Erro ao carregar acervo de imprensa:", error.message);
    process.exit(1);
  }

  const items = ((data || []) as PressItem[]).map((item) => ({
    ...item,
    editorialStatus: getEditorialStatus(item.meta),
    capture: hasCapture(item.meta),
    snapshot: hasSnapshot(item.meta),
    link: Boolean(item.source_url?.trim()),
  }));

  const pendingReviewItems = items
    .filter((item) => item.editorialStatus !== "ready")
    .sort((left, right) => left.title.localeCompare(right.title, "pt-BR"));

  const fullyReadyCandidates = pendingReviewItems.filter((item) => item.capture && item.snapshot && item.link);
  const topTen = pendingReviewItems.slice(0, 10);

  const generatedAt = new Date().toLocaleString("pt-BR");
  const report = [
    "# Estado da Nação — Revisão Editorial Pendente na Preservação de Imprensa",
    "",
    `Data: ${generatedAt}`,
    "",
    "## Resumo",
    "",
    `- Total de itens com revisão pendente: **${pendingReviewItems.length}**`,
    `- Itens pendentes que já têm link, captura e snapshot: **${fullyReadyCandidates.length}**`,
    `- Itens pendentes sem link original: **${pendingReviewItems.filter((item) => !item.link).length}**`,
    `- Itens pendentes sem captura: **${pendingReviewItems.filter((item) => !item.capture).length}**`,
    `- Itens pendentes sem snapshot: **${pendingReviewItems.filter((item) => !item.snapshot).length}**`,
    "",
    "## Link operacional",
    "",
    "- `/admin/acervo/imprensa?editorial=pending_review`",
    "",
    "## Top 10 casos",
    "",
    ...(
      topTen.length > 0
        ? topTen.flatMap((item, index) => [
            `### ${index + 1}. ${item.title}`,
            "",
            `- Slug: \`${item.slug}\``,
            `- Fonte: ${item.source_name || "Sem fonte"}`,
            `- Link original: ${item.link ? "sim" : "não"}`,
            `- Captura preservada: ${item.capture ? "sim" : "não"}`,
            `- Snapshot HTML: ${item.snapshot ? "sim" : "não"}`,
            `- Status editorial: \`${item.editorialStatus}\``,
            `- URL original: ${item.source_url || "Sem URL"}`,
            "",
          ])
        : ["Nenhum item com revisão pendente encontrado.", ""]
    ),
  ].join("\n");

  const reportPath = path.join(process.cwd(), "reports", "estado-da-nacao-preservacao-imprensa-revisao-pendente.md");
  fs.writeFileSync(reportPath, report, "utf8");
  console.log(`Relatório salvo em ${reportPath}`);
}

main().catch((error) => {
  console.error("Falha ao gerar relatório de revisão pendente:", error);
  process.exit(1);
});
