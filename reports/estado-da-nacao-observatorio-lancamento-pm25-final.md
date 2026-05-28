# Estado da Nação — Correção Editorial e Lançamento do Observatório do Ar PM2.5/2024

**Poluente:** PM2.5 (Material Particulado Fino)  
**Ano de Referência:** 2024  
**Data do Relatório Final:** 2026-05-28T21:30:00Z  
**Nível de Confiança:** Médio (Dados Públicos com Cautela Didática e Terminologia Precisa)  
**Selo Metodológico:** Dado horário público WebLakes — comparação experimental — sem QA/QC oficial explícito

---

## 1. Síntese do Lançamento Final

Este relatório consolida a entrega final do pacote de materiais públicos de lançamento da segunda camada consolidada de 2024 do Observatório do Ar — focada em PM2.5. Todas as salvaguardas regulatórias e metodológicas foram blindadas, com os termos adaptados às diretrizes estritas do conselho técnico do SEMEAR.

Os materiais revisados e prontos para publicação são:
1.  **Post para Instagram e WhatsApp:** ([post-instagram-observatorio-pm25-2024.md](file:///C:/Projetos/SEMEAR%20PWA/reports/post-instagram-observatorio-pm25-2024.md)).
2.  **Thread para X/Bluesky:** ([thread-observatorio-pm25-2024.md](file:///C:/Projetos/SEMEAR%20PWA/reports/thread-observatorio-pm25-2024.md)).
3.  **Release Curto para Imprensa:** ([release-observatorio-pm25-2024.md](file:///C:/Projetos/SEMEAR%20PWA/reports/release-observatorio-pm25-2024.md)).
4.  **Roteiro de Carrossel:** ([carrossel-observatorio-pm25-2024.md](file:///C:/Projetos/SEMEAR%20PWA/reports/carrossel-observatorio-pm25-2024.md)).

---

## 2. Adequações Vocabulares Obrigatórias Realizadas

Para manter o rigor e a precisão do SEMEAR, realizamos as seguintes substituições em todo o escopo de divulgação de PM2.5:

*   **Substituição 1: Impacto Urbano ➡️ Comparativo Direto**
    *   *Antes:* "menor impacto urbano"
    *   *Depois:* `"menor média anual registrada entre as três estações analisadas"`
    *   *Aplicação:* Aplicado nas notas de exposição de Santa Cecília (no post do Instagram, na thread e no roteiro do carrossel).
*   **Substituição 2: Escopo do Atlas Visual ➡️ Mapa Focado**
    *   *Antes:* "mapa interativo de dispersão mensal"
    *   *Depois:* `"mapa interativo por estação e período"`
    *   *Aplicação:* Aplicado nos convites de navegação e CTAs de rodapé de posts, thread e do release de imprensa.
*   **Substituição 3: Qualidade do Ar Afetada ➡️ Frequência de Alertas**
    *   *Antes:* "qualidade do ar afetada perante a legislação federal"
    *   *Depois:* `"maior número de dias acima da régua diária da CONAMA 506 nesta comparação experimental"`
    *   *Aplicação:* Aplicado no perfil descritivo dos alertas de Belmonte no post do Instagram, na thread, no release de imprensa e no carrossel.
*   **Substituição 4: Origem Governamental ➡️ Especificação Técnica**
    *   *Antes:* "a partir de dados da rede oficial"
    *   *Depois:* `"a partir de dados horários públicos exibidos pela plataforma INEA/WebLakes"`
    *   *Aplicação:* Aplicado na introdução da thread de redes sociais para especificar claramente a origem dos registros secundários.

---

## 3. Dataset Auditado de Referência (PM2.5 2024)

| Estação (ID) | Cobertura Anual (%) | Média Anual (µg/m³) | Excedências OMS (>15 µg/m³) | Excedências CONAMA 506 (>25 µg/m³) | Status de Lançamento |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **VR-Belmonte (69)** | 95.64% | 11.33 | 77 dias | 14 dias | **Publicado (Experimental)** |
| **VR-Retiro (70)** | 99.67% | 9.34 | 60 dias | 11 dias | **Publicado (Experimental)** |
| **VR-Santa Cecília (71)** | 98.39% | 8.88 | 54 dias | 10 dias | **Publicado (Experimental)** |
| **VR-Meteorológica (72)** | 0.00% (PM2.5) | N/A | 0 dias | 0 dias | **Visualização Meteorológica** |

---

## 4. Resultados de Verificação e QA

1.  **Linter de Termos de Freshness (`npm run inea:qa:language`):** **PASS**
    *   Validação com 100% de conformidade. Não há qualquer ocorrência de indução a leituras instantâneas ou monitoramento minuto a minuto.
2.  **Pipeline de Compilação do Projeto (`npm run verify`):** **PASS**
    *   eslint, typecheck e build executados de forma totalmente limpa e livre de erros.
