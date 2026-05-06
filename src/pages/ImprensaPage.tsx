import { Link } from "react-router-dom";

import { SectionHeader, SurfaceCard } from "../components/BrandSystem";
import { BrandRadialDivider, BrandWatermarkPanel } from "../components/BrandMicro";
import { INSTITUTIONAL_CITATION, INSTITUTIONAL_COORDINATION, INSTITUTIONAL_FUNDING, INSTITUTIONAL_SUMMARY, INSTITUTIONAL_TAGLINE, INSTITUTIONAL_UNIVERSITY_FULL_NAME } from "../content/institucional";

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
    <section className="space-y-6">
      <SurfaceCard className="document-placeholder p-6 shadow-sm md:p-8">
        <SectionHeader
          eyebrow="Imprensa"
          title="Imprensa"
          description="Página de apoio para jornalistas, assessorias, pesquisadores e parceiros com resumo institucional, orientações de citação e acesso rápido aos materiais públicos do projeto."
        />
      </SurfaceCard>

      <SurfaceCard className="surface-card logo-watermark-soft p-6 shadow-sm md:p-8">
        <BrandWatermarkPanel>
        <h2 className="text-lg font-black text-text-primary">Resumo institucional</h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-text-secondary md:text-base">
          <p>{INSTITUTIONAL_SUMMARY}</p>
          <p>{INSTITUTIONAL_TAGLINE}. O portal combina dados ambientais em tempo quase real, biblioteca oficial de relatórios, acervo histórico, agenda de atividades e prestação de contas em linguagem acessível.</p>
          <p className="seed-badge w-fit">{INSTITUTIONAL_COORDINATION} · {INSTITUTIONAL_FUNDING}</p>
        </div>
        </BrandWatermarkPanel>
      </SurfaceCard>

      <SurfaceCard className="surface-card p-6 shadow-sm md:p-8">
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

      <SurfaceCard className="surface-card p-6 shadow-sm md:p-8">
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
        <SurfaceCard className="surface-card p-6 shadow-sm md:p-8">
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
    </section>
  );
}
