import { assertAll, ok, readWorkspaceFile } from "./admin-smoke-lib.mjs";

const label = "ADMIN UPLOAD ACERVO TYPE SMOKE";
const uploadsContent = readWorkspaceFile("src/pages/admin/AdminUploadsPage.tsx");
const acervoEditContent = readWorkspaceFile("src/pages/admin/AdminAcervoEditPage.tsx");
const acervoMapContent = readWorkspaceFile("src/lib/acervo.ts");

assertAll(uploadsContent, [
  'Tipo de conteúdo no Acervo',
  'const [bucket, setBucket] = useState("acervo")',
  'const [acervoContentType, setAcervoContentType] = useState("artigo_cientifico")',
  'acervoContentType: bucket === "acervo" ? acervoContentType : undefined',
  'buildAcervoLink(successAsset.id, successAsset.acervo_content_type || acervoContentType)',
  'Criar item no Acervo',
  'Criar item de Acervo como Artigo Científico',
  'Criar item de Acervo como Notícia',
  'Criar item de Acervo como Mídia',
  'Criar item de Acervo como Documento',
], label);

assertAll(acervoEditContent, [
  'const typeFromUrl = searchParams.get("type");',
  'setType(normalizeAcervoType(typeFromUrl, asset));',
  'const [meta, setMeta] = useState<AcervoMeta>({});',
  'if (!coverAssetId && isImageAsset(normalizedAsset)) {',
  'const isMediaType = type === "midia" || type === "foto" || type === "video" || type === "memoria";',
], label);

assertAll(acervoMapContent, [
  'midia: "Mídia"',
  'midias: ["midia", "video", "foto", "memoria", "photo"]',
], label);

ok(label, "Uploads expose Acervo editorial typing, the Acervo editor consumes assetId/type from the querystring and public Acervo media grouping stays intact.");
