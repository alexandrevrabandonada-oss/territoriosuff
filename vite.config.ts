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
            
            if (
              normalizedId.includes("/src/admin/") ||
              normalizedId.includes("/pages/admin/") ||
              normalizedId.includes("/lib/admin/") ||
              normalizedId.includes("/layout/AdminLayout") ||
              normalizedId.includes("/components/AdminGuard")
            ) {
              return "admin-bundle";
            }

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
      manifest: {
        name: "SEMEAR Portal",
        short_name: "SEMEAR",
        description: "Portal de Monitoramento Ambiental e Engajamento Comunitário",
        theme_color: "#00e5ff",
        background_color: "#0a0a0a",
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
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        navigateFallback: "index.html",
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
        ],
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\/api\/.*$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-runtime",
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 80,
                maxAgeSeconds: 24 * 60 * 60
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/(?:reports|transparency)\/.*\.pdf$/,
            handler: "CacheFirst",
            options: {
              cacheName: "pdf-runtime",
              expiration: {
                maxEntries: 40,
                maxAgeSeconds: 30 * 24 * 60 * 60
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/(?:acervo|reports|transparency)\/.*(?:thumb|cover).*\.(?:png|jpg|jpeg|webp|svg)$/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "thumb-runtime",
              expiration: {
                maxEntries: 120,
                maxAgeSeconds: 14 * 24 * 60 * 60
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/acervo\/.*(?:\.png|\.jpg|\.jpeg|\.webp|\.svg)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "acervo-images",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 30 * 24 * 60 * 60
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/acervo\/.*\.pdf$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "acervo-pdfs",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 14 * 24 * 60 * 60
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ]
});
