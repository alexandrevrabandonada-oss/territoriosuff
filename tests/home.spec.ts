import { test, expect } from '@playwright/test';

test.describe('Home Page @smoke', () => {
  test('should load and display main sections', async ({ page }) => {
    await page.goto('/');
    
    // Check page loads successfully
    await expect(page).toHaveTitle(/SEMEAR/i);
    
    // Verify hero section with main heading
    await expect(page.getByRole('heading', { name: /SEMEAR|Conhecimento que semeia/i }).first()).toBeVisible();
    
    // Check search input is present
    await expect(page.getByPlaceholder(/buscar/i)).toBeVisible();
    
    // Verify main navigation links
    await expect(page.getByRole('link', { name: /dados/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /acervo/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /blog/i }).first()).toBeVisible();
    
    // Check for the public-data overview section
    await expect(page.getByRole('heading', { name: /dados públicos para localizar, compreender e agir/i })).toBeVisible();
    
    // Verify footer is present
    await expect(page.locator('footer')).toBeVisible();
  });

  test('should navigate to main sections', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to Dados
    await page.getByRole('link', { name: /dados/i }).first().click();
    await expect(page).toHaveURL(/\/dados/);
    await page.goBack();
    
    // Navigate to Acervo
    await page.getByRole('link', { name: /acervo/i }).first().click();
    await expect(page).toHaveURL(/\/acervo/);
    await page.goBack();
    
    // Navigate to Blog
    await page.getByRole('link', { name: /blog/i }).first().click();
    await expect(page).toHaveURL(/\/blog/);
  });
});
