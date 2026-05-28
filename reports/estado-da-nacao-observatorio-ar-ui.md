# Estado da Nação — Experiência Visual do Observatório do Ar

Este relatório detalha a concepção, o design e as funcionalidades da interface do **Observatório do Ar** de Volta Redonda no Portal SEMEAR.

---

## 1. Diretrizes de Design & Identidade Visual

O Observatório do Ar foi projetado para evocar a atmosfera de um **atlas cívico e laboratório de dados públicos**, combinando estética científica premium com acessibilidade informativa.

*   **Paleta de Cores de Alta Legibilidade:** Cores contrastantes para destacar faixas de preocupação (verde para referências preservadas, laranja para atenção, vermelho para violações de limites e cinza para ausência de leitura).
*   **Motion Discreto:** Microanimações de hover nos cartões, transição fluida nas abas de seleção temporal e animação automática (Play/Pause) no scrubber do mapa.
*   **Acessibilidade e Contraste:** Rótulos explícitos com explicações didáticas em linguagem pública simplificada ("Como ler sem cair em erro").

---

## 2. Componentes de Transparência e Interação

A página principal `/qualidade-ar/inea` foi reestruturada com os seguintes componentes-chave:

### A. AirAtlasMap (`src/components/air/AirAtlasMap.tsx`)
*   **Localização Visual:** Integração de mapa interativo (Leaflet) plotando as 4 estações oficiais (Belmonte, Retiro, Santa Cecília, Ilha das Águas Cruas).
*   **Time Scrubber:** Barra deslizante mensal que permite rodar animações automáticas ao longo do ano de 2024.
*   **Comparação Lado a Lado:** Painel lateral dinâmico para comparar médias físicas, coberturas e excedências de duas estações selecionadas.

### B. YearExplorer (`src/components/air/YearExplorer.tsx`)
*   **Destaque dos Sensores:** Exibe quais sensores de poluentes estiveram ativos por estação e indica explicitamente as ausências técnicas ("Ausente / 100% de lacuna").
*   **Visão Multianual:** Suporte à visualização da base de 2024 e dos agregados históricos consolidados de 2015 e 2013-2015.
*   **Gaps e Silêncios:** Explica de forma cívica os períodos de inatividade e falhas de comunicação da rede pública.

### C. ThresholdComparisonPanel (`src/components/air/ThresholdComparisonPanel.tsx`)
*   **Cruzamento Normativo:** Permite escolher um poluente, uma estação e um ano para contrapor a média/máximo observado contra a **Diretriz de Saúde da OMS (2021)** e os **Padrões da Legislação Nacional (CONAMA 491/2018)**.
*   **Sinalização de Riscos:** Avisos claros quando a exposição anual ultrapassa os limites sugeridos de exposição crônica.

---

## 3. Segurança Vocabular e Salvaguardas Cívicas

Para evitar desinformação e assegurar a blindagem jurídica da plataforma, as seguintes salvaguardas foram implementadas no código e nas telas:

1.  **Sem Falso Otimismo:** "Ausência de dado não é ar bom" é exibido com destaque na seção de lacunas.
2.  **Caráter Experimental:** Todas as comparações e excedências calculadas sobre a base do WebLakes trazem a chancela de "comparação experimental" e "sem QA/QC oficial explícito", dado que a plataforma de origem não fornece as flags de validação técnica final.
3.  **Expurgo de Linguagem de Leitura Instantânea:** Todas as páginas foram auditadas para afastar termos induzindo a leituras instantâneas ao vivo (não representa tempo real), utilizando em seu lugar termos descritivos de dados históricos e periódicos em lote (*batch*).
