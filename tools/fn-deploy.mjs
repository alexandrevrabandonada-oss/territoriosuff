import { runSupabase } from "./supabase-cli.mjs";

try {
  const output = runSupabase(["functions", "deploy", "--no-verify-jwt"], {
    stdio: ["ignore", "pipe", "pipe"]
  });
  process.stdout.write(output);
} catch (error) {
  const stderr = (error.stderr || "").toString().trim();
  const stdout = (error.stdout || "").toString().trim();
  const message = stderr || stdout || error.message;
  console.error(`[fn:deploy] ERROR ${message}`);
  process.exit(1);
}
