import type { LiveTransparencyMonthlyReport } from "../lib/api";

export const LIVE_TRANSPARENCIA_REPORTS: LiveTransparencyMonthlyReport[] = [
  {
    id: "2026-05",
    month_key: "2026-05",
    month_label: "maio de 2026",
    source_url: "https://www.semearterritorios.online/relatorios/2026-05",
    source_label: "Relatorio mensal interpretativo",
    exported_at: "2026-06-09",
    actions_count: 5,
    hearings_count: 123,
    territorial_coverage_pct: 70.7,
    territorial_status: "atencao",
    executive_summary:
      "O mes reuniu 5 acoes e 123 escutas. Os temas dominantes foram ar/poluicao, po/sujeira, empresas, saude e qualidade de vida.",
    methodological_alert:
      "Parte das escutas nao possui territorio de referencia preenchido. As leituras por bairro devem ser interpretadas como parciais.",
    operational_recommendation:
      "Priorizar revisao das escutas sem territorio antes de consolidar sinteses territoriais e reforcar a pergunta territorial na proxima banca.",
    dominant_themes: ["ar/poluicao", "po/sujeira", "empresas", "saude", "qualidade de vida", "lixo/residuos"],
    action_territories: ["Vila Santa Cecilia", "Conforto", "Santo Agostinho", "Sessenta"],
    hearing_territories: ["Santo Agostinho", "Vila Santa Cecilia", "Sessenta", "Conforto", "Eucaliptal", "Santa Cruz"],
    grouped_priorities: [
      { label: "Outros", count: 34 },
      { label: "Ar, poluicao e po", count: 29 },
      { label: "Limpeza urbana e coleta", count: 29 },
      { label: "Empresas e CSN", count: 20 }
    ],
    qualitative_signals: [
      { label: "Cuidado coletivo", count: 14 },
      { label: "Saude e desconforto", count: 1 }
    ],
    recommended_next_steps: [
      "Revisar as escutas sem territorio de referencia antes da proxima acao.",
      "Preparar devolutiva publica sobre ar/poluicao com linguagem agregada.",
      "Aprofundar o macroeixo outros no planejamento operacional.",
      "Registrar decisao de publicacao ou arquivamento da versao publica."
    ],
    actions_performed: [
      "07/05/2026 | Banca Escuta UFF Vila | Vila Santa Cecilia",
      "08/05/2026 | Feira Conforto | Conforto",
      "14/05/2026 | Feira Santo Agostinho | Santo Agostinho",
      "27/05/2026 | Feira da Sessenta | Sessenta",
      "30/05/2026 | Escuta no Zoologico VR | Vila Santa Cecilia"
    ],
    review_pending: "Nenhuma pendencia de revisao no mes.",
    status: "published",
    created_at: "2026-06-09T00:00:00.000Z",
    updated_at: "2026-06-09T00:00:00.000Z"
  },
  {
    id: "2026-04",
    month_key: "2026-04",
    month_label: "abril de 2026",
    source_url: "https://www.semearterritorios.online/relatorios/2026-04",
    source_label: "Relatorio mensal interpretativo",
    exported_at: "2026-06-09",
    actions_count: 2,
    hearings_count: 99,
    territorial_coverage_pct: 34.3,
    territorial_status: "critica",
    executive_summary:
      "O mes reuniu 2 acoes e 99 escutas. Os temas dominantes foram ar/poluicao, poder publico, po/sujeira, saude e lixo/residuos.",
    methodological_alert:
      "A maioria das escutas nao possui territorio de referencia preenchido. Evite conclusoes fortes por bairro neste recorte.",
    operational_recommendation:
      "Priorizar revisao territorial das escutas pendentes antes de qualquer sintese por bairro e orientar a equipe para melhorar cobertura imediatamente.",
    dominant_themes: ["ar/poluicao", "poder publico", "po/sujeira", "saude", "lixo/residuos", "arvores/sombra"],
    action_territories: ["Aterrado", "Vila Santa Cecilia"],
    hearing_territories: ["Retiro", "Aterrado", "Vila Rica", "Agua Limpa", "Dom Bosco", "Minerlandia"],
    grouped_priorities: [
      { label: "Fiscalizacao e poder publico", count: 28 },
      { label: "Outros", count: 18 },
      { label: "Empresas e CSN", count: 16 },
      { label: "Limpeza urbana e coleta", count: 15 }
    ],
    qualitative_signals: [
      { label: "Percepcao sobre poluicao", count: 3 },
      { label: "Cuidado coletivo", count: 2 },
      { label: "Fiscalizacao", count: 1 }
    ],
    recommended_next_steps: [
      "Revisar as escutas sem territorio de referencia e orientar a equipe antes da proxima acao.",
      "Preparar devolutiva sobre ar/poluicao com linguagem agregada.",
      "Aprofundar o macroeixo fiscalizacao e poder publico no planejamento operacional.",
      "Registrar decisao de publicacao ou arquivamento da versao publica."
    ],
    actions_performed: [
      "18/04/2026 | Banquinha Feira Aterrado | Aterrado",
      "26/04/2026 | Feira da Vila | Vila Santa Cecilia"
    ],
    review_pending: "Nenhuma pendencia de revisao no mes.",
    status: "published",
    created_at: "2026-06-09T00:00:00.000Z",
    updated_at: "2026-06-09T00:00:00.000Z"
  }
];
