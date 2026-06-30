import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";

const ROUTES = ["/", "/dados", "/relatorios", "/transparencia", "/mapa"];
const BASE_URL = "http://127.0.0.1:4173";
const PREVIEW_PORT = 4173;

function npmCommand() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

function spawnLogged(command, args, options = {}) {
  return spawn(command, args, {
    stdio: "inherit",
    shell: false,
    ...options
  });
}

function waitForExit(child) {
  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`Process exited with code ${code ?? "null"}${signal ? ` signal ${signal}` : ""}`));
    });
  });
}

async function waitForHttp(url, timeoutMs = 60_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url, { method: "GET" });
      if (response.ok) return;
    } catch {
      // retry
    }
    await delay(1000);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function runLighthouseCli(url, outputPath, outputFormat) {
  const child = spawnLogged(npmCommand(), [
    "exec",
    "--yes",
    "--package",
    "lighthouse@latest",
    "--",
    "lighthouse",
    url,
    "--quiet",
    "--chrome-flags=--headless=new --no-sandbox",
    "--only-categories=performance,accessibility,best-practices,pwa",
    `--output=${outputFormat}`,
    `--output-path=${outputPath}`
  ]);
  await waitForExit(child);
}

function routeFileName(route) {
  if (route === "/") return "home";
  return route.replaceAll("/", "_").replaceAll("?", "_").replaceAll("&", "_").replaceAll("=", "_").replace(/^_+/, "");
}

async function run() {
  const build = spawnLogged(npmCommand(), ["run", "build"]);
  await waitForExit(build);

  const preview = spawnLogged(npmCommand(), ["run", "preview", "--", "--host", "127.0.0.1", "--port", String(PREVIEW_PORT)]);
  const cleanup = async () => {
    if (!preview.killed) {
      preview.kill("SIGTERM");
    }
  };

  process.on("SIGINT", () => {
    void cleanup().finally(() => process.exit(130));
  });
  process.on("SIGTERM", () => {
    void cleanup().finally(() => process.exit(143));
  });

  try {
    await waitForHttp(`${BASE_URL}/`);

    const outputDir = path.join(process.cwd(), "reports", "lighthouse", new Date().toISOString().replace(/[:.]/g, "-"));
    await fs.mkdir(outputDir, { recursive: true });

    const summary = [];

    for (const route of ROUTES) {
      const url = `${BASE_URL}${route}`;
      const reportBase = routeFileName(route);
      const htmlPath = path.join(outputDir, `${reportBase}.html`);
      const jsonPath = path.join(outputDir, `${reportBase}.json`);

      await runLighthouseCli(url, htmlPath, "html");
      await runLighthouseCli(url, jsonPath, "json");

      const lhr = JSON.parse(await fs.readFile(jsonPath, "utf8"));
      const categories = lhr.categories;
      summary.push({
        route,
        performance: Math.round((categories.performance?.score ?? 0) * 100),
        accessibility: Math.round((categories.accessibility?.score ?? 0) * 100),
        bestPractices: Math.round((categories["best-practices"]?.score ?? 0) * 100),
        pwa: Math.round((categories.pwa?.score ?? 0) * 100)
      });
    }

    const lines = [
      "# Lighthouse Audit Summary",
      "",
      `Base URL: ${BASE_URL}`,
      `Generated: ${new Date().toISOString()}`,
      ""
    ];

    for (const item of summary) {
      lines.push(
        `- ${item.route}: Performance ${item.performance}, A11y ${item.accessibility}, Best Practices ${item.bestPractices}, PWA ${item.pwa}`
      );
    }

    await fs.writeFile(path.join(outputDir, "summary.md"), `${lines.join("\n")}\n`, "utf8");
    console.log(`Lighthouse reports written to ${outputDir}`);
  } finally {
    await cleanup();
  }
}

run().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
