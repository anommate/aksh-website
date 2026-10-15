import { expect, test, type Page } from "@playwright/test";

/*
 * E2E tests for AKSH Header and Hero (Step 4A):
 * - Responsive viewports: 320, 360, 390, 768, 1024, 1440px
 * - Type scale: Cormorant Garamond 600 hero display, Manrope body/nav
 * - Container math and zero horizontal overflow
 * - Desktop split navigation with centered logo
 * - Mobile menu button, drawer focus containment, Escape key, and focus return
 * - Development-only unavailable modal for unbuilt destinations
 * - Keyboard navigation and skip link
 * - Reduced motion support
 * - Self-hosted fonts (zero external requests)
 */

type TypeScale = {
  body: readonly [size: number, leading: number];
  heroDisplay: readonly [size: number, leading: number, tracking: number];
};

// Hero display tracking is -0.01em on tablet and desktop, 0 on mobile.
// Desktop: 80/88px (-0.80px tracking), Tablet: 64/72px (-0.64px tracking), Mobile: 44/52px (0px tracking)
const MOBILE: TypeScale = { body: [16, 28], heroDisplay: [44, 52, 0] };
const TABLET: TypeScale = { body: [18, 30], heroDisplay: [64, 72, -0.64] };
const DESKTOP: TypeScale = { body: [18, 30], heroDisplay: [80, 88, -0.8] };

const VIEWPORTS: (TypeScale & { width: number; gutter: number })[] = [
  { width: 320, gutter: 16, ...MOBILE },
  { width: 360, gutter: 20, ...MOBILE },
  { width: 390, gutter: 20, ...MOBILE },
  { width: 768, gutter: 32, ...TABLET },
  { width: 1024, gutter: 48, ...DESKTOP },
  { width: 1440, gutter: 48, ...DESKTOP },
];

const MAX_CONTENT_WIDTH = 1280;

const px = (value: string) => (value === "normal" ? 0 : Number.parseFloat(value));

