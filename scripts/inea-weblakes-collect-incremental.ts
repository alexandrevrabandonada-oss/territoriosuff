import * as fs from 'node:fs';
import * as path from 'node:path';
import { fetchWebLakesDataSafe, normalizeConcentrationRow, NormalizedRow } from '../src/lib/inea/weblakesClient';

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getLastDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

async function collectStationData(
  stationId: string,
  stationName: string,
  parameterId: string,
  pollutantName: string,
  year: number
) {
  console.log(`\n======================================================`);
  console.log(`Starting Incremental Collection for ${pollutantName} (Param: ${parameterId}) / ${stationName} (${stationId}) / ${year}...`);
  console.log(`======================================================`);

  const rawCacheDir = path.join(process.cwd(), '.cache', 'inea', 'weblakes', 'raw', stationId, parameterId);
  const normalizedBaseDir = path.join(process.cwd(), 'data', 'inea_weblakes_normalized', stationId, parameterId);

  fs.mkdirSync(rawCacheDir, { recursive: true });
  fs.mkdirSync(normalizedBaseDir, { recursive: true });

  const allNormalizedRows: NormalizedRow[] = [];
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-indexed

  for (let month = 1; month <= 12; month++) {
    const monthStr = String(month).padStart(2, '0');
    const yearMonth = `${year}-${monthStr}`;
    const lastDay = getLastDayOfMonth(year, month);
    const startDate = `${yearMonth}-01`;
    const endDate = `${yearMonth}-${String(lastDay).padStart(2, '0')}`;

    // 2026 Year logic: skip future months for partial year
    if (year === currentYear && month > currentMonth) {
      console.log(`  Skipping future month ${yearMonth} for partial year ${currentYear}.`);
      continue;
    }

    const rawCacheFilePath = path.join(rawCacheDir, `${yearMonth}.json`);
    console.log(`\nProcessing Month ${yearMonth} (${startDate} to ${endDate})`);

    let rows: any[] | null = null;

    // 1. Mandatory Cache check
    if (fs.existsSync(rawCacheFilePath)) {
      try {
        console.log(`  [Cache Hit] Loading raw data from cache: ${rawCacheFilePath}`);
        const cachedContent = JSON.parse(fs.readFileSync(rawCacheFilePath, 'utf8'));
        const foundRows = cachedContent.rows || [];
        if (foundRows.length > 0) {
          rows = foundRows;
        } else {
          console.log(`  [Cache Bypassed] Cache exists but contains 0 rows: ${rawCacheFilePath}. Re-fetching...`);
        }
      } catch {
        console.warn(`  [Warning] Failed to parse cache file: ${rawCacheFilePath}. Fetching from network...`);
      }
    }

    // 2. Fetch from network if not in cache
    if (rows === null) {
      try {
        console.log(`  Fetching raw data for ${yearMonth} with clean isolated session...`);
        rows = await fetchWebLakesDataSafe("qualidadedoar.inea.rj.gov.br", {
          stationId,
          parameterId,
          startDate,
          endDate
        });

        const responseData = {
          total: 1,
          page: 1,
          records: rows.length,
          rows: rows
        };

        fs.writeFileSync(rawCacheFilePath, JSON.stringify(responseData, null, 2), 'utf8');
        console.log(`  Saved raw response to cache: ${rawCacheFilePath} (${rows.length} records)`);

      } catch (err: any) {
        console.error(`  Failed to fetch data for ${yearMonth}:`, err.message || err);
        if (year === currentYear) {
          console.warn(`  Stopping ${currentYear} collection early at month ${month} due to fetch failure.`);
          break;
        }
        throw err;
      }

      // Rate-limiting delay between monthly requests (only for network calls)
      const isLastMonth = month === 12 || (year === currentYear && month === currentMonth);
      if (!isLastMonth) {
        const pauseTime = 3000 + Math.floor(Math.random() * 2000); // 3s to 5s politeness delay
        console.log(`  Pausing for ${(pauseTime / 1000).toFixed(1)}s to respect rate limits...`);
        await delay(pauseTime);
      }
    }

    // Normalize monthly data
    console.log(`  Normalizing ${rows.length} rows for ${yearMonth}...`);
    for (const row of rows) {
      try {
        const normalized = normalizeConcentrationRow(row, {
          stationId,
          parameterId,
          startDate,
          endDate
        });
        allNormalizedRows.push(normalized);
      } catch (normErr: any) {
        console.warn(`  [Normalization Error] Row skipped: ${normErr.message || normErr}`);
      }
    }
  }

  // Sort normalized rows chronologically
  console.log(`\nSorting and compiling all ${allNormalizedRows.length} rows chronologically...`);
  allNormalizedRows.sort((a, b) => Date.parse(a.datetime) - Date.parse(b.datetime));

  // Save compiled year.json file
  const compiledFilePath = path.join(normalizedBaseDir, `${year}.json`);
  fs.writeFileSync(compiledFilePath, JSON.stringify(allNormalizedRows, null, 2), 'utf8');
  console.log(`Saved compiled normalized dataset to: ${compiledFilePath}`);
}

