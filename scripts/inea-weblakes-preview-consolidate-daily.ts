import * as fs from 'node:fs';
import * as path from 'node:path';

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
  daily_rows: number;
  total_hourly_records: number;
  expected_hours: number;
  coverage_percent: number;
  daily_mean_average: number | null;
  max_daily_mean: number | null;
  max_daily_max: number | null;
  zero_hours: number;
  data_quality_tier: string;
  validation_note: string;
}

function getArg(name: string, fallback: string) {
  const args = process.argv.slice(2);
  const inline = args.find((arg) => arg.startsWith(`--${name}=`));
  if (inline) return inline.slice(name.length + 3);
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 && args[idx + 1] ? args[idx + 1] : fallback;
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

function run() {
  const outDir = path.resolve(process.cwd(), getArg('dir', 'reports/open-data-preview/inea-2013-2015-daily'));
  const files = fs.readdirSync(outDir).filter((file) => file.endsWith('-daily.json'));
  const dailyRows: DailySummary[] = [];

  for (const file of files) {
    const rows = JSON.parse(fs.readFileSync(path.join(outDir, file), 'utf8')) as DailySummary[];
    dailyRows.push(...rows);
  }

  dailyRows.sort((a, b) =>
    `${a.pollutant}-${a.station_id}-${a.date}`.localeCompare(`${b.pollutant}-${b.station_id}-${b.date}`)
  );

  const grouped = new Map<string, DailySummary[]>();
  for (const row of dailyRows) {
    const year = Number(row.date.slice(0, 4));
    const key = `${row.station_id}|${row.parameter_id}|${year}`;
    const rows = grouped.get(key) || [];
    rows.push(row);
    grouped.set(key, rows);
  }

  const aggregates: AggregateSummary[] = [];
  for (const rows of grouped.values()) {
    const first = rows[0];
    const year = Number(first.date.slice(0, 4));
    const validDailyMeans = rows
      .filter((row) => row.valid_hours >= 18 && row.daily_mean !== null)
      .map((row) => row.daily_mean as number);
    const dailyMaxes = rows.map((row) => row.daily_max).filter((value): value is number => value !== null);
    const expectedHours = (isLeapYear(year) ? 366 : 365) * 24;
    const totalHourlyRecords = rows.reduce((sum, row) => sum + row.valid_hours, 0);

    aggregates.push({
      station_id: first.station_id,
      station_name: first.station_name,
      parameter_id: first.parameter_id,
      pollutant: first.pollutant,
      unit: first.unit,
      year,
      valid_days_18h: validDailyMeans.length,
      daily_rows: rows.length,
      total_hourly_records: totalHourlyRecords,
      expected_hours: expectedHours,
      coverage_percent: Number(((totalHourlyRecords / expectedHours) * 100).toFixed(2)),
      daily_mean_average: validDailyMeans.length ? Number((validDailyMeans.reduce((sum, value) => sum + value, 0) / validDailyMeans.length).toFixed(4)) : null,
      max_daily_mean: validDailyMeans.length ? Number(Math.max(...validDailyMeans).toFixed(4)) : null,
      max_daily_max: dailyMaxes.length ? Number(Math.max(...dailyMaxes).toFixed(4)) : null,
      zero_hours: rows.reduce((sum, row) => sum + row.zero_hours, 0),
      data_quality_tier: 'OPEN_DATA_PREVIEW',
      validation_note: 'Consolidado offline a partir dos arquivos diarios de preview; nao publicado no manifesto de dados abertos.'
    });
  }

  aggregates.sort((a, b) =>
    `${a.pollutant}-${a.station_id}-${a.year}`.localeCompare(`${b.pollutant}-${b.station_id}-${b.year}`)
  );

  fs.writeFileSync(path.join(outDir, 'daily-all.json'), JSON.stringify(dailyRows, null, 2), 'utf8');
  fs.writeFileSync(path.join(outDir, 'aggregate-summary.json'), JSON.stringify(aggregates, null, 2), 'utf8');
  writeCsv(path.join(outDir, 'aggregate-summary.csv'), aggregates as unknown as Record<string, string | number | null>[]);

  console.log(`Consolidated ${dailyRows.length} daily rows into ${aggregates.length} aggregate rows at ${outDir}`);
}

run();
