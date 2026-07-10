import fs from "node:fs/promises";
import path from "node:path";
import { PassThrough } from "node:stream";
import Critters from "critters";
import React from "react";
import { renderToPipeableStream } from "react-dom/server";
import { StaticRouter } from "react-router";

import App from "../src/App";
import { getStaticMetadataFileName } from "../src/content/siteMetadata";

const ROUTES = ["/", "/dados", "/relatorios", "/transparencia", "/mapa"] as const;
const RENDER_TIMEOUT_MS = 30_000;

function renderRoute(pathname: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const output = new PassThrough();
    const chunks: string[] = [];
    let settled = false;

    output.setEncoding("utf8");
    output.on("data", (chunk: string) => chunks.push(chunk));
    output.on("end", () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      resolve(chunks.join(""));
    });
    output.on("error", (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      reject(error);
    });

    const { pipe, abort } = renderToPipeableStream(
      <StaticRouter location={pathname}>
        <App />
      </StaticRouter>,
      {
        onAllReady() {
          pipe(output);
        },
        onShellError(error) {
          if (settled) return;
          settled = true;
          clearTimeout(timeout);
          reject(error);
        },
        onError(error) {
          console.error(`Prerender recoverable error on ${pathname}:`, error);
        }
      }
    );

    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      abort();
      reject(new Error(`Prerender timed out for ${pathname}`));
    }, RENDER_TIMEOUT_MS);
  });
}

function injectMarkup(documentHtml: string, markup: string) {
  const rootPattern = /<div id="root"><\/div>/;
  if (!rootPattern.test(documentHtml)) {
    throw new Error("Unable to find the empty #root element in built HTML.");
  }
  return documentHtml.replace(rootPattern, `<div id="root" data-prerendered="true">${markup}</div>`);
}

async function optimizeCriticalCss(documentHtml: string, distDir: string, route: string) {
  const critters = new Critters({
    path: distDir,
    publicPath: "/",
    preload: false,
    pruneSource: false,
    compress: true,
    logLevel: "silent"
  });
  const optimized = await critters.process(documentHtml);
  const criticalStyle = optimized.match(/<style>([\s\S]*?)<\/style>/)?.[1];
  if (!criticalStyle) throw new Error("Critters did not produce a critical stylesheet.");

  return documentHtml
    .replace(
      /<link\b[^>]*rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/,
      (_link, href: string) => `<style data-prerender-critical="true">${criticalStyle}</style><link crossorigin data-deferred-stylesheet="true" data-href="${href}">`
    )
    .replace(/\s*<link rel="modulepreload"[^>]*>\s*/g, "\n")
    .replace(/<script>\(\(\)=>\{const routes=[\s\S]*?<\/script>\s*/, "")
    .replace(
      /<script type="module" crossorigin src="([^"]+)"><\/script>/,
      (_script, source: string) => {
        const serializedSource = JSON.stringify(source);
        const serializedRoute = JSON.stringify(route);
        return `<script>(()=>{const source=${serializedSource};const route=${serializedRoute};let started=false;let interactive=false;let replaying=false;let timer;const events=["pointerover","pointerdown","touchstart","focusin","keydown","wheel","scroll"];const activateStyles=()=>{for(const link of document.querySelectorAll("link[data-deferred-stylesheet]")){link.rel="stylesheet";link.href=link.dataset.href;delete link.dataset.deferredStylesheet;delete link.dataset.href;}};const load=()=>{if(started)return;started=true;clearTimeout(timer);for(const event of events)window.removeEventListener(event,load,true);activateStyles();import(source).then(()=>setTimeout(()=>{interactive=true;},750));};document.addEventListener("click",event=>{if(replaying||interactive)return;const target=event.target instanceof Element?event.target.closest("button,[role=button],[role=tab]"):null;if(!(target instanceof HTMLElement))return;event.preventDefault();event.stopImmediatePropagation();load();let attempts=0;const replay=()=>{if(interactive){replaying=true;target.click();queueMicrotask(()=>{replaying=false;});}else if(attempts++<400){setTimeout(replay,25);}};replay();},true);let current=location.pathname;while(current.length>1&&current.endsWith("/"))current=current.slice(0,-1);if(current!==route){load();return;}for(const event of events)window.addEventListener(event,load,{capture:true,passive:true});timer=setTimeout(load,30000);requestAnimationFrame(()=>requestAnimationFrame(()=>{const preload=document.createElement("link");preload.rel="modulepreload";preload.href=source;preload.crossOrigin="anonymous";document.head.appendChild(preload);}));})();</script>`;
      }
    );
}

async function main() {
  const distDir = path.join(process.cwd(), "dist");
  const seoDir = path.join(distDir, "_seo");

  for (const route of ROUTES) {
    const sourcePath = route === "/"
      ? path.join(distDir, "index.html")
      : path.join(seoDir, `${getStaticMetadataFileName(route)}.html`);
    const sourceHtml = await fs.readFile(sourcePath, "utf8");
    const markup = await renderRoute(route);
    const prerenderedHtml = await optimizeCriticalCss(injectMarkup(sourceHtml, markup), distDir, route);

    await fs.writeFile(sourcePath, prerenderedHtml, "utf8");

    if (route !== "/") {
      const previewDir = path.join(distDir, route.slice(1));
      await fs.mkdir(previewDir, { recursive: true });
      await fs.writeFile(path.join(previewDir, "index.html"), prerenderedHtml, "utf8");
    }
  }

  console.log(`Prerendered ${ROUTES.length} performance-critical routes with hydratable HTML.`);
}

await main();
