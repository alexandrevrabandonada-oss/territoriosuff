import { type PropsWithChildren } from "react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { Footer } from "../components/Footer";
import { OfflineBanner } from "../components/OfflineBanner";
import { Navbar } from "../components/Navbar";
import { trackOfflineFallback } from "../lib/observability";

export function PortalLayout({ children }: PropsWithChildren) {
  const [isOnline, setIsOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  const location = useLocation();

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    if (!isOnline) {
      trackOfflineFallback(location.pathname);
    }
  }, [isOnline, location.pathname]);

  return (
    <div className="min-h-screen bg-bg-page">
      {/* Skip Link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand-primary focus:px-6 focus:py-3 focus:text-base focus:font-bold focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-primary"
      >
        Ir para o conteúdo principal
      </a>
      <Navbar />
      {!isOnline && (
        <div className="mx-auto w-full max-w-7xl px-4 pt-4 md:px-6">
          <OfflineBanner
            compact
            description="Você continua navegando com o que já foi carregado. Alguns dados e PDFs podem ficar indisponíveis até a conexão voltar."
            onRetry={() => window.location.reload()}
          />
        </div>
      )}
      <main id="main-content" className="mx-auto w-full max-w-7xl px-4 pb-0 pt-16 md:px-6 md:pt-20">{children}</main>
      <Footer />
    </div>
  );
}
