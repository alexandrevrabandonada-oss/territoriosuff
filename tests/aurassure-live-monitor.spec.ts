import { expect, test } from "@playwright/test";

const headers = { "content-type": "application/json", "access-control-allow-origin": "*" };

test.describe("Monitor público de estações", () => {
  test("mostra leitura pública, muda de estação e identifica valores ausentes e atrasados", async ({ page }) => {
    await page.route("**/rest/v1/aurassure_public_measurements*", async (route) => {
      const station = new URL(route.request().url()).searchParams.get("station_id");
      const isIfrj = station === "eq.46561";
      const measuredAt = new Date(Date.now() - (isIfrj ? 90 : 10) * 60_000).toISOString();
      await route.fulfill({ status: 200, headers, body: JSON.stringify([{
        station_id: isIfrj ? 46561 : 46560, measured_at: measuredAt, averaging_period_seconds: 900,
        pm25_ug_m3: isIfrj ? null : 12.3, pm10_ug_m3: isIfrj ? 21.4 : 18.5
      }]) });
    });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const panel = page.getByRole("region", { name: "Última leitura pública da estação" });
    await expect(panel).toContainText("Última medição publicada");
    await expect(panel).toContainText("12,3");
    await expect(panel).toContainText("média de 15 minutos");
    await expect(panel).toContainText("Não é classificação oficial");
    await page.getByLabel("Sua estação favorita").selectOption("46561");
    await expect(panel).toContainText("Leitura desatualizada");
    await expect(panel).toContainText("21,4");
    await expect(panel).toContainText("Traço indica valor indisponível");
    await expect(panel).not.toContainText("12,3");
  });

  test("não transforma ausência ou falha em medição", async ({ page }) => {
    await page.route("**/rest/v1/aurassure_public_measurements*", async (route) => {
      const station = new URL(route.request().url()).searchParams.get("station_id");
      if (station === "eq.46561") {
        await route.fulfill({ status: 503, headers, body: JSON.stringify({ message: "unavailable" }) });
      } else {
        await route.fulfill({ status: 200, headers, body: "[]" });
      }
    });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const panel = page.getByRole("region", { name: "Última leitura pública da estação" });
    await expect(panel).toContainText("Nenhuma concentração disponível");
    await page.getByLabel("Sua estação favorita").selectOption("46561");
    await expect(panel).toContainText("Não foi possível consultar as concentrações");
    await expect(panel).not.toContainText("µg/m³");
  });
});
