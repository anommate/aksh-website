import { defineConfig, devices } from "@playwright/test";

// Browser checks run against the production build: run `pnpm build` first.
// Chromium only for now; Firefox and WebKit smoke tests arrive in Milestone 5.
//
// By default this uses Playwright's pinned Chromium (`pnpm exec playwright
// install chromium`). Set PLAYWRIGHT_CHROMIUM_CHANNEL=chrome (or msedge) to use
// an installed Chromium-based browser instead, e.g. where the download fails.
const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;
const channel = process.env.PLAYWRIGHT_CHROMIUM_CHANNEL || undefined;

export default defineConfig({
  testDir: "tests/e2e",
  forbidOnly: !!process.env.CI,
  reporter: "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"], channel } },
  ],
  webServer: {
    command: `pnpm start --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: false,
    env: { APP_MODE: "development" },
  },
});
