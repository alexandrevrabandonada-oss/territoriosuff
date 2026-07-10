import { expect, test } from "@playwright/test";

const routes = [
  { path: "/", title: /SEMEAR UFF \| Transparência pública ambiental/i },
  { path: "/dados", title: /Leituras ambientais \| SEMEAR/i },
  { path: "/transparencia", title: /Transparência e devolutiva pública \| SEMEAR/i },
  { path: "/qualidade-ar/inea/metodologia", title: /Metodologia e dados abertos INEA \| SEMEAR/i },
  { path: "/offline", title: /Acesso offline \| SEMEAR/i }
];

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
