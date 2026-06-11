import * as fs from "node:fs";
import * as path from "node:path";
import { createClient } from "@supabase/supabase-js";

type MediaAsset = {
  id: string;
  bucket: string;
  file_name: string;
  title?: string | null;
  mime_type?: string | null;
  size_bytes?: number | null;
  source_name?: string | null;
  source_url?: string | null;
  acervo_content_type?: string | null;
  created_at?: string | null;
};

type AcervoReferenceRow = {
  id: string;
  title?: string | null;
  type?: string | null;
  cover_asset_id?: string | null;
  media?: unknown;
};

type SingleAssetReferenceRow = {
  id: string;
  title?: string | null;
  cover_asset_id?: string | null;
};

type ReportReferenceRow = SingleAssetReferenceRow & {
  pdf_asset_id?: string | null;
};

type Reference = {
  area: "acervo" | "blog" | "relatorios" | "agenda";
  title: string;
  role: string;
  contentType?: string | null;
};

const ENV_FILE = fs.existsSync(".env.local") ? ".env.local" : ".env";
const REPORT_PATH = path.join(process.cwd(), "reports", "estado-da-nacao-upload-acervo-fila-curadoria.md");
const CSV_PATH = path.join(process.cwd(), "reports", "estado-da-nacao-upload-acervo-fila-curadoria.csv");

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

function getEmbeddedMediaAssetId(item: unknown) {
  if (!item || typeof item !== "object" || Array.isArray(item)) return null;
  const id = (item as { id?: unknown }).id;
  return typeof id === "string" && id ? id : null;
}

function isPressType(type?: string | null) {
  return type === "noticia" || type === "materia";
}

function addReference(map: Map<string, Reference[]>, assetId: string | null | undefined, reference: Reference) {
  if (!assetId) return;
  const current = map.get(assetId) || [];
  current.push(reference);
  map.set(assetId, current);
}

function formatAssetLine(asset: MediaAsset, references: Reference[]) {
  const title = asset.title || asset.file_name || asset.id;
  const sourceName = asset.source_name?.trim() || "Sem fonte";
  const sourceUrl = asset.source_url?.trim() || "Sem link";
  const usage = references.length > 0 ? references.map((ref) => `${ref.area}:${ref.role}`).join(", ") : "sem uso";

  return [
    `- **${title}**`,
    `  - ID: \`${asset.id}\``,
    `  - Bucket/tipo: \`${asset.bucket}\` / \`${asset.mime_type || "desconhecido"}\``,
    `  - Fonte: ${sourceName}`,
    `  - Link: ${sourceUrl}`,
    `  - Uso: ${usage}`,
  ].join("\n");
}

function csvEscape(value: string | number | null | undefined) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function getUsageSummary(references: Reference[]) {
  return references.length > 0 ? references.map((ref) => `${ref.area}:${ref.role}`).join("; ") : "sem uso";
}

function getQueueCategory(asset: MediaAsset, references: Reference[]) {
  const alreadyPress = references.some((ref) => ref.area === "acervo" && isPressType(ref.contentType));
  if (!asset.source_url?.trim()) return "sem_link_origem";
  if (!asset.source_name?.trim()) return "sem_nome_fonte";
  if (references.length === 0) return "orfao";
  if (!alreadyPress) return "pronto_preservar";
  return "qualificado";
}

