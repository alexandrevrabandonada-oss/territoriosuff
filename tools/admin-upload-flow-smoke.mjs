import { assertAll, ok, readWorkspaceFile } from "./admin-smoke-lib.mjs";

const label = "ADMIN UPLOAD FLOW SMOKE";
const content = readWorkspaceFile("src/pages/admin/AdminUploadsPage.tsx");

assertAll(content, [
  'from("media_assets")',
  'const asset = await adminUploadMedia({',
  'if (status === "published" && file.type.startsWith("image/") && !altText.trim())',
  'setSuccessAsset(asset);',
  'to={`/admin/acervo/novo?assetId=${successAsset.id}`}',
  'to={`/admin/relatorios/novo?assetId=${successAsset.id}`}',
  'to={`/admin/blog/novo?assetId=${successAsset.id}`}',
  'to={`/admin/acervo/novo?assetId=${asset.id}`}',
  'to={`/admin/relatorios/novo?assetId=${asset.id}`}',
  'to={`/admin/blog/novo?assetId=${asset.id}`}',
], label);

ok(label, "Uploads page reads media_assets, uploads through adminUploadMedia, enforces alt text on published images and forwards assetId into editorial flows.");