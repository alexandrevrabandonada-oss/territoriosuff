import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const pagesToAudit = ["/", "/dados", "/agenda", "/conversar", "/acervo", "/blog", "/transparencia", "/mapa", "/qualidade-ar/inea"];

async function expectNoA11yViolations(page: import("@playwright/test").Page): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2aa", "wcag21aa"])
    .analyze();

  expect(results.violations).toHaveLength(0);
}

function parseHeadingLevels(tags: string[]): number[] {
  return tags
    .map((tag) => Number.parseInt(tag.replace("H", ""), 10))
    .filter((level) => Number.isFinite(level) && level >= 1 && level <= 6);
}

test.describe("Accessibility smoke @a11y", () => {
  for (const route of pagesToAudit) {
    test(`${route} should have no axe violations`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      await expectNoA11yViolations(page);
    });
  }

  test("home should expose keyboard skip link", async ({ page }) => {
    await page.goto("/");

    const skipLink = page.getByRole("link", { name: /ir para o conteudo principal|ir para o conteúdo principal/i });
    await expect(skipLink).toHaveAttribute("href", "#main-content");

    await page.keyboard.press("Tab");
    await expect(skipLink).toBeFocused();

    const metrics = await skipLink.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });

    expect(metrics.width).toBeGreaterThan(0);
    expect(metrics.height).toBeGreaterThan(0);
  });

  test("keyboard focus should be visibly styled", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const brandLink = page.getByRole("link", { name: "SEMEAR - Início" });
    await brandLink.focus();
    await expect(brandLink).toBeFocused();

    const focusState = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return null;
      const styles = window.getComputedStyle(el);
      return {
        tag: el.tagName,
        boxShadow: styles.boxShadow,
        outlineStyle: styles.outlineStyle,
        outlineWidth: styles.outlineWidth
      };
    });

    expect(focusState).not.toBeNull();
    expect(focusState?.tag).toMatch(/A|BUTTON|INPUT|TEXTAREA|SELECT/);

    const hasVisibleFocus =
      (focusState?.boxShadow && focusState.boxShadow !== "none") ||
      ((focusState?.outlineStyle && focusState.outlineStyle !== "none") && focusState?.outlineWidth !== "0px");

    expect(Boolean(hasVisibleFocus)).toBeTruthy();
  });

  test("mapa should expose list and valid heading order", async ({ page }) => {
    await page.goto("/mapa");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("link", { name: /pular mapa e ir para lista/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /mapa de monitoramento/i, level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: /lista de estações/i, level: 2 })).toBeVisible();

    const list = page.locator("#mapa-lista ul");
    await expect(list.first()).toBeVisible();

    const headingTags = await page.locator("h1, h2, h3, h4, h5, h6").evaluateAll((nodes) =>
      nodes.map((node) => node.tagName)
    );
    const levels = parseHeadingLevels(headingTags);
    expect(levels.length).toBeGreaterThan(0);
    expect(levels[0]).toBe(1);
    for (let i = 1; i < levels.length; i += 1) {
      expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
    }
  });

  test("headings should keep non-skipping order", async ({ page }) => {
    await page.goto("/sobre");
    await page.waitForLoadState("networkidle");

    const headingTags = await page.locator("h1, h2, h3, h4, h5, h6").evaluateAll((nodes) =>
      nodes.map((node) => node.tagName)
    );

    const levels = parseHeadingLevels(headingTags);
    expect(levels.length).toBeGreaterThan(0);
    expect(levels[0]).toBe(1);

    for (let i = 1; i < levels.length; i += 1) {
      const current = levels[i];
      const previous = levels[i - 1];
      expect(current - previous).toBeLessThanOrEqual(1);
    }
  });
});
