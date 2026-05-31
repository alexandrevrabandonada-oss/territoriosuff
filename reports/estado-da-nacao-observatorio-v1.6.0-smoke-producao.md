# Relatório de Fumaça de Produção — Versão 1.6.0
**Observatório do Ar SEMEAR · Volta Redonda**

*   **Host Alvo:** `https://semear-pwa.vercel.app`
*   **Data de Execução:** 31 de maio de 2026, 20:49:23 (Horário de Brasília)
*   **Versão do Manifesto:** `1.6.0`
*   **Quantidade de Datasets:** 21
*   **Status de Saúde Geral:** 🟢 **PASS (SAUDÁVEL)**

---

## 1. Status de Conexão das APIs Públicas
Todos os endpoints dinâmicos de backend responderam com código de status HTTP `200 OK` e com formato JSON válido:

*   **Resumo Geral (`/api/air/inea/summary`):** `200 OK` (JSON Válido)
*   **Últimas Leituras (`/api/air/inea/latest`):** `200 OK` (JSON Válido)
*   **Classificação IQAr (`/api/air/inea/classification-days`):** `200 OK` (JSON Válido)
*   **Lacunas e Gaps (`/api/air/inea/analytics/data-gaps`):** `200 OK` (JSON Válido)

---

## 2. Validação dos Novos Datasets Históricos (v1.6.0)
Os três novos arquivos CSV com a série histórica estendida (2013-2026) foram publicados com sucesso no diretório de dados abertos e estão acessíveis publicamente com codificação CSV íntegra:

1.  **Linha do Tempo de PM10 (2013-2026):**
    *   **URL:** `https://semear-pwa.vercel.app/data/air/pm10-timeline-2013-2026.csv`
    *   **Status:** `200 OK`
    *   **Registros de Dados:** 42 linhas (excluindo cabeçalhos)
    *   **Status de Cobertura:** Flag `INSUFFICIENT_ANNUAL_COVERAGE` e `SUFFICIENT` calculados dinamicamente para cada ano/estação.
2.  **Linha do Tempo de SO₂ (2013-2026):**
    *   **URL:** `https://semear-pwa.vercel.app/data/air/so2-timeline-2013-2026.csv`
    *   **Status:** `200 OK`
    *   **Registros de Dados:** 22 linhas (excluindo cabeçalhos)
    *   **Status de Cobertura:** Flag `INSUFFICIENT_ANNUAL_COVERAGE` e `SUFFICIENT` calculados dinamicamente para cada ano/estação.
3.  **Linha do Tempo de CO (2013-2026):**
    *   **URL:** `https://semear-pwa.vercel.app/data/air/co-timeline-2013-2026.csv`
    *   **Status:** `200 OK`
    *   **Registros de Dados:** 22 linhas (excluindo cabeçalhos)
    *   **Status de Cobertura:** Flag `INSUFFICIENT_ANNUAL_COVERAGE` e `SUFFICIENT` calculados dinamicamente para cada ano/estação.

---

## 3. Homologação das Rotas da UI
As principais páginas públicas foram solicitadas via HTTP e retornaram com êxito `text/html` saudável:
*   **Radar INEA (`/qualidade-ar/inea`):** `200 OK`
*   **Metodologia (`/qualidade-ar/inea/metodologia`):** `200 OK`
*   **Dados Gerais (`/dados`):** `200 OK`

---

## 4. Veredito Técnico
> [!NOTE]
> **VEREDITO: APROVADO PARA USO PÚBLICO**
> A série histórica ampliada (2013–2026) está adequadamente sinalizada em termos de cobertura, e todas as URLs públicas e APIs de suporte estão estáveis e performáticas na Vercel. A versão v1.6.0 está oficialmente em produção.
