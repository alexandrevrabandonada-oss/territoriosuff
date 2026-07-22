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

        <Link to="/offline" className="site-footer-pwa">
          <span>PWA Pública</span>
          <small>Aplicativo leve, seguro e acessível. Instale e acesse offline.</small>
        </Link>
      </div>
    </footer>
  );
}
