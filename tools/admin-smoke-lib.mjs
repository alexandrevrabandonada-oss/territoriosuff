import fs from "node:fs";
import path from "node:path";

export function readWorkspaceFile(relativePath) {
  const filePath = path.resolve(relativePath);
  if (!fs.existsSync(filePath)) {
    fail(`Missing file: ${relativePath}`);
  }

  return fs.readFileSync(filePath, "utf8");
}

export function fail(message) {
  console.error(message);
  process.exit(1);
}

export function assertIncludes(content, expected, label) {
  if (!content.includes(expected)) {
    fail(`[${label}] Missing expected snippet: ${expected}`);
  }
}

export function assertAny(content, expectedList, label) {
  const found = expectedList.some((expected) => content.includes(expected));
  if (!found) {
    fail(`[${label}] Missing all expected alternatives: ${expectedList.join(" | ")}`);
  }
}

export function assertAll(content, expectedList, label) {
  for (const expected of expectedList) {
    assertIncludes(content, expected, label);
  }
}

export function ok(label, message) {
  console.log(`[${label}] OK: ${message}`);
}

export function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};

  const raw = fs.readFileSync(filePath, "utf8");
  const env = {};

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const index = trimmed.indexOf("=");
    if (index <= 0) continue;

    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

export function loadWorkspaceEnv() {
  const fallbackEnv = parseEnvFile(path.resolve(".env"));
  const localEnv = parseEnvFile(path.resolve(".env.local"));

  return {
    ...fallbackEnv,
    ...localEnv,
    ...process.env,
  };
}