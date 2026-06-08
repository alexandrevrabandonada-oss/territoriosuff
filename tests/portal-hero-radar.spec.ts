import { expect, test } from "@playwright/test";

async function expectHeroKpisReadable(page: import("@playwright/test").Page, route: string, heading: RegExp) {
  await page.goto(route);
  await expect(page.locator(".portal-stage-hero")).toBeVisible();
  await expect(page.getByRole("heading", { name: heading })).toBeVisible();

  const kpis = page.locator(".portal-stage-hero .portal-kpi-card");
  await expect(kpis.first()).toBeVisible();

  const color = await kpis.first().evaluate((el) => window.getComputedStyle(el).color);
  expect(color).not.toBe("rgb(255, 255, 255)");
}

test.describe("Portal Hero and Radar smoke @smoke", () => {
  test("home hero should stay readable on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await expect(page.locator(".portal-stage-hero")).toBeVisible();
    await expect(page.getByRole("heading", { name: /SEMEAR|PROJETO UFF/i })).toBeVisible();
    await expect(page.locator(".portal-stage-hero .portal-kpi-card")).toHaveCount(3);
    await expect(page.locator(".home-search")).toBeVisible();

    const introColor = await page.locator(".portal-hero-aside .home-intro").evaluate((el) => window.getComputedStyle(el).color);
    expect(introColor).not.toBe("rgb(20, 34, 53)");
  });

  test("secondary pages should keep readable hero KPI cards on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    await expectHeroKpisReadable(page, "/alertas", /Central de Alertas/i);
    await expectHeroKpisReadable(page, "/transparencia", /Transparência e prestação de contas/i);
    await expectHeroKpisReadable(page, "/status", /Status do Sistema/i);
  });

  test("radar should switch lazy-loaded modes without blanking", async ({ page }) => {
    await page.goto("/qualidade-ar/inea");
    await expect(page.locator(".portal-stage-hero, h1")).toBeVisible();

    const radarNav = page.locator(".sticky").first();
    const modes = [
      { label: /🗺️\s*Mapa/i, marker: /Onde o ar foi medido/i },
      { label: /⏱️\s*Tempo/i, marker: /Histórico Temporal/i },
      { label: /👥\s*Território/i, marker: /Quem respira esse ar/i },
      { label: /📚\s*Metodologia e Dados/i, marker: /Metodologia e Nível de Confiança|Metodologia e Dados Abertos/i }
    ] as const;

    for (const mode of modes) {
      const button = radarNav.getByRole("button", { name: mode.label });
      await expect(button).toBeVisible();
      await button.click();
      await expect(page.locator("body")).not.toContainText(/^\s*$/);
      await expect(page.locator("main")).toContainText(mode.marker);
    }
  });
});
