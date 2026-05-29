# Estado da Nação — Publicação da Linha do Tempo 2022–2024 do Observatório do Ar

**Poluentes:** PM10 (Material Particulado Inalável) e PM2.5 (Material Particulado Fino)  
**Ano de Referência:** 2022, 2023 e 2024  
**Data da Publicação:** 2026-05-28  
**Status Metodológico:** Comparação experimental — Sem QA/QC oficial explícito  

---

## 1. Arquivos Criados/Alterados

No âmbito do **Tijolo 30.1**, as seguintes entregas técnicas foram finalizadas e homologadas no portal SEMEAR:

*   **[ParticulateTimeline2022_2024.tsx](file:///C:/Projetos/SEMEAR%20PWA/src/components/air/ParticulateTimeline2022_2024.tsx) [NEW]:**  
    Novo componente interativo que permite comparar os dados de PM10 e PM2.5 das três estações (Belmonte, Retiro e Santa Cecília) nos anos de 2022, 2023 e 2024. O componente integra indicadores de médias anuais, excedências diárias (OMS/CONAMA 506), cobertura técnica e destaque de picos horários pontuais de concentração.
*   **[IneaRadarPage.tsx](file:///C:/Projetos/SEMEAR%20PWA/src/pages/air/IneaRadarPage.tsx) [MODIFY]:**  
    Integração do novo componente na âncora `#timeline-plurianual` com o título *"Linha do tempo 2022–2024"* e subtítulo *"Veja como PM10 e PM2.5 se comportaram nas estações de Volta Redonda, ano a ano, em comparação experimental com OMS e CONAMA 506."*. O posicionamento foi inserido após o mapa interativo principal e antes da seção metodológica.
*   **[YearTimeline.tsx](file:///C:/Projetos/SEMEAR%20PWA/src/components/air/YearTimeline.tsx) [DELETE]:**  
    Remoção do arquivo antigo para manter a higienização do repositório.
*   **[inea-public-language-assert.ts](file:///C:/Projetos/SEMEAR%20PWA/scripts/inea-public-language-assert.ts) [MODIFY]:**  
    Atualização da lista de escaneamento visual e de relatórios para incluir os novos arquivos criados, garantindo a cobertura dos linters de integridade vocabular.
*   **[estado-da-nacao-observatorio-linha-do-tempo-2022-2024.md](file:///C:/Projetos/SEMEAR%20PWA/reports/estado-da-nacao-observatorio-linha-do-tempo-2022-2024.md) [MODIFY]:**  
    Ajuste de redação substituindo o termo de controle de exceção interno antigo pelo termo amigável público e refinando os indicadores.
*   **[estado-da-nacao-inea-historico-2022-2023.md](file:///C:/Projetos/SEMEAR%20PWA/reports/estado-da-nacao-inea-historico-2022-2023.md) [MODIFY]:**  
    Substituição de *"ocorrências agudas de emissão"* por *"picos horários pontuais de concentração"*.

---

## 2. Dados Utilizados

A linha do tempo consolida os dados reais processados a partir das séries horárias do INEA obtidas na plataforma WebLakes:

*   **2022:** Médias anuais de PM10 de ~30.7 µg/m³ (Belmonte e Retiro) e ~16.5 µg/m³ (Santa Cecília). Excedências diárias da OMS chegam a 64 dias para PM2.5 em Belmonte.
*   **2023:** Ano de maior criticidade, com Belmonte alcançando média anual de PM10 de 36.11 µg/m³ e 84 dias acima do limiar diário da OMS.
*   **2024:** Belmonte mantendo maior média anual (30.97 µg/m³ para PM10; 11.33 µg/m³ para PM2.5), Retiro registrando o maior pico horário pontual de PM2.5 (208.58 µg/m³), e Santa Cecília com a menor média anual do trio (18.01 µg/m³ de PM10; 8.88 µg/m³ de PM2.5).

---

## 3. Salvaguardas Metodológicas e de Comunicação

Para evitar desvios informacionais na exposição plurianual de dados, a interface do componente e as notas de divulgação foram blindadas com as seguintes salvaguardas explícitas:

1.  **Selo Metodológico:** *"Dado horário público WebLakes — comparação experimental — sem QA/QC oficial explícito"*.
2.  **Ressalva de Freshness:** Aviso claro de que as informações *"não representam monitoramento ao vivo ou leitura minuto a minuto"*, sendo dados históricos consolidados.
3.  **Ressalva de Cobertura:** Indicação expressa de que *"ausência de dado não representa ar bom"*, protegendo a interpretação de períodos com falha instrumental ou lacunas de transmissão da rede pública do INEA.
4.  **Vocabulário de Exposição:** Utilização exclusiva do termo *"eventos de atenção"* para caracterizar excedências regulatórias ou sanitárias diárias, evitando termos jurídicos ou imputações de culpabilidade sem homologação de QA/QC de origem.

---

## 4. Resultados de QA e Verificação

*   **Linter de Linguagem (`npm run inea:qa:language`):** **PASS**
    *   Varredura completa atestando que nenhuma expressão restrita de leitura instantânea sem exceção legal foi incorporada e que as correções obrigatórias foram aplicadas.
*   **Verificação de Pipeline (`npm run verify`):** **PASS**
    *   Compilação limpa, typecheck do TypeScript (`tsc`) aprovado e linter geral (`eslint`) concluído com sucesso.

---

## 5. Próximos Passos

*   Manter a monitoração da integridade da base de dados e avaliar a ingestão de outros anos ou outros poluentes conforme forem disponibilizados em lote pelo órgão oficial.
