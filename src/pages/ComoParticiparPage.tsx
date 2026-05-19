import { Link } from "react-router-dom";
import { IconShell, SurfaceCard } from "../components/BrandSystem";

const participationLinks = [
  { href: "/agenda", label: "Inscricoes e agenda" },
  { href: "/conversar", label: "Conversar" },
  { href: "/alertas", label: "Receber alertas" },
  { href: "/dados", label: "Acompanhar dados" }
];

export function ComoParticiparPage() {
  return (
    <section className="portal-stage space-y-8 md:space-y-10">
      <SurfaceCard className="portal-stage-hero portal-stage-hero-seed overflow-hidden p-0">
        <div className="portal-stage-hero-inner">
          <div className="portal-stage-copy">
            <IconShell tone="seed" className="portal-stage-icon"><span aria-hidden="true">🤝</span></IconShell>
            <h1>Como participar</h1>
            <p>Formas simples de entrar nas atividades públicas, receber alertas, acompanhar dados e contribuir com relatos do território.</p>
          </div>
          <div className="portal-stage-stat"><span>4</span><small>canais de participação</small></div>
        </div>
      </SurfaceCard>

      <SurfaceCard className="portal-list-panel p-6">
        <h2 className="text-lg font-black text-text-primary">Canais de participacao</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-text-secondary md:text-base">
          <li>Inscreva-se nas atividades da agenda para oficinas, rodas de conversa e encontros tecnicos.</li>
          <li>Use o canal Conversar para enviar relatos, perguntas e contribuicoes da sua comunidade.</li>
          <li>Ative alertas para receber avisos de qualidade do ar diretamente no seu dispositivo.</li>
          <li>Acompanhe o painel de dados para monitorar tendencias e apoiar debates publicos.</li>
        </ul>
      </SurfaceCard>

      <SurfaceCard className="portal-list-panel p-6">
        <h2 className="text-lg font-black text-text-primary">Atalhos</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {participationLinks.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                className="inline-flex rounded-full border border-border-subtle px-3 py-1 text-xs font-semibold text-brand-primary transition hover:bg-brand-primary-soft"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </SurfaceCard>

      <SurfaceCard className="portal-list-panel border-brand-primary/15 bg-brand-primary-soft p-6">
        <h2 className="text-lg font-black text-brand-primary">Acessibilidade e contato</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-text-primary">
          <li>Conteudo pensado para leitura objetiva, com linguagem simples e estrutura por blocos.</li>
          <li>Se precisar de suporte para participar de atividades, escreva para <a className="font-semibold text-brand-primary underline" href="mailto:contato@semear.uff.br">contato@semear.uff.br</a>.</li>
          <li>Tambem e possivel acompanhar atualizacoes de situacao em <Link className="font-semibold text-brand-primary underline" to="/status">/status</Link>.</li>
        </ul>
      </SurfaceCard>
    </section>
  );
}
