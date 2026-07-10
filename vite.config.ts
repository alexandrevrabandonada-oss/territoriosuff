import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { VitePWA } from "vite-plugin-pwa";

import {
  DEFAULT_SOCIAL_IMAGE,
  getCanonicalUrl,
  getStaticMetadataFileName,
  STATIC_ROUTE_METADATA
} from "./src/content/siteMetadata";

function buildChunksManifest() {
  return {
    name: "build-chunks-manifest",
    closeBundle() {
      const distDir = path.join(process.cwd(), "dist");
      if (!fs.existsSync(distDir)) return;

      const manifest = {};
      const walk = (dir) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            walk(fullPath);
            continue;
          }

          const relPath = path.relative(distDir, fullPath).replace(/\\/g, "/");
          if (relPath === "manifest.json") continue;
          manifest[relPath] = {
            file: relPath,
            type: relPath.endsWith(".js") ? "chunk" : "asset",
            isEntry: relPath === "index.html"
          };
        }
      };

      walk(distDir);
      fs.writeFileSync(path.join(distDir, "manifest.json"), JSON.stringify(manifest, null, 2));
    }
  };
}

function routeAssetsPreloader(): Plugin {
  const routeEntries = {
    "/": "/src/pages/HomePage.tsx",
    "/dados": "/src/pages/DadosPage.tsx",
    "/qualidade-ar/inea": "/src/pages/air/IneaRadarPage.tsx"
  } as const;

  return {
    name: "route-assets-preloader",
    transformIndexHtml: {
      order: "post",
      handler(_html, context) {
        if (!context.bundle) return [];

        const assetsByRoute: Record<string, Array<{ href: string; kind: "script" | "style" }>> = {};
        const chunks = Object.values(context.bundle).filter((entry) => entry.type === "chunk");

        for (const [route, sourceSuffix] of Object.entries(routeEntries)) {
          const expectedName = sourceSuffix.split("/").at(-1)?.replace(/\.tsx$/, "");
          const chunk = chunks.find((entry) =>
            entry.facadeModuleId?.replace(/\\/g, "/").endsWith(sourceSuffix) || entry.name === expectedName
          );
          if (!chunk) continue;

          const assets: Array<{ href: string; kind: "script" | "style" }> = [
            { href: `/${chunk.fileName}`, kind: "script" }
          ];
          const metadata = (chunk as typeof chunk & { viteMetadata?: { importedCss?: Set<string> } }).viteMetadata;
          metadata?.importedCss?.forEach((fileName) => {
            assets.push({ href: `/${fileName}`, kind: "style" });
          });
          assetsByRoute[route] = assets;
        }

        const routeMap = JSON.stringify(assetsByRoute).replace(/</g, "\\u003c");
        return {
          html: _html,
          tags: [{
            tag: "script",
            injectTo: "head-prepend",
            children: `(()=>{const routes=${routeMap};const path=location.pathname.replace(/\\/+$/,"")||"/";for(const asset of routes[path]||[]){const link=document.createElement("link");link.href=asset.href;link.crossOrigin="anonymous";if(asset.kind==="script"){link.rel="modulepreload";}else{link.rel="preload";link.as="style";}document.head.appendChild(link);}})();`
          }]
        };
      }
    }
  };
}

