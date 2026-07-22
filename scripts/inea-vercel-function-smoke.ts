import { loadIneaSupabaseEnv } from "./lib/inea-env";

type MockResponse = {
  headers: Record<string, string>;
  statusCode?: number;
  jsonData?: unknown;
  sendData?: unknown;
  setHeader: (key: string, value: string) => void;
  status: (code: number) => MockResponse;
  json: (data: unknown) => MockResponse;
  send: (data: unknown) => MockResponse;
};

type Handler = (req: { method: string; query: Record<string, string> }, res: MockResponse) => Promise<unknown>;
type ExpectedShape = "array" | "object";

const { supabaseUrl, supabaseKey } = loadIneaSupabaseEnv();
process.env.SUPABASE_URL = supabaseUrl;
process.env.SUPABASE_SERVICE_ROLE_KEY = supabaseKey;

function mockResponse(): MockResponse {
  const response = {} as MockResponse;
  response.headers = {};
  response.setHeader = (key, value) => {
    response.headers[key.toLowerCase()] = value;
  };
  response.status = (code) => {
    response.statusCode = code;
    return response;
  };
  response.json = (data) => {
    response.jsonData = data;
    return response;
  };
  response.send = (data) => {
    response.sendData = data;
    return response;
  };
  return response;
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertShape(name: string, payload: unknown, expectedShape: ExpectedShape) {
  if (expectedShape === "array") {
    assert(Array.isArray(payload), `${name} must return an array`);
    return;
  }
  assert(payload !== null && typeof payload === "object" && !Array.isArray(payload), `${name} must return an object`);
}

async function run() {
  const checks: Array<{ name: string; expectedShape: ExpectedShape; handler: Handler }> = [
    { name: "summary", expectedShape: "object", handler: (await import("../api/air/inea/summary")).default },
    { name: "stations", expectedShape: "array", handler: (await import("../api/air/inea/stations")).default },
    { name: "latest", expectedShape: "object", handler: (await import("../api/air/inea/latest")).default },
    { name: "observability", expectedShape: "object", handler: (await import("../api/air/inea/observability")).default },
    { name: "export-catalog", expectedShape: "object", handler: (await import("../api/air/inea/export-catalog")).default },
    { name: "classification-days", expectedShape: "object", handler: (await import("../api/air/inea/classification-days")).default },
    { name: "analytics/degraded-days", expectedShape: "array", handler: (await import("../api/air/inea/analytics/degraded-days")).default },
    { name: "analytics/controller-frequency", expectedShape: "array", handler: (await import("../api/air/inea/analytics/controller-frequency")).default },
    { name: "analytics/monthly-profile", expectedShape: "array", handler: (await import("../api/air/inea/analytics/monthly-profile")).default },
    { name: "analytics/station-ranking", expectedShape: "array", handler: (await import("../api/air/inea/analytics/station-ranking")).default },
    { name: "analytics/data-gaps", expectedShape: "array", handler: (await import("../api/air/inea/analytics/data-gaps")).default }
  ];

  const results = await Promise.all(checks.map(async (check) => {
    const startedAt = Date.now();
    const response = mockResponse();
    await check.handler({ method: "GET", query: {} }, response);
    assert(response.statusCode === 200, `${check.name} returned ${response.statusCode}: ${JSON.stringify(response.jsonData ?? response.sendData)}`);
    assertShape(check.name, response.jsonData, check.expectedShape);
    assert(response.headers["content-type"]?.includes("application/json"), `${check.name} must set application/json content type`);
    return { name: check.name, durationMs: Date.now() - startedAt };
  }));

  for (const result of results) {
    console.log(`PASS ${result.name} (${result.durationMs} ms)`);
  }
  console.log(`Vercel Function runtime smoke passed: ${results.length}/11 critical Radar endpoints returned HTTP 200 with valid JSON shapes.`);
}

void run().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
