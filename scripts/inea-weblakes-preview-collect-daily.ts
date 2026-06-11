import * as fs from 'node:fs';
import * as path from 'node:path';
import { fetchWebLakesDataSafe, normalizeConcentrationRow, parseJqGridRows, RawCellRow } from '../src/lib/inea/weblakesClient';
import { PARAMETERS, SITES } from '../src/lib/inea/weblakesDictionary';

interface CliConfig {
  stations: string[];
  parameters: string[];
  years: number[];
  outDir: string;
}

interface DailySummary {
  date: string;
  station_id: string;
  station_name: string;
  parameter_id: string;
  pollutant: string;
  unit: string;
  valid_hours: number;
  coverage_percent: number;
  daily_mean: number | null;
  daily_max: number | null;
  zero_hours: number;
  source_system: string;
  data_quality_tier: string;
  validation_note: string;
}

interface AggregateSummary {
  station_id: string;
  station_name: string;
  parameter_id: string;
  pollutant: string;
  unit: string;
  year: number;
  valid_days_18h: number;
  total_hourly_records: number;
  expected_hours: number;
  coverage_percent: number;
  daily_mean_average: number | null;
  max_daily_mean: number | null;
  max_hourly_value: number | null;
  zero_hours: number;
  data_quality_tier: string;
  validation_note: string;
}

const POLLUTANT_TO_PARAMETER = Object.fromEntries(
  Object.values(PARAMETERS).map((parameter) => [parameter.pollutant.toUpperCase(), parameter.id])
);

function parseArgs(): CliConfig {
  const args = process.argv.slice(2);
  const getArg = (name: string, fallback: string) => {
    const inline = args.find((arg) => arg.startsWith(`--${name}=`));
    if (inline) return inline.slice(name.length + 3);
    const idx = args.indexOf(`--${name}`);
    return idx >= 0 && args[idx + 1] ? args[idx + 1] : fallback;
  };

  const stations = getArg('stations', '69,70,71').split(',').map((item) => item.trim()).filter(Boolean);
  const parameters = getArg('pollutants', 'PM10,PTS,O3')
    .split(',')
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean)
    .map((pollutant) => {
      const id = POLLUTANT_TO_PARAMETER[pollutant] || pollutant;
      if (!PARAMETERS[id]) throw new Error(`Unknown pollutant or parameter id: ${pollutant}`);
      return id;
    });
  const years = parseYears(getArg('years', '2013:2015'));
  const outDir = getArg('out-dir', 'reports/open-data-preview/inea-2013-2015-daily');

  return { stations, parameters, years, outDir };
}

function parseYears(value: string): number[] {
  if (value.includes(':')) {
    const [startRaw, endRaw] = value.split(':');
    const start = Number(startRaw);
    const end = Number(endRaw);
    if (!Number.isInteger(start) || !Number.isInteger(end) || start > end) {
      throw new Error(`Invalid year range: ${value}`);
    }
    return Array.from({ length: end - start + 1 }, (_, idx) => start + idx);
  }
  return value.split(',').map((item) => Number(item.trim())).filter((year) => Number.isInteger(year));
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getLastDayOfMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function isLeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function formatCsvValue(value: string | number | null) {
  if (value === null) return '';
  const text = String(value);
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function writeCsv(filePath: string, rows: Record<string, string | number | null>[]) {
  if (!rows.length) {
    fs.writeFileSync(filePath, '', 'utf8');
    return;
  }
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => formatCsvValue(row[header])).join(','))
  ].join('\n');
  fs.writeFileSync(filePath, csv, 'utf8');
}

async function loadOrFetchMonth(stationId: string, parameterId: string, year: number, month: number): Promise<RawCellRow[]> {
  const monthStr = String(month).padStart(2, '0');
  const yearMonth = `${year}-${monthStr}`;
  const lastDay = getLastDayOfMonth(year, month);
  const startDate = `${yearMonth}-01`;
  const endDate = `${yearMonth}-${String(lastDay).padStart(2, '0')}`;
  const rawCacheDir = path.join(process.cwd(), '.cache', 'inea', 'weblakes', 'raw', stationId, parameterId);
  const rawCacheFile = path.join(rawCacheDir, `${yearMonth}.json`);

  fs.mkdirSync(rawCacheDir, { recursive: true });

  if (fs.existsSync(rawCacheFile)) {
    const rawDataJson = fs.readFileSync(rawCacheFile, 'utf8');
    return parseJqGridRows(rawDataJson);
  }

  const rows = await fetchWebLakesDataSafe('qualidadedoar.inea.rj.gov.br', {
    stationId,
    parameterId,
    startDate,
    endDate
  });

  fs.writeFileSync(rawCacheFile, JSON.stringify({ total: 1, page: 1, records: rows.length, rows }, null, 2), 'utf8');
  await delay(3000 + Math.floor(Math.random() * 2000));
  return rows;
}