function escapeHtmlAttribute(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function replaceHeadTag(html: string, pattern: RegExp, replacement: string) {
  return pattern.test(html) ? html.replace(pattern, replacement) : html.replace("</head>", `    ${replacement}\n  </head>`);
}

function renderRouteMetadataHtml(baseHtml: string, route: (typeof STATIC_ROUTE_METADATA)[number]) {
  const title = escapeHtmlAttribute(route.title);
  const description = escapeHtmlAttribute(route.description);
  const canonicalUrl = escapeHtmlAttribute(getCanonicalUrl(route.path));
  const socialImage = escapeHtmlAttribute(DEFAULT_SOCIAL_IMAGE);
  let html = baseHtml;

  html = replaceHeadTag(html, /<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  html = replaceHeadTag(html, /<meta\s+name="description"[\s\S]*?>/i, `<meta name="description" content="${description}" />`);
  html = replaceHeadTag(html, /<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${canonicalUrl}" />`);
  html = replaceHeadTag(html, /<meta\s+property="og:url"[^>]*>/i, `<meta property="og:url" content="${canonicalUrl}" />`);
  html = replaceHeadTag(html, /<meta\s+property="og:title"[^>]*>/i, `<meta property="og:title" content="${title}" />`);
  html = replaceHeadTag(html, /<meta\s+property="og:description"[\s\S]*?>/i, `<meta property="og:description" content="${description}" />`);
  html = replaceHeadTag(html, /<meta\s+property="og:image"[^>]*>/i, `<meta property="og:image" content="${socialImage}" />`);
  html = replaceHeadTag(html, /<meta\s+name="twitter:title"[^>]*>/i, `<meta name="twitter:title" content="${title}" />`);
  html = replaceHeadTag(html, /<meta\s+name="twitter:description"[\s\S]*?>/i, `<meta name="twitter:description" content="${description}" />`);
  html = replaceHeadTag(html, /<meta\s+name="twitter:image"[^>]*>/i, `<meta name="twitter:image" content="${socialImage}" />`);
  return html;
}

function routeMetadataHtml(): Plugin {
  return {
    name: "route-metadata-html",
    closeBundle() {
      const distDir = path.join(process.cwd(), "dist");
      const indexPath = path.join(distDir, "index.html");
      if (!fs.existsSync(indexPath)) return;

      const baseHtml = fs.readFileSync(indexPath, "utf8");
      const seoDir = path.join(distDir, "_seo");
      fs.mkdirSync(seoDir, { recursive: true });

      for (const route of STATIC_ROUTE_METADATA) {
        const routeHtml = renderRouteMetadataHtml(baseHtml, route);
        if (route.path === "/") {
          fs.writeFileSync(indexPath, routeHtml, "utf8");
          continue;
        }
        fs.writeFileSync(path.join(seoDir, `${getStaticMetadataFileName(route.path)}.html`), routeHtml, "utf8");
      }
    }
  };
}

export default defineConfig({
  build: {
    sourcemap: process.env.SENTRY_AUTH_TOKEN ? "hidden" : false,
    rollupOptions: {
        output: {
          manualChunks(id) {
            const normalizedId = id.replace(/\\/g, "/");

          if (!normalizedId.includes("node_modules")) return undefined;

          if (normalizedId.includes("/react-dom/") || normalizedId.includes("/react/")) {
            return "vendor-react";
          }

          if (normalizedId.includes("/react-router-dom/") || normalizedId.includes("/@remix-run/router/")) {
            return "vendor-router";
          }

          if (normalizedId.includes("/@supabase/")) {
            return "vendor-supabase";
          }

          if (normalizedId.includes("/leaflet/") || normalizedId.includes("/react-leaflet/")) {
            return "vendor-maps";
          }

          if (normalizedId.includes("/pdfjs-dist/")) {
            return "vendor-pdf";
          }

          if (normalizedId.includes("/uplot/")) {
            return "vendor-uplot";
          }

          if (normalizedId.includes("/recharts/") || normalizedId.includes("/victory-vendor/")) {
            return "vendor-charts";
          }

          return undefined;
        }
      }
    }
  },
  plugins: [
    react(),
    routeAssetsPreloader(),
    routeMetadataHtml(),
    buildChunksManifest(),
    ...(process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT
      ? sentryVitePlugin({
            org: process.env.SENTRY_ORG,
            project: process.env.SENTRY_PROJECT,
            authToken: process.env.SENTRY_AUTH_TOKEN,
            release: {
              name: process.env.SENTRY_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA,
              create: true,
              finalize: true,
              inject: true,
              setCommits: { auto: true }
            },
            sourcemaps: {
              assets: "./dist/assets",
              ignore: ["node_modules/**"]
            },
            errorHandler(err) {
              console.warn("Sentry sourcemap upload skipped:", err.message);
            }
          })
      : []),
    VitePWA({
      injectRegister: "script-defer",
      registerType: "autoUpdate",
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      devOptions: {
        enabled: true,
        type: "module"
      },
      manifest: {
        name: "SEMEAR UFF - Transparência Pública Ambiental",
        short_name: "SEMEAR",
        description: "Portal de transparência pública ambiental, dados de qualidade do ar, agenda territorial e controle social.",
        theme_color: "#0f766e",
        background_color: "#f8fafc",
        lang: "pt-BR",
        display: "standalone",
        orientation: "portrait-primary",
        categories: ["education", "environment"],
        start_url: "/",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      },
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        globIgnores: [
          "_seo/*.html",
          "assets/Admin*.js",
          "assets/Admin*.css",
          "assets/acervo-*.css",
          "assets/MapaPage-*.css",
          "assets/*Page-*.js",
          "assets/extractPdfText-*.js",
          "assets/transparencyLiveParser-*.js",
          "assets/vendor-pdf-*.js",
          "assets/vendor-maps-*.js",
          "assets/vendor-maps-*.css",
          "assets/vendor-supabase-*.js",
          "assets/vendor-uplot-*.js",
          "assets/vendor-uplot-*.css",
          "assets/summary-*.js",
          "assets/attention-episodes-*.js",
          "assets/availability-matrix-*.js"
        ],
        additionalManifestEntries: [
          { url: "/", revision: null },
          { url: "/dados", revision: null },
          { url: "/acervo", revision: null },
          { url: "/acervo/linha", revision: null },
          { url: "/blog", revision: null },
          { url: "/relatorios", revision: null },
          { url: "/transparencia", revision: null },
          { url: "/status", revision: null },
          { url: "/mapa", revision: null },
          { url: "/governanca", revision: null },
          { url: "/imprensa", revision: null },
          { url: "/apresentacao", revision: null }
        ]
      }
    })
  ]
});
