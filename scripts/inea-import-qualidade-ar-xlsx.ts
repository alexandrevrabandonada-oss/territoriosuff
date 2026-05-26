import * as fs from 'node:fs';
import * as path from 'node:path';
import * as XLSXModule from 'xlsx';
const XLSX = (XLSXModule as any).readFile ? XLSXModule : ((XLSXModule as any).default || XLSXModule);


const USER_AGENT = "VR-Abandonada-SEMEAR/0.1 contato: alexandrevrabandonada@gmail.com";
const XLSX_URL = "https://dadosabertos.rj.gov.br/dataset/fc10bd4a-3cc6-4bd6-9ed7-0fcfde297fa0/resource/21557b65-3f33-4a17-9d7f-daa7ba82af78/download/qualidade_ar.xlsx";
const CACHE_DIR = path.join(process.cwd(), '.cache', 'inea');
const CACHE_FILE = path.join(CACHE_DIR, 'qualidade_ar.xlsx');

interface CanonicalMeasurement {
  source: "INEA";
  source_system: "CKAN_XLSX" | "SIGQAR";
  station_external_id: string | null;
  station_name: string;
  city: "Volta Redonda";
  neighborhood: string | null;
  lat: number | null;
  lng: number | null;
  measured_at: string;
  
  metric_type: "POLLUTANT_CONCENTRATION" | "POLLUTANT_SUBINDEX" | "GENERAL_AQI";
  pollutant: "PM10" | "PM25" | "SO2" | "NO2" | "O3" | "CO" | null;
  value: number;
  unit: string | null;
  
  air_quality_index: number | null;
  air_quality_classification: string | null;
  controlling_pollutant: string | null;
  
  raw_column: string;
  averaging_period: string | null;
  quality_flag: string | null;
  raw: any;
}


// Guess column mappings based on headers
function detectColumns(headers: string[]) {
  const mapping: { [key: string]: string } = {};

  const regexMap: { [key: string]: RegExp } = {
    station: /estacao|estação|estac|station|code_estacao|nome_estacao/i,
    city: /municipio|município|cidade|city|localidade/i,
    datetime: /data|hora|datetime|date|time|measured|periodo|period/i,
    pollutant: /poluente|parametro|parâmetro|pollutant|parameter|sigla/i,
    value: /valor|concentracao|concentração|medicao|medição|value|num_valor/i,
    unit: /unidade|unit|medida|unid/i,
    quality: /status|qualidade|validacao|validação|flag|valida/i,
    neighborhood: /bairro|neighborhood|regiao|região/i,
    lat: /lat|latitude/i,
    lng: /lng|longitude|lon|long/i
  };

  for (const key in regexMap) {
    const rx = regexMap[key];
    const match = headers.find(h => rx.test(h));
    if (match) {
      mapping[key] = match;
    }
  }

  return mapping;
}

