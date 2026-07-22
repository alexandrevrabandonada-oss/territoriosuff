import { expect, test } from "@playwright/test";

test.describe("Navigation and PWA @smoke", () => {
  test("mobile menu exposes all primary content destinations and returns focus on Escape", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const menuButton = page.getByRole("button", { name: "Abrir menu" });
    await menuButton.click();

    const dialog = page.getByRole("dialog", { name: "Menu de navegação" });
    await expect(dialog.getByRole("link", { name: "Blog", exact: true })).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Dossiês", exact: true })).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Buscar", exact: true })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(menuButton).toBeFocused();
  });

  test("program tabs support arrow, Home and End navigation", async ({ page }) => {
    await page.goto("/programa-uff-territorio");

    const tabList = page.getByRole("tablist", { name: "Frentes do programa" });
    const tabs = tabList.getByRole("tab");
    await expect(tabs).toHaveCount(4);

    await tabs.nth(0).focus();
    await tabs.nth(0).press("End");
    await expect(tabs.nth(3)).toHaveAttribute("aria-selected", "true");

    await tabs.nth(3).press("Home");
    await expect(tabs.nth(0)).toHaveAttribute("aria-selected", "true");

    await tabs.nth(0).press("ArrowRight");
    await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  });

  test("manifest and offline route keep the installable fallback contract", async ({ page, request }) => {
    const manifestResponse = await request.get("/manifest.webmanifest");
    expect(manifestResponse.ok()).toBeTruthy();
    const manifest = await manifestResponse.json() as {
      start_url?: string;
      display?: string;
      icons?: Array<{ sizes?: string; purpose?: string }>;
    };

    expect(manifest.start_url).toBe("/");
    expect(manifest.display).toBe("standalone");
    expect(manifest.icons?.some((icon) => icon.sizes === "512x512" && icon.purpose?.includes("maskable"))).toBeTruthy();

    await page.goto("/offline");
    const offlineRegion = page.getByRole("region", { name: "Acesso offline ao SEMEAR" });
    await expect(offlineRegion.getByRole("heading", { name: "Acesso offline ao SEMEAR", level: 1 })).toBeVisible();
    await expect(offlineRegion.getByRole("status")).toContainText(/conexão indisponível/i);
  });
});
