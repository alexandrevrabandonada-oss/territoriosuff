import { Link } from "react-router-dom";

import { IconShell, SurfaceCard } from "../components/BrandSystem";
import { BrandRadialDivider, BrandWatermarkPanel } from "../components/BrandMicro";
import { PortalPageShell, PortalSectionHeader } from "../components/portal";
import { INSTITUTIONAL_CITATION, INSTITUTIONAL_COORDINATION, INSTITUTIONAL_FUNDING, INSTITUTIONAL_SUMMARY, INSTITUTIONAL_TAGLINE } from "../content/institucional";

const quickLinks = [
  { href: "/dados", label: "Acessar painel publico de dados" },
  { href: "/relatorios", label: "Consultar relatorios e notas tecnicas" },
  { href: "/transparencia", label: "Ver transparencia financeira" },
  { href: "/acervo/linha", label: "Explorar a linha do tempo do acervo" }
];

const citationBullets = [
  "Informe o nome do projeto SEMEAR, a instituicao coordenadora e a data de acesso.",
  "Descreva a estacao, o indicador e o recorte temporal usados na materia.",
  "Se reproduzir numeros agregados, cite a pagina ou relatorio de origem com link direto.",
  "Evite comparar periodos diferentes sem indicar claramente a janela analisada."
];

const contacts = [
  { label: "Contato institucional", href: "mailto:contato@semear.uff.br", text: "contato@semear.uff.br" },
  { label: "Coordenacao UFF", href: "mailto:coord.semear@id.uff.br", text: "coord.semear@id.uff.br" }
];

const downloads = [
  { label: "Baixar logo SEMEAR (SVG)", href: "/brand/semear-logo.svg" },
  { label: "Baixar logo UFF (PNG)", href: "/brand/uff-logo-vertical-blue.png" }
];

export function ImprensaPage() {
  return (
    <PortalPageShell>
      <SurfaceCard className="portal-stage-hero portal-stage-hero-documental overflow-hidden p-0">
        <div className="portal-stage-hero-inner">
          <div className="portal-stage-copy">
            <IconShell tone="brand" className="portal-stage-icon">
              <span aria-hidden="true">🗞️</span>
            </IconShell>
            <h1>Imprensa e materiais institucionais</h1>
            <p>
              Apoio para jornalistas, assessorias, pesquisadores e parceiros com resumo institucional, orientação de citação e acesso rápido aos materiais públicos.
            </p>
          </div>
          <div className="portal-stage-stat">
            <span>UFF</span>
            <small>coordenação institucional</small>
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard className="portal-list-panel logo-watermark-soft p-6 md:p-8">
        <PortalSectionHeader
          eyebrow={<span className="badge-dados-abertos">Resumo institucional</span>}
          title="Resumo institucional"
          subtitle="Base curta para jornalistas, assessorias e parceiros entenderem o escopo público do SEMEAR."
        />
        <BrandWatermarkPanel>
        <h2 className="text-lg font-black text-text-primary">Resumo institucional</h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-text-secondary md:text-base">
          <p>{INSTITUTIONAL_SUMMARY}</p>
          <p>{INSTITUTIONAL_TAGLINE}. O portal combina dados ambientais em tempo quase real, biblioteca oficial de relatórios, acervo histórico, agenda de atividades e prestação de contas em linguagem acessível.</p>
          <p className="seed-badge w-fit">{INSTITUTIONAL_COORDINATION} · {INSTITUTIONAL_FUNDING}</p>
        </div>
        </BrandWatermarkPanel>
      </SurfaceCard>

      <SurfaceCard className="portal-list-panel p-6 md:p-8">
        <PortalSectionHeader
          eyebrow={<span className="badge-metodologia">Uso e citação</span>}
          title="Como citar dados"
          subtitle="Referencie origem, recorte temporal e contexto técnico antes de reproduzir números ou interpretações."
        />
        <h2 className="text-lg font-black text-text-primary">Como citar dados</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-text-secondary md:text-base">
          {citationBullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-text-secondary md:text-base">{INSTITUTIONAL_CITATION}</p>
        <p className="mt-4 text-sm text-text-secondary">
          Para contexto técnico adicional, consulte <Link className="font-semibold text-brand-primary underline" to="/como-ler-dados">Como ler os dados</Link>.
        </p>
        <BrandRadialDivider className="radial-divider-subtle mt-4" />
      </SurfaceCard>

      <SurfaceCard className="portal-list-panel p-6 md:p-8">
        <PortalSectionHeader
          eyebrow={<span className="badge-dados-abertos">Navegação rápida</span>}
          title="Links rápidos"
          subtitle="Atalhos para dados, relatórios, transparência e memória pública."
        />
        <h2 className="text-lg font-black text-text-primary">Links rapidos</h2>
        <ul className="mt-3 grid gap-3 md:grid-cols-2">
          {quickLinks.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                className="flex min-h-[52px] items-center rounded-xl border border-border-subtle bg-surface-1 px-4 py-3 text-sm font-semibold text-brand-primary transition-colors hover:bg-brand-primary-soft"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </SurfaceCard>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <SurfaceCard className="portal-list-panel p-6 md:p-8">
          <PortalSectionHeader
            eyebrow={<span className="badge-dados-abertos">Contatos</span>}
            title="Contatos"
            subtitle="Canais institucionais e referências para imprensa e coordenação."
          />
          <h2 className="text-lg font-black text-text-primary">Contatos</h2>
          <ul className="mt-3 space-y-3 text-sm text-text-secondary md:text-base">
            {contacts.map((item) => (
              <li key={item.href}>
                <a className="font-semibold text-brand-primary underline" href={item.href}>
                  {item.label}: {item.text}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-text-secondary">
            Políticas de privacidade e tratamento de dados pessoais estão em {" "}
            <Link className="font-semibold text-brand-primary underline" to="/privacidade-lgpd">
              Privacidade e LGPD
            </Link>.
          </p>
        </SurfaceCard>

        <SurfaceCard className="document-placeholder p-6 shadow-sm md:p-8">
          <PortalSectionHeader
            eyebrow={<span className="badge-metodologia">Identidade visual</span>}
            title="Download de logos"
            subtitle="Arquivos institucionais básicos para uso editorial controlado."
          />
          <h2 className="text-lg font-black text-brand-primary">Download de logos</h2>
          <div className="mt-4 space-y-4">
            <img
              src="/brand/semear-logo.svg"
              alt="Prévia da marca institucional do projeto SEMEAR"
              className="w-full rounded-xl border border-border-subtle bg-white p-3"
              loading="lazy"
            />
            <img
              src="/brand/uff-logo-vertical-blue.png"
              alt="Prévia da marca institucional da Universidade Federal Fluminense"
              className="w-full rounded-xl border border-border-subtle bg-white p-3"
              loading="lazy"
            />
          </div>
          <ul className="mt-4 space-y-2">
            {downloads.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  download
                  className="inline-flex min-h-[44px] items-center font-semibold text-brand-primary underline"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </SurfaceCard>
      </section>
    </PortalPageShell>
  );
}
