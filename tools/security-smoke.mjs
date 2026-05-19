import { assertAll, ok, readWorkspaceFile } from "./admin-smoke-lib.mjs";

const label = "SECURITY SMOKE";
const alertas = readWorkspaceFile("src/pages/AlertasPage.tsx");
const instagramEmbed = readWorkspaceFile("src/components/InstagramEmbed.tsx");
const viteConfig = readWorkspaceFile("vite.config.ts");
const blogPost = readWorkspaceFile("src/pages/BlogPostPage.tsx");
const acervoItem = readWorkspaceFile("src/pages/acervo/AcervoItemPage.tsx");
const conversarDetail = readWorkspaceFile("src/pages/conversar/ConversarDetailPage.tsx");
const appRoutes = readWorkspaceFile("src/App.tsx");
const adminBlogEdit = readWorkspaceFile("src/pages/admin/AdminBlogEditPage.tsx");
const gitignore = readWorkspaceFile(".gitignore");
const adminUploads = readWorkspaceFile("src/pages/admin/AdminUploadsPage.tsx");

if (/VITE_(?:INGEST_API_KEY|.*SERVICE.*|.*SECRET.*|.*PRIVATE.*|.*TOKEN.*|.*PASSWORD.*)/.test(alertas)) {
  throw new Error(`[${label}] Sensitive VITE_* key reference found in AlertasPage.tsx`);
}

if (alertas.includes("/functions/v1/test-push")) {
  throw new Error(`[${label}] Public alert page must not call the privileged test-push function`);
}

assertAll(instagramEmbed, [
  'hostname !== "instagram.com" && hostname !== "www.instagram.com"',
  'sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"',
  'referrerPolicy="strict-origin-when-cross-origin"',
], label);

assertAll(viteConfig, [
  'sourcemap: process.env.SENTRY_AUTH_TOKEN ? "hidden" : false',
], label);

for (const [fileName, content] of [
  ["BlogPostPage.tsx", blogPost],
  ["AcervoItemPage.tsx", acervoItem],
  ["ConversarDetailPage.tsx", conversarDetail],
]) {
  if (content.includes("dangerouslySetInnerHTML")) {
    throw new Error(`[${label}] Public Markdown page still uses dangerouslySetInnerHTML: ${fileName}`);
  }
}

if (appRoutes.includes('path="/corredores"') || appRoutes.includes('path="/corredores/:slug"')) {
  throw new Error(`[${label}] Removed corredores route is present in public routes`);
}

if (adminBlogEdit.includes("dangerouslySetInnerHTML")) {
  throw new Error(`[${label}] Admin Markdown preview must not use dangerouslySetInnerHTML`);
}

if (!gitignore.split(/\r?\n/).includes("tmp/")) {
  throw new Error(`[${label}] tmp/ must be ignored to avoid committing operational logs/scripts`);
}

if (adminUploads.includes('rel="noreferrer"')) {
  throw new Error(`[${label}] External links should use rel="noopener noreferrer", not noreferrer alone`);
}

ok(label, "No privileged VITE key exposure, Instagram embeds are constrained, and production sourcemaps are not public by default.");
