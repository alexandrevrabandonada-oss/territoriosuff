import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const MIGRATIONS_DIR = path.join(process.cwd(), "supabase", "migrations");
const NPM_CACHE_DIR = path.join(process.cwd(), ".npm-cache");
const SUPABASE_CLI = "supabase@2.82.0";
const LOCAL_MIGRATION_PREFIX_REGEX = /^(\d{14}|\d{8})(?=_)/;

function run(cmd) {
  return execSync(cmd, {
    cwd: process.cwd(),
    env: { ...process.env, npm_config_cache: NPM_CACHE_DIR },
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
}

function listLocalVersions() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    throw new Error(`Migrations directory not found: ${MIGRATIONS_DIR}`);
  }

  const files = fs.readdirSync(MIGRATIONS_DIR).filter((name) => name.endsWith(".sql"));
  const versions = files
    .map((name) => {
      const match = name.match(LOCAL_MIGRATION_PREFIX_REGEX);
      return match ? match[1] : null;
    })
    .filter((value) => value !== null);

  return Array.from(new Set(versions)).sort();
}

function createStub(version) {
  const filename = version.length === 8 ? `${version}__remote_stub.sql` : `${version}__remote_stub.sql`;
  const filePath = path.join(MIGRATIONS_DIR, filename);

  if (fs.existsSync(filePath)) return filename;

  const content = [
    "-- Remote migration stub",
    `-- version: ${version}`,
    "-- This migration exists in the linked remote environment and was stubbed locally",
    "-- to align migration history in a repo-first workflow.",
    ""
  ].join("\n");

  fs.writeFileSync(filePath, content, "utf8");
  return filename;
}

function listRemoteVersions() {
  const query = [
    "select version",
    "from supabase_migrations.schema_migrations",
    "order by version;"
  ].join("\n");
  const tempFile = path.join(os.tmpdir(), `semear-migration-sync-${Date.now()}.sql`);

  fs.writeFileSync(tempFile, query, "utf8");
  const output = run(`npm exec --yes --package=${SUPABASE_CLI} -- supabase db query --linked --file "${tempFile}"`);
  fs.rmSync(tempFile, { force: true });
  const parsed = JSON.parse(output);
  const rows = Array.isArray(parsed.rows) ? parsed.rows : [];

  return Array.from(
    new Set(
      rows
        .map((row) => String(row.version || "").trim())
        .filter(Boolean)
    )
  ).sort();
}

function main() {
  let remoteVersions = [];
  try {
    remoteVersions = listRemoteVersions();
  } catch (error) {
    const stderr = (error.stderr || "").toString().trim();
    const stdout = (error.stdout || "").toString().trim();
    const message = stderr || stdout || error.message;
    if (/SUPABASE_DB_PASSWORD|Forbidden resource|403/i.test(message)) {
      console.log("[migration-sync] remote versions unavailable (missing DB password or forbidden). skipping sync.");
      process.exit(0);
    }
    console.error(`[migration-sync] ERROR failed to read linked migrations: ${message}`);
    process.exit(1);
  }

  const localVersions = listLocalVersions();
  const localSet = new Set(localVersions);

  const missing = remoteVersions.filter((version) => !localSet.has(version));

  console.log(`[migration-sync] remote versions: ${remoteVersions.length}`);
  console.log(`[migration-sync] local versions: ${localVersions.length}`);
  console.log(`[migration-sync] missing local versions: ${missing.length}`);

  if (missing.length === 0) {
    console.log("[migration-sync] already aligned");
    process.exit(0);
  }

  const created = missing.map((version) => createStub(version));

  console.log("[migration-sync] created stubs:");
  created.forEach((name) => console.log(`- ${name}`));
}

main();
