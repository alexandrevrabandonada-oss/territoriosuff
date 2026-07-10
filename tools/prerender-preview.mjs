import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { createBrotliCompress, createGzip, constants as zlibConstants } from "node:zlib";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(rootDir, "dist");
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "127.0.0.1";

const mimeTypes = new Map([
  [".avif", "image/avif"],
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".map", "application/json; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml; charset=utf-8"],
  [".webmanifest", "application/manifest+json; charset=utf-8"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"]
]);
const compressibleExtensions = new Set([".css", ".html", ".js", ".json", ".map", ".mjs", ".svg", ".webmanifest"]);

function resolveRequestPath(requestUrl) {
  const pathname = decodeURIComponent(new URL(requestUrl || "/", `http://${host}:${port}`).pathname);
  if (pathname === "/") return path.join(distDir, "index.html");

  const directPath = path.resolve(distDir, `.${pathname}`);
  if (!directPath.startsWith(`${distDir}${path.sep}`)) return null;
  if (fs.existsSync(directPath) && fs.statSync(directPath).isFile()) return directPath;

  const routeIndex = path.join(directPath, "index.html");
  if (fs.existsSync(routeIndex)) return routeIndex;

  return path.join(distDir, "index.html");
}

const server = http.createServer((request, response) => {
  try {
    const filePath = resolveRequestPath(request.url);
    if (!filePath || !fs.existsSync(filePath)) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    const headers = {
      "Content-Type": mimeTypes.get(extension) || "application/octet-stream",
      "Cache-Control": filePath.includes(`${path.sep}assets${path.sep}`)
        ? "public, max-age=31536000, immutable"
        : "no-cache",
      "X-Content-Type-Options": "nosniff"
    };
    const stat = fs.statSync(filePath);
    const acceptedEncodings = request.headers["accept-encoding"] || "";
    const shouldCompress = stat.size >= 1_024 && compressibleExtensions.has(extension);
    const encoding = shouldCompress && /\bbr\b/.test(acceptedEncodings)
      ? "br"
      : shouldCompress && /\bgzip\b/.test(acceptedEncodings)
        ? "gzip"
        : null;
    const responseHeaders = encoding
      ? { ...headers, "Content-Encoding": encoding, Vary: "Accept-Encoding" }
      : { ...headers, "Content-Length": stat.size };

    response.writeHead(200, responseHeaders);
    if (request.method === "HEAD") {
      response.end();
      return;
    }

    const stream = fs.createReadStream(filePath);
    if (encoding === "br") {
      stream.pipe(createBrotliCompress({
        params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 4 }
      })).pipe(response);
      return;
    }
    if (encoding === "gzip") {
      stream.pipe(createGzip({ level: 6 })).pipe(response);
      return;
    }
    stream.pipe(response);
  } catch (error) {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(error instanceof Error ? error.message : "Internal error");
  }
});

server.listen(port, host, () => {
  console.log(`Prerender preview listening on http://${host}:${port}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
