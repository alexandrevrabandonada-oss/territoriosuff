import * as fs from "node:fs";
import * as path from "node:path";

import {
  AIR_PUBLIC_DATA_BASE_PATH,
  AIR_PUBLIC_DOWNLOADS,
  AIR_PUBLIC_FILES,
  type AirPublicManifest
} from "../src/data/air/public-downloads";

const repoRoot = process.cwd();
const publicAirDir = path.join(repoRoot, "public", "data", "air");
const scanRoots = [
  path.join(repoRoot, "src", "pages", "air"),
  path.join(repoRoot, "src", "components", "air"),
  path.join(repoRoot, "src", "data", "air")
];

const linkPattern = /["'`](\/data\/air\/[^"'`)\s]+)["'`]/g;
const allowedMissing = new Set<string>();

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    if (!/\.(tsx?|jsx?)$/.test(entry.name)) return [];
    return [fullPath];
  });
}

const failures: string[] = [];
const checked = new Set<string>();
const manifestPath = path.join(publicAirDir, "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as AirPublicManifest;
const manifestFiles = new Set((manifest.datasets || []).map((dataset) => dataset.filename).filter(Boolean));
const contractFiles = new Set(AIR_PUBLIC_FILES.map((item) => item.file));
const seenManifestFiles = new Set<string>();

const requiredManifestFields: Array<keyof AirPublicManifest> = [
  "version",
  "dataset_version",
  "status",
  "generated_at",
  "source_system",
  "methodology_label",
  "coverage_notes",
  "last_smoke_test_at",
  "datasets"
];

for (const field of requiredManifestFields) {
  if (manifest[field] === undefined || manifest[field] === null || manifest[field] === "") {
    failures.push(`manifest.json is missing required field: ${field}`);
  }
}

if (!Array.isArray(manifest.datasets) || manifest.datasets.length === 0) {
  failures.push("manifest.json datasets must be a non-empty array");
}

function countCsvRows(file: string) {
  const diskPath = path.join(publicAirDir, file);
  const content = fs.readFileSync(diskPath, "utf8").trim();
  if (!content) return 0;
  return Math.max(0, content.split(/\r?\n/).length - 1);
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  if (inQuotes) {
    throw new Error("unclosed quoted field");
  }

  cells.push(current);
  return cells;
}

function verifyCsvShape(file: string) {
  const diskPath = path.join(publicAirDir, file);
  const content = fs.readFileSync(diskPath, "utf8").trim();
  if (!content) {
    failures.push(`CSV ${file} is empty`);
    return;
  }

  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) {
    failures.push(`CSV ${file} has no parseable lines`);
    return;
  }

  let headers: string[];
  try {
    headers = parseCsvLine(lines[0]).map((header) => header.trim());
  } catch (err) {
    failures.push(`CSV ${file} header parse failed: ${err instanceof Error ? err.message : String(err)}`);
    return;
  }

  if (headers.length === 0 || headers.some((header) => header.length === 0)) {
    failures.push(`CSV ${file} has empty header cell(s)`);
  }

  const duplicateHeaders = headers.filter((header, index) => headers.indexOf(header) !== index);
  if (duplicateHeaders.length > 0) {
    failures.push(`CSV ${file} has duplicate header(s): ${Array.from(new Set(duplicateHeaders)).join(", ")}`);
  }

  for (const [index, line] of lines.slice(1).entries()) {
    try {
      const cells = parseCsvLine(line);
      if (cells.length !== headers.length) {
        failures.push(`CSV ${file} row ${index + 2} has ${cells.length} columns, expected ${headers.length}`);
        return;
      }
    } catch (err) {
      failures.push(`CSV ${file} row ${index + 2} parse failed: ${err instanceof Error ? err.message : String(err)}`);
      return;
    }
  }
}

function verifyAirFile(file: string, sourceLabel: string) {
  const diskPath = path.join(publicAirDir, file);
  checked.add(`/data/air/${file}`);
  if (!fs.existsSync(diskPath)) {
    failures.push(`${sourceLabel} -> /data/air/${file}`);
  }
}

for (const item of AIR_PUBLIC_DOWNLOADS) {
  verifyAirFile(item.file, "AIR_PUBLIC_DOWNLOADS");
  if (!contractFiles.has(item.file)) {
    failures.push(`AIR_PUBLIC_DOWNLOADS -> ${item.file} is missing from AIR_PUBLIC_FILES`);
  }
}

for (const item of AIR_PUBLIC_FILES) {
  verifyAirFile(item.file, "AIR_PUBLIC_FILES");
  if (item.file !== "manifest.json" && !manifestFiles.has(item.file)) {
    failures.push(`AIR_PUBLIC_FILES -> ${item.file} is missing from public/data/air/manifest.json`);
  }
}

for (const dataset of manifest.datasets || []) {
  if (!dataset.filename) continue;
  if (seenManifestFiles.has(dataset.filename)) {
    failures.push(`manifest has duplicate dataset filename: ${dataset.filename}`);
  }
  seenManifestFiles.add(dataset.filename);
  if (!contractFiles.has(dataset.filename)) {
    failures.push(`manifest dataset ${dataset.filename} is missing from AIR_PUBLIC_FILES`);
  }

  for (const field of ["title", "description", "updated_at", "source_system", "methodological_label", "public_url"] as const) {
    if (!dataset[field]) {
      failures.push(`manifest dataset ${dataset.filename} is missing required field: ${field}`);
    }
  }

  verifyAirFile(dataset.filename, "public/data/air/manifest.json");

  const expectedUrl = `https://semear-pwa.vercel.app${AIR_PUBLIC_DATA_BASE_PATH}/${dataset.filename}`;
  if (dataset.public_url !== expectedUrl) {
    failures.push(`manifest public_url mismatch for ${dataset.filename}: expected ${expectedUrl}, got ${dataset.public_url || "empty"}`);
  }

  if (dataset.filename.endsWith(".csv") && typeof dataset.rows_count === "number") {
    verifyCsvShape(dataset.filename);
    const actualRows = countCsvRows(dataset.filename);
    if (dataset.rows_count !== actualRows) {
      failures.push(`manifest rows_count mismatch for ${dataset.filename}: expected ${actualRows}, got ${dataset.rows_count}`);
    }
  }
}

for (const filePath of scanRoots.flatMap(walk)) {
  const source = fs.readFileSync(filePath, "utf8");
  for (const match of source.matchAll(linkPattern)) {
    const publicPath = match[1];
    const relativePath = publicPath.replace(/^\/data\/air\//, "");
    if (allowedMissing.has(relativePath)) continue;
    const diskPath = path.join(publicAirDir, relativePath);
    checked.add(publicPath);
    if (!fs.existsSync(diskPath)) {
      failures.push(`${path.relative(repoRoot, filePath)} -> ${publicPath}`);
    }
  }
}

if (failures.length > 0) {
  console.error("INEA public downloads QA failed. Missing public/data/air files:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`INEA public downloads QA passed: ${checked.size} public /data/air link(s) verified.`);
