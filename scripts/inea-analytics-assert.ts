import * as fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const ENV_FILE = fs.existsSync('.env.local') ? '.env.local' : '.env';

function parseEnvFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) return {};
  const raw = fs.readFileSync(filePath, 'utf8');
  const env: Record<string, string> = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

// 1. Populate process.env BEFORE importing the handler modules
const env = parseEnvFile(ENV_FILE);
process.env.SUPABASE_URL = env.SUPABASE_URL || env.VITE_SUPABASE_URL || "";
process.env.SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY || "";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase configuration in env.");
  process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const mockRes = () => {
  const res: any = {};
  res.headers = {} as Record<string, string>;
  res.setHeader = (key: string, value: string) => {
    res.headers[key] = value;
  };
  res.status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data: any) => {
    res.jsonData = data;
    return res;
  };
  return res;
};

async function runAssertions() {
  console.log("Starting INEA analytics QA assertion suite...");
  let failures = 0;

  try {
    // Dynamically import the handlers so they read the updated process.env
    const degradedDaysHandler = (await import('../api/air/inea/analytics/degraded-days')).default;
    const stationRankingHandler = (await import('../api/air/inea/analytics/station-ranking')).default;
    const monthlyProfileHandler = (await import('../api/air/inea/analytics/monthly-profile')).default;
    const dataGapsHandler = (await import('../api/air/inea/analytics/data-gaps')).default;

    // Test 1: Fetch raw general AQI measurements and check for zero index values
    const { data: measurements, error } = await supabase
      .from("air_measurements")
      .select("air_quality_index, air_quality_classification, raw_json, station_id")
      .eq("source", "INEA")
      .eq("metric_type", "GENERAL_AQI");

    if (error) throw error;

    console.log(`PASS: Loaded ${measurements?.length || 0} GENERAL_AQI measurements for validation.`);

    // Verify if any record has air_quality_index = 0 and check if it is valid or blank
    let zeroCount = 0;
    let blankZeroCount = 0;

    for (const m of measurements || []) {
      if (m.air_quality_index === 0) {
        zeroCount++;
        const rawJson = m.raw_json || {};
        const subindexKeys = ["IQA MP10", "IQA MP2,5", "IQA SO2", "IQA NO2", "IQA O3", "IQA CO"];
        const hasValidSubindex = subindexKeys.some(key => {
          const val = rawJson[key];
          return val !== null && val !== undefined && val !== 0 && val !== "0";
        });
        if (!hasValidSubindex) {
          blankZeroCount++;
        }
      }
    }

    console.log(`INFO: Found ${zeroCount} records with air_quality_index = 0.`);
    console.log(`INFO: Found ${blankZeroCount} blank records with index = 0 and all subindices null/zero.`);

    // Test 2: Call degraded-days handler
    const resDegraded = mockRes();
    await degradedDaysHandler({ method: "GET", query: {} }, resDegraded);
    
    if (resDegraded.statusCode !== 200) {
      console.error("FAIL: degraded-days API returned status", resDegraded.statusCode);
      failures++;
    } else {
      const data = resDegraded.jsonData;
      console.log("PASS: degraded-days API executed successfully.");
      
      // Verify structure of the response
      for (const item of data) {
        if (
          item.measured_days === undefined ||
          item.expected_days === undefined ||
          item.coverage_percent === undefined ||
          item.insufficient_data_days === undefined ||
          item.degraded_days === undefined ||
          item.degraded_percent_of_measured_days === undefined ||
          item.degraded_percent_of_expected_days === undefined ||
          !item.caveat
        ) {
          console.error("FAIL: degraded-days item is missing required QA fields:", item);
          failures++;
          break;
        }
      }
    }

    // Test 3: Call station-ranking handler
    const resRanking = mockRes();
    await stationRankingHandler({ method: "GET", query: {} }, resRanking);
    
    if (resRanking.statusCode !== 200) {
      console.error("FAIL: station-ranking API returned status", resRanking.statusCode);
      failures++;
    } else {
      const data = resRanking.jsonData;
      console.log("PASS: station-ranking API executed successfully.");
      for (const item of data) {
        if (
          item.measured_days === undefined ||
          item.expected_days === undefined ||
          item.coverage_percent === undefined ||
          item.insufficient_data_days === undefined ||
          item.degraded_days === undefined ||
          item.degraded_percent_of_measured_days === undefined ||
          item.degraded_percent_of_expected_days === undefined ||
          item.max_aqi === undefined ||
          item.max_aqi_classification === undefined ||
          !item.caveat
        ) {
          console.error("FAIL: station-ranking item is missing required QA fields:", item);
          failures++;
          break;
        }
      }
    }

    // Test 4: Call monthly-profile handler
    const resMonthly = mockRes();
    await monthlyProfileHandler({ method: "GET", query: {} }, resMonthly);
    
    if (resMonthly.statusCode !== 200) {
      console.error("FAIL: monthly-profile API returned status", resMonthly.statusCode);
      failures++;
    } else {
      const data = resMonthly.jsonData;
      console.log("PASS: monthly-profile API executed successfully.");
      for (const item of data) {
        if (
          item.month === undefined ||
          item.month_name === undefined ||
          item.measured_days === undefined ||
          item.expected_days === undefined ||
          item.coverage_percent === undefined ||
          item.insufficient_data_days === undefined ||
          item.degraded_days === undefined ||
          item.degraded_percent_of_measured_days === undefined ||
          item.degraded_percent_of_expected_days === undefined ||
          !item.caveat
        ) {
          console.error("FAIL: monthly-profile item is missing required QA fields:", item);
          failures++;
          break;
        }
      }
    }

    // Test 5: Call data-gaps handler
    const resGaps = mockRes();
    await dataGapsHandler({ method: "GET", query: {} }, resGaps);
    
    if (resGaps.statusCode !== 200) {
      console.error("FAIL: data-gaps API returned status", resGaps.statusCode);
      failures++;
    } else {
      const data = resGaps.jsonData;
      console.log("PASS: data-gaps API executed successfully.");
      for (const item of data) {
        if (
          item.measured_days === undefined ||
          item.expected_days === undefined ||
          item.coverage_percent === undefined ||
          item.insufficient_data_days === undefined ||
          item.degraded_days === undefined ||
          item.degraded_percent_of_measured_days === undefined ||
          item.degraded_percent_of_expected_days === undefined ||
          item.gap_count === undefined ||
          item.max_gap_hours === undefined ||
          !item.caveat
        ) {
          console.error("FAIL: data-gaps item is missing required QA fields:", item);
          failures++;
          break;
        }
      }
    }

  } catch (err: any) {
    console.error("FAIL: Exception thrown during assertion suite:", err.message);
    failures++;
  }

  console.log("\n------------------------------------------------");
  if (failures > 0) {
    console.error(`QA ANALYTICS COMPLIANCE FAILED: ${failures} assertion failure(s) found.`);
    process.exit(1);
  } else {
    console.log("QA ANALYTICS COMPLIANCE PASSED: All analytics APIs satisfy data completeness rules.");
    process.exit(0);
  }
}

void runAssertions();
