import * as fs from 'node:fs';
import * as path from 'node:path';
import { fetchWebLakesDataSafe, normalizeConcentrationRow } from '../src/lib/inea/weblakesClient';
import { PARAMETERS, SITES } from '../src/lib/inea/weblakesDictionary';

type AvailabilityStatus = 'AVAILABLE' | 'LIKELY_AVAILABLE' | 'EMPTY' | 'ERROR' | 'UNIT_REVIEW' | 'PARSER_REVIEW';

interface SampleWindow {
  label: string;
  start: string;
  end: string;
}

interface CliConfig {
  stations: string[];
  parameters: string[];
  years: number[];
  samples: SampleWindow[];
  outFile: string;
  useCache: boolean;
}

interface WindowCheckResult {
  windowIndex: number;
  label: string;
  startDate: string;
  endDate: string;
  status: 'SUCCESS' | 'EMPTY' | 'ERROR';
  recordsCount: number;
  unit: string;
  min: number | null;
  max: number | null;
  mean: number | null;
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
  estimated_availability: AvailabilityStatus;
  unit_detected: string;
  parser_status: 'OK' | 'REVIEW';
  min_sample_value: number | null;
  max_sample_value: number | null;
  mean_sample_value: number | null;
  zeros_count: number;
  window_results: WindowCheckResult[];
  notes: string;
}

const DEFAULT_SAMPLES: Record<string, SampleWindow> = {
  jan: { label: 'Jan', start: '01-01', end: '01-03' },
  apr: { label: 'Apr', start: '04-01', end: '04-03' },
  jul: { label: 'Jul', start: '07-01', end: '07-03' },
  sep: { label: 'Sep', start: '09-01', end: '09-03' }
};

const POLLUTANT_TO_PARAMETER = Object.fromEntries(
  Object.values(PARAMETERS).map((parameter) => [parameter.pollutant.toUpperCase(), parameter.id])
);

function parseArgs(): CliConfig {
  const args = process.argv.slice(2);
  const getArg = (name: string, fallback: string) => {
    const prefix = `--${name}=`;
    const found = args.find((arg) => arg.startsWith(prefix));
    return found ? found.slice(prefix.length) : fallback;
  };

  const stations = getArg('stations', '69,70,71')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const parameters = getArg('pollutants', 'PM10,PTS,O3')
    .split(',')
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean)
    .map((pollutant) => {
      const id = POLLUTANT_TO_PARAMETER[pollutant] || pollutant;
      if (!PARAMETERS[id]) {
        throw new Error(`Unknown pollutant or parameter id: ${pollutant}`);
      }
      return id;
    });

  const yearsArg = getArg('years', '2013:2015');
  const years = parseYears(yearsArg);

  const samples = getArg('samples', 'jan,apr,jul,sep')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .map((key) => {
      const sample = DEFAULT_SAMPLES[key];
      if (!sample) {
        throw new Error(`Unknown sample "${key}". Valid samples: ${Object.keys(DEFAULT_SAMPLES).join(', ')}`);
      }
      return sample;
    });

  const outFile = getArg(
    'out',
    'reports/open-data-preview/availability-2013-2015-pm10-pts-o3.json'
  );

  const useCache = getArg('cache', 'true') !== 'false';

  return { stations, parameters, years, samples, outFile, useCache };
}

