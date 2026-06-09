# Estado da Nação — Matriz Consolidada de Dados Complementares
**Observatório do Ar SEMEAR · Volta Redonda**

Este documento apresenta a matriz final consolidadora para a integração de dados complementares ao Observatório do Ar. O objetivo é ordenar a viabilidade técnica e priorização estratégica das novas fontes ambientais, meteorológicas, de saúde pública e socioeconômicas, embasando a evolução da plataforma para um Atlas de Justiça Ambiental de Volta Redonda.

Para análises detalhadas de cada dimensão temática, consulte os relatórios técnicos específicos:
1.  **Meteorologia:** [estado-da-nacao-observatorio-meteorologia-disponibilidade.md](file:///C:/Projetos/SEMEAR%20PWA/reports/estado-da-nacao-observatorio-meteorologia-disponibilidade.md)
2.  **Saúde Pública:** [estado-da-nacao-observatorio-saude-ar-disponibilidade.md](file:///C:/Projetos/SEMEAR%20PWA/reports/estado-da-nacao-observatorio-saude-ar-disponibilidade.md)
3.  **Monitoramento de Queimadas:** [estado-da-nacao-observatorio-queimadas-contexto.md](file:///C:/Projetos/SEMEAR%20PWA/reports/estado-da-nacao-observatorio-queimadas-contexto.md)
4.  **Vulnerabilidade Territorial:** [estado-da-nacao-observatorio-vulnerabilidade-territorial.md](file:///C:/Projetos/SEMEAR%20PWA/reports/estado-da-nacao-observatorio-vulnerabilidade-territorial.md)
5.  **Uso do Solo e Recursos Hídricos:** [estado-da-nacao-observatorio-agua-territorio.md](file:///C:/Projetos/SEMEAR%20PWA/reports/estado-da-nacao-observatorio-agua-territorio.md)
6.  **Demandas de Informação Pública:** [pedidos-lai-inea-governanca-observatorio.md](file:///C:/Projetos/SEMEAR%20PWA/reports/pedidos-lai-inea-governanca-observatorio.md)

---

## 1. Matriz Consolidada de Dados Complementares

| Dimensão | Fonte | Dado Principal | Período Disponível | Granularidade | Dificuldade de Acesso | Valor Público | Risco Metodológico | Prioridade |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :--- | :---: |
| **Meteorologia** | INMET / BDMEP | Vento (vel/dir), chuva, temp, UR, radiação | 2013 - 2026 | Horária | **Baixa** (API Pública) | **Altíssimo** (Rosa dos ventos / Dispersão) | Inconsistência local de sensores regionais. | **1. Alta** (Pilar técnico) |
| **Meteorologia** | INEA / WebLakes | Anemômetros locais das estações de VR | 2020 - 2026 | Horária | **Média** (Bases brutas / Ingestão) | **Altíssimo** (Direção real na usina) | Sensores com falhas físicas de calibração frequentes. | **2. Alta** (Pilar técnico) |
| **Saúde** | DATASUS (SIH/SUS) | Internações respiratórias e cardiovasculares | 2013 - 2026 | Mensal | **Baixa** (TabNet / CNES) | **Alto** (Vulnerabilidade) | **Altíssimo** (Confundimento de causalidade / Sazonalidade). | **3. Média** (Exige avisos rígidos) |
| **Queimadas** | INPE (BDQueimadas) | Focos de calor (lat/lon, FRP) | 2013 - 2026 | Diária | **Baixa** (Painel de dados públicos) | **Alto** (Descartar fumaça de biomassa) | Atribuição indireta de plumas de transporte aéreo. | **4. Alta** (Contextualização) |
| **Vulnerabilidade** | IBGE / Censo 2022 | População infantil, idosa e renda per capita | 2022 | Setor Censitário | **Média** (Tratamento espacial de microdados) | **Altíssimo** (Mapa de exposição de bairros) | Dado censitário estático (desatualização temporal urbana). | **5. Alta** (Pilar de Justiça Social) |
| **Recursos Hídricos** | ANA / HidroWeb | Nível do rio (cm) e vazão (m³/s) | 2013 - 2026 | Diária | **Média** (Download de arquivos estruturados) | **Médio** (Deposição em rios urbanos) | Distância física dos pontos de lixiviação industriais. | **6. Baixa** (Roadmap futuro) |
| **Uso do Solo** | MapBiomas | Cobertura urbana, asfalto, vegetação nativa | Coleções Anuais | Anual | **Média** (Processamento raster / Geotiff) | **Alto** (Ilhas de calor e barreiras verdes) | Escala macro de satélite. Exige refino para Volta Redonda. | **7. Baixa** (Roadmap futuro) |

---

## 2. Estratégia de Priorização e Próximos Passos de Ingestão

Para avançar com a transição ordenada do Observatório do Ar para o Atlas de Justiça Ambiental, o roadmap é estruturado em três fases de implementação tecnológica:

### Fase I: Correlação Física de Ventos (Prioridade Máxima)
1.  **Ingestão de Dados INMET:** Desenvolver script Node/TypeScript para consumir a API pública do INMET e carregar dados horários da estação Volta Redonda (A609).
2.  **Rosa dos Ventos Integrada:** Codificar visualização gráfica sobrepondo a velocidade/direção do vento com o mapa das estações físicas e a localização da planta industrial da CSN.

### Fase II: Mapeamento de Vulnerabilidade e Exposição Social (Prioridade Alta)
1.  **Tratamento de Dados IBGE Censo 2022:** Processar e importar a malha de setores censitários do município de Volta Redonda com dados agregados de renda e faixas etárias frágeis (crianças/idosos).
2.  **Mapa de Equipamentos Sensíveis:** Georreferenciar escolas, creches e UBS, criando a visualização de raio de impacto e áreas de maior exposição cumulativa de poluentes secundários e primários.

### Fase III: Ingestão de Focos de Calor e Contexto de Saúde (Prioridade Média)
1.  **Focos de Calor INPE:** Criar cálculo automatizado de contagem de queimadas ativas nos buffers de 25 km, 50 km e 100 km no entorno do município, gerando notificações contextuais para o usuário em dias de fumaça severa no Vale do Paraíba.
2.  **Painel de Saúde e Ar (DATASUS):** Disponibilizar a visualização pareada de internações respiratórias mensais concomitantes com a concentração mensal histórica de material particulado fino (PM2.5) e grosso (PM10), exibindo de forma indissociável as advertências de limitação de causalidade epidemiológica.
