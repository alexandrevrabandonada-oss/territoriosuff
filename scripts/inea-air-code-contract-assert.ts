import fs from "node:fs";
import path from "node:path";

const ROOTS = [
  "src/pages/air",
  "src/components/air",
  "src/lib/inea"
];

const FORBIDDEN_PATTERNS = [
  {
    label: "direct any annotation",
    pattern: /:\s*any\b|any\[\]|as\s+any\b|catch\s*\(\s*err:\s*any\s*\)|useState<\s*any\b/
  },
  {
    label: "opaque fetch json",
    pattern: /fetch\([^\n]+\)\.then\((?:r|\(r\))\s*=>\s*r\.json\(\)\)/
  }
];

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    if (!/\.(ts|tsx)$/.test(entry.name)) return [];
    return [fullPath];
  });
}

const failures: string[] = [];

for (const root of ROOTS) {
  for (const filePath of walk(root)) {
    const source = fs.readFileSync(filePath, "utf8");
    const lines = source.split(/\r?\n/);

    lines.forEach((line, index) => {
      for (const rule of FORBIDDEN_PATTERNS) {
        if (rule.pattern.test(line)) {
          failures.push(`${filePath}:${index + 1} (${rule.label}) ${line.trim()}`);
        }
      }
    });
  }
}

if (failures.length > 0) {
  console.error("INEA air code contract failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("INEA air code contract passed.");
