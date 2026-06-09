# Estado da Nação — Monitoramento de Queimadas e Qualidade do Ar
**Observatório do Ar SEMEAR · Volta Redonda**

Este relatório descreve o mapeamento e a metodologia de integração de focos de queimadas ao Observatório do Ar. O objetivo é isolar a fumaça de queimadas florestais e agropastoris locais/regionais dos picos de poluição originados exclusivamente por fontes fixas industriais e pelo tráfego veicular de Volta Redonda.

---

## 1. Mapeamento da Fonte: Banco de Dados de Queimadas (INPE)

A base utilizada é o **Banco de Dados de Queimadas (BDQueimadas)** do **Instituto Nacional de Pesquisas Espaciais (INPE)**, com dados obtidos via satélite de referência (como o satélite Aqua):

*   **Granularidade:** Diária. Fornece coordenadas geográficas exatas (latitude/longitude), satélite sensor, data/hora do registro e potência radiativa do fogo (FRP - *Fire Radiative Power*).
*   **Abrangência:** Histórica e tempo quase-real (com atraso de processamento de poucas horas).

---

## 2. Metodologia de buffers de proximidade

Para analisar a influência de queimadas sobre Volta Redonda, os focos de calor serão agrupados em anéis concêntricos (buffers de proximidade) a partir do marco zero central do município (Coordenadas de referência: `-22.5120`, `-44.1030`):

1.  **Buffer de 25 km (Local):**
    *   **Área Coberta:** Volta Redonda, Barra Mansa, Pinheiral e partes de Barra do Piraí e Porto Real.
    *   **Peso Metodológico:** Influência direta e imediata. Queimadas urbanas em lotes vagos ou encostas adjacentes causam picos abruptos locais de PM10 e PM2.5 nas estações de monitoramento.
2.  **Buffer de 50 km (Regional I):**
    *   **Área Coberta:** Sul Fluminense e divisa com o Sul de Minas e Vale do Paraíba Paulista.
    *   **Peso Metodológico:** Transporte a curto prazo (12 a 24 horas) dependente de padrões de vento e relevo do vale.
3.  **Buffer de 100 km (Regional II - Macro):**
    *   **Área Coberta:** Região Metropolitana do Rio, Vale do Paraíba completo e Serra da Mantiqueira.
    *   **Peso Metodológico:** Transporte de plumas de fumaça de larga escala durante eventos de seca severa.

---

## 3. Arquitetura de correlação temporal para particulados

A fumaça da queima de biomassa é majoritariamente composta por partículas finas (PM2.5), embora também carregue particulados grossos (PM10). A correlação temporal integrará:

*   **Índice de Incêndios Mensal:** Contagem total de focos de calor ativos nos três buffers ao longo do ano.
*   **Eventos Extremos Simultâneos:** Alertas gerados na interface quando um pico diário de PM2.5 coincide com múltiplos focos de calor ativos no buffer de 25 km nas últimas 48 horas.
*   **Fator Climatológico (Umidade e Vento):** Cruzamento com dados de vento para verificar se a direção da pluma de fumaça detectada pelo satélite sopra na direção de Volta Redonda, justificando o nexo físico do aumento de PM2.5.
