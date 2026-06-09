# Estado da Nação — Exposição Social e Vulnerabilidade Territorial (v0)
**Observatório do Ar SEMEAR · Volta Redonda**

Este relatório consolida a implementação e o lançamento da primeira versão da camada de **Exposição Social e Vulnerabilidade Territorial (v0)** do Observatório do Ar de Volta Redonda. Esta iniciativa cruza indicadores demográficos de sensibilidade biológica do Censo 2022 (IBGE), infraestruturas sensíveis municipais e proximidade geográfica ao polo sidero-industrial para identificar territórios prioritários para intervenções de saúde e mitigação urbana.

---

## 1. Justificativa Cívica e Justiça Ambiental

A distribuição da poluição atmosférica urbana raramente afeta a todos de maneira idêntica. Comunidades localizadas nas proximidades imediatas de complexos industriais ou sob a influência de corredores meteorológicos de plumas sofrem uma sobrecarga física contínua. 

O cruzamento de dados censitários com o monitoramento do ar permite materializar o princípio de **justiça ambiental**, evidenciando áreas críticas de atenção pública em Volta Redonda.

---

## 2. Metodologia do Índice de Exposição Social (v0)

A fórmula desenvolvida para priorização territorial organiza-se sob duas macro-dimensões ponderadas:

### A. Vulnerabilidade Social (Censo Censitário 2022) — Peso 0.6
1.  **Sensibilidade Biológica (Peso 0.6):** Proporção de indivíduos nas faixas etárias extremas de fragilidade do sistema respiratório:
    *   **Crianças (0 a 5 anos):** Alta frequência respiratória e pulmões em desenvolvimento.
    *   **Idosos (60 anos ou mais):** Propensão a crises agudas associadas a comorbidades pré-existentes.
2.  **Proxy Socioeconômica (Peso 0.4):** Proporção de domicílios permanentes com rendimento nominal mensal per capita de até meio salário mínimo (indicando menor capacidade financeira de adaptação).

### B. Exposição Atmosférica e Geográfica — Peso 0.4
*   **Proximidade da Usina Presidente Vargas (CSN):** Distância linear até a fonte de emissão principal.
*   **Apoio Meteorológico (v1.6.1):** Alinhamento com a pluma de dispersão dos ventos no corredor predominantemente Noroeste-Sudeste.

### C. Classificação Consolidada
Os territórios são classificados em quatro faixas de priorização:
*   🟢 **Baixo:** Baixa densidade vulnerável e afastado da zona de pluma primária (ex: os setores analisados em Belmonte indicam prioridade baixa).
*   🟡 **Médio:** Média proporção de idosos ou crianças com exposição atmosférica indireta (ex: os setores analisados em Sessenta e Laranjal indicam prioridade média).
*   🟠 **Alto:** Alta vulnerabilidade demográfica ou proximidade direta aos altos-fornos (ex: os setores analisados em Vila Santa Cecília e Aterrado indicam prioridade alta).
*   🔴 **Muito Alto:** Elevada sobreposição de vulnerabilidade econômica e demográfica sob influência direta do corredor de poluição (ex: os setores analisados em Retiro, Conforto e Ponte Alta indicam prioridade muito alta).

---

## 3. Inventário do Território Mapeado

A tabela abaixo sintetiza a distribuição das sub-regiões analisadas:

| Setor Censitário | Bairro Principal | População | Score Vulnerabilidade | Zona de Exposição | Estação Próxima |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `33063050501` | Retiro (Setor A) | 3.200 | 0.302 | 🔴 **Muito Alto** | RET |
| `33063050502` | Retiro (Setor B) | 2.800 | 0.310 | 🔴 **Muito Alto** | RET |
| `33063050503` | Retiro (Setor C) | 3.500 | 0.290 | 🟠 **Alto** | RET |
| `33063050701` | Vila Santa Cecília | 2.200 | 0.240 | 🟠 **Alto** | SCE |
| `33063050801` | Aterrado (Setor A) | 3.100 | 0.210 | 🟠 **Alto** | NSG |
| `33063050901` | Conforto | 4.500 | 0.244 | 🔴 **Muito Alto** | SCE |
| `33063051001` | Ponte Alta | 3.800 | 0.256 | 🔴 **Muito Alto** | SCE |
| `33063051101` | Voldac | 2.900 | 0.252 | 🟠 **Alto** | NSG |
| `33063051601` | Santo Agostinho | 4.800 | 0.330 | 🟡 **Médio** | NSG |

---

## 4. Salvaguardas Metodológicas Obrigatórias

> [!WARNING]
> **Ressalva de Causalidade Individual:**
> O Índice de Exposição Social (v0) é uma **ferramenta de priorização territorial**. Ele **não mede risco epidemiológico individual de adoecimento nem comprova causalidade direta** entre a poluição industrial local e patologias respiratórias específicas de pacientes individuais. 

A exibição pública desse mapa serve para direcionar recursos de saúde (como reforço de inaladores e pediatria em UBS prioritárias) e ações urbanas (barreiras de vegetação nas divisas industriais).

---

## 5. Estrutura de Arquivos e Open Data

A camada de exposição social está estruturada em formato aberto e documentada para livre reprodutibilidade:
1.  **Dicionário de Dados Sociais:** [`social-data-dictionary.csv`](file:///C:/Projetos/SEMEAR%20PWA/public/data/social/social-data-dictionary.csv)
2.  **Dataset de Setores Censitários:** [`vr-vulnerabilidade-setores-2022.csv`](file:///C:/Projetos/SEMEAR%20PWA/public/data/social/vr-vulnerabilidade-setores-2022.csv)
3.  **Equipamentos Georreferenciados:** [`equipamentos-sensiveis-vr.csv`](file:///C:/Projetos/SEMEAR%20PWA/public/data/social/equipamentos-sensiveis-vr.csv)
4.  **Manifesto Social:** [`manifest.json`](file:///C:/Projetos/SEMEAR%20PWA/public/data/social/manifest.json)
