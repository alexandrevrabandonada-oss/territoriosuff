import * as fs from 'node:fs';
import * as path from 'node:path';
import { fetchWebLakesDataSafe, normalizeConcentrationRow, NormalizedRow } from '../src/lib/inea/weblakesClient';


function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getLastDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

async function runCollect() {
  console.log("Starting Clean Collection for PM2.5 / VR-Retiro (70) / 2024...");
  
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  process.env.WEBLAKES_COLLECTION_MODE = "monthly_fast";
  
  const stationId = "70";
  const parameterId = "20";
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
      console.log(`Deleted: ${cacheFile}`);
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
      console.log(`  Saved raw response to cache: ${rawCacheFilePath}`);
      
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
    
    // Politeness delay between requests
    if (month < 12) {
      const pauseTime = 12000 + Math.floor(Math.random() * 6000);
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

runCollect().catch(err => {
  console.error("Execution failed:", err);
  process.exit(1);
});
