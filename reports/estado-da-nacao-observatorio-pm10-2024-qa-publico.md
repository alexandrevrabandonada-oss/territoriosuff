# Estado da Nação — QA Visual e Lançamento Público da Camada PM10 (2024)

**Poluente:** PM10 (Material Particulado Inalável)  
**Ano de Referência:** 2024  
**Data da Auditoria:** 2026-05-28T16:52:00Z  
**Nível de Confiança:** Médio (Dado Bruto WebLakes com Validação Cruzada)  
**Selo Metodológico:** Dado horário público WebLakes — comparação experimental — sem QA/QC oficial explícito

---

## 1. Homologação Visual e de Interface (QA)

Realizamos a validação visual do portal e o teste de regressão do layout na rota `/qualidade-ar/inea` para os modos Desktop e Mobile, cobrindo:
1.  **Abertura Padrão:** O mapa temático inicia renderizando a camada **"PM10 — 2024"** automaticamente (poluente 18 selecionado por padrão).
2.  **Validação dos Tooltips (Popup):**
    *   **VR-Belmonte:** Exibe nome, cobertura (93.5%), média (30.97 µg/m³), pico (367.52 µg/m³), excedências OMS (48d) e excedências CONAMA (28d), com o selo metodológico no rodapé do tooltip.
    *   **VR-Retiro:** Exibe nome, cobertura (96.7%), média (29.70 µg/m³), pico (300.76 µg/m³), excedências OMS (46d) e excedências CONAMA (32d), com o selo metodológico.
    *   **VR-Santa Cecília:** Exibe nome, cobertura (96.9%), média (18.01 µg/m³), pico (212.70 µg/m³), excedências OMS (5d) e excedências CONAMA (2d), com o selo metodológico.
    *   **Ilha das Águas Cruas (72):** Renderiza o fallback descritivo *"Estação meteorológica / sem PM10 disponível nesta camada."*, sem misturar com poluentes zerados.

---

## 2. Ajustes Editoriais e Governança de Dados

Para garantir a precisão e a segurança metodológica na divulgação das informações, aplicamos as seguintes correções:
*   **Correção de Terminologia legal:** Corrigimos o termo de *"Bloqueio Preventive"* para *"Bloqueio preventivo"* em [estado-da-nacao-observatorio-pm10-2024-publicacao.md](file:///C:/Projetos/SEMEAR%20PWA/reports/estado-da-nacao-observatorio-pm10-2024-publicacao.md) no item 3.4.
*   **Remoção de Vínculo Não-Fontado:** Removemos todas as menções a *"estação interna CSN"* nas descrições de metadados, substituindo pela descrição neutra *"estação meteorológica"* no mapa [AirAtlasMap.tsx](file:///C:/Projetos/SEMEAR%20PWA/src/components/air/AirAtlasMap.tsx) e nos relatórios de publicação, visto que não há uma fonte documental pública aberta atestando a propriedade interna da planta no WebLakes.

---

## 3. Novos Blocos de Conteúdo no Portal

Inserimos diretamente no layout do portal (abaixo do mapa temático em [IneaRadarPage.tsx](file:///C:/Projetos/SEMEAR%20PWA/src/pages/air/IneaRadarPage.tsx)) uma seção de apoio didático com dois novos cartões estruturados:

### 3.1. Bloco "O que este mapa mostra"
> *"Este mapa mostra PM10 em 2024 a partir de dados horários públicos exibidos pela plataforma INEA/WebLakes. As comparações com OMS e CONAMA 506 são experimentais porque a tabela não traz flag oficial de QA/QC por registro."*

### 3.2. Bloco "Principais sinais de atenção"
*   Belmonte teve a maior média anual de PM10 (30.97 µg/m³).
*   Retiro teve o maior número de dias acima do padrão nacional da CONAMA 506 (32 dias).
*   Santa Cecília teve menor média anual (18.01 µg/m³), mas ainda registrou eventos de atenção (5 dias acima do limiar diário da OMS e 2 dias acima do limite da CONAMA 506).

---

## 4. Resultados de Teste e Qualidade

1.  **Validador de Vocabulário de Frescor (`npm run inea:qa:language`):** **PASS**
    *   O novo relatório `reports/estado-da-nacao-observatorio-pm10-2024-qa-publico.md` foi adicionado à varredura e passou 100% livre de termos inadequados.
2.  **Verificação Geral e Build (`npm run verify`):** **PASS**
    *   Build limpo em produção, com **0 erros e 0 warnings** em todo o código React/TypeScript.
