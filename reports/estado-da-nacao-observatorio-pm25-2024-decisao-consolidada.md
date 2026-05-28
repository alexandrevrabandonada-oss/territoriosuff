# Estado da Nação — Decisão Técnica de Publicação PM2.5 2024

**Poluente:** PM2.5 (Material Particulado Fino)  
**Ano de Referência:** 2024  
**Data da Decisão:** 2026-05-28  
**Status Metodológico:** Validação com 100% de conformidade técnica para liberação  

---

## 1. Avaliação de Critérios de Cobertura e Suficiência

De acordo com as diretrizes metodológicas do Observatório do Ar, a liberação pública de uma camada de dados anuais de qualidade do ar exige:
1.  **Suficiência Anual:** Cobertura geral de leituras horárias $\ge 75\%$.
2.  **Suficiência Diária:** Médias de 24h calculadas apenas para dias com $\ge 18\text{ horas}$ válidas ($75\%$ do dia).
3.  **Auditoria de Cache:** Ausência de erros estruturais, quebras de índice ou contaminação de sessão no cache local.

### Diagnóstico das Estações:

*   **VR - Belmonte (ID: 69):** Cobertura de **95.64%** — **APROVADO**
*   **VR - Retiro (ID: 70):** Cobertura de **99.67%** — **APROVADO**
*   **VR - Santa Cecília (ID: 71):** Cobertura de **98.39%** — **APROVADO**

---

## 2. Decisão e Enquadramento Editorial

Fica autorizada a inclusão da camada **PM2.5 (Material Particulado Fino) para o ano de 2024** como a segunda camada de dados horários pública validada experimentalmente no Observatório do Ar.

### Salvaguardas Mandatórias de Divulgação:
1.  **Selo Metodológico:** A exibição na interface e nos materiais de comunicação deve portar obrigatoriamente a inscrição:  
    *"Dado horário público WebLakes — comparação experimental — sem QA/QC oficial explícito"*
2.  **Sem Falsos Positivos de Limpeza:** Deve ser frisado de forma explícita que "ausência de dado não representa ar de boa qualidade".
3.  **Linguagem de Atenção:** As violações de limites diários e anuais devem ser denominadas como "eventos de atenção" ou "dias acima do padrão", evitando-se acusações diretas de infração legal por ausência de QA/QC oficial de origem.

---

## 3. Resumo dos Indicadores Consolidados para o Frontend

| Estação | Cobertura | Média Anual | Pico Máximo | Dias > OMS (>15) | Dias > CONAMA (>25) | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **VR - Belmonte** | 95.6% | 11.33 µg/m³ | 84.19 µg/m³ | 77 dias | 14 dias | Liberado |
| **VR - Retiro** | 99.7% | 9.34 µg/m³ | 208.58 µg/m³ | 60 dias | 11 dias | Liberado |
| **VR - Santa Cecília** | 98.4% | 8.88 µg/m³ | 132.25 µg/m³ | 54 dias | 10 dias | Liberado |
