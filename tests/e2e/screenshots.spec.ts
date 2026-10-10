import { test } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

const ARTIFACT_DIR = "C:/Users/anomm/.gemini/antigravity-ide/brain/5046f6e2-4d9b-4b0e-a663-6d0ad25bdc70";
const DOCS_DIR = path.join(process.cwd(), "docs/audit/screenshots/step-5b");

// Ensure target directories exist
if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}
if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

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

    const filename = `hero-${vp.name}.png`;
    const docsPath = path.join(DOCS_DIR, filename);
    const artifactPath = path.join(ARTIFACT_DIR, filename);

    await page.screenshot({ path: docsPath, fullPage: false });
    fs.copyFileSync(docsPath, artifactPath);
  });

  test(`capture full page screenshot ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);

    const filename = `fullpage-${vp.name}.png`;
    const docsPath = path.join(DOCS_DIR, filename);
    const artifactPath = path.join(ARTIFACT_DIR, filename);

    await page.screenshot({ path: docsPath, fullPage: true });
    fs.copyFileSync(docsPath, artifactPath);
  });
  test(`capture about section screenshot ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("/#about-aksh");
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);

    const filename = `about-${vp.name}.png`;
    const docsPath = path.join(DOCS_DIR, filename);
    const artifactPath = path.join(ARTIFACT_DIR, filename);

    await page.screenshot({ path: docsPath, fullPage: false });
    fs.copyFileSync(docsPath, artifactPath);
  });
}

test("capture hero to about transition screenshot (1518x780)", async ({ page }) => {
  await page.setViewportSize({ width: 1518, height: 780 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  
  // Scroll down so the junction between hero bottom and about top is centered
  await page.evaluate(() => {
    window.scrollTo({ top: 400, behavior: "instant" });
  });
  await page.waitForTimeout(400);

  const filename = "hero-about-transition-1518x780.png";
  const docsPath = path.join(DOCS_DIR, filename);
  const artifactPath = path.join(ARTIFACT_DIR, filename);

  await page.screenshot({ path: docsPath, fullPage: false });
  fs.copyFileSync(docsPath, artifactPath);
});

test("capture mobile drawer screenshot (390px)", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const menuBtn = page.getByRole("button", { name: "Open navigation menu" });
  await menuBtn.click();
  await page.waitForTimeout(400);

  const filename = "aksh-drawer-mobile-390.png";
  const docsPath = path.join(DOCS_DIR, filename);
  const artifactPath = path.join(ARTIFACT_DIR, filename);

  await page.screenshot({ path: docsPath, fullPage: false });
  fs.copyFileSync(docsPath, artifactPath);
});



