import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const MIGRATIONS_DIR = path.join(process.cwd(), "supabase", "migrations");
const NPM_CACHE_DIR = path.join(process.cwd(), ".npm-cache");
const SUPABASE_CLI = "supabase@2.82.0";
const LOCAL_MIGRATION_PREFIX_REGEX = /^(\d{14}|\d{8})(?=_)/;

function run(command) {
  return execSync(command, {
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

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((name) => name.endsWith(".sql") && LOCAL_MIGRATION_PREFIX_REGEX.test(name));

  return Array.from(
    new Set(
      files
        .map((name) => {
          const match = name.match(LOCAL_MIGRATION_PREFIX_REGEX);
          return match ? match[1] : null;
        })
        .filter(Boolean)
    )
  ).sort();
}

function listRemoteVersions() {
  const query = [
    "select version",
    "from supabase_migrations.schema_migrations",
    "order by version;"
  ].join("\n");
  const tempFile = path.join(os.tmpdir(), `semear-migration-status-${Date.now()}.sql`);

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

function printVersions(label, versions) {
  console.log(`${label}: ${versions.length}`);
  versions.forEach((version) => console.log(`- ${version}`));
}

try {
  const localVersions = listLocalVersions();
  const remoteVersions = listRemoteVersions();
  const localSet = new Set(localVersions);
  const remoteSet = new Set(remoteVersions);
  const missingLocal = remoteVersions.filter((version) => !localSet.has(version));
  const missingRemote = localVersions.filter((version) => !remoteSet.has(version));

  console.log("=== MIGRATION STATUS ===");
  console.log(`local: ${localVersions.length}`);
  console.log(`remote: ${remoteVersions.length}`);

  if (missingLocal.length === 0 && missingRemote.length === 0) {
    console.log("status: aligned");
    process.exit(0);
  }

  console.log("status: mismatch");
  if (missingLocal.length > 0) {
    printVersions("missing locally", missingLocal);
  }
  if (missingRemote.length > 0) {
    printVersions("missing remotely", missingRemote);
  }
  process.exit(1);
} catch (error) {
  console.error(`[migration-status] ERROR ${error.message}`);
  process.exit(1);
}