async function open(page: Page, width: number) {
  await page.setViewportSize({ width, height: 800 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
}

for (const viewport of VIEWPORTS) {
  test.describe(`${viewport.width}px viewport`, () => {
    test("no horizontal overflow", async ({ page }) => {
      await open(page, viewport.width);
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow).toBe(0);
    });

    test("container applies gutter and 1280px maximum", async ({ page }) => {
      await open(page, viewport.width);
      const layoutWidth = await page.evaluate(
        () => document.documentElement.clientWidth,
      );
      const container = page.locator("header .aksh-container");
      const box = await container.boundingBox();
      if (!box) throw new Error("Header container has no layout box");

      const expectedWidth = Math.min(
        MAX_CONTENT_WIDTH,
        layoutWidth - 2 * viewport.gutter,
      );
      expect(box.width).toBeCloseTo(expectedWidth, 0);
      expect(box.x).toBeCloseTo((layoutWidth - expectedWidth) / 2, 0);
    });

    test("body and hero heading follow the responsive type scale", async ({ page }) => {
      await open(page, viewport.width);
      const body = await page.evaluate(() => {
        const style = getComputedStyle(document.body);
        return { size: style.fontSize, leading: style.lineHeight, family: style.fontFamily };
      });
      const title = await page
        .getByRole("heading", { level: 1 })
        .evaluate((element) => {
          const style = getComputedStyle(element);
          return {
            size: style.fontSize,
            leading: style.lineHeight,
            tracking: style.letterSpacing,
            weight: style.fontWeight,
            family: style.fontFamily,
          };
        });

      expect([px(body.size), px(body.leading)]).toEqual(viewport.body);
      expect(body.family).toMatch(/^"?Manrope"?,/);

      const [size, leading, tracking] = viewport.heroDisplay;
      expect([px(title.size), px(title.leading)]).toEqual([size, leading]);
      expect(px(title.tracking)).toBeCloseTo(tracking, 2);
      expect(title.weight).toBe("600");
      expect(title.family).toMatch(/^"?Cormorant Garamond"?,/);
    });
  });
}

test.describe("Desktop Navigation & Header Layout", () => {
  test("logo is centered in container at 1440px", async ({ page }) => {
    await open(page, 1440);
    const container = page.locator("header .aksh-container");
    const containerBox = await container.boundingBox();
    const logo = page.locator("header a[aria-label*='AKSH'] img").first();
    const logoBox = await logo.boundingBox();

    if (!containerBox || !logoBox) throw new Error("Missing boxes");

    const containerMidpoint = containerBox.x + containerBox.width / 2;
    const logoMidpoint = logoBox.x + logoBox.width / 2;

    // Logo should be centered within 2px precision
    expect(Math.abs(containerMidpoint - logoMidpoint)).toBeLessThanOrEqual(2);
  });

  test("desktop header shows split navigation and CTA", async ({ page }) => {
    await open(page, 1440);
    // The footer repeats About AKSH; this checks the header's.
    const aboutLink = page.getByRole("banner").getByRole("link", { name: "About AKSH" });
    await expect(aboutLink).toBeVisible();
    await expect(aboutLink).toHaveAttribute("href", "/#about-aksh");
    await expect(page.getByRole("button", { name: "Treatments", exact: true })).toBeVisible();
    const experienceLink = page.getByRole("link", { name: "Our Experience" });
    await expect(experienceLink).toBeVisible();
    await expect(experienceLink).toHaveAttribute("href", "/#experience");
    await expect(page.getByRole("button", { name: "Journal" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Contact" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Book a Consultation" }).first()).toBeVisible();
  });
});

test.describe("Mobile & Tablet Navigation Drawer", () => {
  test("menu button opens drawer, traps focus, closes on Escape and returns focus (390px)", async ({ page }) => {
    await open(page, 390);
    const menuBtn = page.getByRole("button", { name: "Open navigation menu" });
    await expect(menuBtn).toBeVisible();

    // Click menu button
    await menuBtn.click();

    const drawer = page.getByRole("dialog", { name: "Navigation Menu" });
    await expect(drawer).toBeVisible();

    // Close button should be focused
    const closeBtn = page.getByRole("button", { name: "Close navigation menu" });
    await expect(closeBtn).toBeFocused();

    // Press Escape to close
    await page.keyboard.press("Escape");
    await expect(drawer).not.toBeVisible();

    // Focus returns to menu button
    await expect(menuBtn).toBeFocused();
  });

  test("menu button opens drawer and can be closed via Close button (768px)", async ({ page }) => {
    await open(page, 768);
    const menuBtn = page.getByRole("button", { name: "Open navigation menu" });
    await expect(menuBtn).toBeVisible();

    await menuBtn.click();
    const drawer = page.getByRole("dialog", { name: "Navigation Menu" });
    await expect(drawer).toBeVisible();

    const closeBtn = page.getByRole("button", { name: "Close navigation menu" });
    await closeBtn.click();
    await expect(drawer).not.toBeVisible();
  });

  test("clicking About AKSH in mobile drawer closes drawer and navigates to #about-aksh (390px)", async ({ page }) => {
    await open(page, 390);
    const menuBtn = page.getByRole("button", { name: "Open navigation menu" });
    await menuBtn.click();

    const drawer = page.getByRole("dialog", { name: "Navigation Menu" });
    await expect(drawer).toBeVisible();

    const aboutLink = drawer.getByRole("link", { name: "About AKSH" });
    await aboutLink.click();

    await expect(drawer).not.toBeVisible();
    await expect(page).toHaveURL(/#about-aksh$/);
  });
});

test.describe("About Us Section", () => {
  test("section renders with masthead artwork, semantic H2, owner-supplied copy, and CTA", async ({ page }) => {
    await open(page, 1440);
    const section = page.locator("section#about-aksh");
    await expect(section).toBeVisible();

    // Verify Masthead Artwork: the supplied "ABOUT US" file, named by its alt text
    const artwork = section.getByRole("img", { name: "About Us", exact: true });
    await expect(artwork).toBeVisible();
    await expect(artwork).toHaveAttribute("src", "/brand/about-us-masthead-2026-10-15.png");

    // Verify Eyebrow
    await expect(section.getByText("ABOUT AKSH")).toBeVisible();

    // Verify H2 Heading
    const h2 = section.getByRole("heading", { level: 2 });
    await expect(h2).toBeVisible();
    await expect(h2).toContainText("The Art of Feeling Your Best.");

    // Verify Italic Tagline
    await expect(
      section.getByText("Where science, self-care, and modern wellness come together.")
    ).toBeVisible();

    // Verify Three Paragraphs
    await expect(
      section.getByText(/At AKSH, we believe true wellness goes beyond appearances/i)
    ).toBeVisible();
    await expect(
      section.getByText(/Bringing together/i)
    ).toBeVisible();
    await expect(
      section.getByText(/Whether you're looking to recharge, support recovery/i)
    ).toBeVisible();

    // Verify CTA Button and Development Modal trigger
    const ctaBtn = section.getByRole("button", { name: /Discover AKSH/i });
    await expect(ctaBtn).toBeVisible();
    await ctaBtn.click();
    const dialog = page.getByRole("dialog", { name: /Development Preview/i });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("Discover AKSH");
    const understoodBtn = page.getByRole("button", { name: "Understood" });
    await understoodBtn.click();
    await expect(dialog).not.toBeVisible();

    // Verify computed H2 font
    const h2Style = await h2.evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        family: style.fontFamily,
        weight: style.fontWeight,
        size: style.fontSize,
      };
    });
    expect(h2Style.family).toMatch(/^"?Cormorant Garamond"?,/);
    expect(h2Style.weight).toBe("600");
    expect(px(h2Style.size)).toBe(56);
  });
});

