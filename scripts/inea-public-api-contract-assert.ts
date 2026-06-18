import { createClient } from "@supabase/supabase-js";
import { loadIneaSupabaseEnv } from "./lib/inea-env";
import { INEA_RPC_CHECKS, isMissingIneaRpcError } from "./lib/inea-rpc-contract";

const { supabaseUrl, supabaseKey } = loadIneaSupabaseEnv();
process.env.SUPABASE_URL = supabaseUrl;
process.env.SUPABASE_SERVICE_ROLE_KEY = supabaseKey;

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase configuration in env.");
  process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function mockRes() {
  const res: any = {};
  res.headers = {} as Record<string, string>;
  res.setHeader = (key: string, value: string) => {
    res.headers[key] = value;
  };
  res.status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data: unknown) => {
    res.jsonData = data;
    return res;
  };
  res.send = (data: unknown) => {
    res.sendData = data;
    return res;
  };
  return res;
}

function assert(condition: unknown, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function formatErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (isMissingIneaRpcError(message)) {
    return `${message}. O banco atual ainda nao recebeu todas as migrations RPC do Radar INEA; aplique as migrations de rollout antes de executar este assert.`;
  }
  return message;
}

async function invoke(handler: any, req: any) {
  const res = mockRes();
  await handler(req, res);
  return res;
}

function statusMessage(label: string, res: any) {
  const detail = res?.jsonData?.error || res?.sendData || "";
  return detail ? `${label} returned ${res.statusCode}: ${detail}` : `${label} returned ${res.statusCode}`;
}

async function assertRpcReadinessOrThrow() {
  const missingMigrations = new Map<string, string[]>();

  for (const rpc of INEA_RPC_CHECKS) {
    const { error } = await supabase.rpc(rpc.name, rpc.args || {});
    if (!error) continue;
    if (!isMissingIneaRpcError(error.message)) {
      throw new Error(`RPC ${rpc.name} falhou antes do contrato HTTP: ${error.message}`);
    }
    const bucket = missingMigrations.get(rpc.migration) || [];
    bucket.push(rpc.name);
    missingMigrations.set(rpc.migration, bucket);
  }

  if (missingMigrations.size === 0) {
    return;
  }

  const migrationLines = Array.from(missingMigrations.entries()).map(
    ([migration, names]) => `${migration} -> ${names.join(", ")}`
  );
  throw new Error(`RPCs obrigatorias ausentes no banco alvo. Migrations pendentes: ${migrationLines.join(" | ")}`);
}

