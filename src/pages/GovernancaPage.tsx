import { Link } from "react-router-dom";
import changelogRaw from "../../data/changelog.md?raw";

import { INSTITUTIONAL_CITATION, INSTITUTIONAL_COORDINATION, INSTITUTIONAL_FUNDING, INSTITUTIONAL_SUMMARY, INSTITUTIONAL_TAGLINE } from "../content/institucional";
import { IconShell, SurfaceCard } from "../components/BrandSystem";
import { BrandRadialDivider, BrandWatermarkPanel } from "../components/BrandMicro";
import { PortalPageShell, PortalSectionHeader } from "../components/portal";

function getLatestChangelogEntries(markdown: string, limit = 10): string[] {
  return markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.replace(/^-\s+/, ""))
    .slice(0, limit);
}

const latestEntries = getLatestChangelogEntries(changelogRaw, 10);

const governanceLinks = [
  { href: "/blog", label: "Blog" },
  { href: "/acervo", label: "Acervo" },
  { href: "/relatorios", label: "Relatórios" },
  { href: "/privacidade-lgpd", label: "Privacidade e LGPD" },
  { href: "/status", label: "Status técnico" }
];

export function GovernancaPage() {
  return (
    <PortalPageShell>
      <SurfaceCard className="portal-stage-hero portal-stage-hero-lab overflow-hidden p-0">
        <div className="portal-stage-hero-inner">
          <div className="portal-stage-copy">
            <IconShell tone="lab" className="portal-stage-icon">
              <span aria-hidden="true">⚖️</span>
            </IconShell>
            <h1>Governança e publicação</h1>
            <p>
              {INSTITUTIONAL_TAGLINE}. Regras públicas de publicação, correção, privacidade e transparência técnica do portal SEMEAR.
            </p>
          </div>
          <div className="portal-stage-stat">
            <span>{latestEntries.length}</span>
            <small>itens recentes no changelog</small>
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard className="portal-list-panel p-6">
        <PortalSectionHeader
          eyebrow={<span className="badge-dados-abertos">Política editorial</span>}
          title="Política de publicação"
          subtitle="Regras mínimas para tornar conteúdo público com clareza institucional e responsabilidade editorial."
        />
        <BrandWatermarkPanel>
        <h2 className="text-lg font-black text-text-primary">Política de publicação</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-text-secondary md:text-base">
          <li>{INSTITUTIONAL_SUMMARY} Blog, acervo e relatórios são publicados somente após revisão editorial mínima e checagem institucional.</li>
          <li>Conteúdos programados usam data de publicação e permanecem ocultos até o momento previsto.</li>
          <li>Relatórios e notas técnicas entram na biblioteca pública com título, resumo, ano e arquivo PDF quando disponível.</li>
          <li>Itens sem comprovação mínima de origem, contexto ou autoria não devem ser publicados em área pública.</li>
        </ul>
        </BrandWatermarkPanel>
      </SurfaceCard>

      <SurfaceCard className="portal-list-panel p-6">
        <PortalSectionHeader
          eyebrow={<span className="badge-metodologia">Correção e rastreabilidade</span>}
          title="Critérios de correção"
          subtitle="Mudanças materiais devem virar registro público; correções simples podem ser silenciosas quando não mudam o sentido."
        />
        <h2 className="text-lg font-black text-text-primary">Critérios de correção</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-text-secondary md:text-base">
          <li>Correções editoriais simples podem ser aplicadas sem republicação quando não alteram o sentido do conteúdo.</li>
          <li>Correções de dado, contexto técnico ou referência devem gerar registro no changelog público.</li>
          <li>Quando uma publicação for materialmente corrigida, a equipe deve priorizar clareza sobre o que mudou e por quê.</li>
          <li>Em caso de erro crítico, o conteúdo pode ser temporariamente retirado até revisão completa.</li>
        </ul>
        <BrandRadialDivider className="radial-divider-subtle mt-4" />
      </SurfaceCard>

      <SurfaceCard className="portal-list-panel p-6">
        <PortalSectionHeader
          eyebrow={<span className="badge-dados-abertos">Privacidade e observabilidade</span>}
          title="Privacidade e transparência técnica"
          subtitle="O portal precisa ser auditável sem expor segredos, dados pessoais desnecessários ou ruído operacional."
        />
        <h2 className="text-lg font-black text-text-primary">Privacidade e transparência técnica</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-text-secondary md:text-base">
          <li>Direitos de privacidade, dados pessoais e canais de contato estão descritos em <Link className="font-semibold text-brand-primary underline" to="/privacidade-lgpd">/privacidade-lgpd</Link>.</li>
          <li>{INSTITUTIONAL_CITATION}</li>
          <li>Indicadores operacionais, integridade da rede e métricas públicas do portal ficam disponíveis em <Link className="font-semibold text-brand-primary underline" to="/status">/status</Link>.</li>
          <li>Logs públicos e changelog são sanitizados: não expõem segredos, tokens, chaves nem dados pessoais desnecessários.</li>
          <li>{INSTITUTIONAL_FUNDING} e {INSTITUTIONAL_COORDINATION} compõem a identidade institucional exibida ao público.</li>
          <li>Eventos de compartilhamento são registrados com minimização de dados e hash de IP para análise agregada.</li>
        </ul>
      </SurfaceCard>

      <SurfaceCard className="portal-list-panel p-6">
        <PortalSectionHeader
          eyebrow={<span className="badge-dados-abertos">Atalhos institucionais</span>}
          title="Atalhos institucionais"
          subtitle="Caminhos rápidos para blog, acervo, relatórios, privacidade e status técnico."
        />
        <h2 className="text-lg font-black text-text-primary">Atalhos institucionais</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {governanceLinks.map((item) => (
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

      <SurfaceCard className="logo-watermark-soft border-brand-primary/15 bg-brand-primary-soft p-6">
        <PortalSectionHeader
          eyebrow={<span className="badge-metodologia">Changelog público</span>}
          title="Changelog público"
          subtitle="Últimos movimentos do portal registrados de forma legível para o público."
        />
        <h2 className="text-lg font-black text-brand-primary">Changelog público (últimos 10 itens)</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-text-primary md:text-base">
          {latestEntries.map((entry) => (
            <li key={entry}>{entry}</li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-text-secondary">
          Arquivo versionado em <code>data/changelog.md</code>.
        </p>
      </SurfaceCard>
    </PortalPageShell>
  );
}
