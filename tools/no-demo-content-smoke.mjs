import fs from "node:fs";
import path from "node:path";

const apiPath = path.resolve("src/lib/api.legacy.ts");

function fail(message) {
  console.error(`[NO DEMO CONTENT SMOKE] FAILED: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(apiPath)) {
  fail("src/lib/api.legacy.ts not found");
}

const source = fs.readFileSync(apiPath, "utf8");

const requiredPatterns = [
  "function isDemoRecord",
  "slug.startsWith(\"demo-\")",
  "meta.demo === true",
  "filter((row) => !isDemoRecord(row))",
  "if (isDemoRecord(data as Record<string, unknown>)) return null",
  "if (isDemoRecord(corridor as Record<string, unknown>)) return null"
];

for (const pattern of requiredPatterns) {
  if (!source.includes(pattern)) {
    fail(`missing public demo filter guard: ${pattern}`);
  }
}

console.log("[NO DEMO CONTENT SMOKE] OK: Public APIs filter demo/mock content.");
