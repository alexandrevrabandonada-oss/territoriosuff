import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";

const ROUTES = ["/", "/dados", "/relatorios", "/transparencia", "/mapa"];
const BASE_URL = "http://127.0.0.1:4173";

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

function spawnNpm(args) {
  if (process.env.npm_execpath) {
    return spawnLogged(process.execPath, [process.env.npm_execpath, ...args]);
  }

  return spawnLogged(npmCommand(), args, { shell: process.platform === "win32" });
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
  const child = spawnNpm([
    "exec",
    "--yes",
    "--package",
    "lighthouse@latest",
    "--",
    "lighthouse",
    url,
    "--quiet",
    "--chrome-flags=--headless=new --no-sandbox",
    "--only-categories=performance,accessibility,best-practices",
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
  const build = spawnNpm(["run", "build"]);
  await waitForExit(build);

  const preview = spawnLogged(process.execPath, [path.join(process.cwd(), "tools", "prerender-preview.mjs")]);
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
        firstContentfulPaint: lhr.audits["first-contentful-paint"]?.displayValue ?? "n/a",
        largestContentfulPaint: lhr.audits["largest-contentful-paint"]?.displayValue ?? "n/a",
        largestContentfulPaintMs: lhr.audits["largest-contentful-paint"]?.numericValue ?? Number.POSITIVE_INFINITY,
        totalBlockingTime: lhr.audits["total-blocking-time"]?.displayValue ?? "n/a",
        cumulativeLayoutShift: lhr.audits["cumulative-layout-shift"]?.displayValue ?? "n/a",
        cumulativeLayoutShiftValue: lhr.audits["cumulative-layout-shift"]?.numericValue ?? Number.POSITIVE_INFINITY
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
        `- ${item.route}: Performance ${item.performance}, A11y ${item.accessibility}, Best Practices ${item.bestPractices}, FCP ${item.firstContentfulPaint}, LCP ${item.largestContentfulPaint}, TBT ${item.totalBlockingTime}, CLS ${item.cumulativeLayoutShift}`
      );
    }

    await fs.writeFile(path.join(outputDir, "summary.md"), `${lines.join("\n")}\n`, "utf8");
    console.log(`Lighthouse reports written to ${outputDir}`);

    const failures = summary.flatMap((item) => {
      const routeFailures = [];
      if (item.performance < 85) routeFailures.push(`Performance ${item.performance} < 85`);
      if (item.accessibility < 100) routeFailures.push(`A11y ${item.accessibility} < 100`);
      if (item.bestPractices < 100) routeFailures.push(`Best Practices ${item.bestPractices} < 100`);
      if (item.largestContentfulPaintMs > 2_500) {
        routeFailures.push(`LCP ${Math.round(item.largestContentfulPaintMs)}ms > 2500ms`);
      }
      if (item.cumulativeLayoutShiftValue > 0.1) {
        routeFailures.push(`CLS ${item.cumulativeLayoutShiftValue.toFixed(3)} > 0.1`);
      }
      return routeFailures.map((failure) => `${item.route}: ${failure}`);
    });

    if (failures.length > 0) {
      throw new Error(
        `Lighthouse quality budget failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}`
      );
    }
  } finally {
    await cleanup();
  }
}

run().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
