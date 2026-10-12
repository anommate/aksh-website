import { test } from "@playwright/test";
import { captureFile } from "./output";

/*
 * Meet Our Consultant without its CTA: the end of the biography running into
 * The AKSH Experience, at desktop and mobile sizes.
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
