import fs from "node:fs";
import path from "node:path";

import { readEnvFiles, runSupabase } from "./supabase-cli.mjs";

const outputFile = path.join(process.cwd(), "src", "lib", "supabase", "database.types.ts");
const env = readEnvFiles();
const projectRef = env.SUPABASE_PROJECT_REF || process.env.SUPABASE_PROJECT_REF;

if (!projectRef) {
  console.error("[db:types:remote] ERROR SUPABASE_PROJECT_REF not found in .env/.env.local or process env");
  process.exit(1);
}

try {
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  const output = runSupabase(["gen", "types", "typescript", "--project-id", projectRef]);
  fs.writeFileSync(outputFile, output, "utf8");
  console.log(`[db:types:remote] wrote ${outputFile}`);
} catch (error) {
  const stderr = (error.stderr || "").toString().trim();
  const stdout = (error.stdout || "").toString().trim();
  const message = stderr || stdout || error.message;
  if (/necessary privileges|access this endpoint|forbidden|403/i.test(message)) {
    console.error("[db:types:remote] ERROR linked account lacks privilege to generate remote types");
    console.error("[db:types:remote] Hint: use a privileged Supabase login or fall back to npm run db:types when local Supabase is available");
  } else {
    console.error(`[db:types:remote] ERROR ${message}`);
  }
  process.exit(1);
}
