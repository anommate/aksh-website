import { test } from "@playwright/test";
import { captureFile } from "./output";

/*
 * Section mastheads compared across sizes: the top of each section (About Us,
 * Our Services, Meet Our Consultant, The AKSH Experience, Client Experiences)
 * just below the header, at desktop, tablet and mobile widths. File names
 * group by section, so each one's sizes sort side by side.
 */

const VIEWPORTS = [
  { name: "1-desktop-1440x900", width: 1440, height: 900 },
  { name: "2-tablet-768x1024", width: 768, height: 1024 },
  { name: "3-mobile-390x844", width: 390, height: 844 },
  { name: "4-mobile-360x800", width: 360, height: 800 },
  { name: "5-mobile-320x568", width: 320, height: 568 },
];

const SECTIONS = [
  { id: "about-aksh", name: "1-about-us" },
  { id: "services", name: "2-our-services" },
  { id: "meet-our-consultant", name: "3-meet-our-consultant" },
  { id: "experience", name: "4-the-aksh-experience" },
  { id: "client-experiences", name: "5-client-experiences" },
];

for (const vp of VIEWPORTS) {
  test(`capture mastheads ${vp.name}`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await page.waitForLoadState("networkidle");
    for (const section of SECTIONS) {
      const image = page.locator(`section#${section.id} img`).first();
      await image.scrollIntoViewIfNeeded();
      await image.evaluate((img: HTMLImageElement) => img.decode());
      // The section's top 24px below the header, as its anchor lands.
      await page.evaluate((id) => {
        const header = document.querySelector("header")!.getBoundingClientRect().height;
        const top = document.getElementById(id)!.getBoundingClientRect().top + window.scrollY - header - 24;
        window.scrollTo({ top, behavior: "instant" });
      }, section.id);
      await page.waitForTimeout(500);
      await page.screenshot({ path: captureFile(`${section.name}-${vp.name}.png`) });
    }
  });
}
