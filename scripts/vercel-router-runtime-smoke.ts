import assert from "node:assert/strict";

import ineaRouter from "../api/inea-router.js";
import shareRouter from "../api/share-router.js";

function mockResponse() {
  const res: {
    statusCode: number;
    jsonData: unknown;
    location: string | null;
    headers: Record<string, string>;
    status: (code: number) => typeof res;
    json: (data: unknown) => typeof res;
    redirect: (codeOrLocation: number | string, path?: string) => typeof res;
    setHeader: (key: string, value: string) => void;
    send: (data: unknown) => typeof res;
  } = {
    statusCode: 200,
    jsonData: null,
    location: null,
    headers: {},
    status(code) { res.statusCode = code; return res; },
    json(data) { res.jsonData = data; return res; },
    send(data) { res.jsonData = data; return res; },
    setHeader(key,value) { res.headers[key.toLowerCase()] = value; },
    redirect(codeOrLocation, path) {
      res.statusCode = typeof codeOrLocation === "number" ? codeOrLocation : 302;
      res.location = typeof codeOrLocation === "string" ? codeOrLocation : (path ?? null);
      return res;
    }
  };
  return res;
}

const valid = mockResponse();
await ineaRouter({ method: "GET", query: { endpoint: "export-manifest" } }, valid);
assert.equal(valid.statusCode, 200, "INEA manifest route must preserve HTTP 200");
assert.equal((valid.jsonData as { dataset?: string })?.dataset, "inea_air_measurements_public_export", "INEA route must forward the existing manifest contract");

const invalidMethod = mockResponse();
await ineaRouter({ method: "POST", query: { endpoint: "export-manifest" } }, invalidMethod);
assert.equal(invalidMethod.statusCode, 405, "INEA handler must still reject unsupported methods");

const denied = ["unknown","../export","constructor","__proto__","analytics/_http"];
for (const endpoint of denied) {
  const res = mockResponse();
  await ineaRouter({ method: "GET", query: { endpoint } }, res);
  assert.equal(res.statusCode, 404, "INEA router must reject non-allowlisted " + endpoint);
}

const absent = mockResponse();
await ineaRouter({ method: "GET", query: {} }, absent);
assert.equal(absent.statusCode, 404, "Missing router parameter must not expose the index");

const shareMissing = mockResponse();
await shareRouter({ method: "GET", query: { endpoint: "agenda" }, headers: {} }, shareMissing);
assert.equal(shareMissing.location, "/agenda", "Share agenda fallback should preserve public route");

const shareDenied = mockResponse();
await shareRouter({ method: "GET", query: { endpoint: "unknown" } }, shareDenied);
assert.equal(shareDenied.statusCode, 404, "Unknown share routes must be rejected");

console.log("Vercel consolidated router runtime smoke: manifest 200, method 405, redirects and allowlists passed.");
