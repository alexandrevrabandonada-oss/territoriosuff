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

  test("retired and unknown paths never masquerade as the home page", async ({ page }) => {
    await page.goto("/rota-que-nao-existe");

    await expect(page).toHaveURL(/\/rota-que-nao-existe$/);
    await expect(page.getByRole("heading", { name: "Página não encontrada", level: 1 })).toBeVisible();
    await expect(page).toHaveTitle(/Página não encontrada \| SEMEAR/i);
    await expect(page.getByRole("heading", { name: "Projeto UFF SEMEAR", level: 1 })).toHaveCount(0);
  });

  test("public guidance and footer expose only current destinations", async ({ page }) => {
    await page.goto("/como-ler-dados");

    const timelineLink = page.getByRole("link", { name: "Linha do tempo" });
    await expect(timelineLink).toHaveAttribute("href", "/acervo/linha");
    await timelineLink.click();
    await expect(page).toHaveURL(/\/acervo\/linha$/);

    const footer = page.getByRole("contentinfo");
    await expect(footer.getByRole("navigation", { name: "Links úteis" })).toBeVisible();
    const instagram = footer.getByRole("link", { name: "Abrir Instagram oficial do SEMEAR" });
    const tiktok = footer.getByRole("link", { name: "Abrir TikTok oficial do SEMEAR" });
    await expect(instagram).toHaveAttribute("href", "https://www.instagram.com/sfsemear?igsh=MXF1ODdkemZlaHJrYg==");
    await expect(tiktok).toHaveAttribute("href", "https://www.tiktok.com/@semear.uff?_r=1&_t=ZS-98FzuP81rtN");
    await expect(instagram).toHaveAttribute("target", "_blank");
    await expect(tiktok).toHaveAttribute("target", "_blank");
    await expect(footer.locator('a[href="https://www.youtube.com/"]')).toHaveCount(0);
  });
});
