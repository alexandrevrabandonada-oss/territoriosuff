import { expect, test } from "@playwright/test";

const headers = { "content-type": "application/json", "access-control-allow-origin": "*" };

test.describe("Monitor público de estações", () => {
  test("compara médias de 24 horas com referências OMS sem classificar leituras de 15 minutos", async ({ page }) => {
    const end = Math.floor(Date.now() / 900_000) * 900_000;
    await page.route("**/rest/v1/aurassure_preliminary_readings*", async (route) => {
      const url = new URL(route.request().url());
      const count = url.searchParams.get("limit") === "1" ? 1 : 96;
      const samples = Array.from({ length: count }, (_, i) => ({
        station_id: 46560, measured_at: new Date(end - i * 900_000).toISOString(),
        averaging_period_seconds: 900, pm25_ug_m3: 20, pm10_ug_m3: 30
      }));
      await route.fulfill({ status: 200, headers, body: JSON.stringify(samples) });
    });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const context = page.getByLabel("Comparação com a OMS");
    await expect(context).toContainText("MP2,5 · média em 24h");
    await expect(context).toContainText("Acima do valor de referência da OMS");
    await expect(context).toContainText("Abaixo do valor de referência da OMS");
    await expect(context).toContainText("96/96 leituras");
    await expect(context).toContainText("não devem ser comparados diretamente");
  });

  test("não compara com a OMS quando faltam medições de 24 horas", async ({ page }) => {
    const end = Math.floor(Date.now() / 900_000) * 900_000;
    await page.route("**/rest/v1/aurassure_preliminary_readings*", async (route) => {
      const count = new URL(route.request().url()).searchParams.get("limit") === "1" ? 1 : 71;
      const samples = Array.from({ length: count }, (_, i) => ({
        station_id: 46560, measured_at: new Date(end - i * 900_000).toISOString(),
        averaging_period_seconds: 900, pm25_ug_m3: 8, pm10_ug_m3: 12
      }));
      await route.fulfill({ status: 200, headers, body: JSON.stringify(samples) });
    });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const context = page.getByLabel("Comparação com a OMS");
    await expect(context.getByText("Dados insuficientes")).toHaveCount(2);
    await expect(context).toContainText("71/96 leituras");
    await expect(context).not.toContainText("Abaixo do valor de referência da OMS");
  });

  test("mostra leitura pública, muda de estação e identifica valores ausentes e atrasados", async ({ page }) => {
    await page.route("**/rest/v1/aurassure_preliminary_readings*", async (route) => {
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
    await page.route("**/rest/v1/aurassure_preliminary_readings*", async (route) => {
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
