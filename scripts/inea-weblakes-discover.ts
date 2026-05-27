import * as fs from 'node:fs';
import * as path from 'node:path';

const USER_AGENT = "Mozilla/5.0 (compatible; SEMEAR-VR-Abandonada-RadarDoAr/0.1; +contact: alexandrevrabandonada@gmail.com)";
const ENDPOINT_URL = "https://ei.weblakes.com/INEAPublico/AMSTabularData/GridData";

interface RawWebLakesRow {
  id: string;
  cell: string[];
}

interface RawWebLakesResponse {
  page: number;
  total: number;
  records: number;
  rows: RawWebLakesRow[];
}

function cleanHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, '').trim();
}

async function discoverWebLakes() {
  console.log("Starting WebLakes tabular endpoint discovery for Volta Redonda...");

  const stationId = "70"; // VR - Retiro
  const stationName = "VR - Retiro";
  const parameterId = "18"; // PM10
  const pollutant = "PM10";
  const unit = "µg/m³";

  const startDate = "2024-07-17";
  const endDate = "2024-07-18";

  const queryParams = new URLSearchParams({
    aStationType: "1",
    aSites: stationId,
    aParameters: parameterId,
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
    rows: "50",
    page: "1",
    sidx: "Time",
    sord: "asc",
    ssSearchField: "__ANY_COLUMN",
    ssSearchOper: "cn",
    ssSearchString: "",
    _: String(Date.now())
  });

  const requestUrl = `${ENDPOINT_URL}?${queryParams.toString()}`;
  console.log(`Requesting URL: ${requestUrl}`);

  let rawResponseText = "";
  let httpStatus = 0;
  let errorMsg = "";
  let jsonResponse: RawWebLakesResponse | null = null;

  try {
    const res = await fetch(requestUrl, {
      method: "GET",
      headers: {
        "User-Agent": USER_AGENT,
        "Accept": "application/json, text/javascript, */*; q=0.01"
      }
    });

    httpStatus = res.status;
    rawResponseText = await res.text();

    if (res.ok) {
      jsonResponse = JSON.parse(rawResponseText) as RawWebLakesResponse;
      console.log(`WebLakes responded successfully. HTTP ${httpStatus}. Records found: ${jsonResponse.records || 0}`);
    } else {
      console.warn(`WebLakes returned error HTTP ${httpStatus}`);
    }
  } catch (err: any) {
    errorMsg = err.message;
    console.error("Fetch/Parse Error:", err);
  }

  // Ensure directories exist
  const cacheDir = path.join(process.cwd(), '.cache', 'inea', 'weblakes');
  fs.mkdirSync(cacheDir, { recursive: true });
  const reportsDir = path.join(process.cwd(), 'reports');
  fs.mkdirSync(reportsDir, { recursive: true });

  // Save raw response
  const rawCachePath = path.join(cacheDir, 'raw-test-response.json');
  fs.writeFileSync(
    rawCachePath,
    rawResponseText || JSON.stringify({ error: errorMsg, status: httpStatus }),
    'utf8'
  );
  console.log(`Saved raw cache to: ${rawCachePath}`);

  // Normalise sample if successful
  const normalizedSamples: any[] = [];

  if (jsonResponse && Array.isArray(jsonResponse.rows)) {
    for (const row of jsonResponse.rows) {
      if (Array.isArray(row.cell) && row.cell.length >= 5) {
        const rawDatetime = row.cell[2];
        const rawValue = row.cell[3];
        const qaqc = row.cell[4];

        const datetimeCleaned = cleanHtml(rawDatetime);
        const valueCleanedStr = cleanHtml(rawValue);
        const valueCleaned = valueCleanedStr === "" ? null : parseFloat(valueCleanedStr);

        normalizedSamples.push({
          source: "INEA",
          source_system: "WEBLAKES_TABULAR",
          station_id: stationId,
          station_name: stationName,
          parameter_id: parameterId,
          pollutant: pollutant,
          datetime: datetimeCleaned,
          value: valueCleaned,
          unit: unit,
          qaqc: qaqc,
          raw: row
        });
      }
    }
  }

  const samplePath = path.join(reportsDir, 'inea-weblakes-sample.json');
  fs.writeFileSync(samplePath, JSON.stringify(normalizedSamples, null, 2), 'utf8');
  console.log(`Saved normalized sample to: ${samplePath}`);

  // Generate Report
  const mdPath = path.join(reportsDir, 'estado-da-nacao-inea-weblakes-discovery.md');
  const hasRows = normalizedSamples.length > 0;
  const sampleDataText = hasRows
    ? JSON.stringify(normalizedSamples.slice(0, 3), null, 2)
    : "[]";

  const mdContent = `# Relatório de Descoberta Ética — Endpoint Tabular INEA/WebLakes

**Data/Hora do Teste:** ${new Date().toISOString()}  
**Status do Endpoint:** ${httpStatus === 200 ? "ATIVO (HTTP 200)" : `FALHA (HTTP ${httpStatus})`}  
**Estação Testada:** ${stationName} (ID: ${stationId})  
**Poluente Testado:** ${pollutant} (ID: ${parameterId})  
**Período:** ${startDate} a ${endDate}

---

## 1. Resultados da Requisição

- **Endpoint respondeu?** ${httpStatus === 200 ? "Sim" : "Não"}
- **Retornou JSON?** ${jsonResponse ? "Sim" : "Não"}
- **Campos do JSON bruto:** ${jsonResponse ? Object.keys(jsonResponse).join(", ") : "Nenhum"}
- **Quantidade total de registros retornados:** ${jsonResponse ? jsonResponse.records : 0}
- **Há valor físico de concentração?** ${hasRows ? "Sim, extraído das células de dados brutas" : "Não há dados na amostra ou houve falha no retorno"}
- **Há sinalizador de qualidade (QA/QC)?** ${hasRows ? "Sim, extraído da célula de validação" : "Não"}

---

## 2. Amostra Normalizada (Primeiros Registros)

\`\`\`json
${sampleDataText}
\`\`\`

---

## 3. Parâmetros e Estações Identificadas (Mapeamento de Scripts)

Através do cruzamento com scripts acadêmicos públicos da UFSC/LCQAr, mapeamos os seguintes códigos e identificadores operacionais no sistema WebLakes:

### A. Poluentes Monitorados (Parâmetros)
- **PM10:** ID \`18\`
- **PM2.5:** ID \`20\`
- **SO2:** ID \`23\`
- **NO2:** ID \`1465\`
- **O3:** ID \`2130\`
- **CO:** ID \`3\`
- **PTS:** ID \`1955\`

### B. Estações de Volta Redonda (Sites)
- **VR - Belmonte:** ID \`69\`
- **VR - Retiro:** ID \`70\`
- **VR - Santa Cecília:** ID \`71\`
- **VR - Meteorológica Ilha das Águas Cruas:** ID \`72\`

---

## 4. Análise de Riscos e Limites de Coleta (Roteiro Ético)

### A. Limite de Período Seguro para Coleta
Para evitar sobrecarregar o servidor do INEA/WebLakes, qualquer extração de dados deve seguir regras estritas:
1.  **Janelas de tempo pequenas:** Realizar chamadas em lote de no máximo 1 ano (ou preferencialmente 1 mês) por requisição para manter o payload pequeno.
2.  **Pausas (Backoff):** Aguardar pelo menos 10 a 20 segundos entre cada chamada de API, exatamente como faz o scraper do laboratório da UFSC.
3.  **Caching local:** Evitar refazer requisições de períodos que já foram baixados e persistidos localmente.

### B. Riscos Técnicos e Jurídicos
- **Mudança de Layout/Endpoint:** Como se trata de um endpoint do sistema WebLakes integrado, alterações na plataforma podem quebrar a extração, pois os dados vêm estruturados dentro de células de tabela HTML representadas como strings de array.
- **Rate-Limiting e Bloqueios:** O servidor pode banir o IP do cliente se detectar scraping rápido e agressivo. Por isso, a identificação do User-Agent do Projeto SEMEAR é indispensável para transparência ética.
- **Ressalvas Legais:** Os dados obtidos por este endpoint são de natureza provisória ou validada preliminarmente pelo órgão, e não substituem relatórios oficiais consolidados.
`;

  fs.writeFileSync(mdPath, mdContent, 'utf8');
  console.log(`Saved discovery report to: ${mdPath}`);
}

void discoverWebLakes();
