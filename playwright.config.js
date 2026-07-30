const { defineConfig } = require('@playwright/test');

const previewPort = process.env.PLAYWRIGHT_PREVIEW_PORT || '4173';
const previewDirectory = process.env.PLAYWRIGHT_PREVIEW_DIR || 'dist';
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://127.0.0.1:${previewPort}`;

const viewports = [
  ['320px', 320, 568],
  ['375px', 375, 812],
  ['390px', 390, 844],
  ['430px', 430, 932],
  ['768px', 768, 1024],
  ['1024px', 1024, 768],
  ['1280px', 1280, 800],
  ['1440px', 1440, 1000]
];

module.exports = defineConfig({
  testDir: './tests',
  timeout: 45_000,
  expect: {
    timeout: 8_000
  },
  fullyParallel: false,
  retries: 0,
  reporter: 'line',
  use: {
    baseURL,
    trace: 'retain-on-failure'
  },
  projects: viewports.map(([name, width, height]) => ({
    name,
    use: {
      viewport: { width, height },
      browserName: 'chromium'
    }
  })),
  webServer: {
    command: `npx serve ${previewDirectory} -l ${previewPort} --no-clipboard`,
    url: baseURL,
    reuseExistingServer: true,
    timeout: 30_000
  }
});
