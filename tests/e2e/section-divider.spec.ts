import { expect, test, type Page } from "@playwright/test";
import { servicesContent } from "../../src/content/services";

/*
 * Divider between About and Services:
 * - After About, before the Services section (outside #services)
 * - 1px charcoal line across the content container, 6px red dot at the
 *   centre with an 8px clear gap each side; hidden from assistive technology
 * - Balanced spacing to the About CTA and to the Services lettering
 * - Draws outwards from the dot once, on first entry, in about 800ms, with
 *   transforms only (no layout shift); complete without JavaScript, when
 *   already in view on load, and under reduced motion
 */

const divider = (page: Page) => page.locator("[data-section-divider]");
const FOLLOWING = 4; // Node.DOCUMENT_POSITION_FOLLOWING

const scaleOf = (page: Page) =>
  divider(page).evaluate((element) =>
    [...element.querySelectorAll("[data-divider-segment]")].map((segment) => {
      const transform = getComputedStyle(segment).transform;
      return transform === "none" ? 1 : new DOMMatrix(transform).a;
    })
  );

async function open(page: Page, width: number, height: number) {
  await page.setViewportSize({ width, height });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
}

const VIEWPORTS = [
  { width: 1440, height: 900, above: 43, below: 42 },
  { width: 1366, height: 768, above: 43, below: 42 },
  { width: 768, height: 1024, above: 43, below: 42 },
  { width: 390, height: 844, above: 35, below: 30 },
  { width: 320, height: 568, above: 35, below: 30 },
];

