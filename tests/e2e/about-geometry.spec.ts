import { test, expect, type Locator } from "@playwright/test";
import { aboutContent } from "../../src/content/about";

const { artwork } = aboutContent;

/**
 * The masthead image and its lettering. The file is shown whole, transparent
 * margins included; the lettering (its ink rows and columns) is what shows.
 */
async function measureMasthead(image: Locator) {
  await image.evaluate((img: HTMLImageElement) => img.decode());
  return image.evaluate(
    (img: HTMLImageElement, ink) => {
      const rect = img.getBoundingClientRect();
      const container = img.closest(".aksh-container")!.getBoundingClientRect();
      const content = img.closest(".aksh-container")!.getBoundingClientRect().top;
      let clipped: string | null = null;
      for (let el: Element | null = img.parentElement; el; el = el.parentElement) {
        const style = getComputedStyle(el);
        if (style.overflowY !== "visible" || style.clipPath !== "none") clipped = clipped ?? el.tagName;
      }
      return {
        src: img.getAttribute("src"),
        alt: img.getAttribute("alt"),
        width: rect.width,
        ratio: rect.height / rect.width,
        containerWidth: container.width,
        centreOffset: rect.left + rect.width / 2 - (container.left + container.width / 2),
        inside: rect.left >= container.left - 0.5 && rect.right <= container.right + 0.5,
        clipped,
        lettering: {
          left: rect.left + rect.width * ink.left,
          right: rect.left + rect.width * ink.right,
          top: rect.top + rect.height * ink.top,
          bottom: rect.top + rect.height * ink.bottom,
        },
        contentTop: content,
        boxHeight: img.closest("[data-about-masthead]")!.getBoundingClientRect().height,
      };
    },
    {
      top: artwork.ink.top / artwork.height,
      bottom: (artwork.ink.bottom + 1) / artwork.height,
      // Measured ink columns of the supplied file (x 210-1559).
      left: 210 / artwork.width,
      right: 1560 / artwork.width,
    }
  );
}

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

      // Masthead: the supplied file, whole, centred, 560px wide; its
      // lettering about as wide as the earlier artwork (420-480px), in
      // proportion, starting at the content top and below the header.
      const m = await measureMasthead(section.getByRole("img", { name: artwork.alt, exact: true }));
      expect(m.src).toBe(artwork.src);
      expect(Math.abs(m.width - 560)).toBeLessThanOrEqual(0.5);
      expect(Math.abs(m.ratio - artwork.height / artwork.width)).toBeLessThanOrEqual(0.003);
      expect(Math.abs(m.centreOffset)).toBeLessThanOrEqual(0.5);
      expect(m.inside).toBe(true);
      expect(m.clipped).toBeNull();
      expect(m.boxHeight % 1).toBe(0);
      const letteringWidth = m.lettering.right - m.lettering.left;
      expect(letteringWidth).toBeGreaterThanOrEqual(420);
      expect(letteringWidth).toBeLessThanOrEqual(480);
      expect(Math.abs(m.lettering.top - m.contentTop)).toBeLessThanOrEqual(1);
      expect(m.lettering.top).toBeGreaterThanOrEqual(headerBox.height);

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

      // Masthead whole and centred at the container width (or 560px), its
      // lettering inside the viewport.
      const m = await measureMasthead(section.getByRole("img", { name: artwork.alt, exact: true }));
      expect(Math.abs(m.width - Math.min(560, m.containerWidth))).toBeLessThanOrEqual(0.5);
      expect(Math.abs(m.ratio - artwork.height / artwork.width)).toBeLessThanOrEqual(0.003);
      expect(Math.abs(m.centreOffset)).toBeLessThanOrEqual(0.5);
      expect(m.inside).toBe(true);
      expect(m.clipped).toBeNull();
      expect(m.lettering.left).toBeGreaterThanOrEqual(0);
      expect(m.lettering.right).toBeLessThanOrEqual(vp.width);

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