async function main() {
  const env = parseEnvFile(ENV_FILE);
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL || "";
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_SERVICE_ROLE_KEY || "";

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing Supabase service-role configuration in env.");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const [
    { data: mediaRows, error: mediaError },
    { data: acervoRows, error: acervoError },
    { data: blogRows, error: blogError },
    { data: reportRows, error: reportError },
    { data: eventRows, error: eventError },
  ] = await Promise.all([
    supabase
      .from("media_assets")
      .select("id, bucket, file_name, title, mime_type, size_bytes, source_name, source_url, acervo_content_type, created_at")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.from("acervo_items").select("id, title, type, cover_asset_id, media"),
    supabase.from("blog_posts").select("id, title, cover_asset_id"),
    supabase.from("reports").select("id, title, cover_asset_id, pdf_asset_id"),
    supabase.from("events").select("id, title, cover_asset_id"),
  ]);

  const firstError = mediaError || acervoError || blogError || reportError || eventError;
  if (firstError) {
    console.error("Erro ao carregar fila de curadoria:", firstError.message);
    process.exit(1);
  }

  const references = new Map<string, Reference[]>();

  for (const row of (acervoRows || []) as AcervoReferenceRow[]) {
    addReference(references, row.cover_asset_id, {
      area: "acervo",
      title: row.title || "Item de acervo",
      role: "capa",
      contentType: row.type || null,
    });

    if (Array.isArray(row.media)) {
      for (const item of row.media) {
        addReference(references, getEmbeddedMediaAssetId(item), {
          area: "acervo",
          title: row.title || "Item de acervo",
          role: "anexo",
          contentType: row.type || null,
        });
      }
    }
  }

  for (const row of (blogRows || []) as SingleAssetReferenceRow[]) {
    addReference(references, row.cover_asset_id, { area: "blog", title: row.title || "Post do blog", role: "capa" });
  }

  for (const row of (reportRows || []) as ReportReferenceRow[]) {
    addReference(references, row.cover_asset_id, { area: "relatorios", title: row.title || "Relatório", role: "capa" });
    addReference(references, row.pdf_asset_id, { area: "relatorios", title: row.title || "Relatório", role: "pdf" });
  }

  for (const row of (eventRows || []) as SingleAssetReferenceRow[]) {
    addReference(references, row.cover_asset_id, { area: "agenda", title: row.title || "Evento", role: "capa" });
  }

  const mediaAssets = (mediaRows || []) as MediaAsset[];
  const withoutOrigin = mediaAssets.filter((asset) => !asset.source_url?.trim());
  const withoutSourceName = mediaAssets.filter((asset) => !asset.source_name?.trim());
  const orphan = mediaAssets.filter((asset) => (references.get(asset.id)?.length || 0) === 0);
  const readyToPreserve = mediaAssets.filter((asset) => {
    const refs = references.get(asset.id) || [];
    const alreadyPress = refs.some((ref) => ref.area === "acervo" && isPressType(ref.contentType));
    return Boolean(asset.source_url?.trim() && asset.source_name?.trim() && !alreadyPress);
  });

  const generatedAt = new Date().toLocaleString("pt-BR");
  const report = [
    "# Estado da Nação — Fila de Curadoria de Uploads e Acervo",
    "",
    `Data: ${generatedAt}`,
    "",
    "## Resumo",
    "",
    `- Assets recentes analisados: **${mediaAssets.length}**`,
    `- Sem link de origem: **${withoutOrigin.length}**`,
    `- Sem nome da fonte: **${withoutSourceName.length}**`,
    `- Órfãos sem uso em conteúdo: **${orphan.length}**`,
    `- Prontos para preservação editorial: **${readyToPreserve.length}**`,
    "",
    "## Links operacionais",
    "",
    "- `/admin/uploads?queue=without_origin`",
    "- `/admin/uploads?queue=without_source_name`",
    "- `/admin/uploads?queue=orphan`",
    "- `/admin/uploads?queue=ready_to_preserve`",
    "",
    "## Top 10 sem link de origem",
    "",
    ...(withoutOrigin.slice(0, 10).map((asset) => formatAssetLine(asset, references.get(asset.id) || []))),
    ...(withoutOrigin.length === 0 ? ["Nenhuma pendência encontrada."] : []),
    "",
    "## Top 10 órfãos",
    "",
    ...(orphan.slice(0, 10).map((asset) => formatAssetLine(asset, references.get(asset.id) || []))),
    ...(orphan.length === 0 ? ["Nenhuma pendência encontrada."] : []),
    "",
    "## Top 10 prontos para preservar",
    "",
    ...(readyToPreserve.slice(0, 10).map((asset) => formatAssetLine(asset, references.get(asset.id) || []))),
    ...(readyToPreserve.length === 0 ? ["Nenhuma pendência encontrada."] : []),
    "",
  ].join("\n");

  fs.writeFileSync(REPORT_PATH, report, "utf8");
  const csvRows = [
    [
      "categoria",
      "asset_id",
      "titulo",
      "bucket",
      "mime_type",
      "source_name",
      "source_url",
      "uso",
      "created_at",
    ],
    ...mediaAssets.map((asset) => {
      const assetReferences = references.get(asset.id) || [];
      return [
        getQueueCategory(asset, assetReferences),
        asset.id,
        asset.title || asset.file_name || "",
        asset.bucket,
        asset.mime_type || "",
        asset.source_name || "",
        asset.source_url || "",
        getUsageSummary(assetReferences),
        asset.created_at || "",
      ];
    }),
  ].map((row) => row.map(csvEscape).join(","));

  fs.writeFileSync(CSV_PATH, `${csvRows.join("\n")}\n`, "utf8");
  console.log(`Relatório salvo em ${REPORT_PATH}`);
  console.log(`CSV salvo em ${CSV_PATH}`);
}

main().catch((error) => {
  console.error("Falha ao gerar relatório da fila de curadoria:", error);
  process.exit(1);
});
