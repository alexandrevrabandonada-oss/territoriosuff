import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export const SUPABASE_CLI = "supabase@2.82.0";
const NPM_CACHE_DIR = path.join(process.cwd(), ".npm-cache");
export function readEnvFiles() {
  const env = {};

  for (const file of [".env", ".env.local"]) {
    if (!fs.existsSync(file)) continue;
    const raw = fs.readFileSync(file, "utf8");

    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx <= 0) continue;

      const key = trimmed.slice(0, idx).trim();
      let value = trimmed.slice(idx + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }
  }

  return env;
}

export function runSupabase(args, options = {}) {
  const command = [
    "npm",
    "exec",
    "--yes",
    `--package=${SUPABASE_CLI}`,
    "--",
    "supabase",
    ...args
  ].join(" ");

  return execSync(command, {
    cwd: process.cwd(),
    env: {
      ...process.env,
      ...options.env,
      npm_config_cache: NPM_CACHE_DIR
    },
    encoding: "utf8",
    stdio: options.stdio ?? ["ignore", "pipe", "pipe"]
  });
}
