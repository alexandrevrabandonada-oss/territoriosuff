import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

import { trackNavigation } from "../lib/observability";

function getRouteAnnouncement(pathname: string): string {
  const routeLabels: Record<string, string> = {
    "/": "Página inicial",
    "/dados": "Leituras SEMEAR",
    "/acervo": "Acervo",
    "/acervo/linha": "Linha do tempo do acervo",
    "/relatorios": "Relatórios",
    "/agenda": "Agenda",
    "/conversar": "Conversas e atividades",
    "/mapa": "Mapa de monitoramento",
    "/transparencia": "Transparência",
    "/sobre": "Guias"
  };

  return routeLabels[pathname] ?? "Página carregada";
}

export function RouteObservability() {
  const location = useLocation();
  const previousPathnameRef = useRef(location.pathname);

  useEffect(() => {
    trackNavigation(location.pathname);
    document.title = `${getRouteAnnouncement(location.pathname)} | SEMEAR`;

    if (previousPathnameRef.current !== location.pathname) {
      const main = document.getElementById("main-content");
      if (main) {
        window.setTimeout(() => main.focus({ preventScroll: true }), 0);
      }
    }

    previousPathnameRef.current = location.pathname;
  }, [location.pathname]);

  return (
    <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {getRouteAnnouncement(location.pathname)}
    </div>
  );
}
