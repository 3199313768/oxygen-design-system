import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.OXYGEN_FOUNDATION_PORT ?? 6022);
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests/foundation',
  outputDir: './output/playwright/foundation/results',
  fullyParallel: true,
  workers: 2,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'output/playwright/foundation/report', open: 'never' }],
    ['json', { outputFile: 'output/playwright/foundation/results.json' }],
  ],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    // The suite's failure hook disables animations in saved screenshots.
    screenshot: 'off',
  },
  webServer: {
    command: 'node scripts/serve-storybook.mjs',
    env: { OXYGEN_DOCS_PORT: String(port) },
    url: baseURL,
    reuseExistingServer: false,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
