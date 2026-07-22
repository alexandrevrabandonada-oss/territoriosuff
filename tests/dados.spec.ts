import { test, expect } from '@playwright/test';

test.describe('Dados Page @smoke', () => {
  test('should load and display monitoring interface', async ({ page }) => {
    await page.goto('/dados', { waitUntil: 'domcontentloaded' });
    
    // Check page title/heading
    await expect(page.getByRole('heading', { name: /dados/i }).first()).toBeVisible();
    
    // The station control is rendered after the lazy page module is ready.
    await expect(page.locator('.data-control-label').filter({ hasText: 'Estação' }).first()).toBeVisible();
    
    // Check for data visualization or table (flexible - could be chart, table, or loading state)
    const hasDataDisplay = await page.locator('table, canvas, svg, [role="img"]').count() > 0;
    const hasLoadingState = await page.getByText(/carregando|loading/i).count() > 0;
    const hasEmptyState = await page.getByText(/nenhum|sem dados/i).count() > 0;
    
    expect(hasDataDisplay || hasLoadingState || hasEmptyState).toBeTruthy();
  });

  test('should be responsive', async ({ page }) => {
    await page.goto('/dados', { waitUntil: 'domcontentloaded' });
    
    // Verify page renders without errors
    await expect(page.locator('body')).toBeVisible();
    
    // Check no major layout breaks (page has reasonable height)
    const bodyHeight = await page.locator('body').boundingBox();
    expect(bodyHeight?.height).toBeGreaterThan(200);
  });
});
