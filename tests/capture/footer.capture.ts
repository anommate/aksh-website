import { test, type Page } from "@playwright/test";
import { captureFile } from "./output";

/*
 * Full-width footer: the FAQ-to-footer transition with the four wave layers,
 * the charcoal columns and the ivory logo band at desktop, tablet and mobile
 * sizes; three moments of the moving waves; keyboard focus on a link, the
 * Pause/Resume control (paused) and the logo; plus reduced motion and no
 * JavaScript (the complete still waves).
 */

const VIEWPORTS = [
  { name: "desktop-1440x900", width: 1440, height: 900 },
  { name: "tablet-768x1024", width: 768, height: 1024 },
  { name: "mobile-390x844", width: 390, height: 844 },
  { name: "mobile-320x568", width: 320, height: 568 },
];

async function openPage(page: Page) {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.locator("footer").waitFor();
  await page.waitForLoadState("networkidle");
}

/** The FAQ support block's lower part and the whole wave band, together in view. */
const toTransition = (page: Page) =>
  page.evaluate(() => {
    const support = document.querySelector("#faq [data-faq-support]")!.getBoundingClientRect();
    const wave = document.querySelector("footer [data-footer-wave]")!.getBoundingClientRect();
    const header = document.querySelector("header")!.getBoundingClientRect().height;
    const top = Math.min(support.top + support.height / 2, wave.top - 160) + window.scrollY - header;
    window.scrollTo({ top, behavior: "instant" });
  });

/** The wave band's top just below the header, so the waves and the columns show together. */
const toFooter = (page: Page) =>
  page.evaluate(() => {
    const header = document.querySelector("header")!.getBoundingClientRect().height;
    const top = document.querySelector("footer")!.getBoundingClientRect().top + window.scrollY - header - 24;
    window.scrollTo({ top, behavior: "instant" });
  });

const toBottom = (page: Page) =>
  page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));

/** The wave band with a little ivory above and charcoal below. */
const waveClip = (page: Page) =>
  page.evaluate(() => {
    const r = document.querySelector("footer [data-footer-wave]")!.getBoundingClientRect();
    return { x: 0, y: Math.max(0, r.top - 24), width: document.documentElement.clientWidth, height: r.height + 64 };
  });

for (const vp of VIEWPORTS) {
  test(`capture footer ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await openPage(page);
    await toTransition(page);
    await page.waitForTimeout(600);
    await page.screenshot({ path: captureFile(`${vp.name}-1-faq-to-footer.png`) });
    await toFooter(page);
    await page.waitForTimeout(600);
    await page.screenshot({ path: captureFile(`${vp.name}-2-waves-and-columns.png`) });
    await toBottom(page);
    await page.waitForTimeout(600);
    await page.screenshot({ path: captureFile(`${vp.name}-3-logo-band.png`) });
    await page.locator("footer").screenshot({ path: captureFile(`${vp.name}-4-footer-element.png`) });
    await toFooter(page);
    await page.waitForTimeout(300);
    await page.screenshot({ path: captureFile(`${vp.name}-5-waves.png`), clip: await waveClip(page) });
  });
}

test("capture the moving waves (1440x900, three moments)", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openPage(page);
  await toFooter(page);
  for (const [index, wait] of [600, 2500, 2500].entries()) {
    await page.waitForTimeout(wait);
    await page.screenshot({ path: captureFile(`motion-1440x900-${index + 1}.png`), clip: await waveClip(page) });
  }
});

test("capture keyboard focus: a link, the paused control and the logo (1440x900, 390x844)", async ({ page }) => {
  for (const [width, height] of [[1440, 900], [390, 844]]) {
    await page.setViewportSize({ width, height });
    await openPage(page);
    await page.locator("#faq [data-faq-support] button").focus();
    for (let i = 0; i < 2; i++) await page.keyboard.press("Tab");
    await page.screenshot({ path: captureFile(`focus-link-${width}x${height}.png`) });
    const control = page.getByRole("button", { name: "Pause waves" });
    await control.focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(300);
    await page.screenshot({ path: captureFile(`focus-paused-control-${width}x${height}.png`) });
    await page.keyboard.press("Tab");
    await page.waitForTimeout(300);
    await page.screenshot({ path: captureFile(`focus-logo-${width}x${height}.png`) });
  }
});

test("capture reduced motion (1440x900, 390x844)", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const [width, height] of [[1440, 900], [390, 844]]) {
    await page.setViewportSize({ width, height });
    await openPage(page);
    await toFooter(page);
    await page.screenshot({ path: captureFile(`reduced-motion-${width}x${height}.png`) });
  }
});

test("capture without JavaScript (1440x900, 390x844, 320x568)", async ({ browser }) => {
  for (const [width, height] of [[1440, 900], [390, 844], [320, 568]]) {
    const context = await browser.newContext({ viewport: { width, height }, javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    await toTransition(page);
    await page.screenshot({ path: captureFile(`no-js-${width}x${height}-faq-to-footer.png`) });
    await toBottom(page);
    await page.screenshot({ path: captureFile(`no-js-${width}x${height}-bottom.png`) });
    await context.close();
  }
});
