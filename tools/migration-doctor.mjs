import { execSync } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";

const TIMEOUT_MS = 15000;
const MIGRATIONS_DIR = path.join(process.cwd(), "supabase", "migrations");
const ARCHIVE_DIR = path.join(process.cwd(), "supabase", "_archive_migrations");
const NPM_CACHE_DIR = path.join(process.cwd(), ".npm-cache");
const SUPABASE_CLI = "supabase@2.82.0";
const LOCAL_MIGRATION_PREFIX_REGEX = /^(\d{14}|\d{8})(?=_)/;

function run(cmd) {
  try {
    const stdout = execSync(cmd, {
      env: { ...process.env, npm_config_cache: NPM_CACHE_DIR },
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: TIMEOUT_MS
    });
    return { success: true, output: stdout };
  } catch (error) {
    const stderr = (error.stderr || "").toString();
    const stdout = (error.stdout || "").toString();
    return {
      success: false,
      output: stdout,
      error: stderr || error.message,
      isTimeout: error.code === "ETIMEDOUT"
    };
  }
}

function checkPort(port, host = "127.0.0.1") {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.once("error", () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

function getLocalMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) return [];
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith(".sql") && LOCAL_MIGRATION_PREFIX_REGEX.test(file));
}

function getArchivedMigrationFiles() {
  if (!fs.existsSync(ARCHIVE_DIR)) return [];
  return fs.readdirSync(ARCHIVE_DIR).filter((file) => file.endsWith(".sql"));
}

function getLocalVersions(files) {
  return Array.from(
    new Set(
      files
        .map((file) => {
          const match = file.match(LOCAL_MIGRATION_PREFIX_REGEX);
          return match ? match[1] : null;
        })
        .filter((value) => value !== null)
    )
  ).sort();
}

function getRemoteVersions() {
  const query = [
    "select version",
    "from supabase_migrations.schema_migrations",
    "order by version;"
  ].join("\n");
  const tempFile = path.join(os.tmpdir(), `semear-migration-doctor-${Date.now()}.sql`);

  fs.writeFileSync(tempFile, query, "utf8");
  const result = run(`npm exec --yes --package=${SUPABASE_CLI} -- supabase db query --linked --file "${tempFile}"`);
  fs.rmSync(tempFile, { force: true });
  if (!result.success) {
    return result;
  }

  let parsed;
  try {
    parsed = JSON.parse(result.output);
  } catch (error) {
    return {
      success: false,
      error: `failed to parse remote migration JSON: ${error.message}`
    };
  }

  const rows = Array.isArray(parsed.rows) ? parsed.rows : [];
  const versions = rows
    .map((row) => String(row.version || "").trim())
    .filter(Boolean);

  return {
    success: true,
    versions: Array.from(new Set(versions)).sort()
  };
}

console.log("=== SUPABASE MIGRATION DOCTOR (Hardened) ===");

const isRunning = await checkPort(54322);
if (isRunning) {
  console.log("[OK] DB Local: Rodando");
} else {
  console.log("[OK] DB Local: Not running (remote-first mode)");
}

const linkRes = run(`npm exec --yes --package=${SUPABASE_CLI} -- supabase projects list`);
const isLinked = linkRes.success && !linkRes.output.includes("You are not logged in") && linkRes.output.trim().length > 0;

if (isLinked) {
  console.log("[OK] CLI Link: Autenticado");
} else {
  console.log("[SKIP] CLI Link: Nao autenticado ou status desconhecido");
}

console.log("\n--- LOCAL STATE ---");
const localListRes = isRunning ? run(`npm exec --yes --package=${SUPABASE_CLI} -- supabase migration list --local`) : { success: false, skipped: true };

if (localListRes.success) {
  console.log("[OK] CLI local list: Sucesso");
} else if (localListRes.skipped) {
  console.log("[OK] CLI local list: Ignorado (DB Local offline)");
} else {
  console.log("[WARN] CLI local list: Falhou (Usando fallback de Filesystem)");
  if (localListRes.error) {
    process.stdout.write(`      Motivo: ${localListRes.error.split("\n").slice(0, 2).join(" ")}\n`);
  }
}

const localFiles = getLocalMigrationFiles();
const archivedFiles = getArchivedMigrationFiles();
if (fs.existsSync(MIGRATIONS_DIR)) {
  console.log(`[OK] Filesystem Scan (8/14 digitos): ${localFiles.length} arquivos encontrados`);
  console.log(`      Arquivos arquivados: ${archivedFiles.length}`);

  const sorted = [...localFiles].sort().reverse();
  console.log("      Ultimas 5 migracoes locais:");
  sorted.slice(0, 5).forEach((file) => console.log(`      - ${file}`));
} else {
  console.log("[ERROR] Filesystem Scan: Pasta supabase/migrations nao encontrada");
}

if (isLinked) {
  console.log("\n--- REMOTE STATE ---");
  const remoteVersionsRes = getRemoteVersions();
  if (remoteVersionsRes.success) {
    console.log("[OK] Remote migration query: Sucesso");

    const remoteVersions = remoteVersionsRes.versions;
    const localVersions = getLocalVersions(localFiles);
    const localSet = new Set(localVersions);
    const missingLocal = remoteVersions.filter((version) => !localSet.has(version));
    const missingRemote = localVersions.filter((version) => !new Set(remoteVersions).has(version));

    console.log(`      Total remoto (versoes 8/14 digitos): ${remoteVersions.length}`);
    console.log(`      Total local (versoes 8/14 digitos): ${localVersions.length}`);

    if (missingLocal.length > 0) {
      console.log(`      Faltando localmente: ${missingLocal.length}`);
      missingLocal.forEach((version) => console.log(`      - ${version}`));
    }

    if (missingRemote.length > 0) {
      console.log(`      Faltando remotamente: ${missingRemote.length}`);
      missingRemote.forEach((version) => console.log(`      - ${version}`));
    }

    if (missingLocal.length === 0 && missingRemote.length === 0) {
      console.log("      [OK] Historico remoto/local alinhado (versoes 8/14 digitos).");
    }
  } else {
    console.log("[ERROR] Remote migration query: Falhou");
    if (remoteVersionsRes.error) {
      const remoteError = remoteVersionsRes.error.split("\n")[0];
      if (/SUPABASE_DB_PASSWORD|Forbidden resource|403/i.test(remoteError)) {
        console.log("      [SKIP] Remote query requires SUPABASE_DB_PASSWORD or linked access.");
      } else {
        process.stdout.write(`      Erro: ${remoteError}\n`);
      }
    }
  }
}

console.log("\nDoctor analysis completed.");
process.exit(0);
