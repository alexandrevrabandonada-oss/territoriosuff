import { test, expect } from '@playwright/test';

test.describe('Conversar Page @smoke', () => {
  test('should load conversar interface', async ({ page }) => {
    await page.goto('/conversar');
    
    // Check main heading or title
    await expect(page.getByRole('heading', { name: /conversas? e atividades/i }).first()).toBeVisible();
    
    // Verify main content area loads
    await expect(page.locator('main')).toBeVisible();
    
    // Check for conversation-related elements (flexible to different states)
    const hasConversationUI = await page.locator('form, textarea, input[type="text"], [role="textbox"]').count() > 0;
    const hasConversationList = await page.locator('[class*="conversation"], [class*="comment"], [class*="thread"]').count() > 0;
    const hasEmptyState = await page.getByText(/nenhuma|sem conversas|inicie/i).count() > 0;
    const hasLoadingState = await page.getByText(/carregando/i).count() > 0;
    
    expect(hasConversationUI || hasConversationList || hasEmptyState || hasLoadingState).toBeTruthy();
  });

  test('should be responsive and usable', async ({ page }) => {
    await page.goto('/conversar');
    
    // Verify page renders without major errors
    await expect(page.locator('body')).toBeVisible();
    
    // Check page has content
    const bodyHeight = await page.locator('body').boundingBox();
    expect(bodyHeight?.height).toBeGreaterThan(200);
  });
});
