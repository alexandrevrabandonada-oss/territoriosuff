export const SITE_ORIGIN = "https://www.semearsf.org";
export const DEFAULT_SOCIAL_IMAGE = `${SITE_ORIGIN}/brand/semear-preview-logo.jpg`;

export type SiteRouteMetadata = {
  path: string;
  title: string;
  description: string;
};

export const STATIC_ROUTE_METADATA: SiteRouteMetadata[] = [
  { path: "/", title: "SEMEAR UFF | Transparência pública ambiental", description: "Portal público da UFF para dados ambientais, qualidade do ar, memória territorial, participação social e transparência em Volta Redonda." },
  { path: "/alertas", title: "Central de Alertas | SEMEAR", description: "Configure alertas públicos de qualidade do ar com limites, horários de silêncio e critérios transparentes de notificação." },
  { path: "/dados", title: "Leituras ambientais | SEMEAR", description: "Consulte estações, leituras ambientais, cobertura e contexto operacional dos dados públicos reunidos pelo SEMEAR." },
  { path: "/qualidade-ar", title: "Portal de Qualidade do Ar | SEMEAR", description: "Acesse o Radar INEA, conheça a rede própria em implantação e entenda como interpretar os dados de qualidade do ar." },
  { path: "/qualidade-ar/inea", title: "Radar INEA | SEMEAR", description: "Explore mapa, histórico, cobertura, território e metodologia da base pública de qualidade do ar do INEA em Volta Redonda." },
  { path: "/qualidade-ar/inea/analises", title: "Análises INEA | SEMEAR", description: "Sínteses históricas auditáveis sobre cobertura, classificação, estações, lacunas e poluentes da base pública do INEA." },
  { path: "/qualidade-ar/inea/metodologia", title: "Metodologia e dados abertos INEA | SEMEAR", description: "Conheça fontes, cálculos, critérios de validade, limitações, versões e downloads abertos usados no Radar INEA." },
  { path: "/agenda", title: "Agenda pública | SEMEAR", description: "Acompanhe atividades, encontros, escutas e eventos públicos do Projeto UFF SEMEAR no território." },
  { path: "/conversar", title: "Conversas e atividades | SEMEAR", description: "Consulte memórias de campo, rodas de conversa e atividades, ou envie um relato ambiental ao SEMEAR." },
  { path: "/mapa", title: "Mapa de monitoramento | SEMEAR", description: "Localize estações e consulte a cobertura territorial das leituras ambientais disponíveis no portal SEMEAR." },
  { path: "/inscricoes", title: "Inscrições | SEMEAR", description: "Consulte e acompanhe inscrições vinculadas às atividades públicas promovidas pelo Projeto UFF SEMEAR." },
  { path: "/sobre", title: "Sobre o Projeto UFF SEMEAR", description: "Conheça objetivos, princípios, equipe, atuação territorial e compromissos públicos do Projeto UFF SEMEAR." },
  { path: "/transparencia", title: "Transparência e devolutiva pública | SEMEAR", description: "Acompanhe presença territorial, atividades, escutas, prioridades e devolutivas públicas organizadas pelo SEMEAR." },
  { path: "/como-ler-dados", title: "Como ler os dados | SEMEAR", description: "Guia público para interpretar séries ambientais, cobertura, limites metodológicos e indicadores do portal SEMEAR." },
  { path: "/como-participar", title: "Como participar | SEMEAR", description: "Descubra como participar de atividades, enviar relatos, acompanhar dados e contribuir com o controle social ambiental." },
  { path: "/privacidade-lgpd", title: "Privacidade e LGPD | SEMEAR", description: "Saiba como o portal SEMEAR trata dados pessoais, inscrições, relatos, cookies e direitos previstos na LGPD." },
  { path: "/governanca", title: "Governança e publicação | SEMEAR", description: "Conheça responsabilidades, fluxos editoriais, critérios de publicação e mecanismos de governança do SEMEAR." },
  { path: "/imprensa", title: "Imprensa e identidade visual | SEMEAR", description: "Acesse informações institucionais, materiais de imprensa e arquivos oficiais da identidade visual do SEMEAR." },
  { path: "/apresentacao", title: "Apresentação institucional | SEMEAR", description: "Veja uma apresentação pública do Projeto UFF SEMEAR, sua atuação territorial e seus principais eixos de trabalho." },
  { path: "/programa-uff-territorio", title: "Programa UFF Território | SEMEAR", description: "Conheça a proposta integrada de monitoramento, participação, educação ambiental e legado público para o Médio Paraíba." },
  { path: "/acervo", title: "Acervo público | SEMEAR", description: "Explore artigos, notícias, documentos, mídias e memórias públicas preservadas pelo Projeto UFF SEMEAR." },
  { path: "/acervo/linha", title: "Linha do tempo do acervo | SEMEAR", description: "Navegue cronologicamente pelos documentos, estudos e memórias públicas preservadas no acervo SEMEAR." },
  { path: "/dossies", title: "Dossiês temáticos | SEMEAR", description: "Consulte coleções curadas por tema, território e interesse público dentro do acervo do SEMEAR." },
  { path: "/blog", title: "Blog editorial | SEMEAR", description: "Leia atualizações institucionais, bastidores de campo e comunicação pública produzida pelo Projeto UFF SEMEAR." },
  { path: "/relatorios", title: "Relatórios e boletins | SEMEAR", description: "Consulte relatórios, boletins e documentos técnicos publicados com metodologia e contexto de uso explícitos." },
  { path: "/status", title: "Status do sistema | SEMEAR", description: "Acompanhe integridade técnica, operação, conteúdo, observabilidade e disponibilidade dos serviços públicos do SEMEAR." },
  { path: "/buscar", title: "Busca no portal | SEMEAR", description: "Pesquise dados, atividades, acervo, blog, dossiês e relatórios publicados no portal SEMEAR." },
  { path: "/offline", title: "Acesso offline | SEMEAR", description: "Entenda o que permanece disponível sem conexão e como atualizar o aplicativo público SEMEAR." }
];