function parseYears(value: string): number[] {
  if (value.includes(':')) {
    const [startRaw, endRaw] = value.split(':');
    const start = Number(startRaw);
    const end = Number(endRaw);
    if (!Number.isInteger(start) || !Number.isInteger(end) || start > end) {
      throw new Error(`Invalid years range: ${value}`);
    }
    return Array.from({ length: end - start + 1 }, (_, idx) => start + idx);
  }

  return value
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((year) => Number.isInteger(year));
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkSampleWindow(
  stationId: string,
  parameterId: string,
  year: number,
  windowIdx: number,
  sample: SampleWindow,
  useCache: boolean
): Promise<WindowCheckResult> {
  const startDate = `${year}-${sample.start}`;
  const endDate = `${year}-${sample.end}`;
  const cacheDir = path.join(process.cwd(), '.cache', 'inea', 'weblakes', 'availability-scope', stationId, parameterId);
  const cacheFile = path.join(cacheDir, `${year}_${sample.label.toLowerCase()}.json`);

  fs.mkdirSync(cacheDir, { recursive: true });

  if (useCache && fs.existsSync(cacheFile)) {
    return JSON.parse(fs.readFileSync(cacheFile, 'utf8')) as WindowCheckResult;
  }

  console.log(`[Scope] Fetching station=${stationId} parameter=${parameterId} window=${startDate}:${endDate}`);

  try {
    const rawRows = await fetchWebLakesDataSafe('qualidadedoar.inea.rj.gov.br', {
      stationId,
      parameterId,
      startDate,
      endDate
    });

    if (!rawRows.length) {
      const result: WindowCheckResult = {
        windowIndex: windowIdx,
        label: sample.label,
        startDate,
        endDate,
        status: 'EMPTY',
        recordsCount: 0,
        unit: 'N/A',
        min: null,
        max: null,
        mean: null,
        zeros: 0,
        hasWind: false,
        parserOk: true
      };
      fs.writeFileSync(cacheFile, JSON.stringify(result, null, 2), 'utf8');
      return result;
    }

    const values: number[] = [];
    let unit = 'N/A';
    let zeros = 0;
    let hasWind = false;
    let parserOk = true;

    for (const row of rawRows) {
      try {
        const normalized = normalizeConcentrationRow(row, {
          stationId,
          parameterId,
          startDate,
          endDate
        });
        unit = normalized.unit;
        if (normalized.value !== null) {
          values.push(normalized.value);
          if (normalized.value === 0) zeros++;
        }
        if (normalized.wind_speed !== null || normalized.wind_direction !== null) {
          hasWind = true;
        }
      } catch (err: any) {
        parserOk = false;
        console.warn(`[Scope] Parser warning: ${err.message || err}`);
      }
    }

    const result: WindowCheckResult = {
      windowIndex: windowIdx,
      label: sample.label,
      startDate,
      endDate,
      status: values.length ? 'SUCCESS' : 'EMPTY',
      recordsCount: values.length,
      unit,
      min: values.length ? Math.min(...values) : null,
      max: values.length ? Math.max(...values) : null,
      mean: values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null,
      zeros,
      hasWind,
      parserOk
    };

    fs.writeFileSync(cacheFile, JSON.stringify(result, null, 2), 'utf8');
    return result;
  } catch (err: any) {
    const result: WindowCheckResult = {
      windowIndex: windowIdx,
      label: sample.label,
      startDate,
      endDate,
      status: 'ERROR',
      recordsCount: 0,
      unit: 'N/A',
      min: null,
      max: null,
      mean: null,
      zeros: 0,
      hasWind: false,
      parserOk: false,
      errorMsg: err.message || String(err)
    };
    fs.writeFileSync(cacheFile, JSON.stringify(result, null, 2), 'utf8');
    return result;
  }
}

function summarizeEntry(
  stationId: string,
  parameterId: string,
  year: number,
  results: WindowCheckResult[]
): MatrixEntry {
  const successful = results.filter((result) => result.status === 'SUCCESS');
  const errorCount = results.filter((result) => result.status === 'ERROR').length;
  const expectedUnit = PARAMETERS[parameterId].unit;
  const unitDetected = successful[0]?.unit || 'N/A';
  const parserStatus = results.some((result) => !result.parserOk) ? 'REVIEW' : 'OK';
  const values = successful.flatMap((result) => [result.min, result.max, result.mean]).filter((value): value is number => value !== null);
  const meanValues = successful.map((result) => result.mean).filter((value): value is number => value !== null);

  let estimatedAvailability: AvailabilityStatus;
  let notes: string;

  if (errorCount === results.length) {
    estimatedAvailability = 'ERROR';
    notes = 'Todas as janelas amostrais falharam.';
  } else if (successful.length === results.length) {
    estimatedAvailability = 'AVAILABLE';
    notes = 'Todas as janelas amostrais retornaram dados fisicos.';
  } else if (successful.length > 0) {
    estimatedAvailability = 'LIKELY_AVAILABLE';
    notes = `Disponibilidade provavel. Retornou dados em ${successful.length}/${results.length} janelas amostrais.`;
  } else {
    estimatedAvailability = 'EMPTY';
    notes = 'As janelas amostrais responderam, mas sem dados fisicos.';
  }

  if (unitDetected !== 'N/A' && unitDetected !== expectedUnit) {
    estimatedAvailability = 'UNIT_REVIEW';
    notes = `Unidade detectada "${unitDetected}" difere da unidade esperada "${expectedUnit}".`;
  }

  if (parserStatus === 'REVIEW' && estimatedAvailability !== 'ERROR') {
    estimatedAvailability = 'PARSER_REVIEW';
    notes = 'Houve erro de parsing em pelo menos uma linha retornada.';
  }

  return {
    station_id: stationId,
    station_name: SITES[stationId].shortName,
    parameter_id: parameterId,
    pollutant: PARAMETERS[parameterId].pollutant,
    year,
    sampled_windows: results.length,
    windows_with_data: successful.length,
    estimated_availability: estimatedAvailability,
    unit_detected: unitDetected,
    parser_status: parserStatus,
    min_sample_value: values.length ? Math.min(...values) : null,
    max_sample_value: values.length ? Math.max(...values) : null,
    mean_sample_value: meanValues.length ? meanValues.reduce((sum, value) => sum + value, 0) / meanValues.length : null,
    zeros_count: successful.reduce((sum, result) => sum + result.zeros, 0),
    window_results: results,
    notes
  };
}

async function run() {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  process.env.WEBLAKES_COLLECTION_MODE = process.env.WEBLAKES_COLLECTION_MODE || 'monthly_fast';

  const config = parseArgs();
  const output: MatrixEntry[] = [];

  console.log('[Scope] Starting scoped availability audit');
  console.log(`[Scope] Stations: ${config.stations.join(', ')}`);
  console.log(`[Scope] Parameters: ${config.parameters.join(', ')}`);
  console.log(`[Scope] Years: ${config.years.join(', ')}`);
  console.log(`[Scope] Samples: ${config.samples.map((sample) => sample.label).join(', ')}`);

  for (const stationId of config.stations) {
    if (!SITES[stationId]) throw new Error(`Unknown station id: ${stationId}`);
    for (const parameterId of config.parameters) {
      for (const year of config.years) {
        const results: WindowCheckResult[] = [];
        for (let idx = 0; idx < config.samples.length; idx++) {
          const result = await checkSampleWindow(stationId, parameterId, year, idx, config.samples[idx], config.useCache);
          results.push(result);
          if (!config.useCache) {
            await delay(3000 + Math.floor(Math.random() * 2000));
          }
        }
        output.push(summarizeEntry(stationId, parameterId, year, results));
      }
    }
  }

  const outFile = path.resolve(process.cwd(), config.outFile);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify({
    generated_at: new Date().toISOString(),
    collection_mode: process.env.WEBLAKES_COLLECTION_MODE,
    scope: {
      stations: config.stations,
      parameters: config.parameters,
      years: config.years,
      samples: config.samples
    },
    entries: output
  }, null, 2), 'utf8');

  console.log(`[Scope] Wrote ${output.length} entries to ${outFile}`);
}

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
