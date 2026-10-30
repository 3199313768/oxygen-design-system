import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/docs',
  outputDir: './output/playwright/docs/results',
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: [['list'], ['html', { outputFolder: 'output/playwright/docs/report', open: 'never' }]],
  use: { baseURL: `http://127.0.0.1:${process.env.OXYGEN_DOCS_PORT ?? 6016}`, trace: 'retain-on-failure' },
  webServer: {
    command: 'node scripts/serve-storybook.mjs',
    url: `http://127.0.0.1:${process.env.OXYGEN_DOCS_PORT ?? 6016}`,
    reuseExistingServer: false,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
