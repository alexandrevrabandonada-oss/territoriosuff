# Estado da Nação — Smoke Test Final de SO₂ e CO (2024)

**Data do Relatório:** 2026-05-31  
**Estágio de Homologação:** Smoke Test de Produção Aprovado  
**Host Alvo:** [https://semear-pwa.vercel.app](https://semear-pwa.vercel.app)  
**Status Final de Saúde:** **22/22 PASS (100% Saudável)** 🟢

---

## 1. Respostas aos Questionamentos Críticos do Smoke Test

### 1.1. O manifesto em produção está na versão v1.4.0?
**SIM**. O download do arquivo [`manifest.json`](https://semear-pwa.vercel.app/data/air/manifest.json) na nuvem foi analisado e validou com sucesso:
*   `version` = `"1.4.0"`
*   `dataset_version` = `"1.4.0"`
*   `datasets.length` = `14` (contém exatamente os 14 datasets mapeados).

### 1.2. O CSV de SO₂ está público?
**SIM**. O endpoint [`so2-2024-station-summary.csv`](https://semear-pwa.vercel.app/data/air/so2-2024-station-summary.csv) retornou status **`200 OK`**, cabeçalho `text/csv` e foi analisado como válido pelo validador físico, contendo as 3 linhas de dados esperadas das estações de Volta Redonda com o status `"PUBLICÁVEL COM CAUTELA"`.

### 1.3. O CSV de CO está público?
**SIM**. O endpoint [`co-2024-station-summary.csv`](https://semear-pwa.vercel.app/data/air/co-2024-station-summary.csv) retornou status **`200 OK`**, cabeçalho `text/csv` e foi validado com sucesso, contendo as colunas físicas de conversão e média móvel (`native_unit`, `who_conversion_factor`, `conama_averaging` e `moving_8h_max`) e o status `"PUBLICÁVEL COM CAUTELA"`.

### 1.4. NO₂, PTS e O₃ seguem bloqueados?
**SIM, SEGUEM BLOQUEADOS**. Eles estão retidos sob quarentena estrita:
*   Não aparecem na lista de datasets do manifesto público em produção.
*   Nenhum arquivo CSV correspondente a eles foi adicionado à pasta `/data/air/` pública.
*   Na interface pública do Radar (`/qualidade-ar/inea`), eles constam sob a aba de atenuados em *"Parâmetros ainda em auditoria"*, sem ativação no mapa e sem downloads.

### 1.5. O healthcheck em produção passou?
**SIM**. A suíte de testes automáticos na nuvem retornou **`22/22 PASS`** com zero falhas, validando todas as rotas dinâmicas, APIs estáticas de qualidade do ar do Supabase e downloads de planilhas CSV.

---

## 2. Detalhes das Requisições de QA (Smoke Test)

| Componente | Tipo | URL de Produção | Status | Notas |
| :--- | :---: | :--- | :---: | :--- |
| **Dataset Manifest** | `manifest` | `/data/air/manifest.json` | `200 OK` | Version: 1.4.0, datasets: 14 |
| **CSV: SO₂ 2024** | `csv` | `/data/air/so2-2024-station-summary.csv` | `200 OK` | 3 rows parsed (sufficient) |
| **CSV: CO 2024** | `csv` | `/data/air/co-2024-station-summary.csv` | `200 OK` | 3 rows parsed + conversion columns |
| **API: Resumo Geral** | `api` | `/api/air/inea/summary` | `200 OK` | API JSON parsed successfully |
| **API: Últimas Leituras** | `api` | `/api/air/inea/latest` | `200 OK` | API JSON parsed successfully |
