import { expect, test } from "@playwright/test";

const responsiveWidths = [320, 360, 375, 390, 768, 1280, 1440];
const performanceRoutes = ["/", "/dados", "/relatorios", "/qualidade-ar/inea"];

test.describe("UI/UX roadmap", () => {
  for (const width of responsiveWidths) {
    test(`home should not overflow or clip primary content at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const metrics = await page.evaluate(() => {
        const root = document.documentElement;
        const primary = Array.from(document.querySelectorAll<HTMLElement>(
          ".portal-stage-copy h1, .portal-kpi-card, .home-observatory-hub, .home-feature-card"
        ));
        return {
          clientWidth: root.clientWidth,
          scrollWidth: root.scrollWidth,
          clipped: primary
            .map((element) => {
              const rect = element.getBoundingClientRect();
              return { text: element.textContent?.trim().slice(0, 40), left: rect.left, right: rect.right };
            })
            .filter((item) => item.left < -1 || item.right > root.clientWidth + 1)
        };
      });

      expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
      expect(metrics.clipped).toEqual([]);
    });
  }

  test("home should not label past dates as upcoming activities", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const upcoming = page.getByText("Próximas atividades do projeto", { exact: true });
    if (await upcoming.count()) {
      const section = upcoming.locator("xpath=ancestor::section[1]");
      const timestamps = await section.locator("time[datetime]").evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute("datetime"))
      );
      const now = Date.now();
      expect(timestamps.every((value) => value !== null && new Date(value).getTime() >= now)).toBeTruthy();
    }
  });

  test("notebook navigation keeps primary destinations visible", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");

    const navigation = page.getByRole("navigation", { name: "Navegação principal" });
    await expect(navigation).toBeVisible();
    for (const label of ["Home", "Dados", "Radar INEA", "Acervo", "Mais"]) {
      await expect(navigation.getByText(label, { exact: true })).toBeVisible();
    }
    await expect(page.getByRole("button", { name: "Abrir menu" })).toBeHidden();
  });

  test("reports distinguishes an empty catalog from empty filters", async ({ page }) => {
    await page.goto("/relatorios");
    await page.waitForLoadState("networkidle");

    const catalogEmpty = page.getByRole("heading", { name: "A biblioteca oficial está sendo preparada" });
    if (await catalogEmpty.count()) {
      await expect(catalogEmpty).toBeVisible();
      await expect(page.getByRole("heading", { name: "Filtrar por ano, tipo, tema e busca" })).toBeHidden();
      await expect(page.getByRole("link", { name: "Explorar dados abertos" })).toBeVisible();
    } else {
      await expect(page.getByRole("heading", { name: "Filtrar por ano, tipo, tema e busca" })).toBeVisible();
    }
  });

  test("data page separates station transmission from browser connection", async ({ page }) => {
    await page.goto("/dados");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Conexão indisponível", { exact: true })).toHaveCount(0);
    const noTransmission = page.getByText("Sem transmissão atual", { exact: true });
    if (await noTransmission.count()) await expect(noTransmission.first()).toBeVisible();
  });

  test("radar mode is addressable and shareable by URL", async ({ page }) => {
    await page.goto("/qualidade-ar/inea?modo=mapa");
    await page.waitForLoadState("networkidle");

    await page.evaluate(() => {
      const target = window as Window & { __semearInteractionDurations?: number[] };
      target.__semearInteractionDurations = [];
      const observer = new PerformanceObserver((list) => {
        const durations = target.__semearInteractionDurations;
        if (!durations) return;
        list.getEntries().forEach((entry) => durations.push(entry.duration));
      });
      observer.observe({ type: "event", buffered: true, durationThreshold: 16 });
    });

    const mapTab = page.getByRole("tab", { name: /Mapa/ });
    await expect(mapTab).toHaveAttribute("aria-selected", "true");

    await page.getByRole("tab", { name: /Tempo/ }).click();
    await expect(page).toHaveURL(/modo=tempo/);
    await expect(page.getByRole("tab", { name: /Tempo/ })).toHaveAttribute("aria-selected", "true");

    const interactionDurations = await page.evaluate(() =>
      (window as Window & { __semearInteractionDurations?: number[] }).__semearInteractionDurations ?? []
    );
    if (interactionDurations.length > 0) {
      expect(Math.max(...interactionDurations)).toBeLessThanOrEqual(200);
    }
  });

  for (const route of performanceRoutes) {
    test(`production Web Vitals budget is protected on ${route}`, async ({ page }) => {
      await page.setViewportSize({ width: 412, height: 915 });
      await page.addInitScript(() => {
        type VitalsWindow = Window & { __semearVitals?: { lcp: number; cls: number; inp: number } };
        type LayoutShiftEntry = PerformanceEntry & { value: number; hadRecentInput: boolean };
        type InteractionEntry = PerformanceEntry & { interactionId: number };
        const target = window as VitalsWindow;
        target.__semearVitals = { lcp: 0, cls: 0, inp: 0 };

        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            target.__semearVitals!.lcp = Math.max(target.__semearVitals!.lcp, entry.startTime);
          }
        }).observe({ type: "largest-contentful-paint", buffered: true });

        new PerformanceObserver((list) => {
          for (const rawEntry of list.getEntries()) {
            const entry = rawEntry as LayoutShiftEntry;
            if (!entry.hadRecentInput) target.__semearVitals!.cls += entry.value;
          }
        }).observe({ type: "layout-shift", buffered: true });

        try {
          new PerformanceObserver((list) => {
            for (const rawEntry of list.getEntries()) {
              const entry = rawEntry as InteractionEntry;
              if (entry.interactionId) {
                target.__semearVitals!.inp = Math.max(target.__semearVitals!.inp, entry.duration);
              }
            }
          }).observe({ type: "event", buffered: true, durationThreshold: 16 });
        } catch {
          // Event Timing is not available in every test browser.
        }
      });

      await page.goto(route);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(250);

      const button = page.locator("button:visible").first();
      if (await button.count()) {
        await button.click();
        await page.waitForTimeout(100);
        await page.keyboard.press("Escape");
      }

      const vitals = await page.evaluate(() =>
        (window as Window & { __semearVitals?: { lcp: number; cls: number; inp: number } }).__semearVitals
      );
      expect(vitals).toBeDefined();
      expect(vitals!.lcp).toBeLessThanOrEqual(2500);
      expect(vitals!.cls).toBeLessThanOrEqual(0.1);
      expect(vitals!.inp).toBeLessThanOrEqual(200);
    });
  }
});
