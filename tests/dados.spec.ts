import { test, expect } from "@playwright/test";

test.describe("Dados UFF/Aurassure @smoke", () => {
  test("main /dados route displays all three real stations, not the former offline pilot", async ({ page }) => {
    await page.goto("/dados", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: /O ar do território, observado por três estações/i })).toBeVisible();
    for (const station of ["UFF", "IFRJ", "CRIAAD"]) {
      await expect(page.getByRole("button", { name: new RegExp(station) })).toBeVisible();
    }
    await expect(page.getByText("Disponibilidade da rede integrada")).toBeVisible();
    await expect(page.getByText("Cobertura nas últimas 24h")).toHaveCount(3);
    await expect(page.getByText(/Concentrações em revisão técnica/)).toBeVisible();
    await expect(page.getByText(/Estação Piloto/)).toHaveCount(0);
    await expect(page.getByText(/Não transformamos automaticamente o AQI/i)).toBeVisible();
  });

  test("switches stations, plots only approved series and retains access to INEA", async ({ page }) => {
    await page.goto("/dados", { waitUntil: "domcontentloaded" });

    const ifrj = page.getByRole("button", { name: /IFRJ.*Nossa Senhora das Graças/i });
    await ifrj.click();
    await expect(ifrj).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText(/Série revisada · Nossa Senhora das Graças/i)).toBeVisible();

    await page.getByRole("button", { name: "7 dias" }).click();
    await expect(page.getByRole("button", { name: "7 dias" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("link", { name: "Abrir Radar INEA" })).toHaveAttribute("href", "/qualidade-ar/inea");
  });

  test("legacy pilot remains separate, identified as historical", async ({ page }) => {
    await page.goto("/dados/piloto", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/Painel piloto anterior — não corresponde/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /Abrir as três estações integradas/i })).toHaveAttribute("href", "/dados");
  });

  test("main readings page remains responsive", async ({ page }) => {
    await page.goto("/dados", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();
    expect((await page.locator("body").boundingBox())?.height).toBeGreaterThan(200);
  });
});
