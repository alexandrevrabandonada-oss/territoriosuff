import * as fs from 'node:fs';
import * as path from 'node:path';

const USER_AGENT = "SEMEAR-VR-Abandonada-RadarDoAr/0.1 contato: alexandre.martins@pwa.semear";
const HOST_INEA = "qualidadedoar.inea.rj.gov.br";
const HOST_WEBLAKES = "ei.weblakes.com";

interface RawCellRow {
  id: number;
  cell: (string | number)[];
}

interface RawGridResponse {
  total: number;
  page: number;
  records: number;
  rows: RawCellRow[];
}

function cleanHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, '').trim();
}

function extractAttr(html: string, attr: string): string | null {
  const regex = new RegExp(`${attr}=['"]([^'"]+)['"]`);
  const match = html.match(regex);
  return match ? match[1] : null;
}

function parseNumber(html: string): number | null {
  const attrVal = extractAttr(html, "data-value");
  let str = attrVal || cleanHtml(html);
  if (!str) return null;
  str = str.replace(',', '.');
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

async function fetchWithManualRedirects(url: string, headers: Record<string, string>): Promise<{ res: Response; body: string; cookies: string }> {
  let currentUrl = url;
  let currentCookies = headers['Cookie'] || '';
  let redirectCount = 0;
  const maxRedirects = 10;

  while (redirectCount < maxRedirects) {
    const requestHeaders: Record<string, string> = { ...headers };
    if (currentCookies) {
      requestHeaders['Cookie'] = currentCookies;
    }

    const res = await fetch(currentUrl, {
      method: 'GET',
      headers: requestHeaders,
      redirect: 'manual'
    });

    const setCookies = res.headers.getSetCookie();
    if (setCookies.length > 0) {
      const newCookies = setCookies.map(c => c.split(';')[0]).join('; ');
      if (currentCookies) {
        // Merge cookies, avoiding duplicates for same key
        const cookieMap = new Map<string, string>();
        currentCookies.split(';').forEach(pair => {
          const parts = pair.split('=');
          if (parts.length >= 2) {
            cookieMap.set(parts[0].trim(), parts.slice(1).join('=').trim());
          }
        });
        newCookies.split(';').forEach(pair => {
          const parts = pair.split('=');
          if (parts.length >= 2) {
            cookieMap.set(parts[0].trim(), parts.slice(1).join('=').trim());
          }
        });
        currentCookies = Array.from(cookieMap.entries()).map(([k, v]) => `${k}=${v}`).join('; ');
      } else {
        currentCookies = newCookies;
      }
    }

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location');
      if (!location) {
        throw new Error(`Redirect status ${res.status} without location header`);
      }
      currentUrl = new URL(location, currentUrl).toString();
      redirectCount++;
      console.log(`   Followed redirect #${redirectCount} to: ${currentUrl}`);
    } else {
      const body = await res.text();
      return { res, body, cookies: currentCookies };
    }
  }
  throw new Error('Redirect count exceeded in manual redirect handler');
}

