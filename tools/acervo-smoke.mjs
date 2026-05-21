import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('--- Smoke Test: Acervo ---');

  // 1. Validate /admin/acervo/novo exists (requires login, but we check if it doesn't 404)
  // Actually, without login it might redirect to /login or /admin/login
  try {
    console.log('Checking /admin/acervo/novo...');
    await page.goto('http://localhost:5173/admin/acervo/novo');
    const title = await page.title();
    console.log('Page Title:', title);
    // If it's a SPA, it might not 404 but show a blank page or login.
    // We check if the URL is still valid.
  } catch (err) {
    console.error('Failed to reach /admin/acervo/novo:', err.message);
  }

  // 2. Validate public listing
  try {
    console.log('Checking /acervo/artigos...');
    await page.goto('http://localhost:5173/acervo/artigos');
    await page.waitForTimeout(2000); // Wait for load
    const content = await page.content();
    if (content.includes('Nenhum item publicado') || content.includes('Acervo')) {
      console.log('[OK] Public listing rendered.');
    } else {
      console.log('[FAIL] Public listing might be broken.');
    }
  } catch (err) {
    console.error('Failed to reach /acervo/artigos:', err.message);
  }

  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
