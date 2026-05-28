import * as fs from 'node:fs';
import * as path from 'node:path';
import { fetchWebLakesDataSafe, normalizeConcentrationRow, parseJqGridRows } from '../src/lib/inea/weblakesClient';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

async function runCrosscheck() {
  console.log("Starting Recoleta & Crosscheck for July 2024 PM10/Retiro...");

  const stationId = "70";
  const parameterId = "18";
  const startDate = "2024-07-01";
  const endDate = "2024-07-31";

  // Force monthly_fast with clean session for verification
  process.env.WEBLAKES_COLLECTION_MODE = "monthly_fast";

  let rawData: any[];
  try {
    rawData = await fetchWebLakesDataSafe("qualidadedoar.inea.rj.gov.br", {
      stationId,
      parameterId,
      startDate,
      endDate
    });
    console.log(`Fetched ${rawData.length} rows using safe monthly client.`);
  } catch (err: any) {
    console.error("Failed to fetch monthly data:", err);
    return;
  }

  // Load daily pilot rows for comparison
  const pilotBaseDir = path.join(process.cwd(), '.cache', 'inea', 'weblakes', 'raw', stationId, parameterId);
  const dailyRows: any[] = [];

  for (let d = 1; d <= 31; d++) {
    const dayStr = String(d).padStart(2, '0');
    const dayPath = path.join(pilotBaseDir, `2024-07-${dayStr}.json`);
    if (fs.existsSync(dayPath)) {
      const content = fs.readFileSync(dayPath, 'utf8');
      const rows = parseJqGridRows(content);
      dailyRows.push(...rows);
    }
  }

  console.log(`Loaded ${dailyRows.length} rows from daily pilot cache.`);

  // Normalize both sets
  const normalizedMonthly = rawData.map(r => normalizeConcentrationRow(r, { stationId, parameterId, startDate, endDate }));
  const normalizedDaily = dailyRows.map(r => normalizeConcentrationRow(r, { stationId, parameterId, startDate, endDate }));

  // Sort both by datetime to align them
  normalizedMonthly.sort((a, b) => a.datetime.localeCompare(b.datetime));
  normalizedDaily.sort((a, b) => a.datetime.localeCompare(b.datetime));

  console.log(`Normalized monthly count: ${normalizedMonthly.length}`);
  console.log(`Normalized daily count: ${normalizedDaily.length}`);

  // Perform comparison
  let matchCount = 0;
  let mismatchCount = 0;
  const mismatches: any[] = [];

  const dailyMap = new Map<string, number | null>();
  for (const r of normalizedDaily) {
    dailyMap.set(r.datetime, r.value);
  }

  for (const mr of normalizedMonthly) {
    const dv = dailyMap.get(mr.datetime);
    if (dv === undefined) {
      console.log(`Extra row in monthly data: ${mr.datetime} = ${mr.value}`);
      mismatchCount++;
      continue;
    }

    // Allow small float epsilon difference or exact match
    const diff = (mr.value === null || dv === null) ? (mr.value !== dv) : Math.abs(mr.value - dv) > 1e-5;
    if (diff) {
      mismatchCount++;
      mismatches.push({ datetime: mr.datetime, monthly: mr.value, daily: dv });
    } else {
      matchCount++;
    }
  }

  console.log(`\nComparison complete:`);
  console.log(`- Exact matches: ${matchCount}`);
  console.log(`- Mismatches: ${mismatchCount}`);

  if (mismatches.length > 0) {
    console.log("First 5 mismatches:", mismatches.slice(0, 5));
  } else {
    console.log("🎉 100% of rows match perfectly between recoleted monthly data and daily pilot!");
  }

  // Save the recollected monthly file to cache
  const activeCachePath = path.join(process.cwd(), '.cache', 'inea', 'weblakes', 'raw', stationId, parameterId, '2024-07.json');
  
  // Create raw response structure matching JqGrid format
  const jqGridResponse = {
    total: 1,
    page: 1,
    records: rawData.length,
    rows: rawData
  };

  fs.writeFileSync(activeCachePath, JSON.stringify(jqGridResponse, null, 2), 'utf8');
  console.log(`Saved clean monthly data to cache: ${activeCachePath}`);
}

runCrosscheck();
