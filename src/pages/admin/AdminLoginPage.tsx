import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase/client";

type AuthMode = "login" | "signup" | "forgot" | "otp";


export function AdminLoginPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/admin";

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!supabase) {
      setError("Supabase não configurado.");
      setLoading(false);
      return;
    }

    try {
      if (mode === "login") {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (loginError) throw loginError;
        navigate(from, { replace: true });
      } 
      else if (mode === "otp") {
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/admin`,
          }
        });
        if (otpError) throw otpError;
        setMessage("Link de acesso enviado! Verifique seu e-mail para entrar no painel.");
      }
      else if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/admin/login`,
          }
        });
        if (signUpError) throw signUpError;
        setMessage("Conta criada! Verifique seu e-mail para confirmar o cadastro. Após confirmar, um administrador precisará aprovar seu acesso.");
      }
      else if (mode === "forgot") {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/admin/reset-password`,
        });
        if (resetError) throw resetError;
        setMessage("Link de recuperação enviado! Verifique sua caixa de entrada.");
      }
    } catch (err: any) {
      console.error(`[Auth ${mode}] Erro:`, err);
      setError(err.message || "Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-shell relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="admin-auth-card w-full max-w-md overflow-hidden">
        <div className="p-8 sm:p-12">
          <div className="flex justify-center mb-8">
            <div className="admin-auth-mark flex h-20 w-20 items-center justify-center rounded-3xl text-4xl font-black text-white transition-transform hover:rotate-6">
              S
            </div>
          </div>
          
          <div className="text-center mb-10">
            <p className="admin-eyebrow justify-center border-0 bg-transparent text-emerald-700">Área segura SEMEAR</p>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950">
              {mode === "login" && "Bem-vindo"}
              {mode === "otp" && "Entrar sem Senha"}
              {mode === "signup" && "Criar Conta"}
              {mode === "forgot" && "Recuperar Senha"}
            </h2>
            <p className="mt-3 text-slate-500 font-medium">
              {mode === "login" && "Acesso Administrativo SEMEAR"}
              {mode === "otp" && "Enviaremos um link de acesso por e-mail"}
              {mode === "signup" && "Junte-se à equipe de gestão"}
              {mode === "forgot" && "Enviaremos um link seguro"}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2" htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 font-medium text-slate-900 transition-all focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                placeholder="exemplo@id.uff.br"
              />
            </div>

            {mode !== "forgot" && mode !== "otp" && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest" htmlFor="password">
                    Senha
                  </label>
                  {mode === "login" && (
                    <button 
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      Esqueci a senha
                    </button>
                  )}
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className="w-full rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 font-medium text-slate-900 transition-all focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                  placeholder="••••••••"
                />
              </div>
            )}

            {error && (
              <div className="p-4 bg-rose-50 text-rose-600 text-sm font-bold rounded-2xl border border-rose-100 animate-in fade-in zoom-in-95 duration-300" role="alert">
                <span aria-hidden="true">⚠️</span> {error}
              </div>
            )}

            {message && (
              <div className="p-4 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-2xl border border-emerald-100 animate-in fade-in zoom-in-95 duration-300">
                ✅ {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-700 py-5 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-600/20 transition-all hover:shadow-2xl hover:shadow-emerald-600/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processando...
                </span>
              ) : (
                <>
                  {mode === "login" && "Entrar no Painel"}
                  {mode === "otp" && "Enviar Link de Acesso"}
                  {mode === "signup" && "Confirmar Cadastro"}
                  {mode === "forgot" && "Enviar Link"}
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            {mode === "login" ? (
              <div className="space-y-3">
                <p className="text-slate-500 text-sm font-medium">
                  Não tem uma conta?{" "}
                  <button 
                    onClick={() => setMode("signup")}
                    className="text-emerald-600 font-bold hover:underline"
                  >
                    Cadastre-se aqui
                  </button>
                </p>
                <div className="pt-2 border-t border-slate-100">
                  <button 
                    type="button"
                    onClick={() => setMode("otp")}
                    className="text-emerald-600 font-bold hover:underline text-sm"
                  >
                    Entrar sem senha (Link Mágico)
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setMode("login")}
                className="text-slate-500 text-sm font-bold hover:text-slate-900 transition-colors"
              >
                &larr; Voltar para o Login
              </button>
            )}
          </div>
        </div>
        
        <div className="flex justify-center border-t border-slate-100 bg-white/55 px-8 py-6">
          <button 
            onClick={() => navigate("/")}
            className="text-xs font-black text-slate-400 hover:text-emerald-600 uppercase tracking-widest transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar para o Portal
          </button>
        </div>
      </div>
    </div>
  );
}
