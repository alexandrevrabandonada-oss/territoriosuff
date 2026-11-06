import type { LiveTransparencyMonthlyReport } from "../lib/api";

export const LIVE_TRANSPARENCIA_REPORTS: LiveTransparencyMonthlyReport[] = [
  {
    id: "2026-09", month_key: "2026-09", month_label: "setembro de 2026",
    source_url: null, source_label: "Síntese do relatório mensal SEMEAR Territórios", exported_at: "2026-11-06",
    actions_count: 4, hearings_count: 18, individual_hearings_count: 12, group_reports_count: 6,
    territorial_coverage_pct: 100, territorial_status: "adequada",
    source_note: "As 12 escutas individuais têm território de referência preenchido; os 6 relatos de roda são contabilizados separadamente. A cobertura não significa representatividade dos bairros.",
    executive_summary: "O relatório registra 4 ações e 18 registros: 12 escutas individuais e 6 relatos de roda. Os temas mais frequentes incluem ar e poluição, empresas, pó e sujeira.",
    methodological_alert: "As 12 escutas individuais têm território de referência informado. Essa cobertura se refere a apenas 12 registros e não permite generalizar para a população ou para cada bairro.",
    operational_recommendation: "Manter o preenchimento do território e preparar devolutiva agregada sobre ar e poluição.",
    dominant_themes: ["Ar e poluição", "Empresas", "Pó e sujeira", "Poder público", "Saúde"],
    action_territories: ["Jardim Padre Josimo Tavares", "Vila Rica", "Vila Santa Cecília"],
    hearing_territories: ["Vila Santa Cecília", "Aterrado", "Conforto", "Vila Rica"],
    grouped_priorities: [{ label: "Outros", count: 11 }, { label: "Água e rio", count: 7 }, { label: "Empresas e CSN", count: 7 }, { label: "Limpeza urbana e coleta", count: 6 }, { label: "Ar, poluição e pó", count: 4 }, { label: "Fiscalização e poder público", count: 4 }, { label: "Saúde e qualidade de vida", count: 3 }, { label: "Arborização e sombra", count: 1 }, { label: "Educação ambiental", count: 1 }],
    qualitative_signals: [{ label: "Cuidado coletivo", count: 5 }, { label: "Fiscalização", count: 2 }, { label: "Rio e escória", count: 1 }],
    recommended_next_steps: ["Manter o preenchimento do território de referência nas próximas ações.", "Preparar devolutiva agregada sobre ar e poluição.", "Aprofundar as prioridades agrupadas em outros no planejamento."],
    actions_performed: ["01/09/2026 | Roda de conversa no CRAS Padre Josimo | Jardim Padre Josimo Tavares", "11/09/2026 | Roda de conversa no CRAS Santa Rita de Cássia | Território da ação não informado", "17/09/2026 | Congresso UFF — banca de escuta | Vila Santa Cecília", "29/09/2026 | Oficina na igreja | Vila Rica"],
    review_pending: "O relatório não registra pendências de revisão.", status: "published", created_at: "2026-11-06T00:00:00Z", updated_at: "2026-11-06T00:00:00Z"
  },
  {
    id: "2026-08", month_key: "2026-08", month_label: "agosto de 2026",
    source_url: null, source_label: "Síntese do relatório mensal SEMEAR Territórios", exported_at: "2026-11-06",
    actions_count: 3, hearings_count: 11, individual_hearings_count: 0, group_reports_count: 11,
    territorial_coverage_pct: 0, territorial_status: "critica",
    source_note: "Foram registrados 11 relatos de roda e nenhuma escuta individual. Sem escutas individuais, a cobertura territorial dessas escutas não é calculável. O relatório menciona 4 ações no trecho sobre rodas, mas lista 3 ações no total; a diferença requer conferência.",
    executive_summary: "O relatório registra 3 ações e 11 relatos de roda, sem escutas individuais. Os temas mais frequentes incluem ar e poluição, empresas, saúde e água.",
    methodological_alert: "Não houve escutas individuais no recorte; não é possível calcular sua cobertura territorial nem fazer conclusões por bairro a partir desse indicador.",
    operational_recommendation: "Conferir a divergência entre o total de ações e o trecho sobre rodas; registrar território de referência quando houver escutas individuais.",
    dominant_themes: ["Ar e poluição", "Empresas", "Saúde", "Água e rio", "Abandono"],
    action_territories: ["Açude", "Candelária", "Siderlândia"], hearing_territories: [],
    grouped_priorities: [{ label: "Saúde e qualidade de vida", count: 5 }, { label: "Água e rio", count: 3 }, { label: "Arborização e sombra", count: 3 }, { label: "Outros", count: 3 }, { label: "Ar, poluição e pó", count: 2 }, { label: "Educação ambiental", count: 2 }, { label: "Fiscalização e poder público", count: 2 }, { label: "Empresas e CSN", count: 1 }, { label: "Limpeza urbana e coleta", count: 1 }],
    qualitative_signals: [{ label: "Cuidado coletivo", count: 7 }, { label: "Percepção sobre poluição", count: 1 }],
    recommended_next_steps: ["Conferir o número de ações relatadas nas rodas.", "Preparar devolutiva agregada sobre ar e poluição.", "Aprofundar as prioridades de saúde e qualidade de vida."],
    actions_performed: ["07/08/2026 | Roda de conversa histórica | Açude", "15/08/2026 | Escuta com alunos do pré-vestibular | Candelária", "20/08/2026 | Atividade no CRAS | Siderlândia"],
    review_pending: "O relatório não registra pendências de revisão; há divergência de contagem de ações a conferir.", status: "published", created_at: "2026-11-06T00:00:00Z", updated_at: "2026-11-06T00:00:00Z"
  },
  {
    id: "2026-07", month_key: "2026-07", month_label: "julho de 2026",
    source_url: null, source_label: "Síntese do relatório mensal SEMEAR Territórios", exported_at: "2026-11-06",
    actions_count: 5, hearings_count: 8, individual_hearings_count: 1, group_reports_count: 7,
    territorial_coverage_pct: 100, territorial_status: "adequada",
    source_note: "A cobertura de 100% corresponde a uma única escuta individual (1 de 1), sem representatividade territorial. A ação de 03/07 no CRAS Monte Castelo aparece duas vezes na lista original; não é possível afirmar se são dois eventos distintos.",
    executive_summary: "O relatório registra 5 ações e 8 registros: 1 escuta individual e 7 relatos de roda. Ar e poluição, lixo e pó aparecem entre os temas mais recorrentes.",
    methodological_alert: "A única escuta individual tem território de referência informado; esse resultado não sustenta conclusões gerais por bairro. Uma ação aparece duplicada na lista do relatório.",
    operational_recommendation: "Conferir o registro duplicado e manter o preenchimento do território nas próximas ações.",
    dominant_themes: ["Ar e poluição", "Lixo e resíduos", "Pó e sujeira", "Poder público", "Água e rio"],
    action_territories: ["Monte Castelo", "Rústico", "Vila Rica"], hearing_territories: ["Rústico"],
    grouped_priorities: [{ label: "Fiscalização e poder público", count: 6 }, { label: "Limpeza urbana e coleta", count: 5 }, { label: "Outros", count: 5 }, { label: "Água e rio", count: 3 }, { label: "Ar, poluição e pó", count: 1 }, { label: "Arborização e sombra", count: 1 }, { label: "Educação ambiental", count: 1 }],
    qualitative_signals: [{ label: "Cuidado coletivo", count: 4 }, { label: "Fiscalização", count: 3 }, { label: "Percepção sobre poluição", count: 1 }],
    recommended_next_steps: ["Conferir a repetição da ação no CRAS Monte Castelo.", "Preparar devolutiva agregada sobre ar e poluição.", "Aprofundar prioridades de fiscalização e poder público."],
    actions_performed: ["03/07/2026 | Roda no CRAS Monte Castelo | Monte Castelo (consta duas vezes no relatório)", "09/07/2026 | Oficina | Rústico", "14/07/2026 | Roda de conversa com grupo de idosos | Vila Rica", "21/07/2026 | Roda de escuta no Padre Jósimo | Território da ação não informado"],
    review_pending: "O relatório não registra pendências de revisão; a repetição de uma ação requer conferência.", status: "published", created_at: "2026-11-06T00:00:00Z", updated_at: "2026-11-06T00:00:00Z"
  },
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
