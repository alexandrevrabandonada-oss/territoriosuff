import fs from "node:fs";
import path from "node:path";

const NON_PAGE_PREFIXES = ["/api/", "/assets/", "/brand/", "/data/", "/icons/", "/reports/", "/s/"];

function walkSourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkSourceFiles(fullPath);
    return /\.(?:ts|tsx)$/.test(entry.name) ? [fullPath] : [];
  });
}

function routePatternToRegex(routePattern) {
  const escaped = routePattern
    .split("/")
    .map((segment) => segment.startsWith(":") ? "[^/]+" : segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("/");
  return new RegExp(`^${escaped}$`);
}

function findLiteralPublicLinks() {
  const links = [];
  const patterns = [
    /\b(?:to|href)\s*=\s*["'](\/[^"']*)["']/g,
    /\bhref\s*:\s*["'](\/[^"']*)["']/g
  ];

  for (const file of walkSourceFiles(path.resolve("src"))) {
    const content = fs.readFileSync(file, "utf8");
    for (const pattern of patterns) {
      for (const match of content.matchAll(pattern)) {
        const target = match[1].split(/[?#]/, 1)[0].replace(/\/+$/, "") || "/";
        if (target.startsWith("/admin") || NON_PAGE_PREFIXES.some((prefix) => target.startsWith(prefix))) continue;
        links.push({ file: path.relative(process.cwd(), file), target });
      }
    }
  }
  return links;
}

/**
 * Fails if certain routes appear in the public portal section of App.tsx
 */
function runSmoke() {
  const appPath = path.resolve("src/App.tsx");
  if (!fs.existsSync(appPath)) {
    console.error("App.tsx not found");
    process.exit(1);
  }

  const content = fs.readFileSync(appPath, "utf8");
  
  // Extract the portal layout block (public routes)
  const portalSplit = content.split("<PortalLayout>");
  if (portalSplit.length < 2) {
    console.error("PortalLayout block not found in App.tsx");
    process.exit(1);
  }
  
  const publicContent = portalSplit[1].split("</PortalLayout>")[0];
  const publicRoutes = [...publicContent.matchAll(/<Route\s+path="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((route) => route !== "*");
  const publicRouteMatchers = publicRoutes.map(routePatternToRegex);

  const forbidden = [
    'path="/relatorios/:id"',
    'path="/relatorios/novo"',
    'path="/blog/:id"',
    'path="/blog/novo"',
    'path="/acervo/:id"',
    'path="/acervo/novo"',
    'path="/acervo/artigos/novo"',
    'path="/agenda/:id"',
    'path="/agenda/novo"',
    'path="/uploads"',
    'path="/corredores"',
    'path="/corredores/:slug"'
  ];

  let failed = false;
  for (const pattern of forbidden) {
    if (publicContent.includes(pattern)) {
      console.error(`[ROUTE SMOKE] FAILED: Forbidden route "${pattern}" found in public portal block!`);
      failed = true;
    }
  }

  for (const link of findLiteralPublicLinks()) {
    if (publicRouteMatchers.some((matcher) => matcher.test(link.target))) continue;
    console.error(`[ROUTE SMOKE] FAILED: Internal link "${link.target}" in ${link.file} has no public route.`);
    failed = true;
  }

  if (failed) {
    process.exit(1);
  }

  console.log(`[ROUTE SMOKE] OK: ${publicRoutes.length} public route contracts and literal internal links are clean.`);
}

runSmoke();
