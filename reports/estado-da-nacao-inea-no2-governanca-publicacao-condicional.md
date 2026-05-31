# Estado da Nação — Governança de NO₂ e Publicação Condicional (2020–2026)

Este relatório consolida a auditoria e as recomendações de governança para o Dióxido de Nitrogênio (NO₂) no Observatório do Ar SEMEAR, analisando a viabilidade de publicação da série histórica com exclusão de anos anômalos.

---

## 1. Respostas Objetivas de Governança

### 1.1. Quais anos estão matematicamente coerentes?
Estão matematicamente coerentes os anos de **2020, 2021, 2022, 2023, 2025 e 2026 parcial**. Apenas o ano de **2024** apresenta uma anomalia severa de calibração instrumental na estação Retiro (um offset constante de aproximadamente +20 µg/m³ detectável pelo percentil 10 e pela comparação direta com as outras duas estações).

### 1.2. Quais estações têm cobertura suficiente?
*   **Belmonte (69):** Cobertura anual robusta e dados consistentes ao longo de todo o período.
*   **Santa Cecília (71):** Cobertura anual robusta e dados consistentes.
*   **Retiro (70):** Apresenta cobertura de dados horários excelente (>95% na maior parte dos anos), porém o ano de 2024 deve ser rejeitado por qualidade de dados.

### 1.3. O NO₂ de 2024 em Retiro deve ser excluído?
**SIM.** É recomendação consensual da auditoria de dados excluir integralmente o NO₂ de Retiro para o ano de 2024. A média anual registrada (35,26 µg/m³) é artificialmente alta por causa do deslocamento sistemático do zero de calibração. A manutenção destes dados no portal violaria o rigor metodológico.

### 1.4. O parâmetro NO₂ inteiro deve ficar bloqueado ou é possível publicar anos saudáveis?
**É possível e altamente recomendável publicar os anos saudáveis com exclusão explícita de 2024.**
O bloqueio total do NO₂ prejudica a transparência ambiental. A governança propõe o seguinte modelo de publicação condicional:
1.  **Exibição no Portal:** Exibir NO₂ de 2020, 2021, 2022, 2023, 2025 e 2026 parcial no painel de visualização.
2.  **Salvaguarda para 2024:** O ano de 2024 para a estação Retiro deve ser ocultado ou marcado explicitamente com um aviso de "Sem dados válidos devido a anomalias de instrumentação".
3.  **Nota Editorial:** Inserir uma nota explicativa clara em toda a interface de consulta de NO₂ detalhando o motivo da ausência pontual em 2024 Retiro.

---

## 2. Padrões Técnicos Recomendados

### 2.1. Thresholds de Comparação
*   **OMS (2021):** Limite de média diária de **25 µg/m³** (não exceder mais do que 3-4 dias por ano para manter níveis aceitáveis) e média anual de **10 µg/m³**.
*   **CONAMA 506/2018 (Final):** Média horária de **200 µg/m³** (não exceder mais do que 18 vezes por ano) e média anual de **40 µg/m³**.

### 2.2. Ações de Implementação Pós-Aprovação
*   Isolar os arquivos CSV de dados públicos de 2024 para NO₂.
*   Desenvolver o aviso de quarentena/exclusão na UI do Observatório para NO₂ 2024.
