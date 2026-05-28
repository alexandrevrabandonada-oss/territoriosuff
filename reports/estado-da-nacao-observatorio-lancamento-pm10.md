# Estado da Nação — Lançamento da Camada PM10 2024 no Observatório do Ar

**Poluente:** PM10 (Material Particulado Inalável)  
**Ano de Referência:** 2024  
**Data do Relatório:** 2026-05-28T17:00:00Z  
**Nível de Confiança:** Médio (Dados Públicos com Cautela Didática)  
**Selo Metodológico:** Dado horário público WebLakes — comparação experimental — sem QA/QC oficial explícito

---

## 1. Síntese do Lançamento

Com a homologação visual e técnica concluída no Tijolo 27, o Observatório do Ar disponibiliza a primeira camada consolidada de 2024 — focada em PM10 — sob uma robusta governança editorial e metodológica. O objetivo é divulgar esses dados com transparência científica e responsabilidade cívica, evitando interpretações alarmistas ou acusações sem provas, enquanto promovemos o direito à informação e a transparência ativa dos órgãos públicos.

O lançamento baseia-se nos seguintes materiais de comunicação independentes:
1.  **Post para Instagram:** Texto explicativo condensado sob a barreira de 2.000 caracteres, com chamada de link e hashtags específicas ([post-instagram-observatorio-pm10-2024.md](file:///C:/Projetos/SEMEAR%20PWA/reports/post-instagram-observatorio-pm10-2024.md)).
2.  **Thread para X/Bluesky:** Sequência de 6 tweets com ganchos claros e CTAs para o portal ([thread-observatorio-pm10-2024.md](file:///C:/Projetos/SEMEAR%20PWA/reports/thread-observatorio-pm10-2024.md)).
3.  **Release para Imprensa:** Texto profissional estruturado com contextualização jornalística, ressalvas ambientais e dados por estação ([release-observatorio-pm10-2024.md](file:///C:/Projetos/SEMEAR%20PWA/reports/release-observatorio-pm10-2024.md)).
4.  **Roteiro de Carrossel:** Estrutura de 6 cards detalhando o comportamento de cada estação, a cautela metodológica e o CTA final ([carrossel-observatorio-pm10-2024.md](file:///C:/Projetos/SEMEAR%20PWA/reports/carrossel-observatorio-pm10-2024.md)).
5.  **Mensagem para WhatsApp:** Chamada curta de texto para circulação rápida em grupos cidadãos (inclusa no post do Instagram).
6.  **Diretrizes de Banner Interno:** O banner de destaque promocional que direciona o tráfego da página inicial para a aba canônica do radar oficial (já integrado na home page e configurado para evitar termos de leitura instantânea ou dinâmica).

---

## 2. Dataset Oficial Publicado (PM10 2024)

As análises e materiais utilizam exclusivamente os seguintes dados horários consolidados:

*   **VR-Belmonte (69):** Média anual de **30,97 µg/m³**, **48 dias** acima do padrão OMS e **28 dias** acima da CONAMA 506/2024. Maior média do município.
*   **VR-Retiro (70):** Média anual de **29,70 µg/m³**, **46 dias** acima da OMS e **32 dias** acima da CONAMA 506/2024. Maior número de excedências legais.
*   **VR-Santa Cecília (71):** Média anual de **18,01 µg/m³**, **5 dias** acima da OMS e **2 dias** acima da CONAMA 506/2024. Menor média anual registrada entre as três estações analisadas.
*   **VR-Meteorológica Ilha das Águas Cruas (72):** Integrada como exclusivamente meteorológica/sem PM10 no mapa interativo.

---

## 3. Salvaguardas Editoriais Aplicadas

*   **Comparação Experimental:** Todo material explicita que os dados do WebLakes não possuem flag ou selo técnico de qualidade (QA/QC) oficial por registro horário do INEA, de modo que os limites são comparados de forma experimental.
*   **Sem QA/QC Explícito:** Reafirmamos a ausência de controle oficial de validação em nível horário nos canais públicos de origem.
*   **Eventos de Atenção:** Evitou-se o alarmismo de termos como "poluição crônica/aguda" ou "crise sanitária", utilizando a terminologia recomendada de "eventos de atenção em comparação experimental".
*   **Falso Conforto de Falha de Transmissão:** Todo material deixa claro que dados em branco ou falhas no sistema público não significam qualidade boa do ar.
*   **Ausência de Juízo Criminal:** O texto foca estritamente nos dados ambientais e no direito à informação pública, sem induzir julgamentos de culpa, acusações de crime ou atos ilegais.
*   **Exclusão de Terminologia de Freshness Inadequada:** Não há menção a monitoramento instantâneo ou minuto a minuto para a base do INEA, reafirmando que o portal exibe análises históricas consolidadas em lote.

---

## 4. Verificação de Integridade e QA

1.  **Validador de Termos Públicos (`npm run inea:qa:language`):** **PASS**
    *   Todos os novos arquivos de divulgação foram incluídos na varredura do linter de linguagem, passando com 100% de conformidade.
2.  **Compilação e Verificação do Projeto (`npm run verify`):** **PASS**
    *   eslint, typecheck e build executados de forma limpa com zero erros no frontend do portal.
