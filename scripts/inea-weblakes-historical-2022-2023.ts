import * as fs from 'node:fs';
import * as path from 'node:path';
import { fetchWebLakesDataSafe, parseJqGridRows, normalizeConcentrationRow, NormalizedRow, RawCellRow } from '../src/lib/inea/weblakesClient';
import { SITES, PARAMETERS } from '../src/lib/inea/weblakesDictionary';

const STATIONS = ["69", "70", "71"];
const ALL_STATIONS_FOR_SUMMARY = ["69", "70", "71", "72"];
const POLLUTANTS = ["18", "20"]; // PM10 and PM2.5
const YEARS = [2022, 2023];
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getLastDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

async function runHistoricalExtract() {
  console.log(`Starting INEA WebLakes Historical Extract for Years ${YEARS.join(', ')}`);

  // Force Node TLS reject unauthorized
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  // Force monthly_fast mode for safe rate limiting and complete month fetch
  process.env.WEBLAKES_COLLECTION_MODE = "monthly_fast";

  const rawBaseCacheDir = path.join(process.cwd(), '.cache', 'inea', 'weblakes', 'raw');
  const normalizedBaseDir = path.join(process.cwd(), 'data', 'inea_weblakes_normalized');
  const reportsDir = path.join(process.cwd(), 'reports');

  fs.mkdirSync(rawBaseCacheDir, { recursive: true });
  fs.mkdirSync(normalizedBaseDir, { recursive: true });
  fs.mkdirSync(reportsDir, { recursive: true });

  let apiCallsMade = 0;

  // Process year-by-year
  for (const year of YEARS) {
    console.log(`\n==================================================`);
    console.log(`PROCESSING YEAR: ${year}`);
    console.log(`==================================================`);

    const yearNormalizedRows: NormalizedRow[] = [];

    for (const stationId of STATIONS) {
      const stationName = SITES[stationId]?.name || `Estação ${stationId}`;
      console.log(`\n--- Station: ${stationId} (${stationName}) ---`);

      for (const parameterId of POLLUTANTS) {
        const pInfo = PARAMETERS[parameterId] || { pollutant: `Poluente ${parameterId}`, unit: "N/A" };
        console.log(`  Poluente: ${parameterId} (${pInfo.pollutant})`);

        const rawCacheDir = path.join(rawBaseCacheDir, stationId, parameterId);
        const normalizedDir = path.join(normalizedBaseDir, stationId, parameterId);
        fs.mkdirSync(rawCacheDir, { recursive: true });
        fs.mkdirSync(normalizedDir, { recursive: true });

        for (const month of MONTHS) {
          const monthStr = String(month).padStart(2, '0');
          const yearMonth = `${year}-${monthStr}`;
          const lastDay = getLastDayOfMonth(year, month);
          const startDate = `${yearMonth}-01`;
          const endDate = `${yearMonth}-${String(lastDay).padStart(2, '0')}`;

          const rawCacheFilePath = path.join(rawCacheDir, `${yearMonth}.json`);
          const normalizedFilePath = path.join(normalizedDir, `${yearMonth}.json`);

          let rows: RawCellRow[] = [];

          if (fs.existsSync(rawCacheFilePath)) {
            console.log(`    [Cache Hit] Loading raw data for ${yearMonth} from cache.`);
            try {
              const rawDataJson = fs.readFileSync(rawCacheFilePath, 'utf8');
              rows = parseJqGridRows(rawDataJson);
            } catch (err: any) {
              console.error(`    Error reading raw cache for ${yearMonth}:`, err);
            }
          } else {
            console.log(`    [Cache Miss] Fetching raw data for ${yearMonth} (${startDate} to ${endDate})...`);

            try {
              apiCallsMade++;
              rows = await fetchWebLakesDataSafe("qualidadedoar.inea.rj.gov.br", {
                stationId,
                parameterId,
                startDate,
                endDate
              });

              // Save raw response structure
              const responseData = {
                total: 1,
                page: 1,
                records: rows.length,
                rows: rows
              };
              fs.writeFileSync(rawCacheFilePath, JSON.stringify(responseData, null, 2), 'utf8');
              console.log(`    Saved raw response to cache: ${rawCacheFilePath}`);

              const pauseTime = 1000 + Math.floor(Math.random() * 2000);
              console.log(`    Pausing for ${(pauseTime / 1000).toFixed(1)}s to respect rate limits...`);
              await delay(pauseTime);

            } catch (err: any) {
              console.error(`    Error fetching ${yearMonth} for station ${stationId} pollutant ${parameterId}:`, err);
              continue;
            }
          }

          // Process and normalize
          try {
            const normalizedRows: NormalizedRow[] = [];

            for (const row of rows) {
              const normalized = normalizeConcentrationRow(row, {
                stationId,
                parameterId,
                startDate,
                endDate
              });
              normalizedRows.push(normalized);
              yearNormalizedRows.push(normalized);
            }

            fs.writeFileSync(normalizedFilePath, JSON.stringify(normalizedRows, null, 2), 'utf8');
            console.log(`    Processed ${normalizedRows.length} rows, saved to: ${normalizedFilePath}`);

          } catch (err: any) {
            console.error(`    Error parsing raw data for ${yearMonth}:`, err);
          }
        }
      }
    }

    // Compile statistics for this year
    console.log(`\nCompiling Overall ${year} Statistics...`);
    const compiledSummaryPath = path.join(normalizedBaseDir, `summary-${year}.json`);
    
    // Structure summary
    const summary: Record<string, any> = {};
    for (const stationId of ALL_STATIONS_FOR_SUMMARY) {
      summary[stationId] = {
        name: SITES[stationId]?.name || `Estação ${stationId}`,
        pollutants: {}
      };
    }

    // Group rows by station & pollutant
    const groupedRows: Record<string, Record<string, NormalizedRow[]>> = {};
    for (const r of yearNormalizedRows) {
      if (!groupedRows[r.station_id]) {
        groupedRows[r.station_id] = {};
      }
      if (!groupedRows[r.station_id][r.parameter_id]) {
        groupedRows[r.station_id][r.parameter_id] = [];
      }
      groupedRows[r.station_id][r.parameter_id].push(r);
    }

    // Populate pollutants statistics
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    const expectedHours = (isLeap ? 366 : 365) * 24;

    // We want to initialize all pollutants as empty for completeness, matching summary-2024.json
    // The pollutants in summary-2024: "3", "18", "23", "1465", "2130", "1955", "20"
    const ALL_POLLUTANTS_FOR_STRUCTURE = ["3", "18", "23", "1465", "2130", "1955", "20"];

    for (const stationId of ALL_STATIONS_FOR_SUMMARY) {
      const stationGroup = groupedRows[stationId] || {};
      for (const parameterId of ALL_POLLUTANTS_FOR_STRUCTURE) {
        const pRows = stationGroup[parameterId] || [];
        const pInfo = PARAMETERS[parameterId] || { pollutant: `Poluente ${parameterId}`, unit: "N/A" };

        if (pRows.length === 0) {
          summary[stationId].pollutants[parameterId] = {
            pollutant: pInfo.pollutant,
            unit: pInfo.unit,
            totalHours: 0,
            coveragePct: 0,
            mean: null,
            max: null,
            zeroHours: 0,
            exceedances: { WHO_24H: 0, BR_24H_FINAL: 0 }
          };
          continue;
        }

        const values = pRows.map(r => r.value).filter((v): v is number => v !== null);
        const mean = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null;
        const max = values.length > 0 ? Math.max(...values) : null;
        const zeroHours = values.filter(v => v === 0).length;
        const coveragePct = (pRows.length / expectedHours) * 100;

        // WHO/BR exceedance count for PM10 (18) and PM2.5 (20)
        let whoExceed = 0;
        let brExceed = 0;

        if (parameterId === "18") { // PM10
          const dailyData: Record<string, { sum: number; count: number }> = {};
          for (const r of pRows) {
            if (r.value !== null) {
              const date = r.datetime.split('T')[0];
              if (!dailyData[date]) dailyData[date] = { sum: 0, count: 0 };
              dailyData[date].sum += r.value;
              dailyData[date].count++;
            }
          }
          for (const day of Object.values(dailyData)) {
            if (day.count >= 18) {
              const avg = day.sum / day.count;
              if (avg > 45.0) whoExceed++;
              if (avg > 50.0) brExceed++;
            }
          }
        } else if (parameterId === "20") { // PM2.5
          const dailyData: Record<string, { sum: number; count: number }> = {};
          for (const r of pRows) {
            if (r.value !== null) {
              const date = r.datetime.split('T')[0];
              if (!dailyData[date]) dailyData[date] = { sum: 0, count: 0 };
              dailyData[date].sum += r.value;
              dailyData[date].count++;
            }
          }
          for (const day of Object.values(dailyData)) {
            if (day.count >= 18) {
              const avg = day.sum / day.count;
              if (avg > 15.0) whoExceed++;
              if (avg > 25.0) brExceed++;
            }
          }
        }

        // Group by month
        const monthlyGroups: Record<string, NormalizedRow[]> = {};
        for (const r of pRows) {
          const monthKey = r.datetime.slice(0, 7); // YYYY-MM
          if (!monthlyGroups[monthKey]) {
            monthlyGroups[monthKey] = [];
          }
          monthlyGroups[monthKey].push(r);
        }

        const monthsStats: Record<string, any> = {};
        for (const mKey of Object.keys(monthlyGroups).sort()) {
          const mRows = monthlyGroups[mKey];
          const mValues = mRows.map(r => r.value).filter((v): v is number => v !== null);
          const mMean = mValues.length > 0 ? mValues.reduce((a, b) => a + b, 0) / mValues.length : null;
          const mMax = mValues.length > 0 ? Math.max(...mValues) : null;
          const mZeroHours = mValues.filter(v => v === 0).length;

          const [y, mStr] = mKey.split('-');
          const monthNum = parseInt(mStr);
          const mDays = getLastDayOfMonth(parseInt(y), monthNum);
          const mExpectedHours = mDays * 24;
          const mCoverage = (mRows.length / mExpectedHours) * 100;
          const mMissingHours = Math.max(0, mExpectedHours - mRows.length);

          let mWhoExceed = 0;
          let mBrExceed = 0;

          if (parameterId === "18" || parameterId === "20") {
            const mDailyData: Record<string, { sum: number; count: number }> = {};
            for (const r of mRows) {
              if (r.value !== null) {
                const date = r.datetime.split('T')[0];
                if (!mDailyData[date]) mDailyData[date] = { sum: 0, count: 0 };
                mDailyData[date].sum += r.value;
                mDailyData[date].count++;
              }
            }
            for (const day of Object.values(mDailyData)) {
              if (day.count >= 18) {
                const avg = day.sum / day.count;
                const limitWho = parameterId === "18" ? 45.0 : 15.0;
                const limitBr = parameterId === "18" ? 50.0 : 25.0;
                if (avg > limitWho) mWhoExceed++;
                if (avg > limitBr) mBrExceed++;
              }
            }
          }

          monthsStats[mKey] = {
            mean: mMean,
            max: mMax,
            coveragePct: mCoverage,
            zeroHours: mZeroHours,
            missingHours: mMissingHours,
            exceedances: {
              WHO_24H: mWhoExceed,
              BR_24H_FINAL: mBrExceed
            }
          };
        }

        // Fill in missing months as empty to keep front-end structure clean
        for (const month of MONTHS) {
          const monthKey = `${year}-${String(month).padStart(2, '0')}`;
          if (!monthsStats[monthKey]) {
            const mDays = getLastDayOfMonth(year, month);
            const mExpectedHours = mDays * 24;
            monthsStats[monthKey] = {
              mean: null,
              max: null,
              coveragePct: 0,
              zeroHours: 0,
              missingHours: mExpectedHours,
              exceedances: { WHO_24H: 0, BR_24H_FINAL: 0 }
            };
          }
        }

        summary[stationId].pollutants[parameterId] = {
          pollutant: pInfo.pollutant,
          unit: pInfo.unit,
          totalHours: pRows.length,
          coveragePct,
          mean,
          max,
          zeroHours,
          exceedances: {
            WHO_24H: whoExceed,
            BR_24H_FINAL: brExceed
          },
          months: monthsStats
        };
      }
    }

    fs.writeFileSync(compiledSummaryPath, JSON.stringify(summary, null, 2), 'utf8');
    console.log(`Saved compiled ${year} summary to: ${compiledSummaryPath}`);
  }

  console.log(`\nAll historical extractions complete. API calls made: ${apiCallsMade}`);
}

runHistoricalExtract();
