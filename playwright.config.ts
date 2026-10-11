import { defineConfig, devices } from '@playwright/test'

/**
 * End-to-end tests: build the real site, serve it, and drive it in Chromium
 * on a phone-sized and a desktop-sized screen.
 *
 *   npx playwright install chromium   # once, downloads the test browser
 *   npm run test:e2e
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: 'http://localhost:4175', trace: 'retain-on-failure' },
  projects: [
    { name: 'phone', use: { ...devices['Pixel 7'] } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run build && npx vite preview --port 4175 --strictPort',
    url: 'http://localhost:4175',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
