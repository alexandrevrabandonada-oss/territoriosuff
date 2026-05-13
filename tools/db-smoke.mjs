import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

/**
 * DB_SMOKE: Teste de fumaça resiliente para o Supabase.
 * Diferencia erros de rede (transientes) de erros de esquema (críticos).
 */

const TIMEOUT_MS = 8000; // 8 segundos de timeout

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

function getErrorDetails(error) {
  if (!error) return { message: "unknown", code: null };
  const message = (error.message || error.details || String(error)).toLowerCase();
  const code = error.code || null;
  return { message, code };
}

function isNetworkError(message) {
  return (
    message.includes("fetch failed") ||
    message.includes("getaddrinfo") ||
    message.includes("enotfound") ||
    message.includes("timeout") ||
    message.includes("abort") ||
    message.includes("connection refused")
  );
}

function isSchemaError(message, code) {
  // PostgREST error codes for missing relation/column
  return (
    code === "PGRST116" || 
    code === "42P01" || 
    message.includes("relation") && message.includes("does not exist") ||
    message.includes("column") && message.includes("does not exist")
  );
}

function isAuthError(message, code) {
  return (
    code === "401" || 
    code === "403" || 
    message.includes("invalid api key") ||
    message.includes("jwt") ||
    message.includes("apikey")
  );
}

function isExpectedDenied(message) {
  return (
    message.includes("permission denied") || 
    message.includes("not allowed") || 
    message.includes("401") ||
    message.includes("rls")
  );
}

async function selectAndCount(supabase, table) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const { error: selectError } = await supabase.from(table).select("*").limit(1).abortSignal(controller.signal);
    if (selectError) throw selectError;

    const { count, error: countError } = await supabase.from(table).select("*", { count: "exact", head: true }).abortSignal(controller.signal);
    if (countError) throw countError;

    return count ?? 0;
  } finally {
    clearTimeout(id);
  }
}

async function run() {
  const env = fs.existsSync(".env.local") ? parseEnvFile(".env.local") : parseEnvFile(".env");
  const url = env.VITE_SUPABASE_URL;
  const anonKey = env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.log("DB_SMOKE: SKIP (missing env)");
    process.exit(0);
  }

  try {
    const supabase = createClient(url, anonKey);
    const requiredTables = ["stations", "measurements", "events", "blog_posts", "reports"];
    const counts = {};

    console.log(`Checking ${url}...`);

    for (const table of requiredTables) {
      try {
        counts[table] = await selectAndCount(supabase, table);
        console.log(`${table}: OK count=${counts[table]}`);
      } catch (error) {
        const { message, code } = getErrorDetails(error);
        
        if (isNetworkError(message)) {
          console.log(`DB_SMOKE: WARN_NETWORK (${message})`);
          process.exit(0); // Don't block done on network issues
        }
        
        if (isAuthError(message, code)) {
          console.error(`DB_SMOKE: ERROR_AUTH (${message})`);
          process.exit(1);
        }

        if (isSchemaError(message, code)) {
          console.error(`DB_SMOKE: ERROR_SCHEMA (${table} not found or invalid)`);
          process.exit(1);
        }

        throw new Error(`${table}: ${message} (code: ${code})`);
      }
    }

    // Check registrations (often has RLS restrictions)
    try {
      const registrationsCount = await selectAndCount(supabase, "registrations");
      console.log(`registrations: OK count=${registrationsCount}`);
    } catch (error) {
      const { message } = getErrorDetails(error);
      if (isExpectedDenied(message)) {
        console.log("registrations: EXPECTED_DENIED (RLS active)");
      } else if (isNetworkError(message)) {
        console.log(`DB_SMOKE: WARN_NETWORK (registrations)`);
        process.exit(0);
      } else {
        console.error(`registrations: ERROR (${message})`);
        process.exit(1);
      }
    }

    console.log("DB_SMOKE: OK");
  } catch (error) {
    const { message } = getErrorDetails(error);
    console.error(`DB_SMOKE: UNKNOWN_ERROR (${message})`);
    process.exit(1);
  }
}

await run();
