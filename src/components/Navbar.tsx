import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

import { useInstallPrompt } from "../hooks/useInstallPrompt";

const primaryLinks = [
  { href: "/", label: "Home" },
  { href: "/dados", label: "Dados" },
  { href: "/qualidade-ar/inea", label: "Radar INEA" },
  { href: "/acervo", label: "Acervo" }
];

const moreLinks = [
  { href: "/acervo/linha", label: "Linha do Tempo" },
  { href: "/relatorios", label: "Relatórios" },
  { href: "/agenda", label: "Agenda" },
  { href: "/conversar", label: "Conversas e atividades" },
  { href: "/transparencia", label: "Transparência" },
  { href: "/blog", label: "Blog" },
  { href: "/dossies", label: "Dossiês" },
  { href: "/como-ler-dados", label: "Guias" },
  { href: "/buscar", label: "Buscar" }
];

const mobileGroups = [
  {
    label: "Principal",
    links: [
      { href: "/", label: "Home" },
      { href: "/dados", label: "Dados" },
      { href: "/qualidade-ar/inea", label: "Radar INEA" },
      { href: "/qualidade-ar/inea/analises", label: "Análises INEA" },
      { href: "/agenda", label: "Agenda" },
      { href: "/conversar", label: "Conversas e atividades" }
    ]
  },
  {
    label: "Conteúdo",
    links: [
      { href: "/acervo", label: "Acervo" },
      { href: "/acervo/linha", label: "Linha do Tempo" },
      { href: "/relatorios", label: "Relatórios" },
      { href: "/mapa", label: "Mapa" },
      { href: "/dossies", label: "Dossiês" },
      { href: "/blog", label: "Blog" }
    ]
  },
  {
    label: "Institucional",
    links: [
      { href: "/como-ler-dados", label: "Guias" },
      { href: "/como-participar", label: "Como participar" },
      { href: "/transparencia", label: "Transparência" },
      { href: "/buscar", label: "Buscar" }
    ]
  }
];

function shouldMatchMobileLinkExactly(href: string) {
  return href === "/" || href === "/qualidade-ar/inea" || href === "/acervo";
}

export function Navbar() {
  const { prompt, clearPrompt } = useInstallPrompt();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsMoreOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMoreOpen) return;
    const closeMoreMenu = (event: PointerEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent) {
        if (event.key === "Escape") setIsMoreOpen(false);
        return;
      }
      if (!moreMenuRef.current?.contains(event.target as Node)) setIsMoreOpen(false);
    };
    document.addEventListener("pointerdown", closeMoreMenu);
    window.addEventListener("keydown", closeMoreMenu);
    return () => {
      document.removeEventListener("pointerdown", closeMoreMenu);
      window.removeEventListener("keydown", closeMoreMenu);
    };
  }, [isMoreOpen]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = mobilePanelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.body.classList.add("site-nav-open");
    window.addEventListener("keydown", onKeyDown);
    requestAnimationFrame(() => {
      mobilePanelRef.current?.querySelector<HTMLElement>('a[href], button:not([disabled])')?.focus();
    });
    return () => {
      document.body.classList.remove("site-nav-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isMenuOpen]);

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
    <header id="site-navigation" className="site-topbar">
      <div className="site-topbar-inner">
        <Link to="/" className="site-brand" aria-label="SEMEAR - Início">
          <img src="/brand/uff-logo.svg" alt="Universidade Federal Fluminense" className="site-uff-logo" width="64" height="64" />
          <span aria-hidden="true" />
          <img src="/brand/semear-logo.svg" alt="Projeto UFF SEMEAR" className="site-semear-logo" width="72" height="72" />
          <small>Portal público</small>
        </Link>

        <nav className="site-nav" aria-label="Navegação principal">
          {primaryLinks.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              end={shouldMatchMobileLinkExactly(link.href)}
              className={({ isActive }) => (isActive ? "is-active" : undefined)}
            >
              {link.label}
            </NavLink>
          ))}
          <div ref={moreMenuRef} className={`site-nav-more ${moreLinks.some((link) => location.pathname.startsWith(link.href)) ? "is-active" : ""}`}>
            <button
              type="button"
              aria-expanded={isMoreOpen}
              aria-haspopup="menu"
              onClick={() => setIsMoreOpen((open) => !open)}
            >
              Mais
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {isMoreOpen ? (
              <div className="site-nav-more-panel" role="menu" aria-label="Mais áreas do portal">
                {moreLinks.map((link) => (
                  <NavLink key={link.href} to={link.href} role="menuitem">
                    {link.label}
                  </NavLink>
                ))}
              </div>
            ) : null}
          </div>
        </nav>

        <div className="site-actions">
          <Link to="/offline" className="site-pwa-badge">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3 5 6v5c0 4.7 2.9 8 7 10 4.1-2 7-5.3 7-10V6l-7-3Z" />
            </svg>
            PWA Pública
          </Link>
          <button className="site-install" onClick={handleInstallClick} type="button" aria-label="Instalar aplicativo SEMEAR">
            Instalar app
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v10m0 0 4-4m-4 4-4-4M5 20h14" />
            </svg>
          </button>
        </div>

        <button
          ref={menuButtonRef}
          className="site-menu-button"
          onClick={() => setIsMenuOpen((open) => !open)}
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          aria-haspopup="dialog"
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
        <div
          ref={mobilePanelRef}
          className="site-mobile-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-navigation-title"
        >
          <nav id="mobile-navigation" className="site-mobile-nav" aria-label="Navegação móvel">
            <h2 id="mobile-navigation-title" className="sr-only">Menu de navegação</h2>
            {mobileGroups.map((group) => (
              <section key={group.label} className="site-mobile-group" aria-labelledby={`mobile-nav-${group.label}`}>
                <h2 id={`mobile-nav-${group.label}`}>{group.label}</h2>
                <div>
                  {group.links.map((link) => (
                    <NavLink
                      key={link.href}
                      to={link.href}
                      end={shouldMatchMobileLinkExactly(link.href)}
                      className={({ isActive }) => (isActive ? "is-active" : undefined)}
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </div>
              </section>
            ))}
            <button className="site-mobile-install" onClick={handleInstallClick} type="button" aria-label="Instalar aplicativo SEMEAR">Instalar app</button>
          </nav>
        </div>
      )}
    </header>
  );
}
