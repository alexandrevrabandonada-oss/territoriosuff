import fs from "node:fs";
import path from "node:path";

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

  if (failed) {
    process.exit(1);
  }

  console.log("[ROUTE SMOKE] OK: Public portal routes are clean.");
}

runSmoke();