async function collectYear(stationId: string, parameterId: string, year: number) {
  const allRows: RawCellRow[] = [];

  for (let month = 1; month <= 12; month++) {
    const rows = await loadOrFetchMonth(stationId, parameterId, year, month);
    allRows.push(...rows);
  }

  const byDay = new Map<string, number[]>();
  const parameter = PARAMETERS[parameterId];
  const station = SITES[stationId];
  let zeroHours = 0;

  for (const row of allRows) {
    const normalized = normalizeConcentrationRow(row, {
      stationId,
      parameterId,
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`
    });

    if (normalized.value === null) continue;
    if (normalized.value === 0) zeroHours++;

    const day = normalized.datetime.slice(0, 10);
    const values = byDay.get(day) || [];
    values.push(normalized.value);
    byDay.set(day, values);
  }

  const dailyRows: DailySummary[] = [];
  for (const [date, values] of [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const validHours = values.length;
    dailyRows.push({
      date,
      station_id: stationId,
      station_name: station.name,
      parameter_id: parameterId,
      pollutant: parameter.pollutant,
      unit: parameter.unit,
      valid_hours: validHours,
      coverage_percent: Number(((validHours / 24) * 100).toFixed(2)),
      daily_mean: values.length ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(4)) : null,
      daily_max: values.length ? Number(Math.max(...values).toFixed(4)) : null,
      zero_hours: values.filter((value) => value === 0).length,
      source_system: 'INEA_WEBLAKES_PREVIEW',
      data_quality_tier: validHours >= 18 ? 'PREVIEW_DAILY_18H' : 'PREVIEW_DAILY_LOW_COVERAGE',
      validation_note: 'Preview tecnico. Dado horario publico WebLakes; comparacao experimental; sem QA/QC oficial por registro.'
    });
  }

  const validDailyMeans = dailyRows
    .filter((row) => row.valid_hours >= 18 && row.daily_mean !== null)
    .map((row) => row.daily_mean as number);
  const hourlyValues = [...byDay.values()].flat();
  const expectedHours = (isLeapYear(year) ? 366 : 365) * 24;

  const aggregate: AggregateSummary = {
    station_id: stationId,
    station_name: station.name,
    parameter_id: parameterId,
    pollutant: parameter.pollutant,
    unit: parameter.unit,
    year,
    valid_days_18h: validDailyMeans.length,
    total_hourly_records: hourlyValues.length,
    expected_hours: expectedHours,
    coverage_percent: Number(((hourlyValues.length / expectedHours) * 100).toFixed(2)),
    daily_mean_average: validDailyMeans.length ? Number((validDailyMeans.reduce((sum, value) => sum + value, 0) / validDailyMeans.length).toFixed(4)) : null,
    max_daily_mean: validDailyMeans.length ? Number(Math.max(...validDailyMeans).toFixed(4)) : null,
    max_hourly_value: hourlyValues.length ? Number(Math.max(...hourlyValues).toFixed(4)) : null,
    zero_hours: zeroHours,
    data_quality_tier: 'OPEN_DATA_PREVIEW',
    validation_note: 'Preview restrito para auditoria. Nao publicado no manifesto de dados abertos.'
  };

  return { dailyRows, aggregate };
}

async function run() {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  process.env.WEBLAKES_COLLECTION_MODE = process.env.WEBLAKES_COLLECTION_MODE || 'monthly_fast';

  const config = parseArgs();
  const outDir = path.resolve(process.cwd(), config.outDir);
  fs.mkdirSync(outDir, { recursive: true });

  const aggregates: AggregateSummary[] = [];
  const allDailyRows: DailySummary[] = [];

  for (const stationId of config.stations) {
    if (!SITES[stationId]) throw new Error(`Unknown station id: ${stationId}`);
    for (const parameterId of config.parameters) {
      for (const year of config.years) {
        console.log(`[Preview] Collecting station=${stationId} pollutant=${PARAMETERS[parameterId].pollutant} year=${year}`);
        const { dailyRows, aggregate } = await collectYear(stationId, parameterId, year);
        aggregates.push(aggregate);
        allDailyRows.push(...dailyRows);

        const baseName = `${PARAMETERS[parameterId].pollutant.toLowerCase()}-${stationId}-${year}`;
        fs.writeFileSync(path.join(outDir, `${baseName}-daily.json`), JSON.stringify(dailyRows, null, 2), 'utf8');
        writeCsv(path.join(outDir, `${baseName}-daily.csv`), dailyRows as unknown as Record<string, string | number | null>[]);
      }
    }
  }

  fs.writeFileSync(path.join(outDir, 'aggregate-summary.json'), JSON.stringify(aggregates, null, 2), 'utf8');
  writeCsv(path.join(outDir, 'aggregate-summary.csv'), aggregates as unknown as Record<string, string | number | null>[]);
  fs.writeFileSync(path.join(outDir, 'daily-all.json'), JSON.stringify(allDailyRows, null, 2), 'utf8');

  console.log(`[Preview] Wrote ${aggregates.length} aggregate rows and ${allDailyRows.length} daily rows to ${outDir}`);
}

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
