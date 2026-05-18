import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { supabase } from "../../lib/supabase/client";

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
    } catch (err: any) {
      console.error("[Auth reset] Erro:", err);
      setError(err.message || "Não foi possível redefinir a senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-white/20">
        <div className="p-8 sm:p-12">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center font-bold text-white text-4xl shadow-xl shadow-emerald-500/20">
              S
            </div>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Redefinir Senha</h2>
            <p className="text-slate-500 mt-2 font-medium">Defina uma nova senha para o acesso administrativo.</p>
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
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-slate-900 font-medium"
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
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-slate-900 font-medium"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || Boolean(authError)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 uppercase tracking-wider"
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
