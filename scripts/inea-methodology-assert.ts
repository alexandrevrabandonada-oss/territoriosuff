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

const env = parseEnvFile(ENV_FILE);
const SUPABASE_URL = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Critical: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined in env.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runAssertions() {
  console.log("Starting INEA methodology QA assertion suite...");

  // Fetch all INEA records (up to a large limit or paginate, or write targeted checks)
  // Wait, let's paginate or select counts and run tests.
  // Actually, we can retrieve all measurements in batches or just fetch all since Volta Redonda is ~15,696 records.
  // Or even better, we can query specific violation count queries, which is extremely robust and fast!
  // Let's perform targeted queries to see if any violations exist:

  let failures = 0;

  // Assertion 1: Total records count
  const { count: totalCount, error: countError } = await supabase
    .from('air_measurements')
    .select('*', { count: 'exact', head: true })
    .eq('source', 'INEA');

  if (countError) {
    console.error("FAIL: Error fetching total count of INEA measurements:", countError.message);
    failures++;
  } else {
    console.log(`PASS: Found total of ${totalCount} INEA measurements in database.`);
    if ((totalCount || 0) === 0) {
      console.error("FAIL: Database is empty of INEA measurements!");
      failures++;
    }
  }

  // Assertion 1b: No records can have null metric_type
  const { count: nullMetricTypeCount, error: nullMetricTypeError } = await supabase
    .from('air_measurements')
    .select('*', { count: 'exact', head: true })
    .eq('source', 'INEA')
    .is('metric_type', null);

  if (nullMetricTypeError) {
    console.error("FAIL: Error checking for null metric_type values:", nullMetricTypeError.message);
    failures++;
  } else if ((nullMetricTypeCount || 0) > 0) {
    console.error(`FAIL: Found ${nullMetricTypeCount} records where metric_type is null! All INEA measurements must have a valid metric_type.`);
    failures++;
  } else {
    console.log("PASS: 0 records have null metric_type.");
  }

  // Assertion 2: POLLUTANT_CONCENTRATION must be 0 for INEA
  const { count: concentrationCount, error: concentrationError } = await supabase
    .from('air_measurements')
    .select('*', { count: 'exact', head: true })
    .eq('source', 'INEA')
    .eq('metric_type', 'POLLUTANT_CONCENTRATION');

  if (concentrationError) {
    console.error("FAIL: Error checking POLLUTANT_CONCENTRATION count:", concentrationError.message);
    failures++;
  } else if ((concentrationCount || 0) > 0) {
    console.error(`FAIL: Found ${concentrationCount} records with metric_type = 'POLLUTANT_CONCENTRATION' for INEA! There should be 0.`);
    failures++;
  } else {
    console.log("PASS: Found 0 records with metric_type = 'POLLUTANT_CONCENTRATION' for INEA.");
  }

  // Assertion 3: Any POLLUTANT_SUBINDEX (IQA cols) must have unit = null
  const { count: subindexUnitViolationCount, error: subindexUnitError } = await supabase
    .from('air_measurements')
    .select('*', { count: 'exact', head: true })
    .eq('source', 'INEA')
    .eq('metric_type', 'POLLUTANT_SUBINDEX')
    .not('unit', 'is', null);

  if (subindexUnitError) {
    console.error("FAIL: Error checking POLLUTANT_SUBINDEX units:", subindexUnitError.message);
    failures++;
  } else if ((subindexUnitViolationCount || 0) > 0) {
    console.error(`FAIL: Found ${subindexUnitViolationCount} records of POLLUTANT_SUBINDEX with non-null units!`);
    failures++;
  } else {
    console.log("PASS: All POLLUTANT_SUBINDEX records have unit = null.");
  }

  // Assertion 4: Any GENERAL_AQI (Índice IQAr) must have unit = null
  const { count: aqiUnitViolationCount, error: aqiUnitError } = await supabase
    .from('air_measurements')
    .select('*', { count: 'exact', head: true })
    .eq('source', 'INEA')
    .eq('metric_type', 'GENERAL_AQI')
    .not('unit', 'is', null);

  if (aqiUnitError) {
    console.error("FAIL: Error checking GENERAL_AQI units:", aqiUnitError.message);
    failures++;
  } else if ((aqiUnitViolationCount || 0) > 0) {
    console.error(`FAIL: Found ${aqiUnitViolationCount} records of GENERAL_AQI with non-null units!`);
    failures++;
  } else {
    console.log("PASS: All GENERAL_AQI records have unit = null.");
  }

  // Assertion 5: Any row starting with raw_column 'IQA ' must be POLLUTANT_SUBINDEX
  const { count: rawColumnSubindexViolationCount, error: rawColumnSubindexError } = await supabase
    .from('air_measurements')
    .select('*', { count: 'exact', head: true })
    .eq('source', 'INEA')
    .like('raw_column', 'IQA %')
    .neq('metric_type', 'POLLUTANT_SUBINDEX');

  if (rawColumnSubindexError) {
    console.error("FAIL: Error checking raw_column -> POLLUTANT_SUBINDEX mapping:", rawColumnSubindexError.message);
    failures++;
  } else if ((rawColumnSubindexViolationCount || 0) > 0) {
    console.error(`FAIL: Found ${rawColumnSubindexViolationCount} records where raw_column starts with 'IQA ' but metric_type is not 'POLLUTANT_SUBINDEX'!`);
    failures++;
  } else {
    console.log("PASS: All raw_columns starting with 'IQA ' are mapped to POLLUTANT_SUBINDEX.");
  }

  // Assertion 6: raw_column 'Índice IQAr' must be GENERAL_AQI
  const { count: rawColumnAqiViolationCount, error: rawColumnAqiError } = await supabase
    .from('air_measurements')
    .select('*', { count: 'exact', head: true })
    .eq('source', 'INEA')
    .eq('raw_column', 'Índice IQAr')
    .neq('metric_type', 'GENERAL_AQI');

  if (rawColumnAqiError) {
    console.error("FAIL: Error checking raw_column -> GENERAL_AQI mapping:", rawColumnAqiError.message);
    failures++;
  } else if ((rawColumnAqiViolationCount || 0) > 0) {
    console.error(`FAIL: Found ${rawColumnAqiViolationCount} records where raw_column is 'Índice IQAr' but metric_type is not 'GENERAL_AQI'!`);
    failures++;
  } else {
    console.log("PASS: All raw_columns matching 'Índice IQAr' are mapped to GENERAL_AQI.");
  }

  // Assertion 7: air_quality_classification must not be 'OK'
  const { count: okClassificationViolationCount, error: okClassificationError } = await supabase
    .from('air_measurements')
    .select('*', { count: 'exact', head: true })
    .eq('source', 'INEA')
    .eq('air_quality_classification', 'OK');

  if (okClassificationError) {
    console.error("FAIL: Error checking air_quality_classification for 'OK' values:", okClassificationError.message);
    failures++;
  } else if ((okClassificationViolationCount || 0) > 0) {
    console.error(`FAIL: Found ${okClassificationViolationCount} records where air_quality_classification is 'OK'! It should be a real air quality description (e.g., BOA, MODERADA, etc.).`);
    failures++;
  } else {
    console.log("PASS: No records have air_quality_classification = 'OK'.");
  }

  // Assertion 8: air_quality_classification must have valid values (like BOA, MODERADA, etc.) for GENERAL_AQI
  const { data: classificationsSample, error: classificationsError } = await supabase
    .from('air_measurements')
    .select('air_quality_classification')
    .eq('source', 'INEA')
    .eq('metric_type', 'GENERAL_AQI')
    .limit(100);

  if (classificationsError) {
    console.error("FAIL: Error fetching classifications sample:", classificationsError.message);
    failures++;
  } else {
    const values = Array.from(new Set(classificationsSample.map(x => x.air_quality_classification).filter(Boolean)));
    if (values.length === 0) {
      console.error("FAIL: No valid air quality classifications found in sample (they are all null or empty).");
      failures++;
    } else {
      console.log("PASS: Found valid air quality classifications in sample:", values.join(", "));
    }
  }

  // Assertion 9: quality_flag must be exactly 'OK' for all rows
  const { count: nonOkQualityFlagCount, error: qualityFlagError } = await supabase
    .from('air_measurements')
    .select('*', { count: 'exact', head: true })
    .eq('source', 'INEA')
    .neq('quality_flag', 'OK');

  if (qualityFlagError) {
    console.error("FAIL: Error checking quality_flag for non-OK values:", qualityFlagError.message);
    failures++;
  } else if ((nonOkQualityFlagCount || 0) > 0) {
    console.error(`FAIL: Found ${nonOkQualityFlagCount} records where quality_flag is not 'OK'!`);
    failures++;
  } else {
    console.log("PASS: All records have quality_flag = 'OK'.");
  }

  console.log("\n------------------------------------------------");
  if (failures > 0) {
    console.error(`QA METHODOLOGY FAILED: ${failures} assertions failed.`);
    process.exit(1);
  } else {
    console.log("QA METHODOLOGY PASSED: All assertions completed successfully.");
    process.exit(0);
  }
}

void runAssertions();
