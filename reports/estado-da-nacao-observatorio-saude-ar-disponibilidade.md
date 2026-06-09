# Estado da Nação — Saúde Pública e Qualidade do Ar
**Observatório do Ar SEMEAR · Volta Redonda**

Este relatório estabelece os parâmetros técnicos, metodológicos e éticos para integrar indicadores de saúde pública ao Observatório, mapeando o impacto da poluição atmosférica nas internações hospitalares em Volta Redonda.

---

## 1. Mapeamento de Fontes do DATASUS (SIH/SUS)

A base primária utilizada é o **Sistema de Informações Hospitalares do SUS (SIH/SUS)**, consolidada no portal **TabNet/DATASUS**. O escopo de coleta compreende Volta Redonda como município de internação e residência:

### Grupos de Doenças Alvo (Classificação Internacional de Doenças - CID-10)
1.  **Doenças do Aparelho Respiratório (Capítulo X - Códigos J00 a J99):**
    *   Foco em Asma (J45-J46), Bronquite/DPOC (J40-J44) e Infecções Respiratórias Agudas (J00-J22).
    *   **Justificativa:** Impacto imediato (curto prazo) da inalação de partículas finas (PM2.5) e gases irritantes (SO₂).
2.  **Doenças do Aparelho Circulatório (Capítulo IX - Códigos I00 a I99):**
    *   Foco em Infarto Agudo do Miocárdio (I21), Acidente Vascular Cerebral (I60-I64) e Hipertensão (I10-I15).
    *   **Justificativa:** Exposição crônica ao material particulado que atinge a corrente sanguínea, provocando processos inflamatórios e eventos cardiovasculares agudos.

### Estrutura de Recortes Disponíveis
*   **Granularidade Temporal:** Dados mensais e anuais consolidados.
*   **Faixa Etária:**
    *   Infantil (crianças de 0 a 5 anos) - maior suscetibilidade por desenvolvimento pulmonar incompleto.
    *   Idosos (a partir de 60 anos) - maior prevalência de comorbidades pré-existentes.
*   **Região:** Município de residência igual a Volta Redonda (Código IBGE: 330630).

---

## 2. Desenho do Painel “Saúde e Ar” na Interface

O painel estruturará a informação de forma integrada, permitindo visualizar a série temporal de internações de forma paralela à série de qualidade do ar (PM10/PM2.5):

*   **Gráficos Duplos de Eixo:** Exibição mensal das internações por doenças respiratórias (eixo Y1) sobrepostas à média mensal de PM10/PM2.5 (eixo Y2).
*   **Sazonalidade Coincidente:** Destaque visual para o período de inverno (junho a setembro), evidenciando se há acréscimo simultâneo nas internações e nos episódios de poluição (estiagem).
*   **Distribuição Etária:** Gráfico de pizza/rosca mostrando o percentual de internações infantis e geriátricas no total de ocorrências.

---

## 3. Diretrizes de Rigor Epidemiológico e Limitações Metodológicas

> [!WARNING]
> **Salvaguarda de Causalidade: Diretriz de Comunicação Pública**
> O portal exibirá de forma permanente e explícita um aviso metodológico afirmando que a correlação visual de séries temporais **não constitui nexo de causalidade científica direta**.

### Justificativas para a Ressalva
1.  **Fatores de Confundimento:** O aumento de doenças respiratórias no inverno é multifatorial, decorrendo do resfriamento do ar, maior permanência em ambientes fechados (transmissão de vírus como Influenza e VSR) e umidade relativa baixa, além da poluição atmosférica.
2.  **Atraso nos Efeitos (*Lag Effect*):** Os efeitos da poluição na saúde não são necessariamente imediatos. Estudos epidemiológicos apontam que o aumento de internações ocorre tipicamente entre 1 e 7 dias após um pico de emissão (*lag* de 1 a 7 dias).
3.  **Natureza Ecológica dos Dados:** Os dados do DATASUS representam estatísticas agregadas por população (estudos ecológicos), impossibilitando rastrear se uma internação específica foi causada individualmente pela poluição (falácia ecológica).

O portal se compromete a tratar os dados de saúde como **contexto indicador de vulnerabilidade** e não como prova direta de culpabilidade industrial isolada.
