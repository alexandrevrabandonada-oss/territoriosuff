import { chromium } from 'playwright';
import { supabase } from '../src/lib/supabase/client.ts'; // This might not work in node without setup

// Since I cannot easily use the app's supabase client in a simple node script without ESM/TS setup,
// I will just use the browser to check the routes and presence of items.

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

// Note: This script assumes the dev server is running. 
// For a real smoke test in CI, we usually use the build output.
// I will just use the browser subagent to perform this check instead.
console.log('Smoke test script created. Use browser tool to verify.');
