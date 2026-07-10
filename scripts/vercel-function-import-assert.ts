import fs from "node:fs";
import path from "node:path";

const apiRoot = path.join(process.cwd(), "api");
const relativeImportPattern = /(?:from\s+|import\s*\()\s*["'](\.{1,2}\/[^"']+)["']/g;
const explicitRuntimeExtension = /\.(?:cjs|js|json|mjs|node|wasm)(?:[?#].*)?$/i;

function listTypeScriptFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listTypeScriptFiles(absolutePath);
    return entry.isFile() && entry.name.endsWith(".ts") ? [absolutePath] : [];
  });
}

const failures: string[] = [];

for (const filePath of listTypeScriptFiles(apiRoot)) {
  const source = fs.readFileSync(filePath, "utf8");
  for (const match of source.matchAll(relativeImportPattern)) {
    const specifier = match[1];
    if (explicitRuntimeExtension.test(specifier)) continue;

    const line = source.slice(0, match.index).split(/\r?\n/).length;
    failures.push(`${path.relative(process.cwd(), filePath)}:${line} -> ${specifier}`);
  }
}

if (failures.length > 0) {
  console.error("Vercel Function import assertion failed.");
  console.error("Node.js ESM requires explicit runtime extensions for relative imports:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Vercel Function import assertion passed: all relative imports use explicit runtime extensions.");
