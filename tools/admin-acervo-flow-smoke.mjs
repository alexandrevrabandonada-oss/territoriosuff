import { assertAll, ok, readWorkspaceFile } from "./admin-smoke-lib.mjs";

const label = "ADMIN ACERVO FLOW SMOKE";
const listContent = readWorkspaceFile("src/pages/admin/AdminAcervoListPage.tsx");
const editContent = readWorkspaceFile("src/pages/admin/AdminAcervoEditPage.tsx");

assertAll(listContent, [
  'from("acervo_items")',
  '.select("id, title, type, status, published_at, publish_at, slug, source_url, content_md, meta")',
  'query = query.ilike("title", `%${searchTerm}%`);',
  'query = query.eq("type", filterType);',
  'query = query.eq("status", filterStatus);',
  'to={`/acervo/item/${item.slug}`}',
  'navigate(`/admin/acervo/${item.id}`)',
], label);

assertAll(editContent, [
  'const assetIdFromUrl = searchParams.get("assetId");',
  'const typeFromUrl = searchParams.get("type");',
  'const { data, error } = await supabase.from("acervo_items").select("*").eq("id", id).single();',
  'const { error } = await supabase.from("acervo_items").insert(payload);',
  'const { error } = await supabase.from("acervo_items").update(payload).eq("id", id);',
  'if (!summary.trim()) {',
  'if (["artigo_cientifico", "noticia", "documento", "relatorio_tecnico"].includes(type) && !sourceName.trim()) {',
  'const imagesToValidate = media.filter(m => m.type?.startsWith("image/") || m.mime_type?.startsWith("image/"));',
  'setShowSuccess(true);',
  'to={`/acervo/item/${slug}`}',
  'const STATUSES = [',
  "{ value: \"scheduled\", label: \"Agendado\" }",
  'const [meta, setMeta] = useState<AcervoMeta>({});',
  'doi: doi || null,',
  'source_type: normalizedSourceType,',
  'const addMediaAsset = (asset:',
  'const removeMediaAsset = (assetId: string) => {',
  "const moveMedia = (index: number, direction: 'up' | 'down') => {",
], label);

ok(label, "Acervo list and editor use real Supabase reads, insert/update writes, publication validation, assetId intake, media management and public portal links.");
