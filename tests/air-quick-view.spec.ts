import { expect, test } from "@playwright/test";

test.describe("Consulta rápida do ar", () => {
  test.use({ serviceWorkers: "allow" });

  test("explica dados atuais e históricos e permite explorar a série", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Qualidade do ar atual" })).toBeVisible();
    const historical = page.getByRole("region", { name: "O que o histórico mostra" });
    await expect(historical).toContainText("não uma indicação da qualidade do ar agora");
    await expect(historical).toContainText("Cobertura de dados:");
    await historical.getByLabel("Estação histórica").selectOption("70");
    await historical.getByLabel("Poluente").selectOption("PM10");
    await expect(historical).toContainText("Retiro");
    await historical.getByText("Ver gráfico e dados por ano").click();
    await expect(historical.getByRole("list", { name: "Médias anuais de MP10 em Retiro" })).toBeVisible();
    await historical.getByLabel("Período").selectOption("3");
    await expect(historical.getByRole("listitem")).toHaveCount(3);
    await expect(historical).toContainText("ano parcial");
    await expect(historical).toContainText("dados até 05/2026");
    await expect(historical).toContainText("sem controle de qualidade oficial informado por registro");
    await historical.getByLabel("Estação histórica").selectOption("71");
    await historical.getByLabel("Período").selectOption("all");
    await expect(historical).toContainText("cobertura baixa");
  });

  test("preserva estação favorita e identifica a última consulta offline", async ({ page, context }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const station = page.getByLabel("Sua estação favorita");
    await station.selectOption("46561");
    await page.reload();
    await expect(station).toHaveValue("46561");

    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
      localStorage.setItem("semear-station-status-v1", JSON.stringify({
        savedAt: "2026-01-01T15:00:00Z",
        stations: [{
          station_id: 46561, station_name: "IFRJ", neighborhood: "Nossa Senhora das Graças",
          source_label: "Aurassure", last_measured_at: "2026-01-01T14:45:00Z",
          last_capture_at: "2026-01-01T14:45:00Z", last_checked_at: "2026-01-01T15:00:00Z",
          readings_last_24h: 90, coverage_24h_percent: 93.75, collection_status: "receiving",
          release_status: "measurements_pending_technical_review"
        }]
      }));
    });
    await page.reload();
    await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
    await context.setOffline(true);
    await page.reload();
    const card = page.getByRole("region", { name: "Acompanhe o ar da sua cidade" }).first();
    await expect(station).toHaveValue("46561");
    await expect(card).toContainText("Consulta salva em 01/01/2026");
    await expect(card).toContainText("Pode estar desatualizada");
    await expect(card).toContainText("Qualidade do ar atual");
    await expect(card).toContainText("Ainda não disponível");
    await expect(card).toContainText("aguardam validação técnica");
  });

  test("informa ausência de consulta salva quando está offline", async ({ page, context }) => {
    await page.goto("/");
    await page.evaluate(async () => { await navigator.serviceWorker.ready; localStorage.clear(); });
    await page.reload();
    await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
    await context.setOffline(true);
    await page.reload();
    const card = page.getByRole("region", { name: "Acompanhe o ar da sua cidade" }).first();
    await expect(card).toContainText("Situação indisponível");
    await expect(card).toContainText("Sem conexão para atualizar");
    await expect(card).not.toContainText("Consulta salva em");
  });
});
