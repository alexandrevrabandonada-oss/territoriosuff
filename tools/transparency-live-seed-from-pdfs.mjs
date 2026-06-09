import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const DEFAULT_OUTPUT = "data/transparency_live.seed.json";
const PYTHON_CANDIDATES = [
  ...(process.env.PYTHON ? [process.env.PYTHON] : []),
  "C:\\Users\\Micro\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe",
  "py",
  "python",
  "python3",
];

function parseArgs(argv) {
  const result = {
    output: DEFAULT_OUTPUT,
    pdfs: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--output" || arg === "-o") {
      result.output = argv[index + 1] || DEFAULT_OUTPUT;
      index += 1;
      continue;
    }
    result.pdfs.push(arg);
  }

  return result;
}

function resolvePython() {
  for (const candidate of PYTHON_CANDIDATES) {
    if (candidate === "py") {
      const probe = spawnSync(candidate, ["-3", "-c", "import pypdf"], { encoding: "utf8" });
      if (probe.status === 0) {
        return { command: candidate, prefixArgs: ["-3"] };
      }
      continue;
    }

    const probe = spawnSync(candidate, ["-c", "import pypdf"], { encoding: "utf8" });
    if (probe.status === 0) {
      return { command: candidate, prefixArgs: [] };
    }
  }

  throw new Error("Nenhum interpretador Python com pypdf disponivel. Defina PYTHON apontando para um runtime com pypdf.");
}

function run() {
  const args = parseArgs(process.argv.slice(2));
  if (args.pdfs.length === 0) {
    console.error("Uso: node tools/transparency-live-seed-from-pdfs.mjs <pdf1> [pdf2 ...] [--output data/transparency_live.seed.json]");
    process.exit(1);
  }

  const parserPath = path.resolve("tools/transparency-live-parse-pdf.py");
  const outputPath = path.resolve(args.output);
  const python = resolvePython();

  const result = spawnSync(
    python.command,
    [...python.prefixArgs, parserPath, ...args.pdfs],
    { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 }
  );

  if (result.status !== 0) {
    console.error(result.stderr || result.stdout || "Falha ao processar PDFs.");
    process.exit(result.status || 1);
  }

  fs.writeFileSync(outputPath, result.stdout, "utf8");
  console.log(`Seed gerada em ${outputPath}`);
}

run();
