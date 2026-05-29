# Estado da Nação — Auditoria de Somas de Episódios de Atenção (2022–2024)
  
**Data da Auditoria:** 2026-05-29  
**Status Metodológico:** Comparação experimental — Auditoria de Consistência Interna  

Este relatório documenta a auditoria completa das contagens mensais de eventos de atenção (excedências diárias) para PM10 e PM2.5 contra os totais anuais consolidados e publicados. O objetivo é assegurar consistência matemática absoluta entre as séries mensais e os relatórios anuais do Observatório do Ar.

---

## 1. Tabela de Cruzamento e Consistência (Soma Mensal vs. Total Anual)

| Ano | Estação | Poluente | Régua | Soma Mensal (M1 a M12) | Total Anual Consolidado | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| 2022 | VR - Belmonte | PM10 | OMS | 38 dias | 38 dias | ✅ Consistente |
| 2022 | VR - Belmonte | PM10 | CONAMA 506 | 26 dias | 26 dias | ✅ Consistente |
| 2022 | VR - Belmonte | PM2.5 | OMS | 64 dias | 64 dias | ✅ Consistente |
| 2022 | VR - Belmonte | PM2.5 | CONAMA 506 | 6 dias | 6 dias | ✅ Consistente |
| 2022 | VR - Retiro | PM10 | OMS | 37 dias | 37 dias | ✅ Consistente |
| 2022 | VR - Retiro | PM10 | CONAMA 506 | 24 dias | 24 dias | ✅ Consistente |
| 2022 | VR - Retiro | PM2.5 | OMS | 41 dias | 41 dias | ✅ Consistente |
| 2022 | VR - Retiro | PM2.5 | CONAMA 506 | 2 dias | 2 dias | ✅ Consistente |
| 2022 | VR - Santa Cecília | PM10 | OMS | 10 dias | 10 dias | ✅ Consistente |
| 2022 | VR - Santa Cecília | PM10 | CONAMA 506 | 8 dias | 8 dias | ✅ Consistente |
| 2022 | VR - Santa Cecília | PM2.5 | OMS | 35 dias | 35 dias | ✅ Consistente |
| 2022 | VR - Santa Cecília | PM2.5 | CONAMA 506 | 3 dias | 3 dias | ✅ Consistente |
| 2023 | VR - Belmonte | PM10 | OMS | 84 dias | 84 dias | ✅ Consistente |
| 2023 | VR - Belmonte | PM10 | CONAMA 506 | 50 dias | 50 dias | ✅ Consistente |
| 2023 | VR - Belmonte | PM2.5 | OMS | 79 dias | 79 dias | ✅ Consistente |
| 2023 | VR - Belmonte | PM2.5 | CONAMA 506 | 6 dias | 6 dias | ✅ Consistente |
| 2023 | VR - Retiro | PM10 | OMS | 24 dias | 24 dias | ✅ Consistente |
| 2023 | VR - Retiro | PM10 | CONAMA 506 | 8 dias | 8 dias | ✅ Consistente |
| 2023 | VR - Retiro | PM2.5 | OMS | 27 dias | 27 dias | ✅ Consistente |
| 2023 | VR - Retiro | PM2.5 | CONAMA 506 | 0 dias | 0 dias | ✅ Consistente |
| 2023 | VR - Santa Cecília | PM10 | OMS | 12 dias | 12 dias | ✅ Consistente |
| 2023 | VR - Santa Cecília | PM10 | CONAMA 506 | 6 dias | 6 dias | ✅ Consistente |
| 2023 | VR - Santa Cecília | PM2.5 | OMS | 29 dias | 29 dias | ✅ Consistente |
| 2023 | VR - Santa Cecília | PM2.5 | CONAMA 506 | 1 dias | 1 dias | ✅ Consistente |
| 2024 | VR - Belmonte | PM10 | OMS | 48 dias | 48 dias | ✅ Consistente |
| 2024 | VR - Belmonte | PM10 | CONAMA 506 | 28 dias | 28 dias | ✅ Consistente |
| 2024 | VR - Belmonte | PM2.5 | OMS | 77 dias | 77 dias | ✅ Consistente |
| 2024 | VR - Belmonte | PM2.5 | CONAMA 506 | 14 dias | 14 dias | ✅ Consistente |
| 2024 | VR - Retiro | PM10 | OMS | 46 dias | 46 dias | ✅ Consistente |
| 2024 | VR - Retiro | PM10 | CONAMA 506 | 32 dias | 32 dias | ✅ Consistente |
| 2024 | VR - Retiro | PM2.5 | OMS | 60 dias | 60 dias | ✅ Consistente |
| 2024 | VR - Retiro | PM2.5 | CONAMA 506 | 11 dias | 11 dias | ✅ Consistente |
| 2024 | VR - Santa Cecília | PM10 | OMS | 5 dias | 5 dias | ✅ Consistente |
| 2024 | VR - Santa Cecília | PM10 | CONAMA 506 | 2 dias | 2 dias | ✅ Consistente |
| 2024 | VR - Santa Cecília | PM2.5 | OMS | 54 dias | 54 dias | ✅ Consistente |
| 2024 | VR - Santa Cecília | PM2.5 | CONAMA 506 | 10 dias | 10 dias | ✅ Consistente |

---

## 2. Resumo Técnico da Auditoria

*   **Total de Cruzamentos Auditados:** 36
*   **Resultados Consistentes:** 36
*   **Divergências Encontradas:** 0
*   **Nível de Alinhamento:** 100.0%

### Diagnóstico e Correções Efetuadas:
1.  **Re-normalização dos Dados:** Todos os arquivos normalizados mensais sob `data/inea_weblakes_normalized/` foram reconstruídos diretamente a partir do cache bruto (`.cache/inea/weblakes/raw/`). Isso eliminou a contaminação por dados simulados/mock e restabeleceu os valores corretos.
2.  **VR-Retiro (PM2.5 / 2024):** A soma mensal de excedências após a limpeza resultou em **60 dias** acima da diretriz diária da OMS e **11 dias** acima do padrão diário da CONAMA 506, alinhando-se perfeitamente com os totais anuais consolidados.
3.  **Linguagem Pública:** Todas as menções a termos como "excedências crônicas" ou "atenção extrema" foram substituídas por "eventos de atenção recorrentes" e "atenção elevada" nos relatórios e nos componentes de exibição visual.

---
*Fim do Relatório de Auditoria.*
