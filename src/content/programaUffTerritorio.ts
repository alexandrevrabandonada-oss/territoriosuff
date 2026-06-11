export type ProgramFront = {
  id: string;
  shortLabel: string;
  title: string;
  objective: string;
  description: string;
  deliveries: string[];
  impact: string[];
  accent: "brand" | "lab" | "seed" | "warm";
};

export type GovernanceActor = {
  name: string;
  badge: string;
  role: string;
  summary: string;
  highlights: string[];
  emphasis?: string[];
  accent: "brand" | "lab" | "seed" | "warm";
};

export type TimelinePhase = {
  phase: string;
  period: string;
  title: string;
  description: string;
  deliverables: string[];
};

export type BudgetSlice = {
  label: string;
  share: number;
  amountLabel: string;
  summary: string;
};

export type NarrativeBlock = {
  eyebrow: string;
  title: string;
  body: string;
};

export type DeliveryHighlight = {
  title: string;
  body: string;
};

export const PROGRAM_ROUTE = "/programa-uff-territorio";

export const programHeroMetrics = [
  { label: "Investimento previsto", value: "R$ 1,5 mi" },
  { label: "Duração", value: "24 meses" },
  { label: "Frentes integradas", value: "4 eixos" },
  { label: "Governança", value: "UFF + FEC + APS" }
];

export const executiveNarrative: NarrativeBlock[] = [
  {
    eyebrow: "Problema real",
    title: "O território demanda resposta pública mais robusta",
    body:
      "O Médio Paraíba reúne pressão ambiental, desigualdade territorial e lacunas persistentes de informação pública capaz de orientar prevenção, cuidado, educação e incidência social."
  },
  {
    eyebrow: "Solução integrada",
    title: "Uma resposta que junta dados, território e memória pública",
    body:
      "O programa integra monitoramento, inteligência pública, ação comunitária, educação ambiental, memória e incidência em uma mesma arquitetura institucional e tecnológica."
  },
  {
    eyebrow: "Escala regional",
    title: "Capacidade de começar com base existente e expandir",
    body:
      "Como parte da infraestrutura já em construção no SEMEAR, a proposta acelera implantação, qualifica o uso do recurso público e cria condições concretas de replicação regional."
  }
];

export const programReasons = [
  {
    title: "Há um problema territorial concreto e persistente",
    body:
      "Volta Redonda e o Médio Paraíba concentram pressão industrial, desigualdades socioambientais e demanda reprimida por informação pública confiável. O programa organiza leitura territorial clara para orientar cuidado, prevenção e incidência pública."
  },
  {
    title: "Já existe base suficiente para transformar investimento em entrega",
    body:
      "O programa não começa do zero. Ele amplia a base digital, metodológica e institucional já estruturada pelo SEMEAR, reduz tempo de implantação e acelera entregas concretas para comunidades, escolas e instituições públicas."
  }
];

export const solutionBlocks: NarrativeBlock[] = [
  {
    eyebrow: "Plataforma pública",
    title: "Integração com o SEMEAR desde o início",
    body:
      "A proposta aproveita a plataforma SEMEAR como base de dados, interface pública, ambiente editorial e infraestrutura de monitoramento já em construção."
  },
  {
    eyebrow: "Capilaridade territorial",
    title: "Presença local com mediação comunitária e institucional",
    body:
      "A APS garante articulação territorial, devolutiva pública e implementação de base, enquanto UFF e FEC sustentam coordenação acadêmica e viabilidade executiva."
  },
  {
    eyebrow: "Escala progressiva",
    title: "Modelo desenhado para crescer com consistência",
    body:
      "A combinação entre base tecnológica existente, pilotos territoriais e documentação metodológica cria condições reais para expansão regional ao longo do ciclo."
  }
];

export const deliveryHighlights: DeliveryHighlight[] = [
  {
    title: "Painéis e boletins públicos",
    body: "Informação pública territorializada sobre saúde, poluição e dados ambientais em linguagem acessível e verificável."
  },
  {
    title: "Rotinas de monitoramento comunitário",
    body: "Protocolos, registros de campo, devolutivas e produção compartilhada de evidências com base territorial."
  },
  {
    title: "Pilotos de resíduos e economia solidária",
    body: "Ações demonstrativas de compostagem, reciclagem e articulação produtiva local com potencial de replicação."
  },
  {
    title: "Formação e educação ambiental popular",
    body: "Oficinas, materiais pedagógicos, articulação com escolas e fortalecimento de repertórios de incidência pública."
  },
  {
    title: "Acervo e memória socioambiental",
    body: "Documentação, linhas narrativas, mostras e conteúdos públicos integrados à base digital do programa."
  },
  {
    title: "Relatórios e metodologia replicável",
    body: "Sistematização de entregas, avaliação e produção de um legado público acumulativo para uso em outros territórios."
  }
];