export async function importXlsx(forceDownload = false): Promise<CanonicalMeasurement[]> {
  console.log("Starting INEA XLSX Import process...");

  // 1. Ensure cache directory exists
  fs.mkdirSync(CACHE_DIR, { recursive: true });

  // 2. Download file if not exists in cache or forceDownload is true
  if (!fs.existsSync(CACHE_FILE) || forceDownload) {
    console.log(`Downloading XLSX from ${XLSX_URL}...`);
    const response = await fetch(XLSX_URL, {
      headers: { "User-Agent": USER_AGENT }
    });

    if (!response.ok) {
      throw new Error(`Failed to download XLSX file. Status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(CACHE_FILE, buffer);
    console.log(`Saved file to cache at ${CACHE_FILE} (${buffer.length} bytes)`);
  } else {
    console.log(`Using cached XLSX file from ${CACHE_FILE}`);
  }

  // 3. Read XLSX file
  console.log("Reading XLSX file with sheetjs...");
  const workbook = XLSX.readFile(CACHE_FILE);
  const sheetNames = workbook.SheetNames;
  console.log(`Found Sheets: ${sheetNames.join(", ")}`);

  const canonicalData: CanonicalMeasurement[] = [];
  const stats = {
    totalLinesRead: 0,
    vrLines: 0,
    stationsFound: new Set<string>(),
    pollutantsFound: new Set<string>(),
    minDate: "",
    maxDate: ""
  };

  // Process first sheet
  const firstSheetName = sheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  
  // Convert sheet to JSON array of objects
  const rawRows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: null });
  stats.totalLinesRead = rawRows.length;
  console.log(`Read ${rawRows.length} rows from sheet "${firstSheetName}".`);

  let colMapping: { [key: string]: string } = {};

  if (rawRows.length > 0) {
    const headers = Object.keys(rawRows[0]);
    console.log("Detected Headers:", headers);
    colMapping = detectColumns(headers);
    console.log("Guessed Column Mappings:", colMapping);

    // Fallback defaults if columns are missing
    const colStation = colMapping.station || headers.find(h => h.toLowerCase().includes("estac"));
    const colCity = colMapping.city || headers.find(h => h.toLowerCase().includes("munic"));
    const colDatetime = colMapping.datetime || headers.find(h => h.toLowerCase().includes("data"));
    const colNeighborhood = colMapping.neighborhood;
    const colLat = colMapping.lat;
    const colLng = colMapping.lng;

    const pollutantCols = [
      { col: 'IQA MP10', poll: 'PM10' },
      { col: 'IQA MP2,5', poll: 'PM25' },
      { col: 'IQA SO2', poll: 'SO2' },
      { col: 'IQA NO2', poll: 'NO2' },
      { col: 'IQA O3', poll: 'O3' },
      { col: 'IQA CO', poll: 'CO' },
      { col: 'Índice IQAr', poll: 'IQAr' }
    ];

    for (const row of rawRows) {
      const cityVal = colCity ? String(row[colCity] || "") : "";
      
      // We filter for "Volta Redonda"
      const isVoltaRedonda = cityVal.trim().toLowerCase() === "volta redonda";

      if (isVoltaRedonda) {
        stats.vrLines++;

        const stationName = colStation ? String(row[colStation] || "Estação Desconhecida") : "Desconhecida";
        const rawDate = colDatetime ? row[colDatetime] : null;
        
        // Parse date. Excel dates can be serialized as serial numbers.
        let parsedDateStr = "";
        if (typeof rawDate === "number") {
          // Convert Excel serial date to JS Date
          const date = XLSX.SSF.parse_date_code(rawDate);
          const jsDate = new Date(date.y, date.m - 1, date.d, date.H, date.M, date.S);
          parsedDateStr = jsDate.toISOString();
        } else if (rawDate) {
          const dateParts = String(rawDate).split(/[/\s:-]/);
          // Try to handle standard dd/mm/yyyy hh:mm format common in Brazil
          if (String(rawDate).includes("/")) {
            // Assume format DD/MM/YYYY [HH:MM]
            const day = parseInt(dateParts[0], 10);
            const month = parseInt(dateParts[1], 10) - 1;
            const year = parseInt(dateParts[2], 10);
            const hour = dateParts[3] ? parseInt(dateParts[3], 10) : 0;
            const minute = dateParts[4] ? parseInt(dateParts[4], 10) : 0;
            const second = dateParts[5] ? parseInt(dateParts[5], 10) : 0;
            const d = new Date(year, month, day, hour, minute, second);
            parsedDateStr = d.toISOString();
          } else {
            parsedDateStr = new Date(String(rawDate)).toISOString();
          }
        }

        if (!parsedDateStr || isNaN(Date.parse(parsedDateStr))) {
          // Skip rows with invalid date
          continue;
        }

        if (!stats.minDate || parsedDateStr < stats.minDate) stats.minDate = parsedDateStr;
        if (!stats.maxDate || parsedDateStr > stats.maxDate) stats.maxDate = parsedDateStr;

        stats.stationsFound.add(stationName);

        const excelClassification = row['Classificação'] ? String(row['Classificação']).trim() : null;

        // 1. Pivot Pollutant Subindices
        for (const p of pollutantCols) {
          // Skip general index here, process below
          if (p.poll === 'IQAr') continue;

          const rawVal = row[p.col];
          if (rawVal === null || rawVal === undefined || String(rawVal).trim() === "" || String(rawVal).trim() === "-") {
            continue;
          }

          let numericValue: number;
          if (typeof rawVal === "number") {
            numericValue = rawVal;
          } else {
            numericValue = parseFloat(String(rawVal).replace(",", "."));
          }

          if (isNaN(numericValue)) {
            continue;
          }

          stats.pollutantsFound.add(p.poll);

          const canonical: CanonicalMeasurement = {
            source: "INEA",
            source_system: "CKAN_XLSX",
            station_external_id: null,
            station_name: stationName,
            city: "Volta Redonda",
            neighborhood: colNeighborhood ? String(row[colNeighborhood] || "") : null,
            lat: colLat ? parseFloat(String(row[colLat] || "")) || null : null,
            lng: colLng ? parseFloat(String(row[colLng] || "")) || null : null,
            measured_at: parsedDateStr,
            
            metric_type: "POLLUTANT_SUBINDEX",
            pollutant: p.poll as any,
            value: numericValue,
            unit: null, // Subindices are dimensionless

            air_quality_index: null,
            air_quality_classification: excelClassification,
            controlling_pollutant: null,

            raw_column: p.col,
            averaging_period: "1h",
            quality_flag: "OK",
            raw: row
          };

          canonicalData.push(canonical);
        }

        // 2. Pivot General AQI (Índice IQAr)
        const aqiCol = 'Índice IQAr';
        const rawAqiVal = row[aqiCol];
        if (rawAqiVal !== null && rawAqiVal !== undefined && String(rawAqiVal).trim() !== "" && String(rawAqiVal).trim() !== "-") {
          let aqiValue: number;
          if (typeof rawAqiVal === "number") {
            aqiValue = rawAqiVal;
          } else {
            aqiValue = parseFloat(String(rawAqiVal).replace(",", "."));
          }

          if (!isNaN(aqiValue)) {
            const controllingPoll = row['Controlador'] ? String(row['Controlador']) : null;

            const canonical: CanonicalMeasurement = {
              source: "INEA",
              source_system: "CKAN_XLSX",
              station_external_id: null,
              station_name: stationName,
              city: "Volta Redonda",
              neighborhood: colNeighborhood ? String(row[colNeighborhood] || "") : null,
              lat: colLat ? parseFloat(String(row[colLat] || "")) || null : null,
              lng: colLng ? parseFloat(String(row[colLng] || "")) || null : null,
              measured_at: parsedDateStr,
              
              metric_type: "GENERAL_AQI",
              pollutant: null,
              value: aqiValue,
              unit: null, // AQI is dimensionless

              air_quality_index: aqiValue,
              air_quality_classification: excelClassification,
              controlling_pollutant: controllingPoll,

              raw_column: aqiCol,
              averaging_period: "1h",
              quality_flag: "OK",
              raw: row
            };

            canonicalData.push(canonical);
          }
        }
      }
    }
  }

  // Ensure reports folder exists
  fs.mkdirSync(path.join(process.cwd(), 'reports'), { recursive: true });

  // 4. Save sample file
  const samplePath = path.join(process.cwd(), 'reports', 'inea-vr-sample.json');
  fs.writeFileSync(samplePath, JSON.stringify(canonicalData.slice(0, 100), null, 2), 'utf8');
  console.log(`Saved sample data to ${samplePath}`);

  // 5. Generate Markdown Report
  const mdPath = path.join(process.cwd(), 'reports', 'estado-da-nacao-inea-import-xlsx.md');
  const mdContent = `# Estado da Nação — INEA Import XLSX Report

**Data/Hora do Processamento:** ${new Date().toISOString()}
**Fonte URL:** ${XLSX_URL}
**Arquivo Cache Local:** \`${CACHE_FILE}\`

## Resumo Executivo
Processamento e normalização do arquivo oficial de monitoramento de qualidade do ar do INEA, filtrando especificamente para o município de Volta Redonda-RJ.

## Estatísticas da Ingestão
- **Total de linhas lidas no XLSX:** ${stats.totalLinesRead}
- **Linhas encontradas para Volta Redonda:** ${stats.vrLines}
- **Estações identificadas em Volta Redonda (${stats.stationsFound.size}):**
${Array.from(stats.stationsFound).map(s => `  - \`${s}\``).join('\n')}
- **Poluentes identificados em Volta Redonda (${stats.pollutantsFound.size}):**
${Array.from(stats.pollutantsFound).map(p => `  - \`${p}\``).join('\n')}
- **Intervalo temporal dos dados:**
  - **Data inicial:** \`${stats.minDate}\`
  - **Data final:** \`${stats.maxDate}\`

## Detecção de Colunas do Excel
O mapeamento automático de colunas identificou os seguintes campos:
- **Estação:** \`${colMapping.station || 'Não mapeado'}\`
- **Município:** \`${colMapping.city || 'Não mapeado'}\`
- **Data/Hora:** \`${colMapping.datetime || 'Não mapeado'}\`
- **Poluente:** \`${colMapping.pollutant || 'Não mapeado'}\`
- **Valor:** \`${colMapping.value || 'Não mapeado'}\`
- **Unidade:** \`${colMapping.unit || 'Não mapeado'}\`
- **Qualidade/Status:** \`${colMapping.quality || 'Não mapeado'}\`

## Próximos Passos
O próximo passo consiste em executar o script de persistência (\`npm run inea:ingest\`) para inserir/atualizar estas estações e medições no banco de dados Supabase de forma incremental.
`;

  fs.writeFileSync(mdPath, mdContent, 'utf8');
  console.log(`Saved import Markdown report to ${mdPath}`);

  return canonicalData;
}

// Only run automatically if executed directly
if (process.argv[1] && (process.argv[1].endsWith('inea-import-qualidade-ar-xlsx.ts') || process.argv[1].endsWith('inea-import-qualidade-ar-xlsx.js'))) {
  void importXlsx().catch(err => {
    console.error("Critical error in import process:", err);
    process.exit(1);
  });
}
