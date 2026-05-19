import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface AdminGuardProps {
  children: React.ReactNode;
}

/**
 * Componente que protege rotas administrativas.
 * Verifica se o usuário está logado e se é um administrador.
 */
export function AdminGuard({ children }: AdminGuardProps) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let active = true;

    async function checkAccess() {
      try {
        const { isAdmin } = await import("../lib/supabase/auth");
        const isUserAdmin = await isAdmin();
        if (active) {
          setAuthorized(isUserAdmin);
        }
      } catch (error) {
        console.error("[AdminGuard] Erro ao verificar acesso:", error);
        if (active) {
          setAuthorized(false);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    checkAccess();

    return () => {
      active = false;
    };
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="admin-auth-shell relative flex min-h-screen items-center justify-center overflow-hidden p-4">
        <div className="admin-auth-card w-full max-w-md p-8 text-center">
          <div className="admin-auth-mark mx-auto flex h-16 w-16 items-center justify-center rounded-3xl text-3xl font-black text-white">
            S
          </div>
          <p className="admin-eyebrow mx-auto mt-7 justify-center border-0 bg-transparent text-emerald-700">
            Área segura SEMEAR
          </p>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-950">
            Verificando acesso
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Validando permissões administrativas antes de abrir o painel.
          </p>
          <div
            aria-hidden="true"
            className="mx-auto mt-7 h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600"
          />
        </div>
      </div>
    );
  }

  if (!authorized) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
