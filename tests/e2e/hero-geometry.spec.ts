import { test, expect } from "@playwright/test";

test.describe("Hero Geometry Specification", () => {
  test("reference viewport 1518x780 geometry matches target", async ({ page }) => {
    await page.setViewportSize({ width: 1518, height: 780 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);

    // 1. Measure header
    const header = page.locator("header");
    const headerBox = await header.boundingBox();
    expect(headerBox).not.toBeNull();
    if (!headerBox) return;

    // Header height is approx 81px
    expect(headerBox.height).toBeCloseTo(81, 1);

    // 2. Measure hero section & dark card
    const heroSection = page.locator("main > section").first();
    const heroCard = heroSection.locator("> div.bg-soft-charcoal");
    
    const heroSectionBox = await heroSection.boundingBox();
    const heroCardBox = await heroCard.boundingBox();

    expect(heroSectionBox).not.toBeNull();
    expect(heroCardBox).not.toBeNull();
    if (!heroSectionBox || !heroCardBox) return;

    // Outer wrapper geometry
    expect(heroSectionBox.x).toBe(0);
    expect(heroSectionBox.width).toBe(1518);
    expect(heroSectionBox.y).toBeCloseTo(81, 1);

    // Dark card placement and outer margins
    const leftMargin = heroCardBox.x;
    const rightMargin = 1518 - (heroCardBox.x + heroCardBox.width);
    const topGap = heroCardBox.y - headerBox.height;

    // Left and right margins should be ~8px
    expect(leftMargin).toBeCloseTo(8, 1);
    expect(rightMargin).toBeCloseTo(8, 1);
    expect(topGap).toBeCloseTo(8, 1);

    // Dark card width and height
    // Width should be 1518 - 16 = 1502px (approx 1506px target)
    expect(heroCardBox.width).toBeCloseTo(1502, 2);
    // Height should fit in viewport: 780 - 81(header) - 8(top) - 5(bottom) = ~686px (approx 692px target)
    expect(heroCardBox.height).toBeGreaterThanOrEqual(680);
    expect(heroCardBox.height).toBeLessThanOrEqual(700);

    // Bottom of hero card must be <= 780px (visible without scrolling)
    const cardBottom = heroCardBox.y + heroCardBox.height;
    expect(cardBottom).toBeLessThanOrEqual(780);

    // Zero internal overflow
    const overflowCheck = await heroCard.evaluate((el) => ({
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
      hasOverflow: el.scrollHeight > el.clientHeight,
    }));
    expect(overflowCheck.hasOverflow).toBe(false);

    // Rounded corners
    const borderRadius = await heroCard.evaluate((el) => getComputedStyle(el).borderRadius);
    expect(borderRadius).toBe("28px");

    // 3. Verify About Us sibling section is immediately below and in normal flow
    const aboutSection = page.locator("section#about-aksh");
    const aboutBox = await aboutSection.boundingBox();
    expect(aboutBox).not.toBeNull();
    if (!aboutBox) return;

    expect(aboutBox.y).toBeGreaterThanOrEqual(cardBottom);

    // Verify background colors: Hero is Soft Charcoal, About is Brand Ivory
    const heroBg = await heroCard.evaluate((el) => getComputedStyle(el).backgroundColor);
    const aboutBg = await page.locator("body").evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(heroBg).toBe("rgb(40, 40, 38)"); // #282826
    expect(aboutBg).toBe("rgb(249, 248, 244)"); // #F9F8F4
  });

  const VIEWPORTS = [
    { name: "1440x900", width: 1440, height: 900 },
    { name: "1366x768", width: 1366, height: 768 },
    { name: "1024x768", width: 1024, height: 768 },
    { name: "768x1024", width: 768, height: 1024 },
    { name: "390x844", width: 390, height: 844 },
    { name: "320x568", width: 320, height: 568 },
  ];

  for (const vp of VIEWPORTS) {
    test(`responsive layout at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");
      await page.evaluate(() => document.fonts.ready);

      // Verify no horizontal overflow
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow).toBe(0);

      const heroCard = page.locator("main > section > div.bg-soft-charcoal").first();
      await expect(heroCard).toBeVisible();

      const box = await heroCard.boundingBox();
      expect(box).not.toBeNull();
      if (!box) return;

      // Card is horizontally padded (8px outer margin)
      expect(box.x).toBeCloseTo(8, 1);
      expect(box.width).toBeCloseTo(vp.width - 16, 2);

      // Hero content does not clip
      const contentCheck = await heroCard.evaluate((el) => ({
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
      }));
      expect(contentCheck.scrollHeight).toBeLessThanOrEqual(contentCheck.clientHeight + 2);
    });
  }
});
