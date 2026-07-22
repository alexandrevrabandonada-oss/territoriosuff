import { expect, test } from "@playwright/test";

const routes = [
  { path: "/", title: /SEMEAR UFF \| Transparência pública ambiental/i },
  { path: "/dados", title: /Leituras ambientais \| SEMEAR/i },
  { path: "/transparencia", title: /Transparência e devolutiva pública \| SEMEAR/i },
  { path: "/qualidade-ar/inea/metodologia", title: /Metodologia e dados abertos INEA \| SEMEAR/i },
  { path: "/offline", title: /Acesso offline \| SEMEAR/i }
];

const prerenderedRoutes = ["/", "/dados", "/relatorios", "/transparencia", "/mapa"];
const expectPrerender = process.env.PLAYWRIGHT_EXPECT_PRERENDER === "true";

test.describe("Client route metadata @smoke", () => {
  for (const route of routes) {
    test(`${route.path} should expose canonical and social metadata`, async ({ page }) => {
      await page.goto(route.path);
      await expect(page).toHaveTitle(route.title);
      const description = await page.locator('meta[name="description"]').getAttribute("content");
      expect(description?.length).toBeGreaterThanOrEqual(30);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://www.semearsf.org${route.path}`);
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", `https://www.semearsf.org${route.path}`);
      await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute("content", /SEMEAR/i);
      await expect(page.locator('meta[property="twitter:title"]')).toHaveCount(0);
    });
  }
});

test.describe("Hydratable production prerender @smoke", () => {
  for (const route of prerenderedRoutes) {
    test(`${route} should hydrate its server-rendered content without React errors`, async ({ page }) => {
      test.skip(!expectPrerender, "Requires the production prerender preview server");

      const hydrationErrors: string[] = [];
      page.on("console", (message) => {
        if (message.type() !== "error") return;
        const text = message.text();
        if (/hydration|Minified React error #(418|419|421|422|423|424|425)/i.test(text)) {
          hydrationErrors.push(text);
        }
      });
      page.on("pageerror", (error) => {
        if (/hydration|Minified React error #(418|419|421|422|423|424|425)/i.test(error.message)) {
          hydrationErrors.push(error.message);
        }
      });

      await page.goto(route);
      await expect(page.locator("#root")).toHaveAttribute("data-prerendered", "true");
      await expect(page.locator("main")).toBeVisible();
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator('link[data-deferred-stylesheet="true"]')).toHaveCount(1);

      await page.mouse.move(10, 10);
      await expect(page.locator('link[data-deferred-stylesheet="true"]')).toHaveCount(0);
      await expect(page.locator("#root")).toHaveAttribute("data-hydrated", "true", { timeout: 10_000 });
      await page.waitForTimeout(250);
      expect(hydrationErrors).toEqual([]);
    });
  }
});