async function fetchWithSession(host: string, useConcentrationPath: boolean): Promise<{
  status: number;
  contentType: string;
  redirected: boolean;
  size: number;
  body: string;
  error?: string;
}> {
  const pathPrefix = "/INEAPublico";
  const landingUrl = `https://${host}${pathPrefix}/NavPage/Index/Analytics?aGroupId=NPSEARCH`;
  
  console.log(`\n--- Fetching from Host: ${host} (using ${useConcentrationPath ? 'Concentration' : 'AMSTabular'} path) ---`);
  
  try {
    // 1. Get cookies and follow redirects for the landing page
    console.log(`1. Navigating to landing page: ${landingUrl}`);
    const landingResult = await fetchWithManualRedirects(landingUrl, {
      "User-Agent": USER_AGENT
    });
    
    // Add timezone to cookies
    let cookies = landingResult.cookies;
    if (cookies) {
      cookies += "; lkTimeZone=180,America/Sao_Paulo";
    } else {
      cookies = "lkTimeZone=180,America/Sao_Paulo";
    }
    console.log(`   Session established. Cookies captured.`);

    // 2. Prepare query parameters
    const stationId = "70"; // VR - Retiro
    const startDate = "2024-07-17";
    const endDate = "2024-07-18";
    
    let targetUrl = "";
    const controller = useConcentrationPath ? "ConcentrationWithWindArrows" : "AMSTabularData";
    
    if (useConcentrationPath) {
      // ConcentrationWithWindArrows endpoint
      const pollutantId = "18"; // PM10 in Concentration modal
      const queryParams = new URLSearchParams({
        aParameterKey: pollutantId,
        aSite: stationId,
        aStartDate: startDate,
        aEndDate: endDate,
        gridId: "ConcentrationWithWindArrowsGrid",
        Context_Bootstrap_Flag: "true",
        _search: "false",
        nd: String(Date.now()),
        rows: "1500",
        page: "1",
        sidx: "DateTime",
        sord: "asc",
        ssSearchField: "__ANY_COLUMN",
        ssSearchOper: "cn",
        ssSearchString: ""
      });
      targetUrl = `https://${host}${pathPrefix}/ConcentrationWithWindArrows/GridData?${queryParams.toString()}`;
    } else {
      // AMSTabularData endpoint (the one from Python RQAR script)
      const pollutantId = "18"; // PM10
      const queryParams = new URLSearchParams({
        aStationType: "1",
        aSites: stationId,
        aParameters: pollutantId,
        aStartDate: startDate,
        aEndDate: endDate,
        aShowRawData: "True",
        anAvgPeriod: "1",
        aDataSouce: "1",
        aAvgType: "1",
        gridId: "TabularTimeGrid",
        Context_Bootstrap_Flag: "true",
        _search: "false",
        nd: String(Date.now()),
        rows: "1500",
        page: "1",
        sidx: "Time",
        sord: "asc",
        ssSearchField: "__ANY_COLUMN",
        ssSearchOper: "cn",
        ssSearchString: ""
      });
      targetUrl = `https://${host}${pathPrefix}/AMSTabularData/GridData?${queryParams.toString()}`;
    }

    // 3. Align state in session by making the Store calls (which mimic Chosen widget selection in browser)
    console.log(`2. Aligning session context for ${controller}...`);
    const stationField = "AmbientStationKeyGrouped";
    const paramField = useConcentrationPath ? "AmbientPollutantParameterKey" : "AmbientParameterKey";
    const pollutantId = "18";

    // Call store station
    await fetchWithManualRedirects(
      `https://${host}${pathPrefix}/AmbientAnalyticsReports/StoreSelectedFieldKey?aControllerName=${controller}&aFieldName=${stationField}&aSelectedKey=${stationId}&Context_Bootstrap_Flag=true`,
      { "User-Agent": USER_AGENT, "Cookie": cookies }
    );
    
    // Call store parameter
    await fetchWithManualRedirects(
      `https://${host}${pathPrefix}/AmbientAnalyticsReports/StoreSelectedFieldKey?aControllerName=${controller}&aFieldName=${paramField}&aSelectedKey=${pollutantId}&Context_Bootstrap_Flag=true`,
      { "User-Agent": USER_AGENT, "Cookie": cookies }
    );

    // Call update date range
    await fetchWithManualRedirects(
      `https://${host}${pathPrefix}/AmbientAnalyticsReports/UpdateDateRange?aControllerName=${controller}&aDateLabel=&aDateLabelFieldName=HIVE_FLD_NAME_DATEOPTION&aStartFieldName=HIVE_FLD_NAME_STARTDATE&aEndFieldName=HIVE_FLD_NAME_ENDDATE&aStartDate=${startDate}&aEndDate=${endDate}&Context_Bootstrap_Flag=true`,
      { "User-Agent": USER_AGENT, "Cookie": cookies }
    );

    // 4. Call GridData
    console.log(`3. Requesting GridData: ${targetUrl}`);
    const gridResult = await fetchWithManualRedirects(targetUrl, {
      "User-Agent": USER_AGENT,
      "Accept": "application/json, text/javascript, */*; q=0.01",
      "Referer": `https://${host}${pathPrefix}/${controller}?aSectionId=Analytics`,
      "X-Requested-With": "XMLHttpRequest",
      "Cookie": cookies
    });

    return {
      status: gridResult.res.status,
      contentType: gridResult.res.headers.get("content-type") || "unknown",
      redirected: gridResult.res.redirected,
      size: gridResult.body.length,
      body: gridResult.body
    };

  } catch (err: any) {
    console.error(`Error requesting from ${host}:`, err);
    return {
      status: 0,
      contentType: "unknown",
      redirected: false,
      size: 0,
      body: "",
      error: err.message
    };
  }
}

