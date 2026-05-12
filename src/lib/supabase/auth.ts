import { supabase } from "./client";

export interface UserProfile {
  id: string;
  email: string;
  isAdmin: boolean;
}

/**
 * Verifica se o usuário atual tem privilégios de administrador.
 */
export async function isAdmin(): Promise<boolean> {
  if (!supabase) return false;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .single();

  if (error || !data) return false;
  return true;
}

/**
 * Helper para obter o perfil simplificado do usuário logado.
 */
export async function getCurrentProfile(): Promise<UserProfile | null> {
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = await isAdmin();

  return {
    id: user.id,
    email: user.email || "",
    isAdmin: admin,
  };
}

/**
 * Realiza o logout do usuário.
 */
export async function logout() {
  if (!supabase) return;
  await supabase.auth.signOut();
  window.location.href = "/";
}
