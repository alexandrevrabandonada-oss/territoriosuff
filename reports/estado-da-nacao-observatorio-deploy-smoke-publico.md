# Estado da Nação — Deploy e Smoke Test Público do Observatório do Ar

Este relatório detalha a publicação do Observatório do Ar no ambiente de produção Vercel e os resultados dos testes de fumaça (smoke tests) públicos realizados nas rotas, APIs, downloads de dados e visualizações móveis.

---

## 1. Dados Gerais do Deploy

*   **URL Pública do Portal:** [https://semear-pwa.vercel.app](https://semear-pwa.vercel.app)
*   **Identificador do Deploy (Único):** [https://semear-ah2haw109-alexandrevrabandonada-oss-projects.vercel.app](https://semear-ah2haw109-alexandrevrabandonada-oss-projects.vercel.app)
*   **Commit/Hash Publicado:** `dpl_H3wWbZ3V8B9C89s` (Vercel Build Target)
*   **Data e Hora do Deploy:** 29 de Maio de 2026 às 18:21 (Local Time)
*   **Ambiente Utilizado:** Vercel Production Environment (Linked with GitHub repository `territoriosuff`)

---

## 2. Status das Rotas e APIs em Produção

Todas as páginas e endpoints foram testados em produção e responderam com sucesso (**HTTP 200**), sem nenhuma quebra visual ou erros críticos de runtime no console:

| Rota / Endpoint de API | Tipo / Função | Status | Observações Técnicas |
| :--- | :--- | :---: | :--- |
| `/qualidade-ar/inea` | Dashboard do Observatório | 200 | Mapa e gráficos integrados renderizam perfeitamente. |
| `/qualidade-ar/inea#episodios` | Âncora da camada de episódios | 200 | Rola automaticamente para a seção de Sazonalidade. |
| `/qualidade-ar/inea#timeline-plurianual` | Âncora da linha do tempo | 200 | Foca e rola para a seção da série histórica de 3 anos. |
| `/qualidade-ar/inea/metodologia` | Portal de Metodologia | 200 | Sumário e dicionário de dados carregam perfeitamente. |
| `/dados` | Dados Gerais do Portal | 200 | Banner e atalhos de episódios integrados com sucesso. |
| `/api/air/inea/summary` | API: Resumo Geral | 200 | Retorna metadados Supabase com êxito. |
| `/api/air/inea/latest` | API: Últimas Leituras | 200 | Consome Supabase e popula o mapa. |
| `/api/air/inea/classification-days` | API: Classificação do IQAr | 200 | Carrega dados diários de 2024 de Volta Redonda. |
| `/api/air/inea/analytics/data-gaps` | API: Auditoria de Lacunas | 200 | Retorna taxas de cobertura horária por estação. |

---

## 3. Status dos Arquivos Públicos (Open Data)

Os arquivos consolidados sob `/data/air/` foram verificados e estão acessíveis para qualquer cidadão:

| Caminho do Recurso CSV | Tipo de Conteúdo | HTTP | Acentuação & Unidades | Cabeçalhos e Integridade |
| :--- | :---: | :---: | :---: | :--- |
| `/data/air/pm10-2024-station-summary.csv` | `text/csv` | 200 | OK (`µg/m³`) | Cabeçalhos snake_case; 3 linhas de dados físicas. |
| `/data/air/pm25-2024-station-summary.csv` | `text/csv` | 200 | OK (`µg/m³`) | Cabeçalhos snake_case; 3 linhas de dados físicas. |
| `/data/air/particulate-timeline-2022-2024.csv` | `text/csv` | 200 | OK (`µg/m³`) | Cabeçalhos snake_case; 18 linhas de dados físicas. |
| `/data/air/attention-episodes-2022-2024.csv` | `text/csv` | 200 | OK (`µg/m³`) | Cabeçalhos snake_case; 216 linhas de dados físicas. |
| `/data/air/data-dictionary.csv` | `text/csv` | 200 | OK (`µg/m³`) | Cabeçalhos snake_case; 19 linhas de metadados físicas. |
| `/data/air/manifest.json` | `application/json` | 200 | OK | JSON válido; `rows_count` batendo com os CSVs. |

---

## 4. Comportamento e Experiência Mobile em Produção

A auditoria visual mobile (iPhone 13 / `375x812` emulado) atestou:
*   **Mapa e Gráficos:** O mapa Leaflet e os painéis de sazonalidade reduzem-se perfeitamente e não causam vazamento de margem horizontal (*no scroll overflow*).
*   **Matriz de Sazonalidade:** Renderiza de forma empilhada ou com container autônomo de rolagem, permitindo o toque e leitura sem esmagamento visual.
*   **Tabela do Dicionário de Dados:** O portal de metodologia no celular apresenta a tabela de dicionário de dados com rolagem horizontal interna perfeita e fluida, impedindo que textos longos saiam da tela e mantendo os downloads de arquivos 100% clicáveis e acessíveis.

---

## 5. Erros Encontrados e Correções Realizadas

### Erro das APIs Supabase (HTTP 500)
*   **Identificação:** No primeiro deploy público, as requisições para `/api/air/inea/*` falharam com status 500. A checagem dos logs da Vercel indicou a falha: `Error: supabaseUrl is required` na inicialização do cliente Supabase. Isso ocorreu devido à falta das variáveis de ambiente de produção no painel da Vercel.
*   **Correção:** Escrevemos e executamos um script Node.js (`sync_env_vercel.js`) para ler `.env.local` e carregar de forma automatizada e sequencial todos os segredos de produção no ambiente Vercel. O projeto foi redeployado com `npx vercel --prod`.
*   **Verificação:** Após o redeploy, todas as requisições API foram concluídas com `200 OK` e o console do navegador ficou livre de erros.

---

## 6. Veredito Final

> [!TIP]
> **VEREDITO: PUBLICÁVEL E TOTALMENTE OPERACIONAL**
> O Observatório do Ar de Volta Redonda está 100% pronto para divulgação pública. A integridade dos dados abertos e a clareza metodológica foram validadas no ambiente real de nuvem.