for (const viewport of VIEWPORTS) {
  test(`sits between About and Services, aligned to the container, at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await open(page, viewport.width, viewport.height);
    await expect(divider(page)).toHaveCount(1);
    await expect(divider(page)).toHaveAttribute("aria-hidden", "true");

    const geometry = await divider(page).evaluate((element, inkTop) => {
      const about = document.querySelector("#about-aksh")!;
      const services = document.querySelector("#services")!;
      const [start, end] = [...element.querySelectorAll<HTMLElement>("[data-divider-segment]")];
      const dot = element.querySelector<HTMLElement>(".bg-signal-red")!;
      const container = services.querySelector(".aksh-container")!.getBoundingClientRect();
      const artwork = services.querySelector("img")!.getBoundingClientRect();
      // Layout boxes (offsets ignore the draw transform, which may be collapsed).
      const frame = element.getBoundingClientRect();
      const layout = (el: HTMLElement) => {
        const left = frame.left + el.offsetLeft - (element as HTMLElement).offsetLeft;
        const top = frame.top + el.offsetTop - (element as HTMLElement).offsetTop;
        return { left, right: left + el.offsetWidth, top, bottom: top + el.offsetHeight, width: el.offsetWidth, height: el.offsetHeight };
      };
      const startBox = layout(start);
      const endBox = layout(end);
      const dotBox = layout(dot);
      const style = getComputedStyle(start);
      return {
        order: [
          about.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING,
          element.compareDocumentPosition(services) & Node.DOCUMENT_POSITION_FOLLOWING,
        ],
        insideServices: services.contains(element),
        left: startBox.left - container.left,
        right: endBox.right - container.right,
        line: [style.borderTopWidth, style.borderTopColor, startBox.height],
        dot: [dotBox.width, dotBox.height, getComputedStyle(dot).backgroundColor],
        gaps: [dotBox.left - startBox.right, endBox.left - dotBox.right],
        centred: Math.abs(dotBox.left + dotBox.width / 2 - (container.left + container.width / 2)),
        above: startBox.top - about.querySelector("button")!.getBoundingClientRect().bottom,
        // To the wordmark's lettering, below the file's own transparent margin.
        below: artwork.top + artwork.height * inkTop - startBox.bottom,
      };
    }, servicesContent.artwork.ink.top / servicesContent.artwork.height);

    expect(geometry.order).toEqual([FOLLOWING, FOLLOWING]);
    expect(geometry.insideServices).toBe(false);
    expect(Math.abs(geometry.left)).toBeLessThanOrEqual(0.5);
    expect(Math.abs(geometry.right)).toBeLessThanOrEqual(0.5);
    expect(geometry.line).toEqual(["1px", "rgb(40, 40, 38)", 1]);
    expect(geometry.dot).toEqual([6, 6, "rgb(255, 0, 0)"]);
    expect(geometry.gaps).toEqual([8, 8]);
    expect(geometry.centred).toBeLessThanOrEqual(1);
    expect(Math.abs(geometry.above - viewport.above)).toBeLessThanOrEqual(1.5);
    expect(Math.abs(geometry.below - viewport.below)).toBeLessThanOrEqual(1.5);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBe(0);
  });
}


test("draws outwards once on first entry in about 800ms, without layout shift", async ({ page }) => {
  await open(page, 1440, 900);
  // Armed while off screen: segments collapsed towards the dot.
  await expect(divider(page)).toHaveAttribute("data-reveal", "pending");
  expect(await scaleOf(page)).toEqual([0, 0]);
  // Each half grows from the dot: the left half from its right edge, the
  // right half from its left edge.
  const origins = await divider(page).evaluate((element) =>
    [...element.querySelectorAll<HTMLElement>("[data-divider-segment]")].map((segment) => ({
      x: Number.parseFloat(getComputedStyle(segment).transformOrigin),
      width: segment.offsetWidth,
    }))
  );
  expect(Math.abs(origins[0].x - origins[0].width)).toBeLessThanOrEqual(0.5);
  expect(origins[1].x).toBe(0);

  // Watch for any layout shift while it draws.
  await page.evaluate(() => {
    (window as unknown as { shift: number }).shift = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) {
        if (!entry.hadRecentInput) (window as unknown as { shift: number }).shift += entry.value;
      }
    }).observe({ type: "layout-shift" });
  });
  const boxBefore = await divider(page).evaluate((e) => e.getBoundingClientRect().height);
  const servicesOffset = () =>
    page.evaluate(
      () =>
        document.querySelector("#services")!.getBoundingClientRect().top -
        document.querySelector("[data-section-divider]")!.getBoundingClientRect().top
    );
  const offsetBefore = await servicesOffset();

  // Scroll it into view, then sample both halves every frame for 1.3s.
  const samples = await divider(page).evaluate(async (element) => {
    const segments = [...element.querySelectorAll("[data-divider-segment]")];
    const scale = (segment: Element) => {
      const transform = getComputedStyle(segment).transform;
      return transform === "none" ? 1 : new DOMMatrix(transform).a;
    };
    window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY - 500, behavior: "instant" });
    const start = performance.now();
    const out: { t: number; left: number; right: number }[] = [];
    while (performance.now() - start < 1300) {
      await new Promise((resolve) => requestAnimationFrame(resolve));
      out.push({ t: performance.now() - start, left: scale(segments[0]), right: scale(segments[1]) });
    }
    return out;
  });
  await expect(divider(page)).toHaveAttribute("data-reveal", "drawn");
  for (const sample of samples) expect(sample.left).toBeCloseTo(sample.right, 3); // both halves together

  // Smooth, monotonic growth from the dot to full width: no flash or jump.
  for (const [i, sample] of samples.entries()) {
    if (i > 0) expect(sample.left).toBeGreaterThanOrEqual(samples[i - 1].left - 1e-6);
  }
  expect(samples.filter((s) => s.left > 0.02 && s.left < 0.98).length).toBeGreaterThan(10);
  const done = samples.find((s) => s.left === 1)!;
  expect(done.t).toBeGreaterThan(600);
  expect(done.t).toBeLessThan(1200);

  // Transforms only: its box and everything after it never moved.
  expect(await divider(page).evaluate((e) => e.getBoundingClientRect().height)).toBe(boxBefore);
  expect(await servicesOffset()).toBe(offsetBefore);
  expect(await page.evaluate(() => (window as unknown as { shift: number }).shift)).toBe(0);

  // Once only: leaving and returning does not replay it.
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(200);
  await divider(page).evaluate((element) =>
    window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY - 500, behavior: "instant" })
  );
  await page.waitForTimeout(50);
  expect(await scaleOf(page)).toEqual([1, 1]);
});

test("a divider already in view on load stays complete (no flash)", async ({ page }) => {
  // Tall enough that the divider is in the first viewport (the mobile hero
  // does not stretch to the viewport height, unlike desktop).
  await open(page, 390, 2600);
  const top = await divider(page).evaluate((e) => e.getBoundingClientRect().top);
  expect(top).toBeLessThan(2600);
  for (let i = 0; i < 6; i++) {
    expect(await scaleOf(page)).toEqual([1, 1]);
    await page.waitForTimeout(100);
  }
  expect(await divider(page).getAttribute("data-reveal")).toBeNull();
});

test("reduced motion shows the complete divider immediately", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, 390, 844);
  await page.waitForTimeout(300);
  expect(await divider(page).getAttribute("data-reveal")).toBeNull();
  await divider(page).scrollIntoViewIfNeeded();
  expect(await scaleOf(page)).toEqual([1, 1]);
});

test("complete and visible without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await divider(page).scrollIntoViewIfNeeded();
  await expect(divider(page)).toBeVisible();
  expect(await scaleOf(page)).toEqual([1, 1]);
  await context.close();
});
