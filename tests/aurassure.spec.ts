import { expect, test } from "@playwright/test";

test.describe("Rede UFF / Aurassure @smoke", () => {
  test("the review-gated portal route shows stations and provenance boundaries", async ({ page }) => {
    await page.goto("/qualidade-ar/uff", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: /O ar do território, observado por três estações/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /UFF.*Vila Santa Cecília/i })).toBeVisible();
    const ifrj = page.getByRole("button", { name: /IFRJ.*Nossa Senhora das Graças/i });
    await expect(ifrj).toBeVisible();
    await expect(page.getByRole("button", { name: /CRIAAD.*Vila Mury/i })).toBeVisible();

    await ifrj.click();
    await expect(ifrj).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText(/Série revisada · Nossa Senhora das Graças/i)).toBeVisible();

    const sevenDays = page.getByRole("button", { name: "7 dias" });
    await sevenDays.click();
    await expect(sevenDays).toHaveAttribute("aria-pressed", "true");

    await expect(page.getByText(/Não transformamos automaticamente o AQI/i)).toBeVisible();
    await expect(page.getByRole("link", { name: "Abrir Radar INEA" })).toHaveAttribute("href", "/qualidade-ar/inea");
  });
});
