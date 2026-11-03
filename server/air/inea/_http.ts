import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedSupabase: SupabaseClient | null = null;

export function getIneaSupabaseClient() {
  if (cachedSupabase) return cachedSupabase;

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("INEA Supabase environment is not configured.");
  }

  cachedSupabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });
  return cachedSupabase;
}

export function applyPublicJsonHeaders(res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
}

export function rejectNonGet(req: any, res: any) {
  if (req.method === "GET") return false;
  res.setHeader("Allow", "GET");
  res.status(405).json({ error: "Method Not Allowed" });
  return true;
}

export function isValidDateInput(value: unknown) {
  if (typeof value !== "string" || value.trim() === "") return false;
  return !Number.isNaN(Date.parse(value));
}

export function sendPublicError(res: any, scope: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[${scope}] Error:`, message);
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  const status = /environment is not configured|fetch failed|network/i.test(message) ? 503 : 500;
  return res.status(status).json({
    error: "Falha temporaria ao consultar os dados publicos do Radar INEA."
  });
}