export const programFronts: ProgramFront[] = [
  {
    id: "saude-dados",
    shortLabel: "Saúde e dados",
    title: "Saúde, poluição e dados públicos",
    objective: "Transformar evidências ambientais e sanitárias em informação pública legível, acionável e territorializada.",
    description:
      "Integra dados ambientais, séries públicas e leitura territorial em uma camada pública de inteligência para apoiar universidades, serviços, comunidades e instituições no acompanhamento contínuo da qualidade ambiental e de seus efeitos sobre a vida cotidiana.",
    deliveries: [
      "Painéis públicos e boletins periódicos com linguagem cidadã",
      "Integração de bases ambientais, sanitárias e territoriais no SEMEAR",
      "Relatórios temáticos com recortes por bairro, corredor e público prioritário"
    ],
    impact: [
      "Mais transparência para decisões públicas e comunitárias",
      "Maior capacidade de leitura rápida sobre risco e desigualdade",
      "Base contínua para incidência institucional e controle social"
    ],
    accent: "brand"
  },
  {
    id: "monitoramento-comunitario",
    shortLabel: "Monitoramento",
    title: "Monitoramento ambiental comunitário",
    objective: "Conectar ciência cidadã, monitoramento de campo e devolutiva pública com protagonismo territorial.",
    description:
      "A frente organiza coleta situada, escuta local, observação de campo e circulação de dados produzidos com a comunidade, articulando método universitário e conhecimento de quem vive os impactos no território.",
    deliveries: [
      "Rotinas de monitoramento comunitário em pontos prioritários",
      "Protocolos de coleta, registro e validação com formação local",
      "Painéis territoriais e devolutivas públicas com atualização recorrente"
    ],
    impact: [
      "Produção de evidência enraizada no cotidiano local",
      "Fortalecimento de redes comunitárias de observação",
      "Ampliação da confiança pública nos dados produzidos"
    ],
    accent: "lab"
  },
  {
    id: "compostagem-residuos",
    shortLabel: "Resíduos e renda",
    title: "Compostagem, resíduos, reciclagem e economia solidária",
    objective: "Articular manejo de resíduos, tecnologias sociais e geração de valor territorial com base comunitária.",
    description:
      "A proposta integra educação ambiental, cadeias solidárias e pilotos de compostagem e reciclagem para reduzir passivos locais, apoiar iniciativas de trabalho coletivo e consolidar práticas replicáveis de gestão territorial dos resíduos.",
    deliveries: [
      "Pilotos de compostagem e circuitos de reciclagem comunitária",
      "Kits metodológicos para formação e mobilização local",
      "Mapeamento de fluxos, atores e oportunidades de economia solidária"
    ],
    impact: [
      "Redução de descarte inadequado e fortalecimento de práticas sustentáveis",
      "Apoio a redes locais de trabalho, renda e cuidado",
      "Evidências para políticas públicas territorializadas de resíduos"
    ],
    accent: "seed"
  },
  {
    id: "memoria-cultura",
    shortLabel: "Memória e incidência",
    title: "Memória, cultura, educação e incidência pública",
    objective: "Produzir acervo vivo, repertório educativo e narrativa pública sobre território, trabalho, ambiente e direitos.",
    description:
      "A frente reúne documentação, práticas pedagógicas, memória social e comunicação pública para sustentar uma agenda de incidência baseada em conhecimento partilhado, registro do vivido e circulação pública de repertórios territoriais.",
    deliveries: [
      "Acervo digital e linhas narrativas integradas ao SEMEAR",
      "Materiais pedagógicos, oficinas e ciclos públicos de formação",
      "Dossiês, mostras, campanhas e ações de incidência institucional"
    ],
    impact: [
      "Preservação de memória territorial e ambiental",
      "Expansão da capacidade formativa do programa",
      "Maior presença pública das pautas do território"
    ],
    accent: "warm"
  }
];

export const governanceActors: GovernanceActor[] = [
  {
    name: "Universidade Federal Fluminense",
    badge: "UFF",
    role: "Coordenação acadêmica e científica",
    summary:
      "Responsável pela coordenação geral, integração entre ensino, pesquisa e extensão, desenho metodológico, produção científica e supervisão institucional do programa.",
    highlights: ["Coordena o programa", "Integra pesquisa, extensão e formação", "Garante consistência metodológica"],
    accent: "brand"
  },
  {
    name: "Fundação Euclides da Cunha",
    badge: "FEC",
    role: "Gestão administrativa, financeira e contratual",
    summary:
      "Responsável pela gestão administrativa, financeira e contratual do programa, assegurando a execução formal, os fluxos operacionais e a viabilidade institucional das entregas previstas.",
    highlights: ["Conduz a gestão administrativa", "Organiza a execução financeira", "Sustenta a gestão contratual"],
    accent: "lab"
  },
  {
    name: "Associação Popular pela Sustentabilidade",
    badge: "APS",
    role: "Coexecução territorial e comunitária",
    summary:
      "Atua como coexecutora territorial e comunitária do programa, com presença institucional própria na mobilização local, na formação popular, na articulação de parceiros e na implementação concreta das frentes de ação no território.",
    highlights: [
      "Conduz mobilização territorial e comunitária",
      "Articula escolas, lideranças, coletivos e equipamentos públicos",
      "Apoia a implementação dos pilotos e a devolutiva pública"
    ],
    emphasis: [
      "Educação ambiental popular",
      "Coordenação executiva da frente de memória, cultura e incidência socioambiental",
      "Presença permanente na relação entre programa e território"
    ],
    accent: "seed"
  }
];

