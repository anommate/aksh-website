import { test, expect } from "@playwright/test";

test.describe("About Us Section Geometry & Visibility Specification", () => {
  const DESKTOP_VIEWPORTS = [
    { name: "reference-1518x780", width: 1518, height: 780 },
    { name: "short-desktop-1366x768", width: 1366, height: 768 },
    { name: "desktop-1440x900", width: 1440, height: 900 },
  ];

  for (const vp of DESKTOP_VIEWPORTS) {
    test(`complete About Us content including CTA is visible below navbar at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/#about-aksh");
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(300);

      // Header height
      const header = page.locator("header");
      const headerBox = await header.boundingBox();
      expect(headerBox).not.toBeNull();
      if (!headerBox) return;

      // Section bounds
      const section = page.locator("section#about-aksh");
      const sectionBox = await section.boundingBox();
      expect(sectionBox).not.toBeNull();

      // Artwork measurements
      const artwork = section.locator("img[src*='about-us-artwork']");
      const artworkBox = await artwork.boundingBox();
      expect(artworkBox).not.toBeNull();
      if (!artworkBox) return;

      // Artwork width between 420-480px and height between 125-145px
      expect(artworkBox.width).toBeGreaterThanOrEqual(420);
      expect(artworkBox.width).toBeLessThanOrEqual(480);
      expect(artworkBox.height).toBeGreaterThanOrEqual(125);
      expect(artworkBox.height).toBeLessThanOrEqual(145);

      // Artwork is centered within the container
      const container = section.locator(".aksh-container");
      const containerBox = await container.boundingBox();
      if (containerBox) {
        const containerMid = containerBox.x + containerBox.width / 2;
        const artworkMid = artworkBox.x + artworkBox.width / 2;
        expect(Math.abs(containerMid - artworkMid)).toBeLessThanOrEqual(2);
      }

      // Discover CTA Button is fully visible in viewport below navbar without scrolling
      const ctaBtn = section.getByRole("button", { name: /Discover AKSH/i });
      await expect(ctaBtn).toBeVisible();
      const ctaBox = await ctaBtn.boundingBox();
      expect(ctaBox).not.toBeNull();
      if (!ctaBox) return;

      // CTA bottom edge must be above viewport bottom and below header
      const ctaViewportRect = await ctaBtn.evaluate((el) => el.getBoundingClientRect());
      expect(ctaViewportRect.bottom).toBeLessThanOrEqual(vp.height);
      expect(ctaViewportRect.top).toBeGreaterThanOrEqual(headerBox.height);

      // No horizontal overflow
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow).toBe(0);
    });
  }

  const RESPONSIVE_VIEWPORTS = [
    { name: "tablet-768x1024", width: 768, height: 1024 },
    { name: "mobile-390x844", width: 390, height: 844 },
    { name: "mobile-320x568", width: 320, height: 568 },
  ];

  for (const vp of RESPONSIVE_VIEWPORTS) {
    test(`responsive rendering without horizontal overflow at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/#about-aksh");
      await page.evaluate(() => document.fonts.ready);

      const section = page.locator("section#about-aksh");
      await expect(section).toBeVisible();

      // CTA is present and clickable
      const ctaBtn = section.getByRole("button", { name: /Discover AKSH/i });
      await expect(ctaBtn).toBeVisible();

      // No horizontal overflow
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow).toBe(0);
    });
  }
});
