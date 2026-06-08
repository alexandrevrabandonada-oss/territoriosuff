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
          <Link to="/como-ler-dados">Guias</Link>
          <Link to="/privacidade-lgpd">FAQ</Link>
          <Link to="/conversar">Conversas e atividades</Link>
        </nav>

        <div className="site-footer-social">
          <strong>Siga-nos</strong>
          <div className="flex items-center gap-3">
            <a href="https://www.instagram.com/" className="text-white/80 hover:text-white transition-colors" aria-label="Abrir Instagram do SEMEAR" rel="noopener noreferrer" target="_blank">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.008 3.74.052 1.15.05 1.77.242 2.188.404.554.215.95.472 1.367.889.418.417.674.813.889 1.367.162.418.354 1.038.404 2.188.044.956.052 1.31.052 3.74 0 2.43-.008 2.784-.052 3.74-.05 1.15-.242 1.77-.404 2.188-.215.554-.472.95-.889 1.367-.417.418-.813.674-1.367.889-.418.162-1.038.354-2.188.404-.956.044-1.31.052-3.74.052-2.43 0-2.784-.008-3.74-.052-1.15-.05-1.77-.242-2.188-.404a3.736 3.736 0 00-1.367-.889 3.736 3.736 0 00-.889-1.367c-.162-.418-.354-1.038-.404-2.188C2.008 14.784 2 14.43 2 12c0-2.43.008-2.784.052-3.74.05-1.15.242-1.77.404-2.188.215-.554.472-.95.889-1.367.417-.418.813-.674 1.367-.889.418-.162 1.038-.354 2.188-.404C9.216 2.008 9.57 2 12 2zm0 1.8c-2.39 0-2.674.01-3.616.052-.871.04-1.343.185-1.657.307-.416.161-.712.355-.102.766-.39.41-.584.706-.745 1.122-.122.314-.267.786-.307 1.657-.043.942-.053 1.226-.053 3.616s.01 2.674.053 3.616c.04.871.185 1.343.307 1.657.161.416.355.712.766 1.102.39.41.706.584 1.122.745.314.122.786.267 1.657.307.942.043 1.226.053 3.616.053s2.674-.01 3.616-.053c.871-.04 1.343-.185 1.657-.307.416-.161.712-.355 1.102-.766.41-.39.584-.706.745-1.122.122-.314.267-.786.307-1.657.043-.942.053-1.226.053-3.616s-.01-2.674-.053-3.616c-.04-.871-.185-1.343-.307-1.657-.161-.416-.355-.712-.766-1.102-.39-.41-.706-.584-1.122-.745-.314-.122-.786-.267-1.657-.307C14.674 3.81 14.39 3.8 12 3.8zM12 7a5 5 0 100 10 5 5 0 000-10zm0 8.2a3.2 3.2 0 110-6.4 3.2 3.2 0 010 6.4zm5.3-7.5a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="https://www.youtube.com/" className="text-white/80 hover:text-white transition-colors" aria-label="Abrir YouTube do SEMEAR" rel="noopener noreferrer" target="_blank">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" clipRule="evenodd" />
              </svg>
            </a>
            <Link to="/conversar" className="text-white/80 hover:text-white transition-colors font-bold text-lg" aria-label="Conversas e atividades">@</Link>
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
