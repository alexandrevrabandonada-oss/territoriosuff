import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const raw = fs.readFileSync(filePath, "utf8");
  const env = {};

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx <= 0) continue;

    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

function getSeedPath() {
  return process.argv[2] || "data/transparency_live.seed.json";
}

async function run() {
  const env = fs.existsSync(".env.local") ? parseEnvFile(".env.local") : parseEnvFile(".env");
  const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.error("ERRO: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sao obrigatorios no ambiente.");
    process.exit(1);
  }

  const seedPath = getSeedPath();
  if (!fs.existsSync(seedPath)) {
    console.error(`ERRO: Arquivo ${seedPath} nao encontrado.`);
    process.exit(1);
  }

  const items = JSON.parse(fs.readFileSync(seedPath, "utf8"));
  if (!Array.isArray(items)) {
    console.error("ERRO: seed de transparencia viva deve ser um array JSON.");
    process.exit(1);
  }

  const supabase = createClient(url, serviceRoleKey);
  console.log(`Importando ${items.length} fechamento(s) mensais de transparencia viva...`);

  const { data: existing, error: selectError } = await supabase
    .from("transparency_live_reports")
    .select("month_key");

  if (selectError) {
    console.error(`[ERRO CRITICO] Falha ao buscar fechamentos atuais: ${selectError.message}`);
    process.exit(1);
  }

  const existingKeys = new Set((existing ?? []).map((row) => row.month_key));
  let inserted = 0;
  let updated = 0;
  let errors = 0;

  for (const item of items) {
    const monthKey = String(item.month_key ?? "").trim();
    if (!monthKey) {
      console.error("[ERRO] Registro sem month_key.");
      errors++;
      continue;
    }

    const isUpdate = existingKeys.has(monthKey);
    const { error } = await supabase
      .from("transparency_live_reports")
      .upsert(item, { onConflict: "month_key" });

    if (error) {
      console.error(`[ERRO] ${monthKey}: ${error.message}`);
      errors++;
      continue;
    }

    if (isUpdate) updated++;
    else inserted++;
  }

  console.log("\n--- Resumo Final (Transparencia Viva) ---");
  console.log(`Inseridos: ${inserted}`);
  console.log(`Atualizados: ${updated}`);
  console.log(`Erros: ${errors}`);
  console.log("-----------------------------------------\n");

  if (errors > 0) process.exit(1);
}

await run();
