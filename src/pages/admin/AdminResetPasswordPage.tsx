import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { getSupabaseClientOrNull } from "../../lib/supabase/runtime";

function readAuthError(location: ReturnType<typeof useLocation>) {
  const query = new URLSearchParams(location.search);
  const hash = location.hash.startsWith("#") ? location.hash.slice(1) : location.hash;
  const hashParams = new URLSearchParams(hash);

  const message =
    query.get("error_description") ||
    hashParams.get("error_description") ||
    query.get("error") ||
    hashParams.get("error");

  return message ? decodeURIComponent(message.replace(/\+/g, " ")) : null;
}

function getErrorMessage(error: unknown, fallback = "Não foi possível redefinir a senha.") {
  return error instanceof Error ? error.message : fallback;
}

export function AdminResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const authError = useMemo(() => readAuthError(location), [location]);

  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const supabase = await getSupabaseClientOrNull();
    if (!supabase) {
      setError("Supabase não configurado.");
      return;
    }

    if (password.length < 8) {
      setError("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("A confirmação da senha não confere.");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      setMessage("Senha atualizada com sucesso. Você já pode entrar novamente.");
      setPassword("");
      setConfirmPassword("");

      window.setTimeout(() => {
        navigate("/admin/login", { replace: true });
      }, 1200);
    } catch (err) {
      console.error("[Auth reset] Erro:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-shell relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="admin-auth-card w-full max-w-md overflow-hidden">
        <div className="p-8 sm:p-12">
          <div className="flex justify-center mb-8">
            <div className="admin-auth-mark flex h-20 w-20 items-center justify-center rounded-3xl text-4xl font-black text-white">
              S
            </div>
          </div>

          <div className="text-center mb-10">
            <p className="admin-eyebrow justify-center border-0 bg-transparent text-emerald-700">Área segura SEMEAR</p>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950">Redefinir Senha</h2>
            <p className="mt-3 text-slate-500 font-medium">Defina uma nova senha para o acesso administrativo.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2" htmlFor="password">
                Nova senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 font-medium text-slate-900 transition-all focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2" htmlFor="confirmPassword">
                Confirmar senha
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 font-medium text-slate-900 transition-all focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700" role="alert">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700" role="status" aria-live="polite">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || Boolean(authError)}
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-700 py-5 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-600/20 transition-all hover:shadow-2xl hover:shadow-emerald-600/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Atualizando..." : "Salvar nova senha"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/admin/login" className="text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">
              ← Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
