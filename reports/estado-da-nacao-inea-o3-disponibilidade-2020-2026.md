# Estado da Nação — Disponibilidade de Ozônio (O₃) (2020–2026)

Este relatório apresenta o diagnóstico de disponibilidade e cobertura de dados do Ozônio (O₃) na rede de monitoramento de Volta Redonda (INEA/WebLakes) para o período de 2020 a 2026.

---

## 1. Diagnóstico de Disponibilidade por Ano e Estação

Com base na auditoria da matriz de disponibilidade (`data/air/availability-matrix.json`) e das tentativas de coleta incremental da API, constatamos o seguinte quadro técnico:

*   **2020:** Indisponível. Sem dados públicos em Belmonte, Retiro ou Santa Cecília.
*   **2021:** Indisponível. Coleta de dados vazia para O₃ em todas as estações.
*   **2022:** Indisponível. Sem dados suficientes para cálculo da média móvel de 8h (apenas dados esparsos que não passam no critério de 6h válidas por janela).
*   **2023:** Indisponível. Cobertura de dados extremamente esparsa (leituras insuficientes).
*   **2024:** Indisponível. Cobertura de 0,0% confirmada em todas as estações de Volta Redonda (Belmonte, Retiro e Santa Cecília).
*   **2025:** Indisponível. Transmissão do sensor suspensa ou não registrada na plataforma pública.
*   **2026 (parcial):** Indisponível. Nenhuma transmissão contínua identificada.

---

## 2. Veredito e Regras de Governança

### 2.1. Regra de Publicidade
O Ozônio (O₃) exige uma média móvel de 8h (com pelo menos 6 leituras horárias válidas por janela de 8h). Devido à ausência crônica de dados transmitidos pelo INEA, o parâmetro está oficialmente **bloqueado para visualização pública em toda a série de 2020 a 2026**.

### 2.2. Exibição na Interface do Usuário (UI)
*   **Status do Parâmetro:** Apresentar como **"Indisponível no período"** no painel de governança de dados.
*   **Salvaguarda metodológica:** O portal deve alertar explicitamente o cidadão de que a ausência de dados de O₃ decorre de problemas de transmissão/infraestrutura de sensores do órgão de fiscalização e que **"a ausência de dados não representa ar de boa qualidade"**.
