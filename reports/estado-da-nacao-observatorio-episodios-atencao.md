# Estado da Nação — Episódios de Atenção e Sazonalidade (2022–2024)

**Poluentes:** PM10 (Material Particulado Inalável) e PM2.5 (Material Particulado Fino)  
**Estações:** VR-Belmonte, VR-Retiro e VR-Santa Cecília  
**Recorte Temporal:** Anos de 2022, 2023 e 2024  
**Data do Relatório:** 2026-05-28  

---

## 1. Componentes Criados

No âmbito do **Tijolo 31**, a experiência visual do Observatório do Ar foi estendida com duas novas interfaces integradas:

1.  **[SeasonalityHeatmap.tsx](file:///C:/Projetos/SEMEAR%20PWA/src/components/air/SeasonalityHeatmap.tsx) [NEW]:**  
    Interface contendo a Matriz de Concentração Mensal de Eventos (Mês × Estação). A coloração do grid varia conforme o número de dias com médias diárias acima da OMS ou CONAMA 506. O componente lida honestamente com a integridade dos dados, exibindo `N/A` em meses com cobertura técnica inferior a 30%.
2.  **[AttentionEpisodesPanel.tsx](file:///C:/Projetos/SEMEAR%20PWA/src/components/air/AttentionEpisodesPanel.tsx) [NEW]:**  
    Painel de controle unificado que conecta a matriz de sazonalidade e quatro cards analíticos para os rankings didáticos do ano, poluente e regime de limite selecionados.

---

## 2. Dados Derivados Gerados

Desenvolvemos o script de agregação temporal **[generate-attention-episodes.ts](file:///C:/Projetos/SEMEAR%20PWA/scripts/generate-attention-episodes.ts)**, que consome as séries brutas horárias oficiais do INEA na pasta `data/inea_weblakes_normalized/` e compila os dados mensais agregados salvando-os em:

*   **[attention-episodes-2022-2024.ts](file:///C:/Projetos/SEMEAR%20PWA/src/data/air/attention-episodes-2022-2024.ts) [NEW]**

O conjunto de dados mapeia 216 registros (3 estações × 2 poluentes × 3 anos × 12 meses) com os seguintes campos-chave:
*   `valid_days`: Dias com cobertura horária analítica suficiente ($\ge 18$ horas válidas).
*   `who_exceedance_days` / `conama_exceedance_days`: Dias com média diária acima das metas OMS (45/15 µg/m³) ou federais CONAMA 506 (50/25 µg/m³).
*   `max_hourly_value` / `max_hourly_at`: Concentração e data/hora exata do pico horário pontual de concentração.
*   `coverage_percent` e `data_quality_tier`: Validade técnica para garantir a honestidade de dados.

---

## 3. Principais Episódios Encontrados na Série Temporal

*   **Maior Pico Horário Pontual de Concentração:**  
    Registrado em **Julho de 2022** na estação **VR-Santa Cecília** com **410.81 µg/m³** de PM10 no dia 29/07/2022 às 09h. O segundo maior pico ocorreu em Junho de 2023 na mesma estação com 383.84 µg/m³ (dia 10/06/2023 às 11h).
*   **Recorrência de eventos de atenção:**  
    *   Em PM2.5/2024, VR-Retiro registrou 60 dias acima da diretriz diária da OMS e 11 dias acima da régua diária da CONAMA 506, com destaque para picos horários pontuais que exigem atenção metodológica.
    *   No PM10 em 2023 (ano de maior estiagem e criticidade geral), a estação **VR-Belmonte** acumulou 84 dias acima do limiar da OMS, com destaque para Agosto de 2023, que acumulou 22 dias acima do padrão de atenção.
*   **Períodos Críticos (Sazonalidade):**  
    O cruzamento de dados demonstra um aumento severo das ultrapassagens experimentais entre **maio e setembro**, alinhando-se aos meses de estiagem e inverno no Médio Paraíba.

---

## 4. Salvaguardas Metodológicas e Comunicação Cívica

O painel de controle e a matriz de calor foram blindados com as salvaguardas regulamentares do portal SEMEAR:
1.  **Selo de Origem:** *"Dado horário público WebLakes — comparação experimental — sem QA/QC oficial explícito"*.
2.  **Aviso de Freshness:** Indicação clara de que os dados históricos consolidados *"não representam monitoramento ao vivo ou leitura minuto a minuto"*.
3.  **Ressalva de Cobertura:** Exibição destacada de que *"ausência de dado não representa ar bom"*, blindando lacunas institucionais de transmissão ou avarias de sensores de monitoramento.
4.  **Vocabulário Neutro:** Adoção estrita de *"eventos de atenção"* e *"picos horários pontuais de concentração"*, sem insinuações de culpabilidade.

---

## 5. Auditoria de Consistência Mensal-Anual

Para evitar a publicação de achados inconsistentes, a série de episódios de atenção passou por um processo rigoroso de auditoria cruzada:
*   **Total de cruzamentos verificados:** 36 combinações (Anos 2022–2024 × Poluentes PM10/PM2.5 × Estações Belmonte, Retiro, Santa Cecília) confrontando as somas mensais contra os totais anuais de excedências.
*   **Correção de Dados Normalizados:** Identificamos e corrigimos uma contaminação de dados simulados (mock) na série histórica mensal. Todos os arquivos mensais normalizados sob `data/inea_weblakes_normalized/` foram reconstruídos diretamente a partir do cache de dados brutos (`.cache/inea/weblakes/raw/`).
*   **Garantia de Alinhamento:** Após a re-normalização e regeneração do dataset de episódios de atenção, a soma mensal de dias de atenção alinha-se 100% com os totais consolidados anuais para todas as estações e poluentes (por exemplo, VR-Retiro PM2.5 registrou exatamente 60 dias acima da diretriz OMS 24h e 11 dias acima da CONAMA 506 24h em 2024).
*   **Linguagem Pública Ajustada:** Todos os termos que poderiam sugerir juízos de valor legais ou alarmismo foram limpos nos componentes visuais e relatórios (como a substituição de "excedências crônicas" por "eventos de atenção recorrentes" e "atenção extrema" por "atenção elevada").

---

## 6. Resultados de QA e Integração

*   **Linter de Linguagem (`npm run inea:qa:language`):** **PASS**
    *   Validamos que todos os novos arquivos criados atendem às restrições vocabulares da freshness (não representa tempo real).
*   **Build e Verificação de Tipos (`npm run verify`):** **PASS**
    *   PWA compilada de forma limpa sem erros ou avisos na Vite/TypeScript.
*   **Integração na Rota:** Rota unificada `/qualidade-ar/inea` atualizada sob a âncora `#episodios`.

---

## 7. Próximos Passos

*   Continuar a expansão plurianual à medida que novos dados periódicos oficiais em lote forem publicados pelo INEA nos Dados Abertos ou WebLakes.
*   Incentivar pedidos de LAI para obter microdados históricos em períodos com dados ausentes.
