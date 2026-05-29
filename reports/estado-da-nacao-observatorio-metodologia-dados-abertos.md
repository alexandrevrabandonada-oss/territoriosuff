# Estado da Nação — Página de Metodologia e Dados Abertos

Este relatório detalha a entrega da página pública de metodologia, dados abertos e reprodutibilidade para o Observatório do Ar de Volta Redonda.

---

## 1. Arquivos Criados e Modificados

*   **[IneaMethodologyPage.tsx](file:///C:/Projetos/SEMEAR%20PWA/src/pages/air/IneaMethodologyPage.tsx) [NEW]:**  
    Nova página pública sob a rota `/qualidade-ar/inea/metodologia`. Conta com um layout responsivo, sumário de navegação lateral rápida, seções didáticas explicando as fórmulas e a tabela do dicionário de dados interativo.
*   **[data-dictionary.ts](file:///C:/Projetos/SEMEAR%20PWA/src/data/air/data-dictionary.ts) [NEW]:**  
    Objeto estruturado em TypeScript contendo os metadados de todos os campos das tabelas abertas (nomes, rótulos, descrições, unidades, fontes e ressalvas).
*   **[generate-csv-exports.ts](file:///C:/Projetos/SEMEAR%20PWA/scripts/generate-csv-exports.ts) [NEW]:**  
    Script em lote para converter as bases internas de episódios, séries e resumos anuais em arquivos CSV abertos.
*   **[dicionario-dados-observatorio-ar.md](file:///C:/Projetos/SEMEAR%20PWA/reports/dicionario-dados-observatorio-ar.md) [NEW]:**  
    Dicionário técnico formatado em tabela markdown para leitura externa.
*   **[IneaRadarPage.tsx](file:///C:/Projetos/SEMEAR%20PWA/src/pages/air/IneaRadarPage.tsx) [MODIFY]:**  
    Integração de três botões de navegação no final da seção de metodologia do painel principal para direcionamento de fluxo.
*   **[App.tsx](file:///C:/Projetos/SEMEAR%20PWA/src/App.tsx) [MODIFY]:**  
    Declaração da nova rota pública e importação com carregamento lento (*lazy loading*).
*   **[inea-public-language-assert.ts](file:///C:/Projetos/SEMEAR%20PWA/scripts/inea-public-language-assert.ts) [MODIFY]:**  
    Inclusão dos novos arquivos no escopo de verificação do linter de linguagem.

---

## 2. Exports de Dados Disponíveis (CSV)

Os arquivos foram gerados sob o diretório público do portal (`public/data/air/`) e estão disponíveis para download imediato via navegador:

1.  **[pm10-2024-station-summary.csv](file:///C:/Projetos/SEMEAR%20PWA/public/data/air/pm10-2024-station-summary.csv):** Resumos de PM10 de 2024 por estação.
2.  **[pm25-2024-station-summary.csv](file:///C:/Projetos/SEMEAR%20PWA/public/data/air/pm25-2024-station-summary.csv):** Resumos de PM2.5 de 2024 por estação.
3.  **[particulate-timeline-2022-2024.csv](file:///C:/Projetos/SEMEAR%20PWA/public/data/air/particulate-timeline-2022-2024.csv):** Histórico plurianual anualizado.
4.  **[attention-episodes-2022-2024.csv](file:///C:/Projetos/SEMEAR%20PWA/public/data/air/attention-episodes-2022-2024.csv):** Série mensal detalhada de episódios de atenção.
5.  **[data-dictionary.csv](file:///C:/Projetos/SEMEAR%20PWA/public/data/air/data-dictionary.csv):** O dicionário de dados em formato de planilha.

---

## 3. Regras Metodológicas Documentadas

A página de metodologia detalha as regras aplicadas pelo Observatório:
*   **Representatividade (Regra de 18h):** Descarte de dias com menos de 18 horas de medição para o cálculo de médias diárias.
*   **Auditabilidade de Zeros (ZERO_VALUE_REVIEW):** Preservação das leituras de valor exatamente zero com indicação técnica de sob-suspeição.
*   **Freshness:** Declaração explícita de que os dados históricos consolidados em lote *"não representam monitoramento ao vivo ou leitura minuto a minuto"*.
*   **Transparência sobre lacunas:** Garantia da mensagem técnica de que *"ausência de dado não representa ar bom"*.

---

## 4. Resultados do Controle de Qualidade (QA)

*   **Linter de Linguagem (`npm run inea:qa:language`):** **PASS**
    *   Confirmamos que todos os novos arquivos criados atendem às salvaguardas editoriais.
    *   Excedências são tratadas sob a etiqueta: *"Dado horário público WebLakes — comparação experimental — sem QA/QC oficial explícito."*
    *   Utilização estrita de *"dados horários públicos exibidos pela plataforma INEA/WebLakes"* e *"eventos de atenção"*.
    *   Ausência total de termos proibidos de leitura dinâmica instantânea (não se trata de monitoramento ao vivo e não representa tempo real), além de afastar termos de culpabilidade como "prova de crime" ou "homologado".
*   **Verificação de Build e Tipos (`npm run verify`):** **PASS**
    *   Os novos módulos React e as tabelas TypeScript integraram-se sem qualquer tipo incompatível ou aviso de build no bundler Vite.

---

## 5. Próximos Passos

1.  **Auditorias de Somas no Open Data:** Executar scripts de conciliação sempre que novos dados em lote forem ingeridos na base pública.
2.  **Expansão Meteorológica:** Planejar a documentação das variáveis climáticas da estação 72 para apoio a análises de dispersão atmosférica futuras.
3.  **Transparência Ampliada:** Divulgar os links de download na thread social e posts de lançamento para engajar pesquisadores locais no download dos arquivos CSV.
