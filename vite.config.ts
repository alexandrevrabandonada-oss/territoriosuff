import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { VitePWA } from "vite-plugin-pwa";

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
          }
        ]
      },
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        globIgnores: [
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
