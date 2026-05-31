# Relatório Final de Auditoria de Coerência — Observatório do Ar
## Consolidação v1.5.0 → v1.5.1 · Volta Redonda

**Data de Emissão:** 2026-05-31
**Status Geral:** **APROVADO & SAUDÁVEL** ✅
**Versão Atual do Manifesto:** `v1.5.1` (18 Datasets)

---

## 1. Introdução e Objetivo

Este relatório consolida a auditoria de coerência realizada na transição da versão de produção `v1.5.0` para a `v1.5.1` do Observatório do Ar de Volta Redonda. O principal objetivo foi auditar e retificar desalinhamentos entre a documentação de metodologia, os arquivos de dados locais, o manifesto público e as regras técnicas de threshold do portal.

---

## 2. Principais Resoluções e Ajustes

### A. Correção Crítica de PM2.5 (2022 e 2023)
*   **Diagnóstico:** Identificou-se que os microdados horários e médias de PM2.5 para 2022 e 2023 já constavam no arquivo unificado `particulate-timeline-2020-2026.csv`. Contudo, os CSVs individuais de resumo de estação correspondentes estavam ausentes da pasta pública e do manifesto. O relatório de status anterior listava esses anos incorretamente como "não processados".
*   **Ação:**
    *   Foram gerados e validados os arquivos [pm25-2022-station-summary.csv](file:///C:/Projetos/SEMEAR%20PWA/public/data/air/pm25-2022-station-summary.csv) e [pm25-2023-station-summary.csv](file:///C:/Projetos/SEMEAR%20PWA/public/data/air/pm25-2023-station-summary.csv) a partir da timeline de material particulado.
    *   O manifesto público foi atualizado para a versão **`v1.5.1`**, incorporando as duas novas tabelas individuais e expandindo a biblioteca de dados para **18 datasets públicos**.

### B. Correção e Alinhamento Legal de Thresholds
*   **Diagnóstico:** O arquivo [thresholds.ts](file:///C:/Projetos/SEMEAR%20PWA/src/lib/air/thresholds.ts) possuía referências desatualizadas para a resolução revogada CONAMA 491/2018 (para SO₂, NO₂ e O₃) e links de terceiros instáveis para PTS. Além disso, a nota descritiva para CO indica uma aproximação de `~3.5 ppm` para a régua da OMS, quando o cálculo exato de conversão é `~3.49 ppm`.
*   **Ação:**
    *   Atualização das referências normativas vigentes nacionais para a **Resolução CONAMA 506/2024**.
    *   Correção da nota de CO para refletir a conversão física exata de `3.49 ppm` (equivalente a 4 mg/m³ a 25 °C e 1 atm).
    *   Substituição do link de PTS pela fonte oficial e estável da resolução CONAMA 03/1990.

### C. Dicionário de Dados Expandido
*   **Diagnóstico:** Havia discrepâncias entre os campos descritos na interface (`DataDictionaryEntry`), no CSV físico exportado e as variáveis reais presentes nas planilhas de timeline (como `coverage_status`, `annual_mean`, `max_hourly_peak` e indicadores de excedência).
*   **Ação:**
    *   O dicionário de dados em [data-dictionary.ts](file:///C:/Projetos/SEMEAR%20PWA/src/data/air/data-dictionary.ts) e [data-dictionary.csv](file:///C:/Projetos/SEMEAR%20PWA/public/data/air/data-dictionary.csv) foi expandido de 19 para **33 campos**.
    *   Foram documentadas todas as variáveis atualmente exportadas nas tabelas de timeline, station-summaries e episódios de atenção.
    *   Foram criadas entradas de metadados reservados (ex: `native_unit`, `who_conversion_factor`, `status`) visando a manutenibilidade futura da API e exportações estruturadas.

---

## 3. Resumo do Inventário de Datasets (`v1.5.1`)

O portal agora conta com **18 datasets públicos de qualidade do ar** listados no arquivo de índice unificado:

| # | Dataset | Tipo | Poluente | Escopo Temporal | Status |
| :---: | :--- | :---: | :---: | :---: | :---: |
| 1 | `pm10-2020-station-summary.csv` | Resumo Anual | PM10 | 2020 | ✅ Publicado |
| 2 | `pm10-2021-station-summary.csv` | Resumo Anual | PM10 | 2021 | ✅ Publicado |
| 3 | `pm25-2021-station-summary.csv` | Resumo Anual | PM2.5 | 2021 | ✅ Publicado |
| 4 | `pm25-2022-station-summary.csv` | Resumo Anual | PM2.5 | 2022 | ✅ Novo |
| 5 | `pm25-2023-station-summary.csv` | Resumo Anual | PM2.5 | 2023 | ✅ Novo |
| 6 | `pm10-2024-station-summary.csv` | Resumo Anual | PM10 | 2024 | ✅ Publicado |
| 7 | `pm25-2024-station-summary.csv` | Resumo Anual | PM2.5 | 2024 | ✅ Publicado |
| 8 | `so2-2024-station-summary.csv` | Resumo Anual | SO₂ | 2024 | ✅ Publicado |
| 9 | `co-2024-station-summary.csv` | Resumo Anual | CO | 2024 | ✅ Publicado |
| 10 | `pm10-2025-station-summary.csv` | Resumo Anual | PM10 | 2025 | ✅ Publicado |
| 11 | `pm25-2025-station-summary.csv` | Resumo Anual | PM2.5 | 2025 | ✅ Publicado |
| 12 | `pm10-2026-partial-station-summary.csv` | Resumo Anual | PM10 | 2026 (Parcial) | ✅ Publicado |
| 13 | `pm25-2026-partial-station-summary.csv` | Resumo Anual | PM2.5 | 2026 (Parcial) | ✅ Publicado |
| 14 | `particulate-timeline-2020-2026.csv` | Linha do Tempo | PM10, PM2.5 | 2020–2026 | ✅ Publicado |
| 15 | `so2-timeline-2020-2026.csv` | Linha do Tempo | SO₂ | 2020–2026 | ✅ Publicado |
| 16 | `co-timeline-2020-2026.csv` | Linha do Tempo | CO | 2020–2026 | ✅ Publicado |
| 17 | `attention-episodes-2020-2026.csv` | Série Mensal | Todos | 2020–2026 | ✅ Publicado |
| 18 | `data-dictionary.csv` | Metadados | N/A | Geral | ✅ Publicado |

---

## 4. Auditoria Editorial e Linguística

Conforme diretrizes editoriais do Observatório do Ar, foi realizada varredura léxica automática (`npm run inea:qa:language`) em todos os arquivos de dados, códigos e relatórios novos.
*   **Objetivo:** Afastar termos de leitura instantânea que possam sugerir "tempo real", "ao vivo", "tempo-real" ou dados dinâmicos minuto a minuto, garantindo que o público compreenda o caráter histórico, consolidado e em lote (*batch*) das estatísticas.
*   **Resultado:** **PASS** ✅
*   As únicas ocorrências encontradas no código-fonte referem-se a disclaimers técnicos explícitos obrigatórios (ex.: *"não representam monitoramento ao vivo ou leitura minuto a minuto"*), os quais são expressamente permitidos pelo validador.

---

## 5. Plano de Verificação Técnica (QA/QC)

1.  **Integridade do Build (`npm run verify`):** **PASS** ✅
    *   Compilação limpa, linting concluído com zero erros TypeScript e geração estática estrita do bundle do PWA (`vite build`) executada com sucesso.
2.  **Teste de Fumaça (`npm run smoke`):** **PASS** ✅
    *   Validação de RLS do banco de dados, roteamento do portal, expurgo de dados de simulação em APIs públicas e integridade técnica dos painéis editoriais do admin 100% validados.
3.  **Matriz de Saúde Local (Healthcheck):**
    *   Arquivos CSV e páginas do portal respondendo adequadamente com status `200 OK` e com a contagem de linhas e cabeçalhos validados. Os endpoints de API respondem em produção.

---

## 6. Veredito de Liberação cívica

A série histórica de gases SO₂ e CO, bem como as planilhas consolidadas de partículas PM10 e PM2.5, estão **totalmente alinhadas e coerentes**. A infraestrutura está pronta para a próxima etapa de governança técnica.
