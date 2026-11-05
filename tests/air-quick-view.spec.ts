import { expect, test } from "@playwright/test";

test.describe("Consulta rápida do ar", () => {
  test.use({ serviceWorkers: "allow" });

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
    const card = page.getByRole("region", { name: "Acompanhe o ar de Volta Redonda" }).first();
    await expect(station).toHaveValue("46561");
    await expect(card).toContainText("Consulta salva em 01/01/2026");
    await expect(card).toContainText("Pode estar desatualizada");
    await expect(card).toContainText("Sem conexão. As concentrações não podem ser atualizadas agora.");
    await expect(card).toContainText("A operação da estação não indica se o ar está bom ou ruim.");
  });

  test("informa ausência de consulta salva quando está offline", async ({ page, context }) => {
    await page.goto("/");
    await page.evaluate(async () => { await navigator.serviceWorker.ready; localStorage.clear(); });
    await page.reload();
    await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
    await context.setOffline(true);
    await page.reload();
    const card = page.getByRole("region", { name: "Acompanhe o ar de Volta Redonda" }).first();
    await expect(card).toContainText("Situação indisponível");
    await expect(card).toContainText("Sem conexão para atualizar");
    await expect(card).not.toContainText("Consulta salva em");
  });
});
