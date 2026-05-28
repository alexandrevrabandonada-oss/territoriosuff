import * as fs from 'node:fs';
import * as path from 'node:path';
import { fetchWebLakesDataSafe, normalizeConcentrationRow, NormalizedRow } from '../src/lib/inea/weblakesClient';

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getLastDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

async function collectStationData(stationId: string, stationName: string) {
  console.log(`\n======================================================`);
  console.log(`Starting Clean Collection for PM2.5 / ${stationName} (${stationId}) / 2024...`);
  console.log(`======================================================`);
  
  const parameterId = "20"; // PM2.5
  const year = 2024;
  
  const rawCacheDir = path.join(process.cwd(), '.cache', 'inea', 'weblakes', 'raw', stationId, parameterId);
  const normalizedBaseDir = path.join(process.cwd(), 'data', 'inea_weblakes_normalized', stationId, parameterId);
  
  fs.mkdirSync(rawCacheDir, { recursive: true });
  fs.mkdirSync(normalizedBaseDir, { recursive: true });
  
  // 1. Delete old active monthly cache files (e.g., the 59 bytes ones)
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
    
    // Politeness delay between monthly requests to respect the server
    const isLastMonth = month === 12;
    if (!isLastMonth) {
      const pauseTime = 12000 + Math.floor(Math.random() * 6000); // 12s to 18s
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
  
  try {
    // 1. Process VR - Belmonte (69)
    await collectStationData("69", "VR - Belmonte");
    
    // Politeness pause between stations
    console.log("\nPausing 15s between stations...");
    await delay(15000);
    
    // 2. Process VR - Santa Cecília (71)
    await collectStationData("71", "VR - Santa Cecília");
    
    console.log("\nAll PM2.5 collections completed successfully!");
  } catch (err: any) {
    console.error("\nExecution failed:", err.message || err);
    process.exit(1);
  }
}

run();
