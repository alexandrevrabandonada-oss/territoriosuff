import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAdmin } from "../lib/supabase/auth";
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
    async function checkAccess() {
      try {
        const isUserAdmin = await isAdmin();
        setAuthorized(isUserAdmin);
      } catch (error) {
        console.error("[AdminGuard] Erro ao verificar acesso:", error);
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    }

    checkAccess();
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <LoadingCard message="Verificando permissões administrativas..." />
      </div>
    );
  }

  if (!authorized) {
    // Redireciona para login se não autorizado
    // Salva a localização atual para redirecionar de volta após o login
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
