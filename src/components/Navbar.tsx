import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

import { useInstallPrompt } from "../hooks/useInstallPrompt";

const links = [
  { href: "/", label: "Home" },
  { href: "/dados", label: "Dados" },
  { href: "/acervo", label: "Acervo" },
  { href: "/acervo/linha", label: "Linha do Tempo" },
  { href: "/relatorios", label: "Relatórios" },
  { href: "/agenda", label: "Agenda" },
  { href: "/conversar", label: "Conversar" },
  { href: "/corredores", label: "Corredores" },
  { href: "/sobre", label: "Guias" }
];

const mobileLinks = [
  ...links,
  { href: "/mapa", label: "Mapa" },
  { href: "/dossies", label: "Dossiês" },
  { href: "/transparencia", label: "Transparência" }
];

export function Navbar() {
  const { prompt, clearPrompt } = useInstallPrompt();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleInstallClick = async () => {
    if (!prompt) {
      alert("Para instalar o app, use um navegador compatível com PWA ou acesse pelo celular.");
      return;
    }
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") clearPrompt();
  };

  return (
    <header className="site-topbar">
      <div className="site-topbar-inner">
        <Link to="/" className="site-brand" aria-label="SEMEAR - Início">
          <img src="/brand/uff-logo-vertical-blue.png" alt="Universidade Federal Fluminense" className="site-uff-logo" />
          <span aria-hidden="true" />
          <img src="/brand/semear-logo-full.jpeg" alt="Projeto UFF SEMEAR" className="site-semear-logo" />
        </Link>

        <nav className="site-nav" aria-label="Navegação principal">
          {links.map((link) => (
            <NavLink key={link.href} to={link.href} className={({ isActive }) => (isActive ? "is-active" : undefined)}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="site-actions">
          <Link to="/offline" className="site-pwa-badge">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3 5 6v5c0 4.7 2.9 8 7 10 4.1-2 7-5.3 7-10V6l-7-3Z" />
            </svg>
            PWA Pública
          </Link>
          <button className="site-install" onClick={handleInstallClick} type="button">
            Instalar app
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v10m0 0 4-4m-4 4-4-4M5 20h14" />
            </svg>
          </button>
        </div>

        <button
          className="site-menu-button"
          onClick={() => setIsMenuOpen((open) => !open)}
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {isMenuOpen && (
        <nav id="mobile-navigation" className="site-mobile-nav" aria-label="Navegação móvel">
          {mobileLinks.map((link) => (
            <NavLink key={link.href} to={link.href} className={({ isActive }) => (isActive ? "is-active" : undefined)}>
              {link.label}
            </NavLink>
          ))}
          <button onClick={handleInstallClick} type="button">Instalar app</button>
        </nav>
      )}
    </header>
  );
}
