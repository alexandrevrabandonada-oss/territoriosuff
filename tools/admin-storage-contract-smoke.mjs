import { assertAll, ok, readWorkspaceFile } from "./admin-smoke-lib.mjs";

const label = "ADMIN STORAGE CONTRACT SMOKE";
const mediaLib = readWorkspaceFile("src/lib/admin/media.ts");
const adminUploadsMigration = readWorkspaceFile("supabase/migrations/20260512000002_admin_uploads.sql");
const uploadsPage = readWorkspaceFile("src/pages/admin/AdminUploadsPage.tsx");

const expectedBuckets = ["acervo", "media", "blog", "reports", "transparency"];
const expectedMimeTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

assertAll(mediaLib, [
  "export const ADMIN_ALLOWED_BUCKETS",
  "export const ADMIN_ALLOWED_MIME_TYPES",
  "export const ADMIN_MAX_FILE_SIZE = 15 * 1024 * 1024",
  "validateAdminUploadFile(file)",
  "Bucket de upload não permitido.",
  "Tipo de arquivo não permitido. Use PDF, JPG, PNG ou WEBP.",
  "Arquivo muito grande. Limite de",
  "await supabase.storage.from(bucket).remove([filePath]);",
], label);

for (const bucket of expectedBuckets) {
  assertAll(mediaLib, [`"${bucket}"`], label);
  assertAll(uploadsPage, [`{ id: "${bucket}"`], label);
  assertAll(adminUploadsMigration, [
    `('${bucket}', '${bucket}', true)`,
    `bucket_id = %L and public.is_admin())', b, b`,
  ], label);
}

for (const mimeType of expectedMimeTypes) {
  assertAll(mediaLib, [`"${mimeType}"`], label);
}

assertAll(adminUploadsMigration, [
  "buckets_list text[] := array['reports', 'blog', 'media', 'transparency', 'acervo'];",
  "create policy %I_public_select on storage.objects for select to public using (bucket_id = %L)",
  "create policy %I_admin_insert on storage.objects for insert to authenticated with check (bucket_id = %L and public.is_admin())",
  "create policy %I_admin_update on storage.objects for update to authenticated using (bucket_id = %L and public.is_admin())",
  "create policy %I_admin_delete on storage.objects for delete to authenticated using (bucket_id = %L and public.is_admin())",
  "constraint image_needs_alt check",
  "media_assets_admin_all",
], label);

ok(label, "Buckets, MIME types, limite de upload, policies admin e contrato de alt text ficam alinhados entre app e migração.");
