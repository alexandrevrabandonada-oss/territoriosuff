# Estado da Nação — Decisão Técnica sobre Publicação de PM2.5 2024 — VR-Retiro

**Data do Relatório:** 2026-05-28  
**Estação:** Volta Redonda - Retiro (ID 70)  
**Parâmetro:** Material Particulado Fino (PM2.5) — Parâmetro 20  
**Ano:** 2024  
**Status Metodológico:** Comparação Experimental — Sem QA/QC oficial explícito  

---

## Respostas às Perguntas de Decisão Técnica

### 1. PM2.5 em Retiro tem cobertura suficiente em 2024?
**Sim.** A cobertura anual de leituras horárias registrada foi de **99,67%** (8.755 horas encontradas de 8.784 horas esperadas no ano bissexto). Isso supera com folga o patamar de representatividade estatística de 75% exigido pelas normas brasileiras (CONAMA) e internacionais para fins de consolidação de médias anuais e diárias.

### 2. Há valores nulos, negativos ou zeros relevantes?
*   **Valores Nulos:** **0** registros nulos foram identificados após a consolidação da coleta limpa.
*   **Valores Negativos:** **0** registros negativos (que seriam descartados por serem fisicamente inválidos).
*   **Valores Zero:** Foram detectadas **521 leituras iguais a zero** (5,95% do total). Embora fisicamente possíveis em condições de intensa lavagem atmosférica por chuva ou ventilação extrema, em ambientes industriais urbanos esses valores zeros são marcados preventivamente como `ZERO_VALUE_REVIEW`. No entanto, eles não contaminam a integridade geral do banco.

### 3. Há picos extremos que exigem revisão?
O pico máximo horário registrado foi de **208,58 µg/m³**. Trata-se de um valor elevado, mas condizente com picos históricos observados em zonas industriais sob condições de estabilidade atmosférica severa. Não há indícios de anomalias eletrônicas permanentes (leituras fora de escala como `999` ou constantes repetidas), mas o valor configura um evento de atenção relevante.

### 4. O parser continuou consistente?
**Sim.** O parser estrutural normalizou com sucesso todos os 12 meses de 2024. Não houve nenhum erro de deslocamento de colunas, desalinhamento de linhas ou falha de indexação dos atributos em `cell[5]`, `cell[6]` e `cell[7]` da plataforma WebLakes.

### 5. Quantos dias ficaram acima da OMS 24h?
Considerando os 365 dias válidos (todos com cobertura de dados diários ≥ 18 horas válidas), **60 dias** registraram média diária superior a **15 µg/m³** (limite recomendado pela diretriz de 24h da OMS de 2021). Isso significa que em aproximadamente 16,4% dos dias do ano as diretrizes globais de saúde não foram observadas para partículas finas.

### 6. Quantos dias ficaram acima da CONAMA 506 24h?
**11 dias** registraram média diária superior a **25 µg/m³** (padrão nacional de qualidade do ar diário estabelecido pela Resolução CONAMA 506/2024).

### 7. A média anual ultrapassa a OMS anual?
**Sim.** A média anual de PM2.5 calculada foi de **9,34 µg/m³**, ultrapassando em **1,9x** a recomendação de exposição crônica anual da OMS (5 µg/m³).

### 8. A média anual ultrapassa a CONAMA anual?
**Não.** A média anual de **9,34 µg/m³** ficou ligeiramente abaixo do padrão nacional anual definitivo estabelecido pela Resolução CONAMA 506/2024, que é de **10 µg/m³** (representando aproximadamente 93,4% do teto legal nacional).

### 9. A camada pode ir para publicação pública?
**Não de forma ativa.** Embora a consistência do cache e a integridade estatística da série de PM2.5 em VR-Retiro sejam excelentes (99,67% de cobertura), o poluente PM2.5 só deve ser integrado ao mapa de forma ativa quando as séries de PM2.5 das demais estações de monitoramento municipais (Belmonte e Santa Cecília) passarem por auditorias análogas de recoleta e cruzamento. Portanto, a camada de PM2.5 do Retiro permanecerá no status **"Em Auditoria Técnica"** na interface pública.

### 10. Quais ressalvas devem aparecer na UI?
Para qualquer exibição pública futura, as seguintes diretrizes editoriais de linguagem devem ser estritamente cumpridas:
1.  **Selo Metodológico:** *"Dado horário público WebLakes — comparação experimental — sem QA/QC oficial explícito"*.
2.  **Ressalva de Ausência de Dados:** *"Ausência de dados em determinados períodos ou leituras zeradas sob revisão não implicam que a qualidade do ar seja boa ou livre de riscos"*.
3.  **Experimentalidade:** As comparações devem ser sempre rotuladas como "comparação experimental".
4.  **Proibição de Termos em Tempo Real:** Não utilizar termos como "ao vivo", "tempo real", "leituras instantâneas", "minuto a minuto" ou termos de acusação jurídica imediata.

---

## Recomendação Técnica Final

A auditoria confirmou a integridade dos dados coletados de forma isolada por mês. Recomenda-se:
1.  Manter o poluente PM2.5 desabilitado no seletor do mapa interativo (`AirAtlasMap.tsx`).
2.  Manter o card de status do PM2.5 em auditoria ativo no `YearExplorer.tsx`.
3.  Projetar a futura auditoria de PM2.5 para Belmonte e Santa Cecília antes de qualquer ativação cartográfica de partículas finas.