async function run() {
  console.log("Starting INEA public API contract assertion suite...");
  await assertRpcReadinessOrThrow();

  const summaryHandler = (await import("../api/air/inea/summary")).default;
  const latestHandler = (await import("../api/air/inea/latest")).default;
  const stationsHandler = (await import("../api/air/inea/stations")).default;
  const stationsMetadataHandler = (await import("../api/air/inea/stations-metadata")).default;
  const observabilityHandler = (await import("../api/air/inea/observability")).default;
  const exportManifestHandler = (await import("../api/air/inea/export-manifest")).default;
  const exportCatalogHandler = (await import("../api/air/inea/export-catalog")).default;

  const summaryRes = await invoke(summaryHandler, { method: "GET", query: {} });
  assert(summaryRes.statusCode === 200, statusMessage("summary", summaryRes));
  assert(summaryRes.jsonData.totalStations !== undefined, "summary missing totalStations");
  assert(summaryRes.jsonData.timeRange?.minDate !== undefined, "summary missing timeRange.minDate");
  assert(summaryRes.jsonData.latest_measured_at !== undefined, "summary missing latest_measured_at");
  assert(summaryRes.jsonData.latest_ingested_at !== undefined, "summary missing latest_ingested_at");
  console.log("PASS: summary contract");

  const latestRes = await invoke(latestHandler, { method: "GET", query: {} });
  assert(latestRes.statusCode === 200, statusMessage("latest", latestRes));
  assert(Array.isArray(latestRes.jsonData.stations), "latest must return stations array");
  assert(latestRes.jsonData.latest_measured_at !== undefined, "latest missing latest_measured_at");
  assert(latestRes.jsonData.latest_ingested_at !== undefined, "latest missing latest_ingested_at");
  console.log("PASS: latest contract");

  const stationsRes = await invoke(stationsHandler, { method: "GET", query: {} });
  assert(stationsRes.statusCode === 200, statusMessage("stations", stationsRes));
  assert(Array.isArray(stationsRes.jsonData), "stations must return array");
  if (stationsRes.jsonData.length > 0) {
    const station = stationsRes.jsonData[0];
    assert(station.id && station.name && station.code, "stations item missing id/name/code");
  }
  console.log("PASS: stations contract");

  const metadataRes = await invoke(stationsMetadataHandler, { method: "GET", query: {} });
  assert(metadataRes.statusCode === 200, statusMessage("stations-metadata", metadataRes));
  assert(Array.isArray(metadataRes.jsonData.items), "stations-metadata must return items array");
  if (metadataRes.jsonData.items.length > 0) {
    const item = metadataRes.jsonData.items[0];
    assert(item.operation_window?.is_inferred !== undefined, "stations-metadata missing operation_window.is_inferred");
    assert(item.provenance?.methodology_version, "stations-metadata missing provenance.methodology_version");
  }
  console.log("PASS: stations-metadata contract");

  const observabilityRes = await invoke(observabilityHandler, { method: "GET", query: {} });
  assert(observabilityRes.statusCode === 200, statusMessage("observability", observabilityRes));
  assert(observabilityRes.jsonData.total_stations !== undefined, "observability missing total_stations");
  assert(observabilityRes.jsonData.stations_with_reading_count !== undefined, "observability missing stations_with_reading_count");
  assert(Array.isArray(observabilityRes.jsonData.fragile_stations), "observability missing fragile_stations");
  assert(
    observabilityRes.jsonData.stations_with_reading_count <= observabilityRes.jsonData.total_stations,
    "observability stations_with_reading_count exceeds total_stations"
  );
  console.log("PASS: observability contract");

  const manifestRes = await invoke(exportManifestHandler, { method: "GET", query: {} });
  assert(manifestRes.statusCode === 200, statusMessage("export-manifest", manifestRes));
  assert(manifestRes.jsonData.endpoint === "/api/air/inea/export", "export-manifest endpoint mismatch");
  assert(manifestRes.jsonData.relatedEndpoints?.stations_metadata === "/api/air/inea/stations-metadata", "export-manifest missing stations_metadata");
  console.log("PASS: export-manifest contract");

  const catalogRes = await invoke(exportCatalogHandler, { method: "GET", query: {} });
  assert(catalogRes.statusCode === 200, statusMessage("export-catalog", catalogRes));
  assert(Array.isArray(catalogRes.jsonData.available_years?.partitions), "export-catalog missing yearly partitions");
  assert(Array.isArray(catalogRes.jsonData.available_stations), "export-catalog missing station partitions");
  assert(catalogRes.jsonData.metadata_contract_endpoint === "/api/air/inea/stations-metadata", "export-catalog missing metadata endpoint");
  if (catalogRes.jsonData.available_stations.length > 0) {
    const item = catalogRes.jsonData.available_stations[0];
    assert(typeof item.url === "string" && item.url.includes("/api/air/inea/export?"), "station partition missing url");
    assert(typeof item.station_metadata_url === "string" && item.station_metadata_url.includes("/api/air/inea/stations-metadata?stationId="), "station partition missing station_metadata_url");
  }
  console.log("PASS: export-catalog contract");

  const badMethodRes = await invoke(observabilityHandler, { method: "POST", query: {} });
  assert(badMethodRes.statusCode === 405, `observability POST should return 405, got ${badMethodRes.statusCode}`);
  assert(badMethodRes.headers.Allow === "GET", "observability POST must set Allow: GET");
  console.log("PASS: HTTP method guard contract");

  console.log("INEA public API contract passed.");
}

run().catch((error) => {
  console.error(`INEA public API contract failed: ${formatErrorMessage(error)}`);
  process.exit(1);
});
