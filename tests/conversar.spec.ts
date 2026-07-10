import { test, expect } from '@playwright/test';

test.describe('Conversar Page @smoke', () => {
  test('should load conversar interface', async ({ page }) => {
    await page.goto('/conversar');
    
    // Check main heading or title
    await expect(page.getByRole('heading', { name: "Conversas e atividades", level: 1 })).toBeVisible();
    
    // Verify main content area loads
    await expect(page.locator('main')).toBeVisible();
    
    // The page must expose either published records or its explicit empty state.
    const publishedRecords = page.getByRole('region', { name: /registros recentes/i }).locator('article');
    const hasPublishedRecords = await publishedRecords.count() > 0;
    const hasEmptyState = await page.getByText(/nenhuma conversa ou atividade publicada/i).count() > 0;

    expect(hasPublishedRecords || hasEmptyState).toBeTruthy();
  });

  test('should be responsive and usable', async ({ page }) => {
    await page.goto('/conversar');
    
    // Verify page renders without major errors
    await expect(page.locator('body')).toBeVisible();
    
    // Check page has content
    const bodyHeight = await page.locator('body').boundingBox();
    expect(bodyHeight?.height).toBeGreaterThan(200);
  });

  test('should toggle the Relato Ambiental form and validate inputs', async ({ page }) => {
    await page.goto('/conversar');

    // Find the toggle button
    const toggleBtn = page.getByRole('button', { name: /relatar ocorrência/i });
    await expect(toggleBtn).toBeVisible();

    // The form should not be visible initially
    await expect(page.locator('#reporter-name')).not.toBeVisible();

    // Click the toggle button to open the form
    await toggleBtn.click();
    await expect(page.locator('#reporter-name')).toBeVisible();
    await expect(page.getByRole('button', { name: /fechar formulário/i })).toBeVisible();

    // Fill all native required fields but leave category unselected
    await page.locator('#reporter-name').fill('Cidadão de Teste');
    await page.locator('#report-location').fill('Rua de Teste, 123');
    await page.locator('#report-description').fill('Acúmulo de entulho na calçada impedindo a passagem.');
    
    // Try to submit the form without selecting a category
    const submitBtn = page.getByRole('button', { name: /enviar relato/i });
    await submitBtn.click();
    await expect(page.locator('text=Por favor, preencha todos os campos obrigatórios')).toBeVisible();

    // Select category (e.g. Lixo / Resíduos)
    await page.getByRole('radio', { name: /lixo \/ resíduos/i }).click();

    // Fill contact fields with invalid e-mail format (passes HTML5 type="email" but fails custom regex)
    await page.locator('#reporter-email').fill('abc@def');
    await submitBtn.click();
    await expect(page.locator('text=Por favor, informe um endereço de e-mail válido')).toBeVisible();

    // Fix email but enter an invalid phone number
    await page.locator('#reporter-email').fill('email@valido.com');
    await page.locator('#reporter-phone').fill('123'); // invalid length
    await submitBtn.click();
    await expect(page.locator('text=Por favor, informe um telefone de contato válido com DDD')).toBeVisible();

    // Fix phone number
    await page.locator('#reporter-phone').fill('21999999999');

    // Close the form
    const closeBtn = page.getByRole('button', { name: /fechar formulário/i });
    await closeBtn.click();
    await expect(page.locator('#reporter-name')).not.toBeVisible();
  });
});