async function run() {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  process.env.WEBLAKES_COLLECTION_MODE = "monthly_fast";

  // Parse --pollutants command-line argument
  const pollutantsArgIndex = process.argv.indexOf('--pollutants');
  let pollutantsToCollect = ['PM10', 'PM2.5']; // Default is both

  if (pollutantsArgIndex !== -1 && process.argv[pollutantsArgIndex + 1]) {
    const rawVal = process.argv[pollutantsArgIndex + 1];
    pollutantsToCollect = rawVal
      .split(',')
      .map(p => p.trim())
      .map(p => {
        if (p.toUpperCase() === 'PM25') return 'PM2.5';
        if (p.toUpperCase() === 'PM2,5') return 'PM2.5';
        return p.toUpperCase();
      });
  }

  // Parse --years command-line argument
  const yearsArgIndex = process.argv.indexOf('--years');
  let yearsToCollect = [2024]; // Default
  if (yearsArgIndex !== -1 && process.argv[yearsArgIndex + 1]) {
    yearsToCollect = process.argv[yearsArgIndex + 1]
      .split(',')
      .map(y => parseInt(y.trim(), 10));
  }

  // Parse --stations command-line argument
  const stationsArgIndex = process.argv.indexOf('--stations');
  const allStations = [
    { id: "69", name: "VR - Belmonte" },
    { id: "70", name: "VR - Retiro" },
    { id: "71", name: "VR - Santa Cecília" }
  ];
  let stationsToCollect = allStations;
  if (stationsArgIndex !== -1 && process.argv[stationsArgIndex + 1]) {
    const ids = process.argv[stationsArgIndex + 1].split(',').map(s => s.trim());
    stationsToCollect = allStations.filter(st => ids.includes(st.id));
  }

  console.log(`Starting collection:`);
  console.log(`  Pollutants: ${pollutantsToCollect.join(', ')}`);
  console.log(`  Years:      ${yearsToCollect.join(', ')}`);
  console.log(`  Stations:   ${stationsToCollect.map(s => `${s.name} (${s.id})`).join(', ')}`);

  try {
    for (const year of yearsToCollect) {
      for (const poll of pollutantsToCollect) {
        let paramId = '';
        if (poll === 'PM10') paramId = '18';
        else if (poll === 'PM2.5') paramId = '20';
        else if (poll === 'SO2') paramId = '23';
        else if (poll === 'NO2') paramId = '1465';
        else if (poll === 'CO') paramId = '3';
        else if (poll === 'PTS') paramId = '1955';
        else if (poll === 'O3') paramId = '2130';
        else {
          throw new Error(`Unsupported pollutant: ${poll}. Supported options: PM10, PM2.5, SO2, NO2, CO, PTS, O3.`);
        }

        for (let i = 0; i < stationsToCollect.length; i++) {
          const site = stationsToCollect[i];
          await collectStationData(site.id, site.name, paramId, poll, year);

          const isLast = year === yearsToCollect[yearsToCollect.length - 1] &&
                        poll === pollutantsToCollect[pollutantsToCollect.length - 1] &&
                        i === stationsToCollect.length - 1;
          if (!isLast) {
            console.log("\nPausing 8s before next collection to respect API endpoints...");
            await delay(8000);
          }
        }
      }
    }
    console.log("\nAll requested incremental collections completed successfully!");
  } catch (err: any) {
    console.error("\nExecution failed:", err.message || err);
    process.exit(1);
  }
}

run();
