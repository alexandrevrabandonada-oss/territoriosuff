import fs from "node:fs";
import path from "node:path";

import {
  DEFAULT_SOCIAL_IMAGE,
  getCanonicalUrl,
  getStaticMetadataFileName,
  STATIC_ROUTE_METADATA
} from "../src/content/siteMetadata";

type VercelConfig = {
  rewrites?: Array<{ source?: string; destination?: string }>;
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function escapeHtmlAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist");
const sitemap = fs.readFileSync(path.join(rootDir, "public", "sitemap.xml"), "utf8");
const robots = fs.readFileSync(path.join(rootDir, "public", "robots.txt"), "utf8");
const manifest = JSON.parse(fs.readFileSync(path.join(distDir, "manifest.webmanifest"), "utf8")) as {
  start_url?: string;
  icons?: Array<{ sizes?: string; purpose?: string }>;
};
const vercelConfig = JSON.parse(fs.readFileSync(path.join(rootDir, "vercel.json"), "utf8")) as VercelConfig;
const rewrites = vercelConfig.rewrites ?? [];

assert(fs.existsSync(path.join(distDir, "index.html")), "dist/index.html is missing; run the production build first");
assert(robots.includes("Sitemap: https://www.semearsf.org/sitemap.xml"), "robots.txt must advertise the canonical sitemap");
assert(manifest.start_url === "/", "PWA manifest start_url must remain rooted at /");
assert(
  manifest.icons?.some((icon) => icon.sizes === "512x512" && icon.purpose?.split(/\s+/).includes("maskable")),
  "PWA manifest must provide a 512x512 maskable icon"
);

for (const route of STATIC_ROUTE_METADATA) {
  const canonicalUrl = getCanonicalUrl(route.path);
  const htmlPath = route.path === "/"
    ? path.join(distDir, "index.html")
    : path.join(distDir, "_seo", `${getStaticMetadataFileName(route.path)}.html`);

  assert(fs.existsSync(htmlPath), `Missing server-visible metadata HTML for ${route.path}: ${htmlPath}`);
  const html = fs.readFileSync(htmlPath, "utf8");
  const title = escapeHtmlAttribute(route.title);
  const description = escapeHtmlAttribute(route.description);

  assert(html.includes(`<title>${title}</title>`), `${route.path} is missing its route title`);
  assert(html.includes(`<meta name="description" content="${description}" />`), `${route.path} is missing its description`);
  assert(html.includes(`<link rel="canonical" href="${canonicalUrl}" />`), `${route.path} has an invalid canonical URL`);
  assert(html.includes(`<meta property="og:url" content="${canonicalUrl}" />`), `${route.path} has an invalid og:url`);
  assert(html.includes(`<meta property="og:title" content="${title}" />`), `${route.path} is missing og:title`);
  assert(html.includes(`<meta name="twitter:title" content="${title}" />`), `${route.path} must use name=twitter:title`);
  assert(html.includes(`<meta property="og:image" content="${DEFAULT_SOCIAL_IMAGE}" />`), `${route.path} is missing the default social image`);
  assert(!html.includes("semear-pwa.vercel.app"), `${route.path} still references the retired Vercel hostname`);
  assert(!html.includes("https://semearsf.org"), `${route.path} must use the canonical www hostname`);
  assert(sitemap.includes(`<loc>${canonicalUrl}</loc>`), `${route.path} is missing from sitemap.xml`);

  if (route.path !== "/") {
    const expectedDestination = `/_seo/${getStaticMetadataFileName(route.path)}.html`;
    assert(
      rewrites.some((rewrite) => rewrite.source === route.path && rewrite.destination === expectedDestination),
      `${route.path} is missing its Vercel SEO rewrite to ${expectedDestination}`
    );
  }
}

console.log(`SEO static assertion passed: ${STATIC_ROUTE_METADATA.length} routes have server-visible metadata, canonicals, sitemap entries and rewrites.`);
