import { createClient } from "@supabase/supabase-js";

import { loadWorkspaceEnv } from "./admin-smoke-lib.mjs";

const FIXTURE_SLUG = "admin-fixture-relatorio-teste";
const FIXTURE_PAYLOAD = {
  title: "Relatorio Fixture Admin",
  slug: FIXTURE_SLUG,
  summary: "Fixture controlada para validar a rota /admin/relatorios/:id em runtime.",
  type: "relatorio",
  kind: "relatorio",
  year: 2026,
  status: "draft",
  tags: ["fixture", "admin"],
  featured: false,
  published_at: null,
  pdf_url: null,
  pdf_asset_id: null,
  cover_url: null,
  cover_asset_id: null,
};

const env = loadWorkspaceEnv();
const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("ERRO: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sao obrigatorios.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function ensureFixture() {
  const { data: existing, error: fetchError } = await supabase
    .from("reports")
    .select("id, slug")
    .eq("slug", FIXTURE_SLUG)
    .maybeSingle();

  if (fetchError) {
    console.error(`ERRO: falha ao consultar fixture: ${fetchError.message}`);
    process.exit(1);
  }

  if (existing) {
    const { data: updated, error: updateError } = await supabase
      .from("reports")
      .update(FIXTURE_PAYLOAD)
      .eq("id", existing.id)
      .select("id, slug")
      .single();

    if (updateError) {
      console.error(`ERRO: falha ao atualizar fixture: ${updateError.message}`);
      process.exit(1);
    }

    console.log(JSON.stringify({ id: updated.id, slug: updated.slug, mode: "updated" }));
    return;
  }

  const { data: created, error: insertError } = await supabase
    .from("reports")
    .insert(FIXTURE_PAYLOAD)
    .select("id, slug")
    .single();

  if (insertError) {
    console.error(`ERRO: falha ao criar fixture: ${insertError.message}`);
    process.exit(1);
  }

  console.log(JSON.stringify({ id: created.id, slug: created.slug, mode: "created" }));
}

await ensureFixture();