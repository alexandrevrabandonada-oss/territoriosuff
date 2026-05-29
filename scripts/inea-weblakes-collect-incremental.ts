import * as fs from 'node:fs';
import * as path from 'node:path';
import { fetchWebLakesDataSafe, normalizeConcentrationRow, NormalizedRow } from '../src/lib/inea/weblakesClient';
import { SITES, PARAMETERS } from '../src/lib/inea/weblakesDictionary';

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getLastDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

async function collectStationData(stationId: string, stationName: string, parameterId: string, pollutantName: string) {
  console.log(`\n======================================================`);
  console.log(`Starting Incremental Collection for ${pollutantName} (Param: ${parameterId}) / ${stationName} (${stationId}) / 2024...`);
  console.log(`======================================================`);

  const year = 2024;
  const rawCacheDir = path.join(process.cwd(), '.cache', 'inea', 'weblakes', 'raw', stationId, parameterId);
  const normalizedBaseDir = path.join(process.cwd(), 'data', 'inea_weblakes_normalized', stationId, parameterId);

  fs.mkdirSync(rawCacheDir, { recursive: true });
  fs.mkdirSync(normalizedBaseDir, { recursive: true });

  // 1. Delete old monthly cache files from active raw cache
  console.log("Cleaning old active monthly cache files...");
  for (let month = 1; month <= 12; month++) {
    const monthStr = String(month).padStart(2, '0');
    const cacheFile = path.join(rawCacheDir, `${year}-${monthStr}.json`);
    if (fs.existsSync(cacheFile)) {
      fs.unlinkSync(cacheFile);
      console.log(`Deleted cache file: ${cacheFile}`);
    }
  }

  const allNormalizedRows: NormalizedRow[] = [];

  for (let month = 1; month <= 12; month++) {
    const monthStr = String(month).padStart(2, '0');
    const yearMonth = `${year}-${monthStr}`;
    const lastDay = getLastDayOfMonth(year, month);
    const startDate = `${yearMonth}-01`;
    const endDate = `${yearMonth}-${String(lastDay).padStart(2, '0')}`;

    const rawCacheFilePath = path.join(rawCacheDir, `${yearMonth}.json`);
    console.log(`\nProcessing Month ${yearMonth} (${startDate} to ${endDate})`);

    let rows;
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
      throw err; // Stop collection on failure
    }

    // Normalize monthly data
    console.log(`  Normalizing ${rows.length} rows for ${yearMonth}...`);
    for (const row of rows) {
      const normalized = normalizeConcentrationRow(row, {
        stationId,
        parameterId,
        startDate,
        endDate
      });
      allNormalizedRows.push(normalized);
    }

    // Rate-limiting delay between monthly requests
    if (month < 12) {
      const pauseTime = 6000 + Math.floor(Math.random() * 3000); // 6s to 9s (faster for generic check in dev, but polite)
      console.log(`  Pausing for ${(pauseTime / 1000).toFixed(1)}s to respect rate limits...`);
      await delay(pauseTime);
    }
  }

  // Sort normalized rows chronologically
  console.log(`\nSorting and compiling all ${allNormalizedRows.length} rows chronologically...`);
  allNormalizedRows.sort((a, b) => Date.parse(a.datetime) - Date.parse(b.datetime));

  // Save compiled 2024.json file
  const compiledFilePath = path.join(normalizedBaseDir, '2024.json');
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

  console.log(`Starting incremental collection for pollutants: ${pollutantsToCollect.join(', ')}`);

  // Target stations for Volta Redonda
  const stationsToCollect = [
    { id: "69", name: "VR - Belmonte" },
    { id: "70", name: "VR - Retiro" },
    { id: "71", name: "VR - Santa Cecília" }
  ];

  try {
    for (const poll of pollutantsToCollect) {
      // Find parameter configuration
      let paramId = '';
      if (poll === 'PM10') paramId = '18';
      else if (poll === 'PM2.5') paramId = '20';
      else {
        throw new Error(`Unsupported pollutant: ${poll}. Supported options are PM10 and PM2.5.`);
      }

      for (let i = 0; i < stationsToCollect.length; i++) {
        const site = stationsToCollect[i];
        await collectStationData(site.id, site.name, paramId, poll);

        // Pause between stations/pollutants, except for the absolute last check
        const isLastSite = i === stationsToCollect.length - 1 && poll === pollutantsToCollect[pollutantsToCollect.length - 1];
        if (!isLastSite) {
          console.log("\nPausing 8s before next collection to respect API endpoints...");
          await delay(8000);
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
