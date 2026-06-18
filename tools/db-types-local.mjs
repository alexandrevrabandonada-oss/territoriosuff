import fs from "node:fs";
import path from "node:path";

import { runSupabase } from "./supabase-cli.mjs";

const outputFile = path.join(process.cwd(), "src", "lib", "supabase", "database.types.ts");

try {
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  const output = runSupabase(["gen", "types", "typescript", "--local"]);
  fs.writeFileSync(outputFile, output, "utf8");
  console.log(`[db:types:local] wrote ${outputFile}`);
} catch (error) {
  const stderr = (error.stderr || "").toString().trim();
  const stdout = (error.stdout || "").toString().trim();
  const message = stderr || stdout || error.message;
  console.error(`[db:types:local] ERROR ${message}`);
  process.exit(1);
}
