import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <img src="/brand/uff-logo-vertical-blue.png" alt="Universidade Federal Fluminense" />
          <span aria-hidden="true" />
          <img src="/brand/semear-logo-full.jpeg" alt="Projeto UFF SEMEAR" />
        </div>

        <p>Plataforma pública-universitária de referência para monitoramento ambiental e climático.</p>

        <nav aria-label="Links úteis">
          <strong>Links úteis</strong>
          <Link to="/sobre">Sobre o projeto</Link>
          <Link to="/governanca">Equipe</Link>
          <Link to="/transparencia">Transparência</Link>
          <Link to="/privacidade-lgpd">FAQ</Link>
          <Link to="/conversar">Contato</Link>
        </nav>

        <div className="site-footer-social">
          <strong>Siga-nos</strong>
          <div>
            <a href="https://www.instagram.com/" aria-label="Instagram">◎</a>
            <a href="https://www.youtube.com/" aria-label="YouTube">▶</a>
            <Link to="/conversar" aria-label="Conversar">@</Link>
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
