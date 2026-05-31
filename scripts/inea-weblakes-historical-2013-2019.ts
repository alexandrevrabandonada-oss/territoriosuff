import * as fs from 'node:fs';
import * as path from 'node:path';
import { fetchWebLakesDataSafe, parseJqGridRows, normalizeConcentrationRow, NormalizedRow, RawCellRow } from '../src/lib/inea/weblakesClient';
import { SITES, PARAMETERS } from '../src/lib/inea/weblakesDictionary';

const STATIONS = ["69", "70", "71"];
const ALL_STATIONS_FOR_SUMMARY = ["69", "70", "71", "72"];
const POLLUTANTS = ["18", "23", "3"]; // PM10, SO2, CO
const YEARS = [2013, 2014, 2015, 2016, 2017, 2018, 2019];
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getLastDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

interface ParsedHour {
  datetime: string;
  value: number | null;
}

function computeMoving8h(sortedHours: ParsedHour[]): { datetime: string; value: number | null }[] {
  const result: { datetime: string; value: number | null }[] = [];
  const eightHoursMs = 7 * 60 * 60 * 1000;

  for (let i = 0; i < sortedHours.length; i++) {
    const current = sortedHours[i];
    const currentTime = new Date(current.datetime).getTime();
    const windowRows: ParsedHour[] = [];

    for (let j = i; j >= 0; j--) {
      const checkTime = new Date(sortedHours[j].datetime).getTime();
      if (currentTime - checkTime <= eightHoursMs) {
        windowRows.push(sortedHours[j]);
      } else {
        break;
      }
    }

    const validRows = windowRows.filter(r => r.value !== null);
    let movingAvg: number | null = null;
    if (validRows.length >= 6) {
      const sum = validRows.reduce((acc, r) => acc + (r.value || 0), 0);
      movingAvg = sum / validRows.length;
    }

    result.push({
      datetime: current.datetime,
      value: movingAvg
    });
  }

  return result;
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

              // Politeness pause to avoid rate limiting
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

    const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    const expectedHours = (isLeap ? 366 : 365) * 24;

    // We want to initialize all 7 pollutants for completeness, matching summary-2024.json structure
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
        const mean = values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : null;
        const max = values.length > 0 ? Math.max(...values) : null;
        const zeroHours = values.filter(v => v === 0).length;
        const coveragePct = (pRows.length / expectedHours) * 100;

        // Exceedances calculations:
        let whoExceed = 0;
        let brExceed = 0;

        // Group by day for daily means
        const dailyData: Record<string, { sum: number; count: number; values: number[] }> = {};
        for (const r of pRows) {
          if (r.value !== null) {
            const date = r.datetime.split('T')[0];
            if (!dailyData[date]) dailyData[date] = { sum: 0, count: 0, values: [] };
            dailyData[date].sum += r.value;
            dailyData[date].count++;
            dailyData[date].values.push(r.value);
          }
        }

        if (parameterId === "18") { // PM10
          // PM10 WHO = 45, CONAMA = 50. Daily mean >= 18 valid hours
          for (const day of Object.values(dailyData)) {
            if (day.count >= 18) {
              const avg = day.sum / day.count;
              if (avg > 45.0) whoExceed++;
              if (avg > 50.0) brExceed++;
            }
          }
        } else if (parameterId === "23") { // SO2
          // SO2 WHO = 40, CONAMA = 20. Daily mean >= 18 valid hours (18h rule)
          for (const day of Object.values(dailyData)) {
            if (day.count >= 18) {
              const avg = day.sum / day.count;
              if (avg > 40.0) whoExceed++;
              if (avg > 20.0) brExceed++;
            }
          }
        } else if (parameterId === "3") { // CO
          // CO: WHO daily mean * 1.145 > 4 mg/m3.
          for (const day of Object.values(dailyData)) {
            if (day.count >= 18) {
              const avg = day.sum / day.count;
              if (avg * 1.145 > 4.0) whoExceed++;
            }
          }

          // CONAMA limit: 8h moving average > 9 ppm (computed as total hours exceeding)
          const sortedParsedHours = pRows
            .map(r => ({ datetime: r.datetime, value: r.value }))
            .sort((a, b) => a.datetime.localeCompare(b.datetime));
          const moving8h = computeMoving8h(sortedParsedHours);
          const movingExceedingBR = moving8h.filter(m => m.value !== null && m.value > 9.0).length;
          brExceed = movingExceedingBR;
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
          const mMean = mValues.length > 0 ? mValues.reduce((sum, v) => sum + v, 0) / mValues.length : null;
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

          // Group by day for daily means within month
          const mDailyData: Record<string, { sum: number; count: number }> = {};
          for (const r of mRows) {
            if (r.value !== null) {
              const date = r.datetime.split('T')[0];
              if (!mDailyData[date]) mDailyData[date] = { sum: 0, count: 0 };
              mDailyData[date].sum += r.value;
              mDailyData[date].count++;
            }
          }

          if (parameterId === "18") {
            for (const day of Object.values(mDailyData)) {
              if (day.count >= 18) {
                const avg = day.sum / day.count;
                if (avg > 45.0) mWhoExceed++;
                if (avg > 50.0) mBrExceed++;
              }
            }
          } else if (parameterId === "23") {
            for (const day of Object.values(mDailyData)) {
              if (day.count >= 18) {
                const avg = day.sum / day.count;
                if (avg > 40.0) mWhoExceed++;
                if (avg > 20.0) mBrExceed++;
              }
            }
          } else if (parameterId === "3") {
            for (const day of Object.values(mDailyData)) {
              if (day.count >= 18) {
                const avg = day.sum / day.count;
                if (avg * 1.145 > 4.0) mWhoExceed++;
              }
            }
            const mSorted = mRows
              .map(r => ({ datetime: r.datetime, value: r.value }))
              .sort((a, b) => a.datetime.localeCompare(b.datetime));
            const mMoving = computeMoving8h(mSorted);
            mBrExceed = mMoving.filter(m => m.value !== null && m.value > 9.0).length;
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
