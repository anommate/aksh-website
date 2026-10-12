import { expect, test, type Page } from "@playwright/test";
import { consultantContent } from "../../src/content/consultant";

/*
 * Homepage "Meet Our Consultant" section:
 * - Exact owner-supplied copy, with bold role and runs, italic tagline
 * - Portrait: the supplied photograph, whole, at its natural ratio, lazy
 *   loaded, nothing drawn over it
 * - Desktop: portrait left (5 parts), profile right (7 parts); tablet and
 *   mobile: name block, portrait, then tagline and biography
 * - No CTA of its own; the consultation buttons elsewhere remain
 * - No horizontal overflow at any checked size, 200% zoom or reduced motion
 */

const { name, eyebrow, role, tagline, biography, portrait } = consultantContent;
const section = (page: Page) => page.locator("section#meet-our-consultant");

async function open(page: Page, width: number, height: number) {
  await page.setViewportSize({ width, height });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
}

async function revealPortrait(page: Page) {
  const image = section(page).getByRole("img", { name: portrait.alt });
  await image.scrollIntoViewIfNeeded();
  await image.evaluate((img: HTMLImageElement) => img.decode());
  return image;
}

const VIEWPORTS = [
  { width: 1440, height: 900, layout: "columns" },
  { width: 1366, height: 768, layout: "columns" },
  { width: 768, height: 1024, layout: "stacked" },
  { width: 390, height: 844, layout: "stacked" },
  { width: 320, height: 568, layout: "stacked" },
] as const;

test("renders the exact copy with bold and italic emphasis, after Services", async ({ page }) => {
  await open(page, 1440, 900);
  const consultant = section(page);

  // Directly after Services in the page.
  const order = await page.evaluate(() =>
    [...document.querySelectorAll("main > section")].map((s) => s.id || s.getAttribute("aria-labelledby"))
  );
  expect(order.indexOf("meet-our-consultant")).toBe(order.indexOf("services") + 1);

  await expect(consultant.getByText(eyebrow, { exact: true })).toBeVisible();
  await expect(consultant.getByRole("heading", { level: 2 })).toHaveText(name);
  await expect(consultant.getByRole("heading")).toHaveCount(1);

  const roleText = consultant.getByText(role, { exact: true });
  await expect(roleText).toBeVisible();
  expect(Number(await roleText.evaluate((e) => getComputedStyle(e).fontWeight))).toBeGreaterThanOrEqual(700);

  const taglineText = consultant.getByText(tagline, { exact: true });
  await expect(taglineText).toBeVisible();
  expect(await taglineText.evaluate((e) => getComputedStyle(e).fontStyle)).toBe("italic");

  const paragraphs = consultant.locator("[data-consultant-biography] > p");
  await expect(paragraphs).toHaveText(biography.map((runs) => runs.map((run) => run.text).join("")));
  const strong = consultant.locator("strong");
  await expect(strong).toHaveText(biography.flat().filter((run) => run.bold).map((run) => run.text));
  for (const weight of await strong.evaluateAll((els) => els.map((e) => Number(getComputedStyle(e).fontWeight)))) {
    expect(weight).toBeGreaterThanOrEqual(700);
  }

  // No CTA in this section.
  await expect(consultant.getByRole("button")).toHaveCount(0);
  await expect(consultant.getByRole("link")).toHaveCount(0);
  await expect(consultant).not.toContainText("Book a Consultation");
  await expect(consultant).not.toContainText("CTA:");
  // Only the supplied wording: no qualification, award or experience claims.
  await expect(consultant).not.toContainText(/years|award|MBBS|MD\b|certified/i);
});

test("the page keeps one H1 and the consultant name is an H2", async ({ page }) => {
  await open(page, 1440, 900);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 2, name })).toHaveCount(1);
});

