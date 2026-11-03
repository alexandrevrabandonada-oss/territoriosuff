/**
 * Private Aurassure/UFF capture endpoint — no public proxy or regulatory classification.
 * Only authorized operators can invoke it. Stores the original provider response with a hash.
 * Provider credentials belong exclusively in Supabase Edge Function secrets.
 */
import { createClient } from "npm:@supabase/supabase-js@2";
import { parseAurassureRequest } from "./request.ts";

const API_ROOT = "https://app.aurassure.com/-/api/iot-platform/v1.1.0/clients/24302/applications/16/things/";
const MAX_RESPONSE_BYTES = 2_000_000;

function json(status: number, data: Record<string, unknown>): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" }
  });
}

async function secureMatch(value: string | null, secret: string): Promise<boolean> {
  if (!value || !secret || secret.length < 32) return false;
  const encoder = new TextEncoder();
  const expected = new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode("Bearer " + secret)));
  const actual = new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
  let difference = 0;
  for (let i = 0; i < expected.length; i++) difference |= expected[i] ^ actual[i];
  return difference === 0;
}

function getAdminKey(): string | null {
  // New Supabase secret API keys have precedence over the legacy service role JWT.
  try {
    const keys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}") as Record<string, string>;
    if (typeof keys.default === "string" && keys.default) return keys.default;
  } catch { /* legacy projects may have no new keys */ }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
}

Deno.serve(async (request: Request) => {
  if (request.method !== "POST") return json(405, { ok: false, error: "method_not_allowed" });
  const operatorToken = Deno.env.get("AURASSURE_BRIDGE_TOKEN");
  if (!operatorToken || operatorToken.length < 32) return json(503, { ok: false, error: "bridge_not_configured" });
  if (!(await secureMatch(request.headers.get("authorization"), operatorToken))) {
    return json(401, { ok: false, error: "unauthorized" });
  }
  const accessId = Deno.env.get("AURASSURE_ACCESS_ID");
  const accessKey = Deno.env.get("AURASSURE_ACCESS_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const adminKey = getAdminKey();
  if (!accessId || !accessKey || !supabaseUrl || !adminKey) {
    return json(503, { ok: false, error: "provider_or_database_not_configured" });
  }

  let payload: unknown;
  try {
    if (Number(request.headers.get("content-length") ?? 0) > 8192) return json(413, { ok: false, error: "request_too_large" });
    const body = await request.text();
    if (body.length > 8192) return json(413, { ok: false, error: "request_too_large" });
    payload = JSON.parse(body);
  } catch {
    return json(400, { ok: false, error: "invalid_json" });
  }

  let validated;
  try {
    validated = parseAurassureRequest(payload);
  } catch (error) {
    return json(400, { ok: false, error: error instanceof Error ? error.message : "invalid_request" });
  }

  let upstreamJson: unknown;
  let raw: string;
  try {
    const response = await fetch(API_ROOT + validated.upstreamPath, {
      method: validated.upstreamMethod,
      headers: {
        "Access-Id": accessId,
        "Access-Key": accessKey,
        "Accept": "application/json",
        ...(validated.operation === "readings" ? { "Content-Type": "application/json" } : {})
      },
      ...(validated.operation === "readings" ? { body: JSON.stringify(validated.upstreamBody) } : {}),
      signal: AbortSignal.timeout(15000)
    });
    if (!response.ok) return json(502, { ok: false, error: "provider_http_error", provider_status: response.status });
    raw = await response.text();
    if (new TextEncoder().encode(raw).length > MAX_RESPONSE_BYTES) {
      return json(502, { ok: false, error: "provider_response_too_large" });
    }
    upstreamJson = JSON.parse(raw);
  } catch (error) {
    // Never log response bodies, provider keys or tokens.
    return json(502, { ok: false, error: error instanceof SyntaxError ? "provider_invalid_json" : "provider_unreachable" });
  }

  const bytes = new TextEncoder().encode(raw);
  const hash = [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))]
    .map((x) => x.toString(16).padStart(2, "0")).join("");

  const db = createClient(supabaseUrl, adminKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await db.from("aurassure_api_snapshots").insert({
    operation: validated.operation,
    request_meta: validated.requestMeta,
    response_json: upstreamJson,
    response_text: raw,
    response_sha256: hash,
    source_system: "AURASSURE_UFF",
    validation_status: "pending_schema_and_metrology_review"
  }).select("id, fetched_at").single();
  if (error || !data) return json(503, { ok: false, error: "private_snapshot_storage_failed" });

  return json(200, {
    ok: true,
    source_system: "AURASSURE_UFF",
    operation: validated.operation,
    snapshot_id: data.id,
    fetched_at: data.fetched_at,
    sha256: hash,
    validation_status: "pending_schema_and_metrology_review",
    // Station discovery response is visible only to the authenticated operator.
    ...(validated.operation === "stations" ? { provider_response: upstreamJson } : {})
  });
});
