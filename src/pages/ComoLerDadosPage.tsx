import { Link } from "react-router-dom";
import { IconShell, SurfaceCard } from "../components/BrandSystem";

const quickLinks = [
  { href: "/dados", label: "Painel de dados" },
  { href: "/alertas", label: "Alertas de qualidade do ar" },
  { href: "/agenda", label: "Agenda pública" },
  { href: "/conversar", label: "Canal Conversar" }
];

export function ComoLerDadosPage() {
  return (
    <section className="portal-stage space-y-8 md:space-y-10">
      <SurfaceCard className="portal-stage-hero portal-stage-hero-lab overflow-hidden p-0">
        <div className="portal-stage-hero-inner">
          <div className="portal-stage-copy">
            <IconShell tone="lab" className="portal-stage-icon"><span aria-hidden="true">📊</span></IconShell>
            <h1>Como ler os dados</h1>
            <p>Guia rápido para interpretar leituras de MP2.5 e MP10, tendências recentes e classificações públicas de risco.</p>
          </div>
          <div className="portal-stage-stat"><span>4</span><small>passos de leitura</small></div>
        </div>
      </SurfaceCard>

      <SurfaceCard className="portal-list-panel p-6">
        <h2 className="text-lg font-black text-text-primary">Leitura em 4 passos</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-text-secondary md:text-base">
          <li>Considere primeiro o horario da medicao para entender se e uma condicao pontual ou continua.</li>
          <li>Compare MP2.5 e MP10: valores altos em ambos indicam pior qualidade do ar no momento.</li>
          <li>Use as classificacoes de risco como orientacao publica, nao como diagnostico individual.</li>
          <li>Acompanhe tendencia nas ultimas horas para evitar conclusoes com base em um unico valor.</li>
        </ul>
      </SurfaceCard>

      <SurfaceCard className="portal-list-panel p-6">
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
        <h2 className="text-lg font-black text-brand-primary">Acessibilidade e contato</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-text-primary">
          <li>As paginas seguem navegacao por teclado, foco visivel e contraste reforcado.</li>
          <li>Se voce encontrar barreiras de acesso, envie relato para <a className="font-semibold text-brand-primary underline" href="mailto:contato@semear.uff.br">contato@semear.uff.br</a>.</li>
          <li>Para duvidas sobre interpretacao publica, consulte tambem a pagina de <Link className="font-semibold text-brand-primary underline" to="/sobre">Sobre o projeto</Link>.</li>
        </ul>
      </SurfaceCard>
    </section>
  );
}
