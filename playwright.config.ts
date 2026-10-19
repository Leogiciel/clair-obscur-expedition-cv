import { defineConfig, devices } from '@playwright/test';

// Browser checks of the built GitHub Pages site (pnpm build:pages), served as Pages serves it.
export default defineConfig({
  testDir: 'e2e',
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: 'http://localhost:4173/clair-obscur-expedition-cv/' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } }
  ],
  webServer: {
    command: 'node e2e/serve.mjs',
    url: 'http://localhost:4173/clair-obscur-expedition-cv/',
    reuseExistingServer: !process.env.CI
  }
});
