import { test, type Page } from "@playwright/test";
import { captureFile } from "./output";

/*
 * Services (#services): the About-to-Services divider running into the
 * single-line "OUR SERVICES" wordmark; the section top after #services (the
 * wordmark above the eyebrow, H2 and introduction); and the card stack part
 * way through, at desktop, tablet and mobile sizes.
 */

const VIEWPORTS = [
  { name: "desktop-1440x900", width: 1440, height: 900 },
  { name: "tablet-768x1024", width: 768, height: 1024 },
  { name: "mobile-390x844", width: 390, height: 844 },
  { name: "mobile-320x568", width: 320, height: 568 },
];

async function settle(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  // The wordmark is lazy-loaded: bring it near the view so it loads, then wait for it.
  const wordmark = page.locator("#services [data-services-wordmark] img");
  await wordmark.scrollIntoViewIfNeeded();
  await wordmark.evaluate((img: HTMLImageElement) => img.decode());
  await page.waitForLoadState("networkidle");
}

for (const vp of VIEWPORTS) {
  test(`capture services ${vp.name}`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: vp.width, height: vp.height });

    // The divider in the upper third, the wordmark below it.
    await page.goto("/");
    await settle(page);
    await page.evaluate(() => {
      const divider = document.querySelector("[data-section-divider]")!;
      const header = document.querySelector("header")!.getBoundingClientRect().height;
      const top = divider.getBoundingClientRect().top + window.scrollY - header - window.innerHeight * 0.2;
      window.scrollTo({ top, behavior: "instant" });
    });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: captureFile(`services-${vp.name}-1-divider-to-wordmark.png`) });

    // The section anchor: lands 24px below the sticky header.
    await page.goto("/#services");
    await settle(page);
    await page.waitForTimeout(800);
    await page.screenshot({ path: captureFile(`services-${vp.name}-2-anchor-top.png`) });

    // Part way through the card stack: the sticky cards still overlap.
    await page.evaluate(() => {
      const list = document.querySelector("#services ol")!;
      const top = list.getBoundingClientRect().top + window.scrollY + list.getBoundingClientRect().height * 0.45;
      window.scrollTo({ top, behavior: "instant" });
    });
    await page.waitForTimeout(800);
    await page.screenshot({ path: captureFile(`services-${vp.name}-3-stack.png`) });
  });
}
