import * as fs from 'node:fs';
import * as path from 'node:path';
import { normalizeConcentrationRow, parseJqGridRows } from '../src/lib/inea/weblakesClient';
import { PARAMETERS, SITES } from '../src/lib/inea/weblakesDictionary';

interface HourRow {
  datetime: string;
  value: number;
}

interface MetricRow {
  station_id: string;
  station_name: string;
  parameter_id: string;
  pollutant: string;
  year: number;
  hourly_records: number;
  days_with_data: number;
  valid_days_1h: number;
  valid_days_18h: number;
  hourly_mean: number | null;
  daily_mean_all_days: number | null;
  daily_mean_valid_18h: number | null;
  max_daily_mean_1h: number | null;
  max_daily_mean_18h: number | null;
  max_hourly_value: number | null;
  max_moving_8h: number | null;
}

const PARAMETER_IDS = ['18', '1955', '2130'];
const STATION_IDS = ['69', '70', '71'];
const YEARS = [2013, 2014, 2015];

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

function getLastDayOfMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

function round(value: number | null) {
  return value === null ? null : Number(value.toFixed(4));
}

function loadYearRows(stationId: string, parameterId: string, year: number): HourRow[] {
  const rows: HourRow[] = [];
  const rawCacheDir = path.join(process.cwd(), '.cache', 'inea', 'weblakes', 'raw', stationId, parameterId);

  for (let month = 1; month <= 12; month++) {
    const monthStr = String(month).padStart(2, '0');
    const yearMonth = `${year}-${monthStr}`;
    const rawCacheFile = path.join(rawCacheDir, `${yearMonth}.json`);
    if (!fs.existsSync(rawCacheFile)) continue;

    const startDate = `${yearMonth}-01`;
    const endDate = `${yearMonth}-${String(getLastDayOfMonth(year, month)).padStart(2, '0')}`;
    const rawBody = fs.readFileSync(rawCacheFile, 'utf8');
    const rawRows = parseJqGridRows(rawBody);

    for (const rawRow of rawRows) {
      const normalized = normalizeConcentrationRow(rawRow, {
        stationId,
        parameterId,
        startDate,
        endDate
      });
      if (normalized.value === null) continue;
      rows.push({ datetime: normalized.datetime, value: normalized.value });
    }
  }

  return rows.sort((a, b) => Date.parse(a.datetime) - Date.parse(b.datetime));
}

function computeMoving8hMax(rows: HourRow[]) {
  if (!rows.length) return null;
  let max: number | null = null;

  for (let i = 0; i < rows.length; i++) {
    const currentTime = Date.parse(rows[i].datetime);
    const windowRows: HourRow[] = [];

    for (let j = i; j >= 0; j--) {
      const diffHours = (currentTime - Date.parse(rows[j].datetime)) / (60 * 60 * 1000);
      if (diffHours <= 7) {
        windowRows.push(rows[j]);
      } else {
        break;
      }
    }

    if (windowRows.length >= 6) {
      const avg = average(windowRows.map((row) => row.value));
      if (avg !== null && (max === null || avg > max)) {
        max = avg;
      }
    }
  }

  return max;
}

function auditMetric(stationId: string, parameterId: string, year: number): MetricRow {
  const rows = loadYearRows(stationId, parameterId, year);
  const byDay = new Map<string, number[]>();

  for (const row of rows) {
    const day = row.datetime.slice(0, 10);
    const values = byDay.get(day) || [];
    values.push(row.value);
    byDay.set(day, values);
  }

  const dailyMeansAll = [...byDay.values()].map((values) => average(values)).filter((value): value is number => value !== null);
  const dailyMeans18h = [...byDay.values()]
    .filter((values) => values.length >= 18)
    .map((values) => average(values))
    .filter((value): value is number => value !== null);
  const hourlyValues = rows.map((row) => row.value);
  const maxHourly = hourlyValues.length ? Math.max(...hourlyValues) : null;
  const maxMoving8h = parameterId === '2130' ? computeMoving8hMax(rows) : null;

  return {
    station_id: stationId,
    station_name: SITES[stationId].name,
    parameter_id: parameterId,
    pollutant: PARAMETERS[parameterId].pollutant,
    year,
    hourly_records: rows.length,
    days_with_data: byDay.size,
    valid_days_1h: dailyMeansAll.length,
    valid_days_18h: dailyMeans18h.length,
    hourly_mean: round(average(hourlyValues)),
    daily_mean_all_days: round(average(dailyMeansAll)),
    daily_mean_valid_18h: round(average(dailyMeans18h)),
    max_daily_mean_1h: round(dailyMeansAll.length ? Math.max(...dailyMeansAll) : null),
    max_daily_mean_18h: round(dailyMeans18h.length ? Math.max(...dailyMeans18h) : null),
    max_hourly_value: round(maxHourly),
    max_moving_8h: round(maxMoving8h)
  };
}

function run() {
  const rows: MetricRow[] = [];

  for (const parameterId of PARAMETER_IDS) {
    for (const stationId of STATION_IDS) {
      for (const year of YEARS) {
        rows.push(auditMetric(stationId, parameterId, year));
      }
    }
  }

  const outDir = path.join(process.cwd(), 'reports', 'open-data-preview', 'inea-2013-2015-daily');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'metric-audit.json'), JSON.stringify(rows, null, 2), 'utf8');
  writeCsv(path.join(outDir, 'metric-audit.csv'), rows as unknown as Record<string, string | number | null>[]);

  console.log(`Wrote ${rows.length} metric audit rows to ${outDir}`);
}

run();
