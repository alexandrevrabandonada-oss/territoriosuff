let supabaseClientModulePromise: Promise<typeof import("./client")> | null = null;

export async function loadSupabaseClientModule() {
  if (!supabaseClientModulePromise) {
    supabaseClientModulePromise = import("./client");
  }
  return supabaseClientModulePromise;
}

export async function getSupabaseClientOrNull() {
  const { supabase } = await loadSupabaseClientModule();
  return supabase;
}

export async function getSupabaseClient() {
  const { assertSupabase } = await loadSupabaseClientModule();
  return assertSupabase();
}
