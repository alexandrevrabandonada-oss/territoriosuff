import { Link } from "react-router-dom";
import { IconShell, SurfaceCard } from "../components/BrandSystem";
import { PortalHero, PortalPageShell, PortalSectionHeader } from "../components/portal";

const quickLinks = [
  { href: "/dados", label: "Painel de dados" },
  { href: "/alertas", label: "Alertas de qualidade do ar" },
  { href: "/agenda", label: "Agenda pública" },
  { href: "/conversar", label: "Conversas e atividades" }
];

export function ComoLerDadosPage() {
  return (
    <PortalPageShell>
      <PortalHero
        tone="lab"
        badge={<span className="badge-metodologia">Biblioteca pedagógica</span>}
        title="Como ler os dados"
        subtitle="Guia rápido para interpretar leituras de MP2.5 e MP10, tendências recentes e classificações públicas de risco."
        metrics={
          <>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-white">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/70">Passos</div>
              <div className="mt-2 text-3xl font-black">4</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-white">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/70">Foco</div>
              <div className="mt-2 text-lg font-black">Leitura pública responsável</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-white">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/70">Próximo passo</div>
              <div className="mt-2 text-lg font-black">Ir de contexto para ação</div>
            </div>
          </>
        }
        aside={
          <div className="rounded-[1.8rem] border border-white/10 bg-white/10 p-5 text-white backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <IconShell tone="lab" className="portal-stage-icon"><span aria-hidden="true">📊</span></IconShell>
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/70">Guia público</div>
                <div className="mt-1 text-base font-black">Entenda o que um indicador diz, o que ele não diz e onde buscar mais contexto.</div>
              </div>
            </div>
          </div>
        }
      />

      <SurfaceCard className="portal-list-panel p-6">
        <PortalSectionHeader
          eyebrow={<span className="badge-dados-abertos">Leitura em camadas</span>}
          title="Leitura em 4 passos"
          subtitle="Um roteiro curto para evitar conclusões rápidas e interpretar melhor séries, horários e classificações."
        />
        <h2 className="text-lg font-black text-text-primary">Leitura em 4 passos</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-text-secondary md:text-base">
          <li>Considere primeiro o horario da medicao para entender se e uma condicao pontual ou continua.</li>
          <li>Compare MP2.5 e MP10: valores altos em ambos indicam pior qualidade do ar no momento.</li>
          <li>Use as classificacoes de risco como orientacao publica, nao como diagnostico individual.</li>
          <li>Acompanhe tendencia nas ultimas horas para evitar conclusoes com base em um unico valor.</li>
        </ul>
      </SurfaceCard>

      <SurfaceCard className="portal-list-panel p-6">
        <PortalSectionHeader
          eyebrow={<span className="badge-metodologia">Navegação guiada</span>}
          title="Onde ver mais contexto"
          subtitle="Avance do dado bruto para contexto territorial, institucional e metodológico."
        />
        <h2 className="text-lg font-black text-text-primary">Onde ver mais contexto</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {quickLinks.map((item) => (
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
          eyebrow={<span className="badge-dados-abertos">Acessibilidade e apoio</span>}
          title="Acessibilidade e contato"
          subtitle="O portal foi pensado para navegação pública, com foco visível, contraste reforçado e leitura assistida."
        />
        <h2 className="text-lg font-black text-brand-primary">Acessibilidade e contato</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-text-primary">
          <li>As paginas seguem navegacao por teclado, foco visivel e contraste reforcado.</li>
          <li>Se voce encontrar barreiras de acesso, envie relato para <a className="font-semibold text-brand-primary underline" href="mailto:contato@semear.uff.br">contato@semear.uff.br</a>.</li>
          <li>Para duvidas sobre interpretacao publica, consulte tambem a pagina de <Link className="font-semibold text-brand-primary underline" to="/sobre">Sobre o projeto</Link>.</li>
        </ul>
      </SurfaceCard>
    </PortalPageShell>
  );
}
