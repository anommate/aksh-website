import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

// Manual screenshot and video captures: `pnpm build && pnpm test:capture`.
// They write files, so they live in tests/capture (*.capture.ts), outside the
// default `pnpm test:e2e` run. Each run writes to a new folder, by default
// under the git-ignored captures/ (see tests/capture/global-setup.ts).
export default defineConfig({
  ...base,
  testDir: "tests/capture",
  testMatch: "**/*.capture.ts",
  globalSetup: "./tests/capture/global-setup.ts",
  // Playwright's own working files (videos before they are saved, traces).
  outputDir: "captures/.playwright",
  use: { ...base.use, trace: "off" },
});
