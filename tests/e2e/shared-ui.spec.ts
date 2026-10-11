import { expect, test, type Locator, type Page } from "@playwright/test";

/*
 * Shared UI details used across the homepage:
 * - Buttons show the global focus outline (2px solid, 2px offset), ivory on
 *   charcoal surfaces, and keep it in forced-colours mode
 * - Decorative signal dots render at the 6px token size
 * - The development dialog wording, focus trap, Escape and focus return
 */

const BLACK = "rgb(0, 0, 0)";
const IVORY = "rgb(249, 248, 244)";

async function open(page: Page, width: number, height = 900) {
  await page.setViewportSize({ width, height });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
}

const hero = (page: Page) => page.locator("main section").first();

async function focusRing(control: Locator) {
  await control.focus();
  return control.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      focusVisible: element.matches(":focus-visible"),
      style: style.outlineStyle,
      width: style.outlineWidth,
      offset: style.outlineOffset,
      color: style.outlineColor,
    };
  });
}

async function expectRing(control: Locator, color?: string) {
  const ring = await focusRing(control);
  expect(ring.focusVisible).toBe(true);
  expect(ring.style).toBe("solid");
  expect(ring.width).toBe("2px");
  expect(ring.offset).toBe("2px");
  // Button colours transition, so wait for the outline colour to settle.
  if (color) {
    await expect.poll(() => control.evaluate((e) => getComputedStyle(e).outlineColor)).toBe(color);
  }
}

test.describe("button focus outline", () => {
  test("header, hero, About and Services buttons show the 2px outline (1440px)", async ({ page }) => {
    await open(page, 1440);
    // Keyboard modality first, so programmatic focus is focus-visible.
    await page.keyboard.press("Tab");

    await expectRing(page.locator("header").getByRole("button", { name: "Book a Consultation" }), BLACK);
    await expectRing(page.locator("header").getByRole("button", { name: "Treatments" }), BLACK);
    await expectRing(hero(page).getByRole("button", { name: "Explore Treatments" }), IVORY);
    await expectRing(hero(page).getByRole("button", { name: "Book a Consultation" }), IVORY);
    await expectRing(page.getByRole("button", { name: "Discover AKSH" }), BLACK);
    for (const label of ["Explore Biohacking", "Explore Recovery", "Explore Body Contouring", "Explore Skin"]) {
      await expectRing(page.getByRole("button", { name: label }), BLACK);
    }
  });

  test("dialog and mobile menu buttons show the 2px outline (390px)", async ({ page }) => {
    await open(page, 390, 844);
    await page.keyboard.press("Tab");
    const menu = page.getByRole("button", { name: "Open navigation menu" });
    await expectRing(menu, BLACK);

    await page.keyboard.press("Enter");
    const close = page.getByRole("button", { name: "Close navigation menu" });
    await expect(close).toBeFocused();
    await expectRing(close, BLACK);
    await page.keyboard.press("Escape");
    await expect(menu).toBeFocused();

    await page.getByRole("button", { name: "Discover AKSH" }).focus();
    await page.keyboard.press("Enter");
    const understood = page.getByRole("button", { name: "Understood" });
    await expect(understood).toBeFocused();
    await expectRing(understood, BLACK);
  });

  test("the outline stays visible in forced-colours mode", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await open(page, 1440);
    await page.keyboard.press("Tab");
    await expectRing(page.locator("header").getByRole("button", { name: "Book a Consultation" }));
    await expectRing(hero(page).getByRole("button", { name: "Explore Treatments" }));
    await expectRing(page.getByRole("button", { name: "Explore Skin" }));
  });
});

test.describe("decorative signal dots", () => {
  async function expectDot(dot: Locator) {
    await expect(dot).toHaveAttribute("aria-hidden", "true");
    const box = await dot.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { width: rect.width, height: rect.height, shrink: getComputedStyle(element).flexShrink };
    });
    expect(box).toEqual({ width: 6, height: 6, shrink: "0" });
  }

  for (const width of [1440, 390]) {
    test(`hero, About, divider, Services and dialog dots are 6x6px (${width}px)`, async ({ page }) => {
      await open(page, width, 844);
      const dots = page.locator("main span.bg-signal-red.rounded-circle");
      await expect(dots).toHaveCount(4);
      for (const dot of await dots.all()) await expectDot(dot);

      await page.getByRole("button", { name: "Discover AKSH" }).click();
      await expectDot(page.getByRole("dialog").locator("span.bg-signal-red.rounded-circle"));
    });
  }
});

test.describe("development dialog", () => {
  test("explains the destination is in development and keeps focus behaviour", async ({ page }) => {
    await open(page, 1440);
    const trigger = page.getByRole("button", { name: "Explore Recovery" });
    await trigger.click();

    const dialog = page.getByRole("dialog", { name: "Development Preview: Recovery Treatments" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("This destination is still in development and is not available yet.");
    await expect(dialog).toContainText("/treatments/recovery");
    await expect(dialog).toContainText("No appointment has been confirmed or scheduled.");
    await expect(dialog).not.toContainText("only the header and hero");
    await expect(dialog).not.toContainText("Milestones");

    // Focus is trapped on the dialog's only control, then returns on Escape.
    const understood = dialog.getByRole("button", { name: "Understood" });
    await expect(understood).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(understood).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(understood).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });
});
