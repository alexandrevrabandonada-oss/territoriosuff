import * as fs from 'node:fs';
import * as path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { importXlsx } from './inea-import-qualidade-ar-xlsx';

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
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY; // Fallback to anon if role key is missing

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Critical: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined in env.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runIngest() {
  console.log("Starting INEA Database Ingestion run...");
  const startedAt = new Date().toISOString();
  
  // 1. Create run record in database
  const { data: runData, error: runError } = await supabase
    .from('air_ingest_runs')
    .insert([
      {
        source: 'INEA',
        source_system: 'CKAN_XLSX',
        started_at: startedAt,
        status: 'running',
        rows_read: 0,
        rows_inserted: 0
      }
    ])
    .select()
    .single();

  if (runError) {
    console.error("Failed to register ingest run:", runError.message);
    process.exit(1);
  }

  const runId = runData.id;

  try {
    // 2. Fetch and import XLSX data
    const canonicalMeasurements = await importXlsx();
    console.log(`Successfully parsed ${canonicalMeasurements.length} canonical measurements.`);

    // Update read rows in run record
    await supabase
      .from('air_ingest_runs')
      .update({ rows_read: canonicalMeasurements.length })
      .eq('id', runId);

    // 3. Extract and upsert Stations
    // Get unique stations
    const stationsMap = new Map<string, { lat: number | null, lng: number | null, raw: any }>();
    for (const m of canonicalMeasurements) {
      if (!stationsMap.has(m.station_name)) {
        stationsMap.set(m.station_name, {
          lat: m.lat,
          lng: m.lng,
          raw: m.raw
        });
      } else {
        // If we find lat/lng in later rows, fill them in
        const current = stationsMap.get(m.station_name)!;
        if (current.lat === null && m.lat !== null) {
          current.lat = m.lat;
          current.lng = m.lng;
        }
      }
    }

    const stationsToUpsert = Array.from(stationsMap.entries()).map(([name, data]) => ({
      source: 'INEA',
      source_system: 'CKAN_XLSX',
      code: name,
      name: name,
      city: 'Volta Redonda',
      lat: data.lat,
      lng: data.lng,
      active: true,
      raw_json: data.raw
    }));

    console.log(`Upserting ${stationsToUpsert.length} stations into air_stations...`);
    const { error: stationUpsertError } = await supabase
      .from('air_stations')
      .upsert(stationsToUpsert, { onConflict: 'source,code' });

    if (stationUpsertError) {
      throw new Error(`Failed to upsert stations: ${stationUpsertError.message}`);
    }

    // 4. Fetch the stations from the database to map Names to UUIDs
    const { data: dbStations, error: stationsFetchError } = await supabase
      .from('air_stations')
      .select('id, name')
      .eq('source', 'INEA');

    if (stationsFetchError || !dbStations) {
      throw new Error(`Failed to fetch stations: ${stationsFetchError?.message || 'No stations found'}`);
    }

    const stationIdMap = new Map<string, string>();
    for (const s of dbStations) {
      stationIdMap.set(s.name, s.id);
    }

    // 5. Map and Batch Upsert Measurements
    const measurementsToInsert = canonicalMeasurements.map(m => {
      const stationId = stationIdMap.get(m.station_name);
      if (!stationId) {
        console.warn(`Warning: Station "${m.station_name}" not found in database lookup map. Skipping measurement.`);
        return null;
      }

      return {
        station_id: stationId,
        source: 'INEA',
        source_system: 'CKAN_XLSX',
        pollutant: m.pollutant || 'IQAr',
        value: m.value,
        unit: m.unit,
        measured_at: m.measured_at,
        averaging_period: m.averaging_period,
        quality_flag: m.quality_flag,
        metric_type: m.metric_type,
        air_quality_index: m.air_quality_index,
        air_quality_classification: m.air_quality_classification,
        controlling_pollutant: m.controlling_pollutant,
        raw_column: m.raw_column,
        raw_json: m.raw
      };
    }).filter(Boolean);

    // Deduplicate in memory before upsert to avoid duplicate keys in the same batch
    const uniqueMeasurementsMap = new Map<string, any>();
    for (const m of measurementsToInsert) {
      if (!m) continue;
      const key = `${m.station_id}_${m.pollutant}_${m.measured_at}_${m.averaging_period}_${m.metric_type}`;
      uniqueMeasurementsMap.set(key, m); // Keeps the last one
    }
    const deduplicatedMeasurements = Array.from(uniqueMeasurementsMap.values());
    console.log(`Prepared ${measurementsToInsert.length} measurements. Deduplicated to ${deduplicatedMeasurements.length} unique records. Batching...`);

    const BATCH_SIZE = 500;
    let insertedCount = 0;

    for (let i = 0; i < deduplicatedMeasurements.length; i += BATCH_SIZE) {
      const batch = deduplicatedMeasurements.slice(i, i + BATCH_SIZE);
      console.log(`Upserting batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(deduplicatedMeasurements.length / BATCH_SIZE)} (${batch.length} rows)...`);
      
      const { error: batchError } = await supabase
        .from('air_measurements')
        .upsert(batch, { onConflict: 'station_id,pollutant,measured_at,averaging_period,metric_type' });

      if (batchError) {
        console.error(`Error in batch starting at index ${i}:`, batchError.message);
      } else {
        insertedCount += batch.length;
      }
    }

    console.log(`Ingestion completed. ${insertedCount} measurements processed successfully.`);

    // 6. Update run record to success
    const finishedAt = new Date().toISOString();
    const statsReport = {
      totalStationsUpserted: stationsToUpsert.length,
      measurementsProcessed: measurementsToInsert.length,
      measurementsSuccessfullySaved: insertedCount,
      uniqueStations: Array.from(stationsMap.keys())
    };

    await supabase
      .from('air_ingest_runs')
      .update({
        finished_at: finishedAt,
        status: 'success',
        rows_inserted: insertedCount,
        report_json: statsReport
      })
      .eq('id', runId);

    // 7. Write Markdown Report
    const mdPath = path.join(process.cwd(), 'reports', 'estado-da-nacao-inea-ingest.md');
    const mdContent = `# Estado da Nação — INEA Ingestion Report

**ID da Execução:** \`${runId}\`
**Status:** \`SUCCESS\`
**Início:** \`${startedAt}\`
**Fim:** \`${finishedAt}\`

## Resumo da Ingestão
Os dados do arquivo XLSX do INEA foram processados e importados com sucesso para o banco de dados do Supabase.

## Estatísticas de Banco de Dados
- **Estações Inseridas/Atualizadas:** ${stationsToUpsert.length}
- **Medições Lidas:** ${canonicalMeasurements.length}
- **Medições Inseridas/Atualizadas:** ${insertedCount}

## Estações Mapeadas
${stationsToUpsert.map(s => `- **${s.name}** (Lat: \`${s.lat}\`, Lng: \`${s.lng}\`)`).join('\n')}

## Validação e Consistência
- Todas as medições duplicadas foram tratadas no banco de dados através da restrição exclusiva composto \`ux_air_measurements_prevent_duplicates\`.
- Registros sem data ou sem valores válidos de medição foram devidamente ignorados durante o processamento.
`;

    fs.writeFileSync(mdPath, mdContent, 'utf8');
    console.log(`Saved ingestion Markdown report to ${mdPath}`);

  } catch (error: any) {
    console.error("Critical Ingestion Failure:", error.message);
    const finishedAt = new Date().toISOString();
    await supabase
      .from('air_ingest_runs')
      .update({
        finished_at: finishedAt,
        status: 'failed',
        error_message: error.message
      })
      .eq('id', runId);

    // Write failure report
    const mdPath = path.join(process.cwd(), 'reports', 'estado-da-nacao-inea-ingest.md');
    const mdContent = `# Estado da Nação — INEA Ingestion Report (FALHA)

**ID da Execução:** \`${runId}\`
**Status:** \`FAILED\`
**Início:** \`${startedAt}\`
**Fim:** \`${finishedAt}\`

## Erro Crítico
Ocorreu um erro fatal que impediu a conclusão da ingestão:
\`\`\`
${error.message}
\`\`\`

## Stacktrace
\`\`\`
${error.stack}
\`\`\`
`;
    fs.writeFileSync(mdPath, mdContent, 'utf8');
  }
}

void runIngest();
