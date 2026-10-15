import { test, type Page } from "@playwright/test";
import { captureFile } from "./output";

/*
 * 15 Oct 2026 updates, at desktop, tablet and mobile sizes:
 * - the full-width footer logo in its ivory band (20px to each edge)
 * - the About Us masthead after #about-aksh
 * - the Services progress line at the start, middle and end of the card
 *   stack, and at the middle again on the way back up
 */

const VIEWPORTS = [
  { name: "desktop-1440x900", width: 1440, height: 900 },
  { name: "tablet-768x1024", width: 768, height: 1024 },
  { name: "mobile-390x844", width: 390, height: 844 },
  { name: "mobile-320x568", width: 320, height: 568 },
];

const frames = (page: Page) =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));

async function scrollTo(page: Page, top: number) {
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), top);
  await frames(page);
  // Let the fill's short smoothing finish.
  await page.waitForTimeout(400);
}

for (const vp of VIEWPORTS) {
  test(`capture ${vp.name}`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: vp.width, height: vp.height });

    // About Us masthead, as the section anchor shows it.
    await page.goto("/#about-aksh");
    await page.evaluate(() => document.fonts.ready);
    await page.locator("#about-aksh [data-about-masthead] img").evaluate((img: HTMLImageElement) => img.decode());
    await page.waitForLoadState("networkidle");
    await page.locator("#about-aksh").evaluate((s) => s.scrollIntoView({ block: "start", behavior: "instant" }));
    await page.waitForTimeout(600);
    await page.screenshot({ path: captureFile(`${vp.name}-1-about-masthead.png`) });

    // Services progress: start, middle, end, then the middle again going back up.
    const { start, end } = await page.evaluate(() => {
      const list = document.querySelector("#services ol")!;
      const items = [...list.children] as HTMLElement[];
      const reading = Number.parseFloat(getComputedStyle(document.querySelector("[data-service-progress]")!).top);
      const listTop = list.getBoundingClientRect().top + window.scrollY;
      const gap = Number.parseFloat(getComputedStyle(list).rowGap);
      const naturalLast = items.slice(0, -1).reduce((sum, item) => sum + item.getBoundingClientRect().height + gap, 0);
      const stickyLast = Number.parseFloat(getComputedStyle(items.at(-1)!).top);
      return { start: listTop - reading, end: listTop + naturalLast - (Number.isFinite(stickyLast) ? stickyLast : reading) };
    });
    const middle = Math.round((start + end) / 2);
    await scrollTo(page, Math.round(start + 40));
    await page.screenshot({ path: captureFile(`${vp.name}-2-progress-start.png`) });
    await scrollTo(page, middle);
    await page.screenshot({ path: captureFile(`${vp.name}-3-progress-middle.png`) });
    await scrollTo(page, Math.round(end));
    await page.screenshot({ path: captureFile(`${vp.name}-4-progress-end.png`) });
    await scrollTo(page, middle);
    await page.screenshot({ path: captureFile(`${vp.name}-5-progress-middle-reversed.png`) });

    // Footer logo band at the very bottom.
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
    await page.locator("footer [data-footer-brand] img").evaluate((img: HTMLImageElement) => img.decode());
    await page.waitForTimeout(400);
    await page.screenshot({ path: captureFile(`${vp.name}-6-footer-logo.png`) });
    await page.locator("footer [data-footer-brand]").screenshot({ path: captureFile(`${vp.name}-7-footer-logo-band.png`) });
  });
}
