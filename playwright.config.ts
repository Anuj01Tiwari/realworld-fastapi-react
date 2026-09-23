import { defineConfig } from '@playwright/test';
import { baseConfig } from './specs/e2e/playwright.base';

export default defineConfig({
  ...baseConfig,
  testDir: './specs/e2e',
  use: { ...baseConfig.use, baseURL: 'http://localhost:3000' },
  // App is already running via `docker compose up`, so we don't start a new server —
  // reuseExistingServer just checks the URL is reachable and skips launching anything.
  webServer: {
    command: 'node -e "setInterval(()=>{},1000)"',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 5_000,
  },
});