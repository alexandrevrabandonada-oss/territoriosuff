import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <img src="/brand/uff-logo.svg" alt="Universidade Federal Fluminense" width="64" height="64" loading="lazy" />
          <span aria-hidden="true" />
          <img src="/brand/semear-logo.svg" alt="Projeto UFF SEMEAR" width="72" height="72" loading="lazy" />
        </div>

        <p>Plataforma pública-universitária de referência para monitoramento ambiental e climático.</p>

        <nav aria-label="Links úteis">
          <strong>Links úteis</strong>
          <Link to="/sobre">Sobre o projeto</Link>
          <Link to="/governanca">Governança</Link>
          <Link to="/transparencia">Transparência</Link>
          <Link to="/como-ler-dados">Guias</Link>
          <Link to="/privacidade-lgpd">Privacidade e LGPD</Link>
          <Link to="/conversar">Conversas e atividades</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/dossies">Dossiês</Link>
          <Link to="/buscar">Buscar no portal</Link>
        </nav>

        <div className="site-footer-social">
          <strong>Siga-nos</strong>
          <div className="flex items-center gap-3">
            <a
              href="https://www.instagram.com/sfsemear?igsh=MXF1ODdkemZlaHJrYg=="
              className="text-white/80 transition-colors hover:text-white"
              aria-label="Abrir Instagram oficial do SEMEAR"
              rel="noopener noreferrer"
              target="_blank"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a
              href="https://www.tiktok.com/@semear.uff?_r=1&_t=ZS-98FzuP81rtN"
              className="text-white/80 transition-colors hover:text-white"
              aria-label="Abrir TikTok oficial do SEMEAR"
              rel="noopener noreferrer"
              target="_blank"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M14.5 3c.35 2.08 1.55 3.32 3.5 3.74v3.02a8.1 8.1 0 0 1-3.5-1.02v5.72a6 6 0 1 1-5.18-5.94v3.12a3 3 0 1 0 2.18 2.82V3h3Z" />
              </svg>
            </a>
          </div>
        </div>

        <Link to="/offline" className="site-footer-pwa">
          <span>PWA Pública</span>
          <small>Aplicativo leve, seguro e acessível. Instale e acesse offline.</small>
        </Link>
      </div>
    </footer>
  );
}
