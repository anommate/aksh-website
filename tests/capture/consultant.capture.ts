import { test } from "@playwright/test";
import { captureFile } from "./output";

/*
 * Meet Our Consultant: the section top (the "MEET OUR CONSULTANT" wordmark
 * above the profile, after #meet-our-consultant) at desktop, tablet and
 * mobile sizes; and, without its CTA, the end of the biography running into
 * The AKSH Experience.
 */

const VIEWPORTS = [
  { name: "desktop-1440x900", width: 1440, height: 900 },
  { name: "short-desktop-1366x768", width: 1366, height: 768 },
  { name: "mobile-390x844", width: 390, height: 844 },
];

for (const vp of VIEWPORTS) {
  test(`capture consultant section end ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    // The biography's end in the upper half, the next section below it.
    await page.evaluate(() => {
      const biography = document.querySelector("#meet-our-consultant [data-consultant-biography]")!;
      const bottom = biography.getBoundingClientRect().bottom + window.scrollY;
      window.scrollTo({ top: bottom - window.innerHeight * 0.55, behavior: "instant" });
    });
    await page.waitForTimeout(800);
    await page.screenshot({ path: captureFile(`consultant-${vp.name}-end-without-cta.png`) });
  });
}

const TOP_VIEWPORTS = [
  { name: "desktop-1440x900", width: 1440, height: 900 },
  { name: "tablet-768x1024", width: 768, height: 1024 },
  { name: "mobile-390x844", width: 390, height: 844 },
  { name: "mobile-320x568", width: 320, height: 568 },
];

for (const vp of TOP_VIEWPORTS) {
  test(`capture consultant section top ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    // The section anchor: lands 24px below the sticky header.
    await page.goto("/#meet-our-consultant");
    await page.evaluate(() => document.fonts.ready);
    const image = page.locator("#meet-our-consultant [data-consultant-masthead] img");
    await image.evaluate((img: HTMLImageElement) => img.decode());
    await page.waitForLoadState("networkidle");
    await page.locator("#meet-our-consultant").evaluate((s) => s.scrollIntoView({ block: "start", behavior: "instant" }));
    await page.waitForTimeout(800);
    await page.screenshot({ path: captureFile(`consultant-${vp.name}-top-wordmark.png`) });
  });
}
