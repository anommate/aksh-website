import { test, type Browser, type Page } from "@playwright/test";
import { captureFile } from "./output";

/*
 * The AKSH Experience (#experience) audit captures: the section top (artwork,
 * H2 and tagline), the timeline and the closing CTA at desktop, tablet and
 * mobile sizes, 200% zoom and reduced motion; the pause control; and short
 * recordings of the looping illustrations and of pausing and resuming them.
 */

const VIEWPORTS = [
  { name: "desktop-1440x900", width: 1440, height: 900 },
  { name: "short-desktop-1366x768", width: 1366, height: 768 },
  { name: "tablet-768x1024", width: 768, height: 1024 },
  { name: "mobile-390x844", width: 390, height: 844 },
  { name: "mobile-320x568", width: 320, height: 568 },
];

// Long enough for the reveal (2.2s) to finish.
const REVEALED = 2600;

/**
 * Opens the homepage at #experience, settled 24px below the header, or as
 * close as the end of the page allows (the compact section is the last one).
 */
async function openSection(page: Page) {
  await page.goto("/#experience");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => {
    const top =
      document.getElementById("experience")!.getBoundingClientRect().top -
      document.querySelector("header")!.getBoundingClientRect().bottom;
    const atEnd = Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight;
    return Math.abs(top - 24) < 0.5 || (atEnd && top > 24);
  });
}

const centre = (page: Page, selector: string) =>
  page.evaluate((s) => document.querySelector(s)!.scrollIntoView({ block: "center", behavior: "instant" }), selector);

const closingCta = (page: Page) =>
  page.evaluate(() => {
    const cta = document.querySelector("#experience [data-journey] ~ div button")!;
    window.scrollTo({ top: cta.getBoundingClientRect().bottom + window.scrollY - window.innerHeight + 120, behavior: "instant" });
  });

for (const vp of VIEWPORTS) {
  test(`capture section ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await openSection(page);
    await page.waitForTimeout(REVEALED);
    await page.screenshot({ path: captureFile(`${vp.name}-1-section-top.png`) });

    await centre(page, vp.width >= 1280 ? "#experience [data-journey]" : "#experience [data-journey-step]:nth-child(3)");
    await page.waitForTimeout(REVEALED);
    await page.screenshot({ path: captureFile(`${vp.name}-2-timeline.png`) });

    await closingCta(page);
    await page.waitForTimeout(REVEALED);
    await page.screenshot({ path: captureFile(`${vp.name}-3-closing-cta.png`) });
  });
}

test("capture 200% zoom (1440x900 at 2x)", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 720, height: 450 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await openSection(page);
  await page.waitForTimeout(REVEALED);
  await page.screenshot({ path: captureFile("zoom-200pct-1440x900-1-section-top.png") });
  await centre(page, "#experience [data-journey-step]:nth-child(2)");
  await page.waitForTimeout(REVEALED);
  await page.screenshot({ path: captureFile("zoom-200pct-1440x900-2-timeline.png") });
  await context.close();
});

test("capture reduced motion (390x844)", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await openSection(page);
  await page.screenshot({ path: captureFile("reduced-motion-390x844-1-section-top.png") });
  await centre(page, "#experience [data-journey-step]:nth-child(3)");
  await page.screenshot({ path: captureFile("reduced-motion-390x844-2-timeline.png") });
});

test("capture paused by keyboard (1440x900)", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openSection(page);
  await page.waitForTimeout(REVEALED);
  // Keyboard path: the control directly follows the last Services CTA.
  await page.getByRole("button", { name: "Explore Skin" }).focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(400);
  await page.screenshot({ path: captureFile("desktop-1440x900-4-paused-control-focused.png") });
});

async function record(
  browser: Browser,
  name: string,
  viewport: { width: number; height: number },
  outputDir: string,
  script: (page: Page) => Promise<void>
) {
  const context = await browser.newContext({ viewport, recordVideo: { dir: outputDir, size: viewport } });
  let page: Page;
  try {
    page = await context.newPage();
  } catch (error) {
    await context.close();
    // Video needs Playwright's ffmpeg, a separate one-time download.
    const missing = error instanceof Error && error.message.includes("ffmpeg");
    test.skip(missing, "Recording needs Playwright's ffmpeg: run `pnpm exec playwright install ffmpeg` once");
    throw error;
  }
  await script(page);
  await context.close();
  await page.video()!.saveAs(captureFile(name));
}

test("record looping illustrations", async ({ browser }, testInfo) => {
  test.setTimeout(90_000);
  await record(browser, "loop-desktop-1440x900.webm", { width: 1440, height: 900 }, testInfo.outputPath(), async (page) => {
    await openSection(page);
    await page.waitForTimeout(12_000); // the reveal, then about two and a half loops
  });
  await record(browser, "loop-mobile-390x844.webm", { width: 390, height: 844 }, testInfo.outputPath(), async (page) => {
    await openSection(page);
    await centre(page, "#experience [data-journey-step]:nth-child(1)");
    await page.waitForTimeout(10_000);
  });
});

test("record pause and resume", async ({ browser }, testInfo) => {
  test.setTimeout(90_000);
  await record(browser, "pause-resume-desktop-1440x900.webm", { width: 1440, height: 900 }, testInfo.outputPath(), async (page) => {
    await openSection(page);
    await page.waitForTimeout(4000);
    await page.getByRole("button", { name: "Pause animations" }).click();
    await page.waitForTimeout(3000);
    // Scrolling away and back keeps the visitor's pause.
    await page.evaluate(() => window.scrollBy({ top: -1200, behavior: "smooth" }));
    await page.waitForTimeout(1500);
    await page.evaluate(() => document.getElementById("experience")!.scrollIntoView({ behavior: "smooth" }));
    await page.waitForTimeout(2500);
    await page.getByRole("button", { name: "Resume animations" }).click();
    await page.waitForTimeout(5000);
  });
});