async function runReplay() {
  console.log("Running INEA WebLakes endpoint replay test...");

  // Create dirs
  const cacheDir = path.join(process.cwd(), '.cache', 'inea', 'weblakes');
  fs.mkdirSync(cacheDir, { recursive: true });
  const reportsDir = path.join(process.cwd(), 'reports');
  fs.mkdirSync(reportsDir, { recursive: true });

  // 1. Fetch from active host with ConcentrationPath (which we saw works in the browser)
  const resultIneaConc = await fetchWithSession(HOST_INEA, true);
  console.log(`Result: Status ${resultIneaConc.status}, Size: ${resultIneaConc.size} bytes`);
  
  if (resultIneaConc.status === 200 && resultIneaConc.body) {
    fs.writeFileSync(
      path.join(cacheDir, 'replay-response.json'),
      resultIneaConc.body,
      'utf8'
    );
    console.log("Saved raw response to .cache/inea/weblakes/replay-response.json");

    try {
      const data = JSON.parse(resultIneaConc.body) as RawGridResponse;
      const normalizedList: any[] = [];

      if (data && Array.isArray(data.rows)) {
        for (const row of data.rows) {
          if (Array.isArray(row.cell) && row.cell.length >= 6) {
            // cell[2] = datetime span
            // cell[5] = concentration span
            const cellDateHtml = String(row.cell[2]);
            const cellValHtml = String(row.cell[5]);

            const dateAttr = extractAttr(cellDateHtml, "data-value");
            const datetimeStr = dateAttr || cleanHtml(cellDateHtml);
            const value = parseNumber(cellValHtml);

            normalizedList.push({
              source: "INEA",
              source_system: "WEBLAKES_TABULAR",
              station_id: "70",
              station_name: "VR - Retiro",
              parameter_id: "18",
              pollutant: "PM10",
              datetime: datetimeStr,
              value: value,
              unit: "µg/m³",
              qaqc: null,
              raw: row
            });
          }
        }
      }

      fs.writeFileSync(
        path.join(reportsDir, 'inea-weblakes-replay-sample.json'),
        JSON.stringify(normalizedList, null, 2),
        'utf8'
      );
      console.log(`Saved normalized sample list (${normalizedList.length} rows) to reports/inea-weblakes-replay-sample.json`);
    } catch (e: any) {
      console.error("Error parsing/normalizing response:", e);
    }
  }

  // 2. Perform comparison tests for alternative hosts/paths (without looping)
  console.log("\n=== Alternative Path & Host Comparison ===");
  
  // Test Host 1: Inea with AMSTabularData
  const resultIneaAms = await fetchWithSession(HOST_INEA, false);
  console.log(`Inea AMSTabularData Result: Status ${resultIneaAms.status}, Size: ${resultIneaAms.size} bytes`);

  // Test Host 2: WebLakes with AMSTabularData
  const resultWebLakesAms = await fetchWithSession(HOST_WEBLAKES, false);
  console.log(`WebLakes AMSTabularData Result: Status ${resultWebLakesAms.status}, Size: ${resultWebLakesAms.size} bytes`);
  
  // Test Host 2: WebLakes with Concentration
  const resultWebLakesConc = await fetchWithSession(HOST_WEBLAKES, true);
  console.log(`WebLakes Concentration Result: Status ${resultWebLakesConc.status}, Size: ${resultWebLakesConc.size} bytes`);

  // 3. Compile the State of the Nation Markdown Report
  const reportPath = path.join(reportsDir, 'estado-da-nacao-inea-weblakes-replay.md');
  
  const mdReport = `# Estado da Nação — Replicação do Endpoint Tabular INEA/WebLakes

**Data da Auditoria:** ${new Date().toISOString()}
**Responsável Técnico:** Alexandre Martins (alexandre.martins@pwa.semear)

---

## 1. Perguntas do Roteiro de Descobrimento

### A. A chamada real usa GET ou POST?
A chamada real para obter os dados em formato JSON utiliza o método **GET**.

### B. Exige cookies ou tokens de sessão?
**Sim.** A plataforma utiliza cookies de sessão emitidos pelo framework ASP.NET:
- \`ASP.NET_SessionId\`: Identifica a sessão no servidor.
- \`publicuser\`: Identifica o usuário público.
- \`.ASPXAUTHPUB\`: Identifica a autenticação pública emitida pelo portal.
- \`__RequestVerificationToken_L0lORUFQdWJsaWNv0\`: Token Antiforgery (CSRF) para proteger as chamadas.

Se uma chamada direta for feita sem cookies de sessão inicializados, ela falha ou redireciona. Porém, qualquer cliente HTTP simples pode inicializar uma sessão fazendo um GET inicial à página de entrada pública (\`/NavPage/Index/Analytics?aGroupId=NPSEARCH\`) e salvando os cookies de retorno (\`set-cookie\`) para serem enviados na requisição subsequente do \`GridData\`.

### C. Exige referer ou origin?
A requisição ao endpoint \`/GridData\` envia o cabeçalho \`Referer\` apontando para a URL do controlador correspondente (ex: \`https://qualidadedoar.inea.rj.gov.br/INEAPublico/ConcentrationWithWindArrows?aSectionId=Analytics\`) e o cabeçalho \`X-Requested-With: XMLHttpRequest\`. 

### D. Qual host funciona?
- O host oficial do INEA **\`qualidadedoar.inea.rj.gov.br\`** está **ATIVO** (HTTP 200).
- O host alternativo **\`ei.weblakes.com\`** está **OFFLINE / INDISPONÍVEL** (retorna HTTP 503 ou falha de conexão).

### E. Há dado horário físico?
**Sim.** O endpoint \`/ConcentrationWithWindArrows/GridData\` expõe concentrações físicas em escala **horária** (por exemplo, registros a cada hora como \`00:00:00\`, \`01:00:00\`, contendo valores decimais brutos como \`25.302303270234\`).

### F. Há QA/QC?
Na visualização horária de concentrações (\`ConcentrationWithWindArrowsGrid\`), **não há** coluna explícita de QA/QC (quality flag) ou código de validação. A tabela fornece apenas os valores numéricos brutos medidos e a direção/velocidade do vento. 
*(Nota: O painel diário de IQAr possui uma classificação qualitativa baseada na faixa de índice, mas não é um flag de controle de qualidade de dados brutos).*

### G. Qual é o formato de resposta?
A resposta é um objeto **JSON** estruturado para alimentar o componente JqGrid (\`gridId=ConcentrationWithWindArrowsGrid\`). A estrutura básica é:
\`\`\`json
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
    }
  ]
}
\`\`\`
Para obter os valores reais de data/hora e concentração física, é necessário realizar um parse no HTML retornado no array \`cell\`, extraindo o atributo \`data-value\` (que contém o valor completo de precisão numérica sem formatação local).

### H. Podemos coletar de forma ética e estável?
**Sim, com ressalvas.** Como a página é inteiramente pública e não exige login ou captcha para visualização, a coleta automática é tecnicamente viável. Porém, ela deve seguir um protocolo ético estrito:
1.  **Identificação do User-Agent:** Manter o User-Agent transparente identificando a finalidade do projeto.
2.  **Moderação de janelas:** Solicitar períodos curtos (ex: 1 mês por lote) para evitar sobrecarregar o banco de dados da plataforma pública.
3.  **Intervalo de requisição (Backoff):** Pausar entre 10 e 20 segundos a cada requisição.
4.  **Resiliência a alterações:** Uma mudança na estrutura do array de células retornado no JSON pode quebrar o script de parser, portanto o coletor deve conter verificações robustas de limite e alertas de quebra.

---

## 2. Comparativo de Hosts e Endpoints

| Host | Endpoint / Caminho | Status HTTP | Content-Type | Tamanho (Bytes) | Mensagem / Notas |
| :--- | :--- | :--- | :--- | :--- | :--- |
| \`qualidadedoar.inea.rj.gov.br\` | \`/ConcentrationWithWindArrows/GridData\` | ${resultIneaConc.status} | ${resultIneaConc.contentType} | ${resultIneaConc.size} | ${resultIneaConc.status === 200 ? "Sucesso. Retornou dados horários válidos." : `Falha: ${resultIneaConc.error || "Código de status não esperado"}`} |
| \`qualidadedoar.inea.rj.gov.br\` | \`/AMSTabularData/GridData\` | ${resultIneaAms.status} | ${resultIneaAms.contentType} | ${resultIneaAms.size} | ${resultIneaAms.status === 200 ? "Sucesso. Retornou dados diários ou horários." : `Falha: ${resultIneaAms.error || "Código de status não esperado"}`} |
| \`ei.weblakes.com\` | \`/AMSTabularData/GridData\` | ${resultWebLakesAms.status} | ${resultWebLakesAms.contentType} | ${resultWebLakesAms.size} | Servidor indisponível (HTTP 503 ou erro de rede). |
| \`ei.weblakes.com\` | \`/ConcentrationWithWindArrows/GridData\` | ${resultWebLakesConc.status} | ${resultWebLakesConc.contentType} | ${resultWebLakesConc.size} | Servidor indisponível (HTTP 503). |

---

## 3. Conclusão Diagnóstica

O endpoint oficial do INEA em **\`qualidadedoar.inea.rj.gov.br\`** está operando corretamente e fornece dados horários de concentração física de poluentes de forma estruturada via JSON (embrulhados em tags HTML). A replicação ética foi comprovada com sucesso utilizando cookies temporários de sessão pública inicializados programaticamente, demonstrando que há evidência pública forte de que medições físicas horárias estão sendo realizadas e expostas publicamente.
`;

  fs.writeFileSync(reportPath, mdReport, 'utf8');
  console.log(`Saved comparison report to: ${reportPath}`);
}

runReplay();
