import * as fs from 'node:fs';
import * as path from 'node:path';
import { fetchWebLakesDataSafe, normalizeConcentrationRow } from '../src/lib/inea/weblakesClient';
import { SITES, PARAMETERS } from '../src/lib/inea/weblakesDictionary';

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

interface WindowCheckResult {
  windowIndex: number;
  startDate: string;
  endDate: string;
  status: 'SUCCESS' | 'EMPTY' | 'ERROR';
  recordsCount: number;
  unit: string;
  min: number | null;
  max: number | null;
  zeros: number;
  hasWind: boolean;
  parserOk: boolean;
  errorMsg?: string;
}

interface MatrixEntry {
  station_id: string;
  station_name: string;
  parameter_id: string;
  pollutant: string;
  year: number;
  sampled_windows: number;
  windows_with_data: number;
  estimated_availability: 'AVAILABLE' | 'LIKELY_AVAILABLE' | 'PARTIAL' | 'EMPTY' | 'ERROR' | 'UNIT_REVIEW' | 'PARSER_REVIEW';
  unit_detected: string;
  parser_status: 'OK' | 'FAILED' | 'REVIEW';
  min_sample_value: number | null;
  max_sample_value: number | null;
  zeros_count: number;
  notes: string;
}

// 4 amostradores curtos de 3 dias por ano
const SAMPLES = [
  { label: 'Jan', start: '01-01', end: '01-03' },
  { label: 'Apr', start: '04-01', end: '04-03' },
  { label: 'Jul', start: '07-01', end: '07-03' },
  { label: 'Sep', start: '09-01', end: '09-03' }
];

async function checkSampleWindow(
  stationId: string,
  parameterId: string,
  year: number,
  windowIdx: number,
  sample: typeof SAMPLES[0]
): Promise<WindowCheckResult> {
  const startDate = `${year}-${sample.start}`;
  const endDate = `${year}-${sample.end}`;

  const cacheDir = path.join(process.cwd(), '.cache', 'inea', 'weblakes', 'availability', stationId, parameterId);
  fs.mkdirSync(cacheDir, { recursive: true });
  const cacheFile = path.join(cacheDir, `${year}_w${windowIdx}.json`);

  // 1. Read from cache if it exists
  if (fs.existsSync(cacheFile)) {
    try {
      const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      return cached;
    } catch {
      console.warn(`  [Warning] Failed to parse cache file ${cacheFile}. Fetching from network...`);
    }
  }

  // 2. Fetch from network
  console.log(`  [Fetch] Station: ${stationId}, Param: ${parameterId}, Window: ${startDate} to ${endDate}`);
  try {
    const rawRows = await fetchWebLakesDataSafe("qualidadedoar.inea.rj.gov.br", {
      stationId,
      parameterId,
      startDate,
      endDate
    });

    if (!rawRows || rawRows.length === 0) {
      const emptyRes: WindowCheckResult = {
        windowIndex: windowIdx,
        startDate,
        endDate,
        status: 'EMPTY',
        recordsCount: 0,
        unit: 'N/A',
        min: null,
        max: null,
        zeros: 0,
        hasWind: false,
        parserOk: true
      };
      fs.writeFileSync(cacheFile, JSON.stringify(emptyRes, null, 2), 'utf8');
      return emptyRes;
    }

    // Process and normalize rows to check content
    let min = null;
    let max = null;
    let zeros = 0;
    let hasWind = false;
    let parserOk = true;
    let unit = 'N/A';
    let validRecords = 0;

    for (const r of rawRows) {
      try {
        const norm = normalizeConcentrationRow(r, {
          stationId,
          parameterId,
          startDate,
          endDate
        });

        unit = norm.unit;
        if (norm.value !== null) {
          validRecords++;
          if (min === null || norm.value < min) min = norm.value;
          if (max === null || norm.value > max) max = norm.value;
          if (norm.value === 0) zeros++;
        }
        if (norm.wind_speed !== null || norm.wind_direction !== null) {
          hasWind = true;
        }
      } catch (err: any) {
        console.warn(`  [Parser Error] Row parsing failed: ${err.message || err}`);
        parserOk = false;
      }
    }

    const successRes: WindowCheckResult = {
      windowIndex: windowIdx,
      startDate,
      endDate,
      status: validRecords > 0 ? 'SUCCESS' : 'EMPTY',
      recordsCount: validRecords,
      unit,
      min,
      max,
      zeros,
      hasWind,
      parserOk
    };

    fs.writeFileSync(cacheFile, JSON.stringify(successRes, null, 2), 'utf8');
    return successRes;

  } catch (err: any) {
    console.error(`  [Network Error] Fetch failed for ${startDate} to ${endDate}: ${err.message || err}`);
    
    // Save error in cache to avoid aggressive retries
    const errorRes: WindowCheckResult = {
      windowIndex: windowIdx,
      startDate,
      endDate,
      status: 'ERROR',
      recordsCount: 0,
      unit: 'N/A',
      min: null,
      max: null,
      zeros: 0,
      hasWind: false,
      parserOk: false,
      errorMsg: err.message || String(err)
    };

    fs.writeFileSync(cacheFile, JSON.stringify(errorRes, null, 2), 'utf8');
    return errorRes;
  }
}