const metadataByPath = new Map(STATIC_ROUTE_METADATA.map((metadata) => [metadata.path, metadata]));

const dynamicMetadata: Array<{ prefix: string; title: string; description: string }> = [
  { prefix: "/agenda/", title: "Atividade pública | SEMEAR", description: "Detalhes de uma atividade pública, encontro ou ação territorial promovida pelo Projeto UFF SEMEAR." },
  { prefix: "/conversar/", title: "Conversa ou atividade | SEMEAR", description: "Memória pública de conversa, escuta ou atividade territorial publicada pelo Projeto UFF SEMEAR." },
  { prefix: "/qualidade-ar/inea/estacoes/", title: "Estação INEA | SEMEAR", description: "Detalhes, cobertura, histórico e metadados de uma estação pública de qualidade do ar do INEA." },
  { prefix: "/acervo/item/", title: "Item do acervo | SEMEAR", description: "Documento, estudo ou memória pública preservada no acervo do Projeto UFF SEMEAR." },
  { prefix: "/acervo/", title: "Área do acervo | SEMEAR", description: "Itens públicos organizados por área temática dentro do acervo do Projeto UFF SEMEAR." },
  { prefix: "/dossies/", title: "Dossiê temático | SEMEAR", description: "Coleção temática curada a partir do acervo público do Projeto UFF SEMEAR." },
  { prefix: "/blog/", title: "Artigo do blog | SEMEAR", description: "Publicação editorial do Projeto UFF SEMEAR sobre território, ambiente, pesquisa e participação social." },
  { prefix: "/relatorios/", title: "Relatório público | SEMEAR", description: "Relatório ou boletim técnico publicado pelo Projeto UFF SEMEAR com contexto e metodologia explícitos." }
];

export function normalizeSitePath(pathname: string) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

export function getSiteRouteMetadata(pathname: string): SiteRouteMetadata {
  const normalizedPath = normalizeSitePath(pathname);
  const exactMetadata = metadataByPath.get(normalizedPath);
  if (exactMetadata) return exactMetadata;

  const dynamicMatch = dynamicMetadata.find((metadata) => normalizedPath.startsWith(metadata.prefix));
  if (dynamicMatch) return { path: normalizedPath, title: dynamicMatch.title, description: dynamicMatch.description };

  return { ...metadataByPath.get("/")!, path: normalizedPath };
}

export function getCanonicalUrl(pathname: string) {
  const normalizedPath = normalizeSitePath(pathname);
  return `${SITE_ORIGIN}${normalizedPath === "/" ? "/" : normalizedPath}`;
}

export function getStaticMetadataFileName(pathname: string) {
  return pathname === "/" ? "home" : pathname.slice(1).replace(/\//g, "--");
}
