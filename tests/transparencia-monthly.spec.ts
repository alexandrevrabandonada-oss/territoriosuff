import { expect, test } from "@playwright/test";

test("apresenta os três meses com bases e divergências explícitas @smoke", async ({ page }) => {
  await page.route("**/rest/v1/transparency_live_reports*", (route) => route.fulfill({
    status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" },
    body: JSON.stringify([{ id: "junho", month_key: "2026-06", month_label: "junho de 2026", actions_count: 4, hearings_count: 36, territorial_coverage_pct: 96.7, territorial_status: "adequada", status: "published" }])
  }));
  await page.goto("/transparencia", { waitUntil: "domcontentloaded" });

  const september = page.locator("article").filter({ has: page.getByRole("heading", { name: "setembro de 2026" }) });
  const august = page.locator("article").filter({ has: page.getByRole("heading", { name: "agosto de 2026" }) });
  const july = page.locator("article").filter({ has: page.getByRole("heading", { name: "julho de 2026" }) });
  await expect(page.getByRole("heading", { name: "junho de 2026" })).toBeVisible();
  await expect(september).toContainText("12 escutas individuais e 6 relatos de roda");
  await expect(august).toContainText("Não calculável");
  await expect(august).toContainText("11 relatos de roda e nenhuma escuta individual");
  await expect(july).toContainText("uma única escuta individual (1 de 1)");
  await expect(july).toContainText("aparece duas vezes");
  await august.getByText("Ver atividades do mês").click();
  await expect(august).toContainText("07/08/2026");
  await expect(august).toContainText("20/08/2026");
});
