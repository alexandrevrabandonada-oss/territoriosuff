# Estado da Nação — Publicação da Camada PM10 (2024) no Observatório do Ar

**Poluente:** PM10 (Material Particulado Inalável)  
**Ano de Referência:** 2024  
**Data da Publicação:** 2026-05-28T16:47:00Z  
**Nível de Confiança:** Médio (Dado Bruto WebLakes com Validação Cruzada)  
**Selo Metodológico:** Dado horário público WebLakes — comparação experimental — sem QA/QC oficial explícito

---

## 1. Contexto e Justificativa

Após a descoberta e correção de divergências no comportamento de sessão (*stateful session*) do endpoint WebLakes/INEAPublico, a equipe técnica do SEMEAR recolheu e auditou a série anual completa de 2024 de PM10 para as três estações automáticas ativas no município de Volta Redonda-RJ:
*   **VR - Belmonte (ID: 69)**
*   **VR - Retiro (ID: 70)**
*   **VR - Santa Cecília (ID: 71)**

A alta cobertura horária consolidada (superior a 93% em todas as estações) forneceu representatividade estatística robusta para liberar a primeira camada de dados abertos estruturados de 2024 no portal do Observatório do Ar.

---

## 2. Dataset Público Consolidado (PM10 2024)

As métricas estruturadas e expostas publicamente no arquivo `src/data/air/pm10-2024-station-summary.ts` são as seguintes:

| Estação (ID) | Cobertura Anual (%) | Leituras Horárias | Média Anual (µg/m³) | Pico Horário (µg/m³) | Leituras Zero | Dias Válidos (≥18h) | Excedências OMS (>45 µg/m³) | Excedências CONAMA 506 (>50 µg/m³) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **VR-Belmonte (69)** | 93.53% | 8.216 | 30.97 | 367.52 | 45 | 341 | 48 dias | 28 dias |
| **VR-Retiro (70)** | 96.74% | 8.498 | 29.70 | 300.76 | 53 | 366 | 46 dias | 32 dias |
| **VR-Santa Cecília (71)** | 96.90% | 8.512 | 18.01 | 212.70 | 255 | 358 | 5 dias | 2 dias |

---

## 3. Implementações Realizadas no Frontend

Para publicar essa camada de forma metodologicamente blindada e didaticamente acessível, realizamos as seguintes intervenções no código-fonte do portal:

### 3.1. Dataset Estruturado
*   Criamos o arquivo [pm10-2024-station-summary.ts](file:///C:/Projetos/SEMEAR%20PWA/src/data/air/pm10-2024-station-summary.ts) contendo a tipagem e os valores finais auditados das estações para PM10 em 2024.

### 3.2. Atualização do Mapa Temático (`AirAtlasMap.tsx`)
*   **Modo Restrito:** Travamos a exibição do mapa anual em 2024 para o poluente **PM10**, desabilitando temporariamente no seletor os demais poluentes (PM2.5, SO2, NO2, CO, PTS e O3) com o rótulo `(Em Auditoria)`.
*   **Métricas Selecionáveis:** Alinhamos a seleção de métricas do mapa para suportar diretamente:
    *   *Média anual*
    *   *Pico horário*
    *   *Dias acima OMS*
    *   *Dias acima CONAMA 506*
    *   *Cobertura*
    *   *Leituras zero em revisão*
*   **Tooltip Avançado:** O *Popup* do Leaflet por estação foi padronizado para exibir de forma síncrona: o nome da estação, a cobertura geral do período, a média anual, o pico máximo horário, os dias excedentes da diretriz da OMS, os dias excedentes do limite nacional da CONAMA, e o selo metodológico explícito.
*   **Rodapé do Mapa:** Adicionamos o rodapé informando a governança e o selo: `Dado horário público WebLakes — comparação experimental — sem QA/QC oficial explícito`.

### 3.3. Atualização do Painel de Anos (`YearExplorer.tsx`)
*   **Bloco Dedicado:** Para o ano de 2024, criamos um painel específico intitulado *"PM10 validado experimentalmente"*, exibindo o comparativo completo e direto entre as três estações operacionais.
*   **Estação 72 (Ilha das Águas Cruas):** Incluímos um fallback de visual amigável informando: *"Estação meteorológica / sem PM10 disponível nesta camada."*, explicando didaticamente que esta estação meteorológica monitora variáveis de clima, mas não dispõe de sensores de material particulado nesta base.
*   **Selo e Notas de Exposição:** Exibimos em destaque o selo e o bloco explicativo de leitura e refinamos as notas de exposição automática usando a terminologia regulatória de atenção.

### 3.4. Atualização do Painel de Padrões (`ThresholdComparisonPanel.tsx`)
*   **Bloqueio preventivo:** Liberamos as comparações cruzadas para PM10/2024 para as estações 69, 70 e 71.
*   **Mensagem de Auditoria:** Se o usuário selecionar qualquer outro poluente para o ano de 2024, o Observed Value Card é ocultado e substituído pelo aviso de segurança: *"Este poluente ainda está em auditoria para comparação anual."*

---

## 4. Salvaguardas Metodológicas e Linguagem

*   **Linguagem Cívica de Atenção:** Substituímos em todo o escopo de 2024 o termo técnico *"eventos de poluição crônica ou aguda"* por *"eventos de atenção em comparação experimental com as réguas OMS e CONAMA."*, evitando alarmismo e mantendo o enquadramento rigoroso do projeto.
*   **Bloco Didático de Leitura:** Adicionamos nas interfaces o bloco explicativo *"Como ler esses números"*:
    > *"Os valores vêm de dados horários públicos exibidos pela plataforma INEA/WebLakes. Como a tabela não traz uma flag oficial de QA/QC por registro, tratamos as comparações com OMS e CONAMA como experimentais. Ainda assim, a alta cobertura horária permite identificar sinais fortes de atenção."*
*   **Frescor e Transparência:** Todas as exibições reafirmam que ausência de dados não é ar bom, incentivando a transparência ativa dos órgãos ambientais.

---

## 5. Resultados de Verificação e QA

Executamos com sucesso o pipeline de qualidade local:
1.  **Linter de Termos Públicos (`npm run inea:qa:language`):** **PASS** (100% de conformidade com as regras de vocabulário e freshness).
2.  **Verificação de Build e Tipos (`npm run verify`):** **PASS** (eslint e tsc sem avisos, build de produção gerado com sucesso).
