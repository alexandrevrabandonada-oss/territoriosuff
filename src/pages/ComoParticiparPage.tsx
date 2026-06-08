import { Link } from "react-router-dom";
import { IconShell, SurfaceCard } from "../components/BrandSystem";
import { PortalHero, PortalPageShell, PortalSectionHeader } from "../components/portal";

const participationLinks = [
  { href: "/agenda", label: "Inscricoes e agenda" },
  { href: "/conversar", label: "Conversas e atividades" },
  { href: "/alertas", label: "Receber alertas" },
  { href: "/dados", label: "Acompanhar dados" }
];

export function ComoParticiparPage() {
  return (
    <PortalPageShell>
      <PortalHero
        tone="seed"
        badge={<span className="badge-dados-abertos">Participação pública</span>}
        title="Como participar"
        subtitle="Formas simples de entrar nas atividades públicas, receber alertas, acompanhar dados e contribuir com relatos do território."
        metrics={
          <>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-white">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/70">Canais</div>
              <div className="mt-2 text-3xl font-black">4</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-white">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/70">Foco</div>
              <div className="mt-2 text-lg font-black">Agenda, relatos, alertas e dados</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-white">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/70">Próximo passo</div>
              <div className="mt-2 text-lg font-black">Escolher uma porta de entrada</div>
            </div>
          </>
        }
        aside={
          <div className="rounded-[1.8rem] border border-white/10 bg-white/10 p-5 text-white backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <IconShell tone="seed" className="portal-stage-icon"><span aria-hidden="true">🤝</span></IconShell>
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/70">Engajamento cívico</div>
                <div className="mt-1 text-base font-black">Participar aqui significa acompanhar, relatar, comparecer e cobrar.</div>
              </div>
            </div>
          </div>
        }
      />

      <SurfaceCard className="portal-list-panel p-6">
        <PortalSectionHeader
          eyebrow={<span className="badge-metodologia">Canais de participação</span>}
          title="Canais de participação"
          subtitle="Quatro portas de entrada para quem quer se envolver com o portal e com o território."
        />
        <h2 className="text-lg font-black text-text-primary">Canais de participacao</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-text-secondary md:text-base">
          <li>Inscreva-se nas atividades da agenda para oficinas, rodas de conversa e encontros tecnicos.</li>
          <li>Use a área Conversas e atividades para acompanhar registros de campo e enviar relatos, perguntas e contribuições da sua comunidade.</li>
          <li>Ative alertas para receber avisos de qualidade do ar diretamente no seu dispositivo.</li>
          <li>Acompanhe o painel de dados para monitorar tendencias e apoiar debates publicos.</li>
        </ul>
      </SurfaceCard>

      <SurfaceCard className="portal-list-panel p-6">
        <PortalSectionHeader
          eyebrow={<span className="badge-dados-abertos">Atalhos úteis</span>}
          title="Atalhos"
          subtitle="Vá direto para o tipo de participação que faz sentido para você."
        />
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
        <PortalSectionHeader
          eyebrow={<span className="badge-dados-abertos">Acessibilidade e contato</span>}
          title="Acessibilidade e contato"
          subtitle="O acesso à participação precisa ser simples, direto e suportado por canais claros."
        />
        <h2 className="text-lg font-black text-brand-primary">Acessibilidade e contato</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-text-primary">
          <li>Conteudo pensado para leitura objetiva, com linguagem simples e estrutura por blocos.</li>
          <li>Se precisar de suporte para participar de atividades, escreva para <a className="font-semibold text-brand-primary underline" href="mailto:contato@semear.uff.br">contato@semear.uff.br</a>.</li>
          <li>Tambem e possivel acompanhar atualizacoes de situacao em <Link className="font-semibold text-brand-primary underline" to="/status">/status</Link>.</li>
        </ul>
      </SurfaceCard>
    </PortalPageShell>
  );
}
