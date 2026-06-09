# Estado da Nação — Vulnerabilidade Territorial e Exposição Social
**Observatório do Ar SEMEAR · Volta Redonda**

Este relatório apresenta o mapeamento de vulnerabilidade socioeconômica e demográfica de Volta Redonda, utilizando dados do Censo Demográfico 2022 (IBGE) por setor censitário e a localização de infraestruturas sensíveis (escolas, creches, unidades de saúde). O objetivo é propor a base metodológica para a construção de um Mapa de Exposição Social cruzado com as plumas de dispersão industrial do município.

---

## 1. Demografia e Indicadores do Censo IBGE 2022

O mapeamento da vulnerabilidade no território adota recortes de alta resolução espacial por **Setor Censitário** para Volta Redonda (código municipal `3306305`). Três indicadores principais são extraídos dos microdados do Censo 2022:

### A. População de Extrema Faixa Etária (Sensibilidade Biológica)
*   **Crianças (0 a 5 anos):** Faixa etária com sistema respiratório em desenvolvimento, maior frequência respiratória por minuto e propensão a crises de asma e bronquiolite.
*   **Idosos (60 anos ou mais):** Grupo com maior incidência de comorbidades circulatórias e respiratórias crônicas.
*   **Mapeamento:** Densidade absoluta e percentual destas faixas etárias por setor censitário.

### B. Rendimento Domiciliar (Vulnerabilidade Socioeconômica)
*   **Indicador:** Percentual de domicílios particulares permanentes com rendimento nominal mensal per capita de até 1/2 salário mínimo.
*   **Justificativa:** Populações de baixa renda possuem menor capacidade de adaptação (como aquisição de purificadores de ar ou medicamentos) e maior exposição física em habitações menos vedadas à poeira sedimentável ("pó preto").

---

## 2. Georreferenciamento de Infraestrutura Sensível

Para mensurar o risco de exposição aguda, propõe-se o mapeamento das coordenadas exatas das seguintes instalações públicas e privadas em Volta Redonda:

| Categoria | Tipo de Equipamento | População Alvo | Relevância Metodológica |
| :--- | :--- | :--- | :--- |
| **Educação** | Escolas Municipais e Estaduais | Crianças e Adolescentes | Exposição continuada em horário escolar durante picos diurnos de material particulado. |
| **Educação** | Creches (Públicas e Privadas) | Crianças de 0 a 3 anos | Grupo de altíssima vulnerabilidade biológica. |
| **Saúde** | Unidades Básicas de Saúde (UBS/ESF) | Comunidade Geral / Doentes | Pontos de primeiro atendimento para crises respiratórias agudas. |
| **Saúde** | Hospitais e UPAs | Pacientes Internados | Instalações que demandam controle rigoroso de qualidade do ar interno. |

---

## 3. Matriz de Exposição Social (Cruzamento Territorial)

A integração destas camadas geográficas ao Observatório permitirá gerar um **Índice de Exposição Territorial**, composto pelo cruzamento de duas dimensões:

```
               [ GRAU DE VULNERABILIDADE SOCIAL (IBGE) ]
                      Baixa      Média      Alta
         +----------+----------+----------+----------+
         | Baixa    |   Verde  |   Verde  |  Amarelo |
  [PLUMA |          |  (Laranja|  (Laranja|  (Alerta |
 INDUSTRIAL| Média  |  Médio)  |  Médio)  |  Crítico)|
  DO AR] |          +----------+----------+----------+
         | Alta     |  Amarelo |  Laranja  | Vermelho |
         |          |  (Alerta)|  (Crítico)| (Máximo) |
         +----------+----------+----------+----------+
```

### Regras de Sobreposição (Overlay Analítico)
1.  **Vulnerabilidade Social:** Média ponderada entre a densidade de faixas etárias extremas (peso 0.6) e o percentual de baixa renda (peso 0.4).
2.  **Exposição Atmosférica:** Estimada com base na proximidade física das fontes de emissão industriais (CSN e entorno) e histórico de concentrações de PM10/PM2.5 nas estações Belmonte, Retiro e Santa Cecília.
3.  **Áreas Críticas de Priorização:** Os setores analisados nos bairros adjacentes à usina siderúrgica (como Aero Clube, Retiro, Belmonte, Vila Santa Cecília, Aterrado) indicam maior prioridade por combinar densidade de crianças/idosos com a proximidade física.

Este mapeamento subsidiará políticas públicas locais de mitigação, focando a instalação de cortinas arbóreas e monitoramento epidemiológico intensivo nas sub-regiões identificadas sob maior estresse cumulativo.
