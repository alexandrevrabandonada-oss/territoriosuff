import { spawnSync } from "node:child_process";

const LEGACY_MIGRATION_VERSION = "20260305";
const SUPABASE_CLI = "supabase@2.82.0";

function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    input: options.input,
    shell: process.platform === "win32"
  });

  return {
    command: [command, ...args].join(" "),
    status: result.status ?? 1,
    stdout: result.stdout || "",
    stderr: result.stderr || ""
  };
}

function summarizeLines(text, maxLines = 8) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(-maxLines);
}

// Legacy note:
// `20260305_170000_reports.sql` uses an 8-digit version prefix. The Supabase CLI
// still shows a mirrored local/remote mismatch for this migration in `migration list`,
// but the reliable apply path is to mark the remote entry as reverted and immediately
// re-run `db push`. The migration is idempotent, so this keeps schema state correct.
const repair = runCommand("npx", [
  "npm",
  "exec",
  "--yes",
  `--package=${SUPABASE_CLI}`,
  "--",
  "supabase",
  "migration",
  "repair",
  "--status",
  "reverted",
  LEGACY_MIGRATION_VERSION
]);
const repairOutput = `${repair.stdout}\n${repair.stderr}`;
const repairNotFound = /not found/i.test(repairOutput);
const repairOk = repair.status === 0;

if (repairOk) {
  console.log(`[db:push:safe] repair: prepared legacy migration ${LEGACY_MIGRATION_VERSION} for replay`);
} else if (repairNotFound) {
  console.log(`[db:push:safe] repair: version ${LEGACY_MIGRATION_VERSION} not found remotely, continuing`);
} else {
  console.log("[db:push:safe] repair: non-blocking failure, continuing to db push");
  const repairLines = summarizeLines(repairOutput, 6);
  if (repairLines.length > 0) {
    console.log(repairLines.join("\n"));
  }
}

const push = runCommand("npm", [
  "exec",
  "--yes",
  `--package=${SUPABASE_CLI}`,
  "--",
  "supabase",
  "db",
  "push",
  "--include-all",
  "--yes"
], {
  input: "y\n"
});
const pushOutput = `${push.stdout}\n${push.stderr}`;
const pushLines = summarizeLines(pushOutput, 12);

console.log("[db:push:safe] db push summary:");
if (pushLines.length > 0) {
  console.log(pushLines.join("\n"));
} else {
  console.log("No output captured.");
}

if (push.status !== 0) {
  console.error(`[db:push:safe] failed with exit code ${push.status}`);
  process.exit(push.status);
}

console.log("[db:push:safe] done");
