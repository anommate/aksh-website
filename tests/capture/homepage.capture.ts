import { test } from "@playwright/test";
import { captureFile } from "./output";

/*
 * Homepage reference captures (hero, full page, About, the hero-to-About
 * transition and the mobile drawer), formerly tests/e2e/screenshots.spec.ts.
 * Written only to this run's capture folder; the historical set from that
 * spec stays in docs/audit/screenshots/step-5b.
 */

const VIEWPORTS = [
  { name: "reference-1518x780", width: 1518, height: 780 },
  { name: "desktop-1440x900", width: 1440, height: 900 },
  { name: "short-desktop-1366x768", width: 1366, height: 768 },
  { name: "laptop-1024x768", width: 1024, height: 768 },
  { name: "tablet-768x1024", width: 768, height: 1024 },
  { name: "mobile-390x844", width: 390, height: 844 },
  { name: "mobile-320x568", width: 320, height: 568 },
];

for (const vp of VIEWPORTS) {
  test(`capture hero top screenshot ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);
    await page.screenshot({ path: captureFile(`hero-${vp.name}.png`), fullPage: false });
  });

  test(`capture full page screenshot ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);
    await page.screenshot({ path: captureFile(`fullpage-${vp.name}.png`), fullPage: true });
  });

  test(`capture about section screenshot ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("/#about-aksh");
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);
    await page.screenshot({ path: captureFile(`about-${vp.name}.png`), fullPage: false });
  });
}

test("capture hero to about transition screenshot (1518x780)", async ({ page }) => {
  await page.setViewportSize({ width: 1518, height: 780 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  // Scroll down so the junction between hero bottom and about top is centred.
  await page.evaluate(() => {
    window.scrollTo({ top: 400, behavior: "instant" });
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: captureFile("hero-about-transition-1518x780.png"), fullPage: false });
});

test("capture mobile drawer screenshot (390px)", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: captureFile("aksh-drawer-mobile-390.png"), fullPage: false });
});
