import { test, type Page } from "@playwright/test";
import { recordArea } from "./frame-recorder";
import { captureFile } from "./output";

/*
 * Client Experiences (#client-experiences, fictional samples shown in
 * development and preview only): the section top and its scrolling columns at
 * desktop, tablet and mobile sizes, 200% zoom, reduced motion and paused;
 * plus short recordings of the columns scrolling, pausing and resuming.
 */

const VIEWPORTS = [
  { name: "desktop-1440x900", width: 1440, height: 900 },
  { name: "short-desktop-1366x768", width: 1366, height: 768 },
  { name: "tablet-768x1024", width: 768, height: 1024 },
  { name: "mobile-390x844", width: 390, height: 844 },
  { name: "mobile-320x568", width: 320, height: 568 },
];

async function openSection(page: Page) {
  await page.goto("/#client-experiences");
  await page.evaluate(() => document.fonts.ready);
  await page.locator("#client-experiences").waitFor();
  await page.evaluate(() => document.getElementById("client-experiences")!.scrollIntoView({ behavior: "instant" }));
  await page.waitForTimeout(800);
}

const showColumns = (page: Page) =>
  page.evaluate(() =>
    document
      .querySelector("#client-experiences [data-testimonials-viewport], #client-experiences [data-testimonials-grid]")!
      .scrollIntoView({ block: "center", behavior: "instant" })
  );

for (const vp of VIEWPORTS) {
  test(`capture testimonials ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await openSection(page);
    await page.screenshot({ path: captureFile(`${vp.name}-1-section-top.png`) });
    await showColumns(page);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: captureFile(`${vp.name}-2-columns.png`) });
  });
}

test("capture testimonials at 200% zoom (1440x900 at 2x)", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 720, height: 450 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await openSection(page);
  await page.screenshot({ path: captureFile("zoom-200pct-1440x900-1-section-top.png") });
  await showColumns(page);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: captureFile("zoom-200pct-1440x900-2-columns.png") });
  await context.close();
});

test("capture testimonials with reduced motion (1440x900, 390x844)", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const [width, height] of [[1440, 900], [390, 844]]) {
    await page.setViewportSize({ width, height });
    await openSection(page);
    await showColumns(page);
    await page.screenshot({ path: captureFile(`reduced-motion-${width}x${height}-static-grid.png`) });
  }
});

test("capture testimonials paused by keyboard (1440x900)", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openSection(page);
  await showColumns(page);
  await page.waitForTimeout(1500);
  await page.locator("#experience").getByRole("button", { name: "Begin Your Journey" }).focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(400);
  await page.screenshot({ path: captureFile("desktop-1440x900-3-paused-control-focused.png") });
});

const viewportClip = (page: Page) =>
  page.evaluate(() => {
    const scroller = document.querySelector("#client-experiences [data-testimonials-scroller]")!.getBoundingClientRect();
    return { x: scroller.left, y: Math.max(0, scroller.top), width: scroller.width, height: Math.min(scroller.height, window.innerHeight - Math.max(0, scroller.top)) };
  });

test("record scrolling, pausing and resuming", async ({ page }) => {
  test.setTimeout(120_000);
  for (const [name, width, height] of [["desktop-1440x900", 1440, 900], ["mobile-390x844", 390, 844]] as const) {
    await page.setViewportSize({ width, height });
    await openSection(page);
    await page.evaluate(() => {
      const scroller = document.querySelector("#client-experiences [data-testimonials-scroller]")!;
      window.scrollTo({ top: scroller.getBoundingClientRect().top + window.scrollY - 90, behavior: "instant" });
    });
    await page.waitForTimeout(500);
    const control = page.locator("#client-experiences").getByRole("button", { name: /testimonials$/ });
    await recordArea(page, await viewportClip(page), captureFile(`scroll-pause-resume-${name}.webm`), {
      script: async () => {
        await page.waitForTimeout(5000); // scrolling
        await control.click(); // Pause testimonials
        await page.waitForTimeout(2500); // held
        await control.click(); // Resume testimonials
        await page.waitForTimeout(3500); // continues from the same place
      },
    });
    // Keep the pointer off the columns, which would pause them.
    await page.mouse.move(0, 0);
  }
});
