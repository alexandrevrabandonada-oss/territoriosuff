import { createClient } from "@supabase/supabase-js";

const url = import.meta.env?.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env?.VITE_SUPABASE_ANON_KEY as string | undefined;

const hasEnv = Boolean(url && anon);

if (!hasEnv && typeof window !== "undefined") {
  console.error("[Supabase] Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.local.");
}

export const supabase = hasEnv ? createClient(url as string, anon as string) : null;

export function assertSupabase() {
  if (!supabase) {
    throw new Error(
      "Integracao Supabase nao configurada. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY em .env.local."
    );
  }
  return supabase;
}
