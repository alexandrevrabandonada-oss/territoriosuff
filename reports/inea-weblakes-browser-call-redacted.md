# Chamada Tabular INEA/WebLakes via DevTools (Redigida)

Esta é a captura e a redigitação ética da chamada realizada pelo painel de Analytics da plataforma pública do INEA/WebLakes, especificamente o relatório **Concentração de Poluentes e Padrão dos Ventos** na aba **Tabela**, para fins de diagnóstico e replicação ética do contrato.

## 1. URL da Requisição

```http
GET https://qualidadedoar.inea.rj.gov.br/INEAPublico/ConcentrationWithWindArrows/GridData?aParameterKey=18&aSite=70&aStartDate=2024-07-17&aEndDate=2024-07-18&gridId=ConcentrationWithWindArrowsGrid&Context_Bootstrap_Flag=true&_search=false&nd=1779922287021&rows=1500&page=1&sidx=DateTime&sord=asc&ssSearchField=__ANY_COLUMN&ssSearchOper=cn&ssSearchString=&_=1779922235667 HTTP/1.1
```

## 2. Comando cURL Equivalente (Redigido)

```bash
curl "https://qualidadedoar.inea.rj.gov.br/INEAPublico/ConcentrationWithWindArrows/GridData?aParameterKey=18&aSite=70&aStartDate=2024-07-17&aEndDate=2024-07-18&gridId=ConcentrationWithWindArrowsGrid&Context_Bootstrap_Flag=true&_search=false&nd=1779922287021&rows=1500&page=1&sidx=DateTime&sord=asc&ssSearchField=__ANY_COLUMN&ssSearchOper=cn&ssSearchString=&_=1779922235667" \
  -H "accept: application/json, text/javascript, */*; q=0.01" \
  -H "accept-language: pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7" \
  -H "connection: keep-alive" \
  -H "cookie: ASP.NET_SessionId=[REDACTED_SESSION_ID]; publicuser=[REDACTED_PUBLIC_USER_ID]; .ASPXAUTHPUB=[REDACTED_AUTH_TOKEN]; __RequestVerificationToken_L0lORUFQdWJsaWNv0=[REDACTED_CSRF_TOKEN]; lkTimeZone=180,America/Sao_Paulo" \
  -H "host: qualidadedoar.inea.rj.gov.br" \
  -H "referer: https://qualidadedoar.inea.rj.gov.br/INEAPublico/ConcentrationWithWindArrows?aSectionId=Analytics&aLinkId=concentrationWithWindArrows" \
  -H "sec-ch-ua: \"Chromium\";v=\"148\", \"Google Chrome\";v=\"148\", \"Not/A)Brand\";v=\"99\"" \
  -H "sec-ch-ua-mobile: ?0" \
  -H "sec-ch-ua-platform: \"Windows\"" \
  -H "sec-fetch-dest: empty" \
  -H "sec-fetch-mode: cors" \
  -H "sec-fetch-site: same-origin" \
  -H "user-agent: SEMEAR-VR-Abandonada-RadarDoAr/0.1 contato: alexandre.martins@pwa.semear" \
  -H "x-requested-with: XMLHttpRequest"
```

## 3. Headers de Requisição (Request Headers)

*   **Host**: `qualidadedoar.inea.rj.gov.br`
*   **Referer**: `https://qualidadedoar.inea.rj.gov.br/INEAPublico/ConcentrationWithWindArrows?aSectionId=Analytics&aLinkId=concentrationWithWindArrows`
*   **X-Requested-With**: `XMLHttpRequest`
*   **User-Agent**: `SEMEAR-VR-Abandonada-RadarDoAr/0.1 contato: alexandre.martins@pwa.semear` *(Nota: User-Agent modificado para fins de auditoria ética identificável)*
*   **Accept**: `application/json, text/javascript, */*; q=0.01`
*   **Cookie**: `ASP.NET_SessionId=[REDACTED]; publicuser=[REDACTED]; .ASPXAUTHPUB=[REDACTED]; __RequestVerificationToken_L0lORUFQdWJsaWNv0=[REDACTED]; lkTimeZone=180,America/Sao_Paulo`

## 4. Payload / Form Data (Query Parameters)

| Parâmetro | Valor | Descrição |
| :--- | :--- | :--- |
| `aParameterKey` | `18` | ID do Poluente (PM10 nesta interface) |
| `aSite` | `70` | ID da Estação (VR - Retiro) |
| `aStartDate` | `2024-07-17` | Data Inicial (Formato YYYY-MM-DD) |
| `aEndDate` | `2024-07-18` | Data Final (Formato YYYY-MM-DD) |
| `gridId` | `ConcentrationWithWindArrowsGrid` | ID do Grid da Tabela no LkJqGrid |
| `Context_Bootstrap_Flag` | `true` | Parâmetro interno de layout |
| `_search` | `false` | Indica que não há termo de pesquisa ativo no grid |
| `nd` | `1779922287021` | Cache buster (timestamp javascript) |
| `rows` | `1500` | Número de linhas solicitadas por página |
| `page` | `1` | Página de resultados solicitada |
| `sidx` | `DateTime` | Coluna de ordenação principal |
| `sord` | `asc` | Sentido da ordenação (ascendente) |
| `ssSearchField` | `__ANY_COLUMN` | Filtro de pesquisa rápida no grid |
| `ssSearchOper` | `cn` | Operador do filtro de pesquisa |
| `ssSearchString` | `(vazio)` | Valor pesquisado |
| `_` | `1779922235667` | Cache buster de controle do jQuery |

## 5. Preview da Resposta (Response Preview - 2 Primeiros Registros)

```json
{
  "total": 1,
  "page": 1,
  "records": 47,
  "rows": [
    {
      "id": 1,
      "cell": [
        1,
        "",
        "<span data-value='2024-07-17T00:00:00'>17-jul-2024, 00:00:00</span>",
        "Região do Médio Paraíba (RMP)",
        "VR - Retiro",
        "<span data-value='0000000000000025,3023032702340000'>25,30</span>",
        "<span data-value='0000000000000000,9138763855563270'>0,9</span>",
        "<span data-value='0000000000000025,2011762194820000'>25</span>"
      ]
    },
    {
      "id": 2,
      "cell": [
        2,
        "",
        "<span data-value='2024-07-17T01:00:00'>17-jul-2024, 01:00:00</span>",
        "Região do Médio Paraíba (RMP)",
        "VR - Retiro",
        "<span data-value='0000000000000026,7273532878028000'>26,73</span>",
        "<span data-value='0000000000000000,9622050982051430'>1,0</span>",
        "<span data-value='0000000000000081,8526378049364000'>82</span>"
      ]
    }
  ],
  "footer": null,
  "options": {
    "DataActionsVisible": true
  }
}
```