export const expansionBlocks = [
  {
    title: "Bom uso do recurso público",
    body:
      "A proposta evita duplicação de estrutura e investe na expansão de uma base já em construção. Isso reduz custo de implantação, acelera entregas e melhora a relação entre investimento e resultado público."
  },
  {
    title: "Capacidade de escala regional",
    body:
      "A experiência CESCOLA e a arquitetura do SEMEAR entram como repertório já testado, agora ampliado para escala regional com integração de dados públicos, memória digital e pilotos territorializados."
  }
];

export const timelinePhases: TimelinePhase[] = [
  {
    phase: "Fase 1",
    period: "Meses 1 a 6",
    title: "Implantação, pactuação e linha de base",
    description:
      "Estruturação da governança, detalhamento dos planos de ação, instalação dos fluxos operacionais e consolidação da linha de base territorial e informacional.",
    deliverables: ["Plano executivo integrado", "Mapa inicial de parceiros e territórios", "Primeira versão dos painéis e protocolos"]
  },
  {
    phase: "Fase 2",
    period: "Meses 7 a 12",
    title: "Pilotos territoriais e integração de dados",
    description:
      "Ativação dos pilotos de monitoramento, resíduos e memória, com integração dos primeiros conjuntos de dados e devolutivas públicas recorrentes.",
    deliverables: ["Pilotos em operação", "Boletins públicos iniciais", "Oficinas e formações comunitárias"]
  },
  {
    phase: "Fase 3",
    period: "Meses 13 a 18",
    title: "Escala, circulação pública e avaliação intermediária",
    description:
      "Ampliação dos recortes territoriais, fortalecimento das redes parceiras, abertura de novos conteúdos públicos e avaliação dos ajustes necessários para escala.",
    deliverables: ["Novos territórios incorporados", "Relatórios e dossiês temáticos", "Avaliação intermediária com recomendações"]
  },
  {
    phase: "Fase 4",
    period: "Meses 19 a 24",
    title: "Consolidação, legado e replicação",
    description:
      "Sistematização metodológica, consolidação do acervo, entrega dos produtos finais e desenho de replicação dos pilotos para continuidade institucional e territorial.",
    deliverables: ["Kit metodológico replicável", "Acervo final consolidado", "Plano de continuidade e expansão"]
  }
];

export const budgetSlices: BudgetSlice[] = [
  {
    label: "Infraestrutura territorial e operação de campo",
    share: 28,
    amountLabel: "R$ 420 mil",
    summary: "Equipamentos, apoio de campo, logística, monitoramento e ativação territorial."
  },
  {
    label: "Plataforma, dados e expansão da base SEMEAR",
    share: 18,
    amountLabel: "R$ 270 mil",
    summary: "Expansão da base existente, integração de dados, painéis, acervo e manutenção evolutiva."
  },
  {
    label: "Bolsas, pesquisa e extensão",
    share: 22,
    amountLabel: "R$ 330 mil",
    summary: "Equipe acadêmica, formação, pesquisa aplicada e acompanhamento extensionista."
  },
  {
    label: "Educação, cultura e memória pública",
    share: 12,
    amountLabel: "R$ 180 mil",
    summary: "Materiais pedagógicos, oficinas, ações de memória e circulação pública."
  },
  {
    label: "Compostagem, reciclagem e economia solidária",
    share: 10,
    amountLabel: "R$ 150 mil",
    summary: "Pilotos, tecnologias sociais, articulação produtiva e formação local."
  },
  {
    label: "Gestão, comunicação e avaliação",
    share: 10,
    amountLabel: "R$ 150 mil",
    summary: "Coordenação executiva, comunicação institucional, transparência e avaliação."
  }
];

export const publicLegacyItems = [
  {
    title: "Metodologia integrada",
    body: "Um modelo replicável que cruza dados públicos, monitoramento comunitário, formação e memória territorial em uma mesma arquitetura de ação."
  },
  {
    title: "Rede territorial ativa",
    body: "Capacidade instalada de trabalho cooperativo entre universidade, fundação, associação e parceiros comunitários."
  },
  {
    title: "Acervo e inteligência pública",
    body: "Documentação, repertório pedagógico, relatórios e evidências territoriais organizados em ambiente digital público e durável."
  },
  {
    title: "Pilotos replicáveis",
    body: "Experiências territorializadas com potencial de adaptação para novos bairros, municípios e agendas públicas."
  }
];