for (const viewport of VIEWPORTS) {
  test(`portrait is whole, unstretched and unobstructed at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await open(page, viewport.width, viewport.height);
    const image = await revealPortrait(page);

    await expect(image).toHaveAttribute("loading", "lazy");
    await expect(image).toHaveAttribute("width", String(portrait.width));
    await expect(image).toHaveAttribute("height", String(portrait.height));
    expect(await image.getAttribute("srcset")).toContain("dr-priyanka-masharkar.jpg");

    const geometry = await image.evaluate((img: HTMLImageElement) => {
      const rect = img.getBoundingClientRect();
      const wrapper = img.parentElement!.getBoundingClientRect();
      const container = img.closest(".aksh-container")!.getBoundingClientRect();
      const points = [0.1, 0.5, 0.9].flatMap((fx) => [0.1, 0.5, 0.9].map((fy) => [fx, fy]));
      const header = document.querySelector("header")!.getBoundingClientRect().bottom;
      const covered = points.filter(([fx, fy]) => {
        const x = rect.left + rect.width * fx;
        const y = rect.top + rect.height * fy;
        if (y < header || y > window.innerHeight) return false; // off-screen points are not checked
        return document.elementFromPoint(x, y) !== img;
      });
      return {
        ratio: rect.height / rect.width,
        naturalRatio: img.naturalHeight / img.naturalWidth,
        fit: getComputedStyle(img).objectFit,
        width: rect.width,
        unclipped: wrapper.top <= rect.top + 0.5 && wrapper.bottom >= rect.bottom - 0.5,
        insideContainer: rect.left >= container.left - 0.5 && rect.right <= container.right + 0.5,
        covered: covered.length,
      };
    });
    const ratio = portrait.height / portrait.width;
    expect(Math.abs(geometry.ratio - ratio)).toBeLessThanOrEqual(0.005);
    expect(Math.abs(geometry.naturalRatio - ratio)).toBeLessThanOrEqual(0.005);
    expect(geometry.fit).toBe("fill"); // sized by width and auto height, never cropped
    expect(geometry.unclipped).toBe(true);
    expect(geometry.insideContainer).toBe(true);
    expect(geometry.covered).toBe(0);
    expect(geometry.width).toBeLessThanOrEqual(520 + 0.5);
  });

  test(`layout and reading order at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await open(page, viewport.width, viewport.height);
    await revealPortrait(page);
    const boxes = await section(page).evaluate((s) => {
      const box = (el: Element) => {
        const r = el.getBoundingClientRect();
        return { top: r.top + window.scrollY, bottom: r.bottom + window.scrollY, left: r.left, right: r.right };
      };
      const container = s.querySelector(".aksh-container")!;
      return {
        container: box(container),
        name: box(s.querySelector("h2")!),
        portrait: box(s.querySelector("img")!),
        tagline: box(s.querySelector("p.italic")!),
        biography: box(s.querySelector("[data-consultant-biography]")!),
      };
    });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBe(0);

    if (viewport.layout === "columns") {
      // Portrait left, aligned to the container; profile right; both start together.
      const width = boxes.container.right - boxes.container.left;
      expect(Math.abs(boxes.portrait.left - boxes.container.left)).toBeLessThanOrEqual(0.5);
      const share = (boxes.portrait.right - boxes.portrait.left) / width;
      expect(share).toBeGreaterThan(0.36);
      expect(share).toBeLessThan(0.44);
      expect(boxes.name.left).toBeGreaterThan(boxes.portrait.right + 40);
      expect(boxes.tagline.left).toBeGreaterThan(boxes.portrait.right + 40);
      expect(boxes.biography.right).toBeLessThanOrEqual(boxes.container.right + 0.5);
    } else {
      // Name block, then portrait, then tagline and biography.
      expect(boxes.portrait.top).toBeGreaterThan(boxes.name.bottom);
      expect(boxes.tagline.top).toBeGreaterThan(boxes.portrait.bottom);
      expect(boxes.biography.top).toBeGreaterThan(boxes.tagline.bottom);
    }
  });
}

test("keyboard skips the section, and the other consultation buttons remain", async ({ page }) => {
  await open(page, 1440, 900);
  // Tab from the last Services CTA goes straight to The AKSH Experience.
  await page.getByRole("button", { name: "Explore Skin" }).focus();
  await page.keyboard.press("Tab");
  const focused = page.locator(":focus");
  await expect(focused).toHaveAccessibleName("Pause animations");
  expect(await focused.evaluate((e) => !!e.closest("#experience"))).toBe(true);

  await expect(page.locator("header").getByRole("button", { name: "Book a Consultation" })).toBeVisible();
  await expect(page.locator("#experience").getByRole("button", { name: "Begin Your Journey" })).toHaveCount(1);
});

test("200% zoom (1440x900 at 2x) stacks the section without overflow", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 720, height: 450 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await revealPortrait(page);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBe(0);
  for (const runs of biography) {
    await expect(section(page).getByText(runs.map((run) => run.text).join(""))).toBeVisible();
  }
  await context.close();
});

test("reduced motion renders the same static section", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, 390, 844);
  await revealPortrait(page);
  await expect(section(page).getByRole("heading", { level: 2, name })).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBe(0);
});