async function run() {
  // Set execution environment
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  process.env.WEBLAKES_COLLECTION_MODE = "monthly_fast";

  const years = [
    2026, 2025, 2024, 2023, 2022, 2021, 2020,
    2019, 2018, 2017, 2016, 2015, 2014, 2013
  ];

  const stations = Object.keys(SITES);
  const parameters = Object.keys(PARAMETERS);

  console.log(`Starting Availability Matrix Discovery...`);
  console.log(`Stations count: ${stations.length}`);
  console.log(`Parameters count: ${parameters.length}`);
  console.log(`Years count: ${years.length}`);
  console.log(`-----------------------------------------------`);

  const matrix: MatrixEntry[] = [];
  const currentYear = 2026;
  const currentMonth = 5; // May

  for (const stationId of stations) {
    const stationName = SITES[stationId].name;

    for (const parameterId of parameters) {
      const pollInfo = PARAMETERS[parameterId];
      const expectedUnit = pollInfo.unit;

      for (const year of years) {
        console.log(`Checking Station ${stationId} (${stationName}) - Parameter ${parameterId} (${pollInfo.pollutant}) - Year ${year}...`);

        const results: WindowCheckResult[] = [];

        for (let idx = 0; idx < SAMPLES.length; idx++) {
          const sample = SAMPLES[idx];
          const sampleMonth = parseInt(sample.start.split('-')[0], 10);

          // 2026 parcial check: skip future samples
          if (year === currentYear && sampleMonth > currentMonth) {
            continue;
          }

          const res = await checkSampleWindow(stationId, parameterId, year, idx, sample);
          results.push(res);

          // Rate-limiting delay for network calls (only if not loaded from cache)
          const cacheDir = path.join(process.cwd(), '.cache', 'inea', 'weblakes', 'availability', stationId, parameterId);
          const cacheFile = path.join(cacheDir, `${year}_w${idx}.json`);
          if (!fs.existsSync(cacheFile)) {
            const delayTime = 3000 + Math.floor(Math.random() * 2000); // 3s to 5s
            await delay(delayTime);
          }
        }

        // Aggregate results
        const totalWindows = results.length;
        const successWindows = results.filter(r => r.status === 'SUCCESS').length;
        const errorWindows = results.filter(r => r.status === 'ERROR').length;

        let unitDetected = 'N/A';
        const successfulResults = results.filter(r => r.status === 'SUCCESS');
        if (successfulResults.length > 0) {
          unitDetected = successfulResults[0].unit;
        }

        const validMins = successfulResults.map(r => r.min).filter((v): v is number => v !== null);
        const validMaxs = successfulResults.map(r => r.max).filter((v): v is number => v !== null);
        const totalZeros = successfulResults.reduce((sum, r) => sum + r.zeros, 0);

        const minSampleValue = validMins.length > 0 ? Math.min(...validMins) : null;
        const maxSampleValue = validMaxs.length > 0 ? Math.max(...validMaxs) : null;

        let estimatedAvailability: MatrixEntry['estimated_availability'];
        let parserStatus: MatrixEntry['parser_status'] = 'OK';
        let notes: string;

        // Determine parser status
        const hasParserError = results.some(r => !r.parserOk);
        if (hasParserError) {
          parserStatus = 'REVIEW';
        }

        // Determine estimated availability
        if (errorWindows === totalWindows) {
          estimatedAvailability = 'ERROR';
          notes = 'Todos os testes amostrais falharam com erros na plataforma.';
        } else if (successWindows === totalWindows) {
          estimatedAvailability = 'AVAILABLE';
          notes = 'Todas as janelas amostradas retornaram dados físicos horários.';
        } else if (successWindows > 0) {
          estimatedAvailability = 'LIKELY_AVAILABLE';
          notes = `Disponibilidade provável. Retornou dados em ${successWindows}/${totalWindows} janelas amostradas.`;
        } else if (errorWindows > 0 && successWindows === 0) {
          estimatedAvailability = 'ERROR';
          notes = `Falha de plataforma. Erros detectados em ${errorWindows}/${totalWindows} janelas.`;
        } else {
          estimatedAvailability = 'EMPTY';
          notes = 'Janelas amostradas responderam com sucesso, mas retornaram conjuntos vazios de dados.';
        }

        // Check for unit review
        if (unitDetected !== 'N/A' && unitDetected !== expectedUnit) {
          estimatedAvailability = 'UNIT_REVIEW';
          notes = `Alerta de Unidade: Detectado "${unitDetected}" mas o esperado era "${expectedUnit}".`;
        }

        if (parserStatus === 'REVIEW' && estimatedAvailability !== 'ERROR') {
          estimatedAvailability = 'PARSER_REVIEW';
          notes = 'Erro de parsing nos dados retornados pela plataforma WebLakes.';
        }

        matrix.push({
          station_id: stationId,
          station_name: SITES[stationId].shortName,
          parameter_id: parameterId,
          pollutant: pollInfo.pollutant,
          year,
          sampled_windows: totalWindows,
          windows_with_data: successWindows,
          estimated_availability: estimatedAvailability,
          unit_detected: unitDetected,
          parser_status: parserStatus,
          min_sample_value: minSampleValue,
          max_sample_value: maxSampleValue,
          zeros_count: totalZeros,
          notes
        });
      }
    }
  }

  // Save compiled matrix file
  const outDir = path.join(process.cwd(), 'data', 'air');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'availability-matrix.json');
  fs.writeFileSync(outFile, JSON.stringify(matrix, null, 2), 'utf8');

  console.log(`-----------------------------------------------`);
  console.log(`Availability Matrix compilation complete!`);
  console.log(`Total entries generated: ${matrix.length}`);
  console.log(`Saved output to: ${outFile}`);
}

run().catch(console.error);
