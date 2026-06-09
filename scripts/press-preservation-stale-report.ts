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

function getLastCaptureAt(meta: Record<string, unknown> | null | undefined) {
  const sourceCapture = getSourceCapture(meta);
  return typeof sourceCapture?.captured_at === "string" ? sourceCapture.captured_at : null;
}

function daysSince(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const diffMs = Date.now() - date.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

function formatDate(value?: string | null) {
  if (!value) return "Sem captura";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sem captura";
  return date.toLocaleString("pt-BR");
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

  const items = ((data || []) as PressItem[]).map((item) => {
    const captureAt = getLastCaptureAt(item.meta);
    const captureAge = daysSince(captureAt);
    return {
      ...item,
      captureAt,
      captureAge,
      editorialStatus: getEditorialStatus(item.meta),
      snapshot: hasSnapshot(item.meta),
    };
  });

  const staleItems = items
    .filter((item) => item.captureAge !== null && item.captureAge > 30)
    .sort((left, right) => (right.captureAge || 0) - (left.captureAge || 0));

  const topTen = staleItems.slice(0, 10);
  const pendingReviewCount = staleItems.filter((item) => item.editorialStatus !== "ready").length;
  const withSnapshotCount = staleItems.filter((item) => item.snapshot).length;
  const withoutSnapshotCount = staleItems.length - withSnapshotCount;

  const generatedAt = new Date().toLocaleString("pt-BR");
  const report = [
    "# Estado da Nação — Fila Stale de Preservação de Imprensa",
    "",
    `Data: ${generatedAt}`,
    "",
    "## Resumo",
    "",
    `- Total de itens com captura acima de 30 dias: **${staleItems.length}**`,
    `- Itens stale com revisão pendente: **${pendingReviewCount}**`,
    `- Itens stale com snapshot HTML: **${withSnapshotCount}**`,
    `- Itens stale sem snapshot HTML: **${withoutSnapshotCount}**`,
    "",
    "## Link operacional",
    "",
    "- `/admin/acervo/imprensa?queue=stale&sort=capture_age`",
    "",
    "## Top 10 casos mais antigos",
    "",
    ...(
      topTen.length > 0
        ? topTen.flatMap((item, index) => [
            `### ${index + 1}. ${item.title}`,
            "",
            `- Slug: \`${item.slug}\``,
            `- Fonte: ${item.source_name || "Sem fonte"}`,
            `- Última captura: ${formatDate(item.captureAt)}`,
            `- Idade da captura: **${item.captureAge} dia(s)**`,
            `- Status editorial: \`${item.editorialStatus}\``,
            `- Snapshot HTML: ${item.snapshot ? "sim" : "não"}`,
            `- URL original: ${item.source_url || "Sem URL"}`,
            "",
          ])
        : ["Nenhum item stale encontrado.", ""]
    ),
  ].join("\n");

  const reportPath = path.join(process.cwd(), "reports", "estado-da-nacao-preservacao-imprensa-stale.md");
  fs.writeFileSync(reportPath, report, "utf8");
  console.log(`Relatório salvo em ${reportPath}`);
}

main().catch((error) => {
  console.error("Falha ao gerar relatório de imprensa stale:", error);
  process.exit(1);
});
