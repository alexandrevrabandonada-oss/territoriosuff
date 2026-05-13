import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { LoadingCard } from "./LoadingCard";

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
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <LoadingCard message="Verificando permissões administrativas..." />
      </div>
    );
  }

  if (!authorized) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
