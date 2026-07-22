import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;
const ciPort = process.env.PLAYWRIGHT_PORT || '4173';
const localPort = process.env.PLAYWRIGHT_PORT || '5174';
const externalServer = process.env.PLAYWRIGHT_EXTERNAL_SERVER === 'true';
const baseURL = process.env.PLAYWRIGHT_BASE_URL || (isCI ? `http://127.0.0.1:${ciPort}` : `http://127.0.0.1:${localPort}`);

/**
 * Playwright configuration for SEMEAR PWA smoke tests
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',

  expect: {
    timeout: isCI ? 20_000 : 10_000,
  },

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: isCI,

  /* Retry on CI only */
  retries: isCI ? 2 : 0,

  /* Opt out of parallel tests on CI */
  workers: isCI ? 1 : undefined,

  /* Reporter to use */
  reporter: 'html',

  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL,

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Production previews register the PWA worker. Blocking it keeps smoke
       tests on the assets from the current build instead of a warming cache. */
    serviceWorkers: 'block',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Run app server before tests (skip when CI provides external preview server) */
  webServer: externalServer
    ? undefined
    : {
        command: isCI
          ? `npm run preview -- --host 127.0.0.1 --port ${ciPort}`
          : `npm run dev -- --host 127.0.0.1 --port ${localPort}`,
        url: baseURL,
        reuseExistingServer: false,
        timeout: 120000,
      },
});
