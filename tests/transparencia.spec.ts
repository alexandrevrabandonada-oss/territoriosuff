import { expect, test } from "@playwright/test";

test.describe("Transparencia Page @smoke", () => {
  test("should distinguish individual records from monthly consolidated hearings", async ({ page }) => {
    await page.goto("/transparencia");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { name: /escutas, território e devolutiva pública/i, level: 1 })).toBeVisible();
    await expect(page.getByText("Registros individuais de escuta", { exact: true })).toBeVisible();
    await expect(page.getByText("Atividades de campo", { exact: true })).toBeVisible();
    await expect(page.getByText("Escutas consolidadas no mês", { exact: true })).toBeVisible();
    await expect(page.getByText(/fechamento mais recente dentro da série/i)).toBeVisible();
  });

  test("should defer and then render the territory map", async ({ page }) => {
    await page.goto("/transparencia");
    await page.waitForLoadState("networkidle");

    const mapHeading = page.getByRole("heading", { name: /onde as escutas e atividades têm acontecido/i });
    await expect(mapHeading).toBeVisible();
    await mapHeading.scrollIntoViewIfNeeded();
    await expect(page.getByRole("button", { name: "Zoom in" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Zoom out" })).toBeVisible();
  });
});
