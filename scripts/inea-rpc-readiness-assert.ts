import { createClient } from "@supabase/supabase-js";
import { loadIneaSupabaseEnv } from "./lib/inea-env";
import { INEA_RPC_CHECKS, isMissingIneaRpcError } from "./lib/inea-rpc-contract";

const { supabaseUrl, supabaseKey } = loadIneaSupabaseEnv();

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase configuration in env.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Starting INEA RPC readiness assertion suite...");

  const missing: string[] = [];
  const failed: string[] = [];
  const missingMigrations = new Map<string, string[]>();

  for (const rpc of INEA_RPC_CHECKS) {
    const { error } = await supabase.rpc(rpc.name, rpc.args || {});
    if (!error) {
      console.log(`PASS: ${rpc.name}`);
      continue;
    }

    if (isMissingIneaRpcError(error.message)) {
      missing.push(`${rpc.name}: ${error.message}`);
      const bucket = missingMigrations.get(rpc.migration) || [];
      bucket.push(rpc.name);
      missingMigrations.set(rpc.migration, bucket);
      console.error(`MISSING: ${rpc.name}`);
      continue;
    }

    failed.push(`${rpc.name}: ${error.message}`);
    console.error(`FAIL: ${rpc.name} -> ${error.message}`);
  }

  if (missing.length > 0 || failed.length > 0) {
    console.error("\nINEA RPC readiness failed.");

    if (missing.length > 0) {
      console.error("Missing RPCs:");
      for (const item of missing) {
        console.error(`- ${item}`);
      }
      console.error("Required migrations by missing RPC set:");
      for (const [migration, rpcs] of missingMigrations.entries()) {
        console.error(`- ${migration}: ${rpcs.join(", ")}`);
      }
    }

    if (failed.length > 0) {
      console.error("RPCs present but failing:");
      for (const item of failed) {
        console.error(`- ${item}`);
      }
    }

    console.error("Aplique as migrations de rollout do Radar INEA antes de validar contratos HTTP.");
    process.exit(1);
  }

  console.log("INEA RPC readiness passed.");
}

void run();