test.describe("Development Unavailable Modal", () => {
  test("clicking unbuilt CTA opens accessible development notice dialog", async ({ page }) => {
    await open(page, 1440);
    const bookBtn = page.getByRole("button", { name: "Book a Consultation" }).first();
    await bookBtn.click();

    const dialog = page.getByRole("dialog", { name: /Development Preview/i });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("No appointment has been confirmed or scheduled");

    const understoodBtn = page.getByRole("button", { name: "Understood" });
    await understoodBtn.click();
    await expect(dialog).not.toBeVisible();
  });
});

test("fonts are self-hosted: no third-party font requests", async ({ page, baseURL }) => {
  const requests: { url: string; type: string }[] = [];
  page.on("request", (request) =>
    requests.push({ url: request.url(), type: request.resourceType() }),
  );
  await open(page, 1440);

  const thirdParty = requests.filter(
    ({ url }) => !url.startsWith(`${baseURL}/`) && !url.startsWith("data:"),
  );
  expect(thirdParty).toEqual([]);

  const fonts = requests.filter(({ type }) => type === "font");
  expect(fonts.length).toBeGreaterThan(0);
  for (const { url } of fonts) {
    expect(url).toMatch(/\/_next\/static\/media\/[^/]+\.woff2$/);
  }

  const loaded = await page.evaluate(() =>
    [...document.fonts]
      .filter((face) => face.status === "loaded")
      .map((face) => `${face.family.replaceAll('"', "")} ${face.weight}`),
  );
  expect(loaded).toContain("Cormorant Garamond 600");
  expect(loaded).toContain("Manrope 400");
});

for (const width of [390, 1440]) {
  test(`skip link: first Tab stop, visibly focused, moves focus to main (${width}px)`, async ({ page }) => {
    await open(page, width);
    const skipLink = page.getByRole("link", { name: "Skip to main content" });

    // Hidden until focused.
    expect((await skipLink.boundingBox())?.width ?? 0).toBeLessThanOrEqual(1);

    await page.keyboard.press("Tab");
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeInViewport({ ratio: 1 });

    const focused = await skipLink.evaluate((element) => {
      const style = getComputedStyle(element);
      const { height } = element.getBoundingClientRect();
      return {
        focusVisible: element.matches(":focus-visible"),
        outlineStyle: style.outlineStyle,
        outlineWidth: style.outlineWidth,
        outlineOffset: style.outlineOffset,
        height,
      };
    });
    expect(focused.focusVisible).toBe(true);
    expect(focused.outlineStyle).toBe("solid");
    expect(px(focused.outlineWidth)).toBeGreaterThanOrEqual(2);
    expect(px(focused.outlineOffset)).toBeGreaterThanOrEqual(2);
    expect(focused.height).toBeGreaterThanOrEqual(44);

    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main-content$/);
    await expect(page.getByRole("main")).toBeFocused();
    expect((await skipLink.boundingBox())?.width ?? 0).toBeLessThanOrEqual(1);
  });
}

test("document shell: language, one main landmark, one h1, one h2 per section", async ({ page }) => {
  await open(page, 1024);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("main").getByRole("heading", { level: 2 })).toHaveText([
    "The Art of Feeling Your Best.",
    "Thoughtfully Designed Around You.",
    "Dr. Priyanka Masharkar",
    "Your Wellness Journey, Simplified.",
    "The Art of Feeling Good, Through Their Eyes.",
    // The FAQ heading is lettering artwork: no text, named by its alt text.
    "",
  ]);
  await expect(page.getByRole("heading", { level: 2, name: "Frequently Asked Questions", exact: true })).toHaveCount(1);
  // The footer's group headings follow, outside main.
  await expect(page.getByRole("contentinfo").getByRole("heading", { level: 2 })).toHaveText([
    "Explore",
    "Our Services",
    "Visit AKSH",
    "Connect",
  ]);
});
