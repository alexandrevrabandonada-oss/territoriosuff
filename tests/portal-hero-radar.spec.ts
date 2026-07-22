import { expect, test } from "@playwright/test";

async function expectHeroKpisReadable(page: import("@playwright/test").Page, route: string, heading: RegExp) {
  await page.goto(route, { waitUntil: "domcontentloaded" });
  await expect(page.locator("main")).toBeVisible();
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
    await expect(page.getByRole("heading", { name: "Projeto UFF SEMEAR", level: 1 })).toBeVisible();
    await expect(page.locator(".portal-stage-hero .portal-kpi-card")).toHaveCount(3);
    await expect(page.locator(".home-search")).toBeVisible();

    const introColor = await page.locator(".portal-hero-aside .home-intro").evaluate((el) => window.getComputedStyle(el).color);
    expect(introColor).not.toBe("rgb(20, 34, 53)");
  });

  test("secondary pages should keep readable hero KPI cards on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    await expectHeroKpisReadable(page, "/alertas", /Central de Alertas/i);
    await expectHeroKpisReadable(page, "/transparencia", /Escutas, território e devolutiva pública/i);
    await expectHeroKpisReadable(page, "/status", /Status do Sistema/i);
  });

  test("radar should switch lazy-loaded modes without blanking", async ({ page }) => {
    await page.goto("/qualidade-ar/inea", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".inea-radar-page")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Observatório do Ar Volta Redonda/i })).toBeVisible();

    const modes = [
      { label: /🗺️\s*Mapa/i, marker: /Onde o ar foi medido/i },
      { label: /⏱️\s*Tempo/i, marker: /Histórico Temporal/i },
      { label: /👥\s*Território/i, marker: /Quem respira esse ar/i },
      { label: /📚\s*Metodologia e Dados/i, marker: /Guia público do Radar INEA|Leia o Radar sem transformar dado público/i }
    ] as const;

    for (const mode of modes) {
      const button = page.getByRole("tab", { name: mode.label });
      await expect(button).toBeVisible();
      await button.click();
      await expect(page.locator("body")).not.toContainText(/^\s*$/);
      await expect(page.locator("main")).toContainText(mode.marker);
    }

    const mapTab = page.getByRole("tab", { name: /🗺️\s*Mapa/i });
    await mapTab.focus();
    await mapTab.press("End");
    await expect(page.getByRole("tab", { name: /Metodologia e Dados/i })).toHaveAttribute("aria-selected", "true");
  });
});
