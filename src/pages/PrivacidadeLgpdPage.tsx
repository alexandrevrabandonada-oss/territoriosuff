import { Link } from "react-router-dom";
import { IconShell, SurfaceCard } from "../components/BrandSystem";

export function PrivacidadeLgpdPage() {
  return (
    <section className="portal-stage space-y-8 md:space-y-10">
      <SurfaceCard className="portal-stage-hero portal-stage-hero-documental overflow-hidden p-0">
        <div className="portal-stage-hero-inner">
          <div className="portal-stage-copy">
            <IconShell tone="brand" className="portal-stage-icon"><span aria-hidden="true">🔐</span></IconShell>
            <h1>Privacidade e LGPD</h1>
            <p>Compromissos públicos do SEMEAR com privacidade, minimização de dados, participação segura e transparência institucional.</p>
          </div>
          <div className="portal-stage-stat"><span>LGPD</span><small>direitos e contato</small></div>
        </div>
      </SurfaceCard>

      <SurfaceCard className="portal-list-panel p-6">
        <h2 className="text-lg font-black text-text-primary">Como tratamos dados</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-text-secondary md:text-base">
          <li>Coletamos somente dados necessarios para funcionamento da plataforma e inscricoes publicas.</li>
          <li>Dados ambientais publicados em <Link className="font-semibold text-brand-primary underline" to="/dados">/dados</Link> sao de interesse coletivo e nao identificam pessoas.</li>
          <li>Dados de contato enviados em formularios sao usados apenas para retorno institucional e organizacao de atividades.</li>
          <li>Voce pode solicitar revisao, correcao ou exclusao de dados pessoais pelos canais oficiais.</li>
        </ul>
      </SurfaceCard>

      <SurfaceCard className="portal-list-panel p-6">
        <h2 className="text-lg font-black text-text-primary">Participacao com seguranca</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-text-secondary md:text-base">
          <li>Use <Link className="font-semibold text-brand-primary underline" to="/agenda">/agenda</Link> para inscricoes em atividades com informacoes claras de uso de dados.</li>
          <li>No <Link className="font-semibold text-brand-primary underline" to="/conversar">/conversar</Link>, evite publicar informacoes pessoais sensiveis em texto aberto.</li>
          <li>Alertas em <Link className="font-semibold text-brand-primary underline" to="/alertas">/alertas</Link> usam somente dados tecnicos necessarios para envio.</li>
        </ul>
      </SurfaceCard>

      <SurfaceCard className="portal-list-panel border-brand-primary/15 bg-brand-primary-soft p-6">
        <h2 className="text-lg font-black text-brand-primary">Acessibilidade e contato</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-text-primary">
          <li>Se preferir, envie sua solicitacao em linguagem simples e a equipe retorna com orientacao objetiva.</li>
          <li>Canal de privacidade e direitos LGPD: <a className="font-semibold text-brand-primary underline" href="mailto:contato@semear.uff.br">contato@semear.uff.br</a>.</li>
          <li>Para contexto institucional do projeto, veja tambem a pagina <Link className="font-semibold text-brand-primary underline" to="/sobre">Sobre</Link>.</li>
        </ul>
      </SurfaceCard>
    </section>
  );
}
