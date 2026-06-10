import { createClient } from "@supabase/supabase-js";

import { assertAll, fail, loadWorkspaceEnv, ok, readWorkspaceFile } from "./admin-smoke-lib.mjs";

const label = "ADMIN REPORTS FLOW SMOKE";
const fixtureSlug = "admin-fixture-relatorio-teste";
const routesContent = readWorkspaceFile("src/admin/AdminRoutes.tsx");
const listContent = readWorkspaceFile("src/pages/admin/AdminReportsListPage.tsx");
const editContent = readWorkspaceFile("src/pages/admin/AdminReportsEditPage.tsx");

assertAll(routesContent, [
  'path="relatorios" element={<AdminReportsListPage />}',
  'path="relatorios/novo" element={<AdminReportsEditPage />}',
  'path="relatorios/:id" element={<AdminReportsEditPage />}',
], label);

assertAll(listContent, [
  'from("reports")',
  '.select("id, title, slug, type, kind, status, year, featured, published_at, pdf_url")',
  'query = query.or(`title.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%`);',
  'query = query.eq("year", parseInt(filterYear));',
  'query = query.eq("status", filterStatus);',
  '!report.pdf_url && (',
  'to={`/relatorios/${report.slug}`}',
  'navigate(`/admin/relatorios/${report.id}`)',
], label);

assertAll(editContent, [
  'const assetIdFromUrl = searchParams.get("assetId");',
  'const { data, error } = await supabase.from("reports").select("*").eq("id", id).single();',
  'const { error } = await supabase.from("reports").insert(payload);',
  'const { error } = await supabase.from("reports").update(payload).eq("id", id);',
  'const effectivePdfUrl = resolvedPdfAsset?.public_url || pdfUrl;',
  'if (!effectivePdfUrl) {',
  'type: toDbReportType(type),',
  'kind: type,',
  'applyPdfAsset(asset);',
  'applyCoverAsset(asset);',
  'setShowSuccess(true);',
  'to={`/relatorios/${slug}`}',
  'const STATUSES = [',
  "{ value: \"published\", label: \"Publicado\" }",
], label);

ok(label, "Reports list and editor use real Supabase reads, insert/update writes, PDF enforcement, media selection via assetId and public preview links.");

const env = loadWorkspaceEnv();
const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  ok(label, "Fixture presence check skipped because service-role environment is unavailable.");
  process.exit(0);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const { count, error: countError } = await supabase
  .from("reports")
  .select("id", { count: "exact", head: true });

if (countError) {
  fail(`[${label}] Failed to count reports: ${countError.message}`);
}

if (!count) {
  fail(`[${label}] No reports found. Run: npm run admin:fixture:report`);
}

const { data: fixture, error: fixtureError } = await supabase
  .from("reports")
  .select("id, slug")
  .eq("slug", fixtureSlug)
  .maybeSingle();

if (fixtureError) {
  fail(`[${label}] Failed to load report fixture: ${fixtureError.message}`);
}

if (!fixture) {
  fail(`[${label}] Report fixture '${fixtureSlug}' not found. Run: npm run admin:fixture:report`);
}

ok(label, `Fixture ${fixture.slug} (${fixture.id}) is available for /admin/relatorios/:id runtime validation.`);
