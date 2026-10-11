import { expect, test, type Locator, type Page } from "@playwright/test";
import { servicesContent } from "../../src/content/services";

/*
 * Homepage Services section:
 * - All four categories and twelve treatments render, in order, with CTAs
 * - Desktop card stack: sticky, header-aware offsets, increasing z-order,
 *   enabled only when the tallest card fits below the header
 * - Tablet and mobile card stack: header-aware 8px steps, tall cards pinned by
 *   their bottom edge, covered cards receding from 1 to 0.95, every line
 *   reachable, card 04 settling on the real page
 * - Native wheel and touch scrolling (slow swipes, momentum flicks, reversal,
 *   rotation); no trapped scrolling
 * - Keyboard focus is never left beneath a later card
 * - Normal flow on very short viewports (phones in landscape, 200% zoom),
 *   desktop sizes where cards do not fit, desktop enlarged text, reduced
 *   motion, and without JavaScript
 */

const { categories } = servicesContent;
const STACK_GAP = 24;
const STACK_STEP = 12;
const MOBILE_STEP = 8;

type Viewport = { width: number; height: number };

async function open(page: Page, viewport: Viewport, path = "/") {
  await page.setViewportSize(viewport);
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
}

// Waits until the scroll position has been stable for two frames.
async function settle(page: Page) {
  await page.waitForFunction(
    () =>
      new Promise<boolean>((resolve) => {
        const y = window.scrollY;
        requestAnimationFrame(() =>
          requestAnimationFrame(() => resolve(window.scrollY === y))
        );
      })
  );
}

const scrollPosition = (page: Page) => page.evaluate(() => window.scrollY);

// Waits until the scroll position has rested for 300ms, so touch momentum has
// finished. Returns every position sampled on the way.
async function waitForScrollRest(page: Page) {
  const samples = [await scrollPosition(page)];
  for (let stable = 0, i = 0; stable < 6 && i < 160; i++) {
    await page.waitForTimeout(50);
    const now = await scrollPosition(page);
    stable = now === samples[samples.length - 1] ? stable + 1 : 0;
    samples.push(now);
  }
  return samples;
}

// Raw touch points through CDP, so Chrome performs its own touch scrolling and
// momentum. A swipe moves slowly (16ms apart) and holds still for 200ms before
// lifting, so it does not fling; a flick moves fast (8ms apart, roughly
// 3000px/s for 200px) and lifts while moving, so it flings. Each point carries
// an explicit timestamp, so Chrome's velocity estimate does not depend on how
// busy the test machine is.
async function touchDrag(page: Page, fromY: number, toY: number, kind: "swipe" | "flick") {
  const client = await page.context().newCDPSession(page);
  const x = Math.round(page.viewportSize()!.width / 2);
  const steps = kind === "swipe" ? 20 : 8;
  const interval = kind === "swipe" ? 0.016 : 0.008;
  const start = Date.now() / 1000;
  let timestamp = start;
  const send = (type: "touchStart" | "touchMove" | "touchEnd", y?: number) =>
    client.send("Input.dispatchTouchEvent", {
      type,
      touchPoints: y === undefined ? [] : [{ x, y }],
      timestamp,
    });
  await send("touchStart", fromY);
  for (let i = 1; i <= steps; i++) {
    timestamp = start + i * interval;
    await send("touchMove", Math.round(fromY + ((toY - fromY) * i) / steps));
    await page.waitForTimeout(interval * 1000);
  }
  if (kind === "swipe") {
    timestamp += 0.2;
    await page.waitForTimeout(200);
    await send("touchMove", toY);
  }
  timestamp += 0.002;
  await send("touchEnd");
  await client.detach();
}

const stack = (page: Page) => page.locator("section#services ol[data-stack]");
const items = (page: Page) => page.locator("[data-service-stack-item]");

// Sticky layout of the stack as the browser resolves it.
async function stackGeometry(page: Page) {
  return stack(page).evaluate((list) => {
    const style = getComputedStyle(list);
    const viewport = document.documentElement.clientHeight;
    const bottom = Number.parseFloat(style.getPropertyValue("--service-stack-bottom"));
    return {
      header: document.querySelector("header")!.getBoundingClientRect().bottom,
      viewport,
      bottom,
      pinLine: viewport - bottom,
      rowGap: Number.parseFloat(style.rowGap),
      listTop: list.getBoundingClientRect().top,
      tail: (() => {
        const spacer = getComputedStyle(list, "::after");
        return spacer.content === "none" ? 0 : Number.parseFloat(spacer.height);
      })(),
      cards: [...list.children].map((item) => {
        const itemStyle = getComputedStyle(item);
        const rect = item.getBoundingClientRect();
        return {
          position: itemStyle.position,
          top: Number.parseFloat(itemStyle.top),
          zIndex: Number(itemStyle.zIndex),
          height: rect.height,
          rectTop: rect.top,
          rectBottom: rect.bottom,
        };
      }),
    };
  });
}

// Scrolls through the stack and records every heading, paragraph, treatment
// and CTA that is, at some point, fully in view below the header with nothing
// painted over it. Returns the text of any that never were.
async function unreachableContent(page: Page) {
  return page.evaluate(async () => {
    const frames = () =>
      new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const section = document.querySelector("section#services")!;
    const targets = [
      ...section.querySelectorAll<HTMLElement>("article h3, article p, article li, article button"),
    ];
    const seen = new Set<HTMLElement>();
    const header = document.querySelector("header")!;
    const listTop = section.querySelector("ol")!.getBoundingClientRect().top + window.scrollY;
    const end = document.documentElement.scrollHeight - window.innerHeight;
    for (let y = Math.max(0, listTop - window.innerHeight); ; y = Math.min(end, y + 48)) {
      window.scrollTo({ top: y, behavior: "instant" });
      await frames();
      const top = header.getBoundingClientRect().bottom;
      for (const element of targets) {
        if (seen.has(element)) continue;
        const rect = element.getBoundingClientRect();
        if (rect.top < top || rect.bottom > window.innerHeight) continue;
        const x = rect.left + rect.width / 2;
        const inset = Math.min(4, rect.height / 2);
        const clear = [rect.top + inset, rect.top + rect.height / 2, rect.bottom - inset].every((y) => {
          const hit = document.elementFromPoint(x, y);
          return hit !== null && element.contains(hit);
        });
        if (clear) seen.add(element);
      }
      if (y >= end) break;
    }
    return targets.filter((element) => !seen.has(element)).map((element) => element.textContent);
  });
}

async function itemTops(page: Page) {
  return items(page).evaluateAll((elements) =>
    elements.map((element) => element.getBoundingClientRect().top)
  );
}

async function headerBottom(page: Page) {
  return page.locator("header").evaluate((header) => header.getBoundingClientRect().bottom);
}

// True when the element is inside the viewport, below the header, and is the
// hit target along its middle line (nothing painted over it).
async function isUnobscured(locator: Locator) {
  return locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const header = document.querySelector("header")!.getBoundingClientRect().bottom;
    if (rect.top < header || rect.bottom > window.innerHeight) return false;
    const y = rect.top + rect.height / 2;
    const inset = rect.height / 2;
    return [rect.left + inset, rect.left + rect.width / 2, rect.right - inset].every((x) => {
      const hit = document.elementFromPoint(x, y);
      return hit !== null && element.contains(hit);
    });
  });
}

async function expectNormalFlow(page: Page) {
  await expect(stack(page)).toHaveAttribute("data-stack", "off");
  const layout = await items(page).evaluateAll((elements) =>
    elements.map((element) => ({
      position: getComputedStyle(element).position,
      top: element.getBoundingClientRect().top + window.scrollY,
      bottom: element.getBoundingClientRect().bottom + window.scrollY,
    }))
  );
  for (const [index, item] of layout.entries()) {
    expect(item.position).toBe("static");
    if (index > 0) expect(item.top).toBeGreaterThanOrEqual(layout[index - 1].bottom);
  }
  // No trailing stack space outside the sticky layout.
  expect(await stack(page).evaluate((list) => getComputedStyle(list, "::after").content)).toBe("none");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBe(0);
}

test.describe("services content", () => {
  test("renders the introduction, four categories and twelve treatments in order", async ({ page }) => {
    await open(page, { width: 1440, height: 900 });
    const section = page.locator("section#services");

    await expect(section.getByRole("img", { name: "Our Services" })).toBeVisible();
    // The artwork is the label: no typed "Our Services" text is repeated.
    await expect(section.getByText(/our services/i)).toHaveCount(0);
    await expect(section.getByText(servicesContent.eyebrow, { exact: true })).toBeVisible();
    await expect(
      section.getByRole("heading", { level: 2, name: servicesContent.heading })
    ).toBeVisible();
    await expect(section.getByText(servicesContent.introduction)).toBeVisible();

    await expect(section.getByRole("heading", { level: 3 })).toHaveText(
      categories.map((category) => category.title)
    );
    await expect(section.locator("article li")).toHaveCount(12);

    for (const category of categories) {
      const card = section.getByRole("article", { name: category.title, exact: true });
      await expect(card.locator("p").first()).toHaveText(category.number);
      await expect(card.getByText(category.tagline, { exact: true })).toBeAttached();
      await expect(card.getByText(category.description, { exact: true })).toBeAttached();
      await expect(card.getByRole("listitem")).toHaveText(
        category.treatments.map((t) => `${t.name} — ${t.descriptor}`)
      );
      const names = card.locator("li strong");
      await expect(names).toHaveText(category.treatments.map((t) => t.name));
      const weights = await names.evaluateAll((elements) =>
        elements.map((element) => Number(getComputedStyle(element).fontWeight))
      );
      expect(Math.min(...weights)).toBeGreaterThanOrEqual(700);
      await expect(card.getByRole("button", { name: category.cta.label })).toBeAttached();
      // No approved photography yet: a labelled placeholder, never an image.
      await expect(card.getByText("Development placeholder")).toBeAttached();
      await expect(card.getByText(`${category.title} imagery to be supplied`)).toBeAttached();
    }
    await expect(section.locator("article img")).toHaveCount(0);
    await expect(section.locator("a")).toHaveCount(0);
  });

  const MASTHEAD_VIEWPORTS = [
    { width: 1440, height: 900, artwork: 440, gap: 24, cards: 40 },
    { width: 1366, height: 768, artwork: 440, gap: 24, cards: 40 },
    { width: 768, height: 1024, artwork: 440, gap: 24, cards: 32 },
    { width: 390, height: 844, artwork: 350, gap: 20, cards: 28 },
    { width: 320, height: 568, artwork: 288, gap: 20, cards: 28 },
  ];

  for (const viewport of MASTHEAD_VIEWPORTS) {
    test(`masthead artwork is whole, proportional and compact at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await open(page, viewport, "/#services");
      const artwork = page.locator("section#services").getByRole("img", { name: "Our Services" });
      await artwork.evaluate((img: HTMLImageElement) => img.decode());

      const geometry = await artwork.evaluate((img: HTMLImageElement) => {
        const rect = img.getBoundingClientRect();
        const parent = img.parentElement!.getBoundingClientRect();
        const container = img.closest(".aksh-container")!.getBoundingClientRect();
        const eyebrow = img.closest("[data-services-masthead]")!.querySelector(".grid")!.getBoundingClientRect();
        const masthead = img.closest("[data-services-masthead]")!;
        const list = masthead.parentElement!.querySelector("ol")!;
        const section = img.closest("section")!;
        // Every box from the card list up to the section: one ivory surface.
        const surfaces: string[] = [];
        for (let el: Element | null = list; el && el !== section.parentElement; el = el.parentElement) {
          surfaces.push(getComputedStyle(el).backgroundColor);
        }
        return {
          intrinsic: [Number(img.getAttribute("width")), Number(img.getAttribute("height"))],
          naturalRatio: img.naturalHeight / img.naturalWidth,
          width: rect.width,
          height: rect.height,
          fit: getComputedStyle(img).objectFit,
          centreOffset: rect.left + rect.width / 2 - (container.left + container.width / 2),
          insideContainer: rect.left >= container.left - 0.5 && rect.right <= container.right + 0.5,
          unclipped: parent.top <= rect.top + 0.5 && parent.bottom >= rect.bottom - 0.5,
          gapToIntroduction: eyebrow.top - rect.bottom,
          introToCards: list.getBoundingClientRect().top - eyebrow.bottom,
          surfaces,
        };
      });

      // Intrinsic size attributes match the asset; the optimised variant the
      // browser decoded keeps the same proportions.
      expect(geometry.intrinsic).toEqual([servicesContent.artwork.width, servicesContent.artwork.height]);
      const ratio = servicesContent.artwork.height / servicesContent.artwork.width;
      expect(Math.abs(geometry.naturalRatio - ratio)).toBeLessThanOrEqual(0.005);
      expect(Math.abs(geometry.width - viewport.artwork)).toBeLessThanOrEqual(0.5);
      expect(geometry.width).toBeLessThanOrEqual(480);
      expect(Math.abs(geometry.height - geometry.width * ratio)).toBeLessThanOrEqual(1);
      expect(geometry.fit).toBe("contain");
      expect(Math.abs(geometry.centreOffset)).toBeLessThanOrEqual(0.5);
      expect(geometry.insideContainer).toBe(true);
      expect(geometry.unclipped).toBe(true);
      expect(Math.abs(geometry.gapToIntroduction - viewport.gap)).toBeLessThanOrEqual(0.5);
      expect(Math.abs(geometry.introToCards - viewport.cards)).toBeLessThanOrEqual(0.5);
      // No stone band: only the section paints a background, in Brand Ivory.
      expect(geometry.surfaces.at(-1)).toBe("rgb(249, 248, 244)");
      for (const surface of geometry.surfaces.slice(0, -1)) expect(surface).toBe("rgba(0, 0, 0, 0)");

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow).toBe(0);
    });
  }

  test("#services lands 24px below the sticky header, artwork fully visible", async ({ page }) => {
    for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
      await open(page, viewport, "/#services");
      await settle(page);
      const top = await page.locator("section#services").evaluate((s) => s.getBoundingClientRect().top);
      expect(Math.abs(top - (await headerBottom(page)) - 24)).toBeLessThanOrEqual(1);
      await expect(page.getByRole("img", { name: "Our Services" })).toBeInViewport({ ratio: 1 });
    }
  });
});

test.describe("desktop card stack", () => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 1366, height: 768 }]) {
    test(`sticks with header-aware offsets and increasing z-order at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await open(page, viewport);
      await expect(stack(page)).toHaveAttribute("data-stack", "on");
      const header = await headerBottom(page);
      const layout = await items(page).evaluateAll((elements) =>
        elements.map((element) => {
          const style = getComputedStyle(element);
          return {
            position: style.position,
            top: Number.parseFloat(style.top),
            zIndex: Number(style.zIndex),
            height: element.getBoundingClientRect().height,
          };
        })
      );
      layout.forEach((item, index) => {
        expect(item.position).toBe("sticky");
        expect(item.top).toBe(header + STACK_GAP + index * STACK_STEP);
        expect(item.zIndex).toBe(index + 1);
        expect(item.height).toBe(layout[0].height);
      });
      // The tallest card fits below the header with clearance.
      expect(layout[3].top + layout[3].height + STACK_GAP).toBeLessThanOrEqual(viewport.height);
    });
  }

  test("wheel scrolling stays native and overlaps continuously in both directions", async ({ page }) => {
    await open(page, { width: 1440, height: 900 });
    await page.locator("section#services").evaluate((s) => window.scrollTo(0, s.getBoundingClientRect().top + window.scrollY));
    await settle(page);
    await page.mouse.move(720, 450);

    const maxScroll = await page.evaluate(
      () => document.documentElement.scrollHeight - window.innerHeight
    );
    const start = await page.evaluate(() => window.scrollY);
    let previousTops = await itemTops(page);
    let previousY = start;
    let sawOverlap = false;

    for (let step = 0; step < 40 && previousY < maxScroll; step++) {
      await page.mouse.wheel(0, 120);
      await settle(page);
      const y = await page.evaluate(() => window.scrollY);
      expect(y - previousY).toBe(Math.min(120, maxScroll - previousY));
      const tops = await itemTops(page);
      tops.forEach((top, index) => {
        // Cards only rise, and never faster than the page scrolls.
        expect(top).toBeLessThanOrEqual(previousTops[index] + 0.5);
        expect(previousTops[index] - top).toBeLessThanOrEqual(120.5);
      });
      if (tops[1] < tops[0] + (await items(page).first().evaluate((e) => e.getBoundingClientRect().height))) {
        sawOverlap = true;
      }
      const depth = await items(page).first().locator("[data-service-card]").evaluate((card) =>
        Number(card.style.getPropertyValue("--service-stack-depth") || 0)
      );
      expect(depth).toBeGreaterThanOrEqual(0);
      previousTops = tops;
      previousY = y;
    }
    expect(sawOverlap).toBe(true);
    expect(previousY).toBe(maxScroll);

    for (let step = 0; step < 40 && previousY > start; step++) {
      await page.mouse.wheel(0, -120);
      await settle(page);
      const y = await page.evaluate(() => window.scrollY);
      expect(previousY - y).toBe(Math.min(120, previousY));
      previousY = y;
    }
    expect(previousY).toBeLessThanOrEqual(start);
    const restored = await itemTops(page);
    for (const [index, top] of restored.entries()) {
      if (index > 0) expect(top).toBeGreaterThan(restored[index - 1]);
    }
  });

  for (const viewport of [{ width: 1440, height: 900 }, { width: 1366, height: 768 }]) {
    test(`card 04 fully settles on the real page before it ends at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await open(page, viewport, "/#services");
      const header = await headerBottom(page);
      const stickyTops = [0, 1, 2, 3].map((index) => header + STACK_GAP + index * STACK_STEP);

      // Real wheel scrolling to the end of the page.
      await page.mouse.move(viewport.width / 2, viewport.height / 2);
      let y = -1;
      for (let step = 0; step < 60; step++) {
        await page.mouse.wheel(0, 240);
        await settle(page);
        const next = await page.evaluate(() => window.scrollY);
        if (next === y) break;
        y = next;
      }
      const atEnd = await page.evaluate(
        () => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1
      );
      expect(atEnd).toBe(true);

      // Every card rests at its sticky offset: the stack is complete.
      for (const [index, top] of (await itemTops(page)).entries()) {
        expect(Math.abs(top - stickyTops[index])).toBeLessThanOrEqual(0.5);
      }
      const depth = await items(page).first().locator("[data-service-card]").evaluate((card) =>
        Number(card.style.getPropertyValue("--service-stack-depth"))
      );
      expect(depth).toBeCloseTo(3, 3);
      expect(await isUnobscured(page.getByRole("button", { name: "Explore Skin" }))).toBe(true);

      // The trailing space lives inside the stack and is only what is needed:
      // at the page end, card 04's natural position is exactly its sticky top.
      const tail = await stack(page).evaluate((list) => {
        const last = list.lastElementChild!.getBoundingClientRect();
        const gap = Number.parseFloat(getComputedStyle(list).rowGap);
        return {
          spacer: Number.parseFloat(getComputedStyle(list, "::after").height),
          naturalTop: list.getBoundingClientRect().top + 3 * (last.height + gap),
        };
      });
      expect(tail.spacer).toBeGreaterThan(0);
      expect(tail.naturalTop).toBeLessThanOrEqual(stickyTops[3] + 0.5);
      expect(tail.naturalTop).toBeGreaterThanOrEqual(stickyTops[3] - 2);

      // Cards never extend beyond the Services section.
      const bounds = await page.locator("section#services").evaluate((section) => {
        const rect = section.getBoundingClientRect();
        const cards = [...section.querySelectorAll("[data-service-stack-item]")].map((item) =>
          item.getBoundingClientRect()
        );
        return { top: rect.top, bottom: rect.bottom, cards: cards.map((c) => [c.top, c.bottom]) };
      });
      for (const [top, bottom] of bounds.cards) {
        expect(top).toBeGreaterThanOrEqual(bounds.top);
        expect(bottom).toBeLessThanOrEqual(bounds.bottom);
      }
    });
  }

  test("an exposed CTA works with the mouse", async ({ page }) => {
    await open(page, { width: 1440, height: 900 }, "/#services");
    const cta = page.getByRole("button", { name: categories[0].cta.label });
    await cta.click();
    const dialog = page.getByRole("dialog", {
      name: `Development Preview: ${categories[0].cta.destinationName}`,
    });
    await expect(dialog).toContainText(categories[0].cta.href);
    await dialog.getByRole("button", { name: "Understood" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
});

test.describe("keyboard focus", () => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
    { width: 320, height: 568 },
  ]) {
    test(`exposes each covered card and its CTA at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await open(page, viewport);
      await expect(stack(page)).toHaveAttribute("data-stack", "on");
      await expectKeyboardExposure(page, viewport);
    });
  }
});

async function expectKeyboardExposure(page: Page, viewport: Viewport) {
  await page.getByRole("button", { name: "Discover AKSH" }).focus();

  for (const category of categories) {
    await page.keyboard.press("Tab");
    const cta = page.getByRole("button", { name: category.cta.label });
    await expect(cta).toBeFocused();
    await settle(page);
    expect(await isUnobscured(cta)).toBe(true);
    expect(await cta.evaluate((e) => getComputedStyle(e).outlineStyle)).toBe("solid");
  }

  // At the end of the page, earlier CTAs sit beneath later cards.
  await page.mouse.move(viewport.width / 2, viewport.height / 2);
  for (let i = 0; i < 10; i++) await page.mouse.wheel(0, 1000);
  await settle(page);
  for (const category of categories.slice(0, 3).reverse()) {
    const cta = page.getByRole("button", { name: category.cta.label });
    expect(await isUnobscured(cta)).toBe(false);
    await page.keyboard.press("Shift+Tab");
    await expect(cta).toBeFocused();
    await settle(page);
    expect(await isUnobscured(cta)).toBe(true);
  }

  // Enter opens the notice; Escape returns focus to the exposed CTA.
  const recovery = categories[1];
  await page.keyboard.press("Tab");
  const cta = page.getByRole("button", { name: recovery.cta.label });
  await expect(cta).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("dialog", { name: `Development Preview: ${recovery.cta.destinationName}` })
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(cta).toBeFocused();
  await settle(page);
  expect(await isUnobscured(cta)).toBe(true);
}

const MOBILE_STACK_VIEWPORTS = [
  // Standard phone: card 04 is extended so its bottom rests on the pin line.
  { width: 390, height: 844, restsOnPinLine: true },
  { width: 360, height: 800, restsOnPinLine: true },
  { width: 320, height: 568, restsOnPinLine: true },
  // Tablet portrait: every card fits, so the stack settles at the top.
  { width: 768, height: 1024, restsOnPinLine: false },
];

test.describe("tablet and mobile card stack", () => {
  test.use({ hasTouch: true });

  for (const viewport of MOBILE_STACK_VIEWPORTS) {
    const size = `${viewport.width}x${viewport.height}`;

    test(`sticks with header-aware, content-aware offsets at ${size}`, async ({ page }) => {
      await open(page, viewport);
      await expect(stack(page)).toHaveAttribute("data-stack", "on");
      const { header, pinLine, cards } = await stackGeometry(page);
      expect(cards[0].top).toBeLessThanOrEqual(header + 12 + 0.5);
      cards.forEach((card, index) => {
        expect(card.position).toBe("sticky");
        expect(card.zIndex).toBe(index + 1);
        // Stuck, the whole card is above the pin line, so its bottom is in view.
        expect(card.top + card.height).toBeLessThanOrEqual(pinLine + 1);
        if (index === 0) return;
        const previous = cards[index - 1];
        // A covered card never shows beneath the card that covers it...
        expect(card.top + card.height).toBeGreaterThanOrEqual(previous.top + previous.height - 1);
        // ...and, where its top is in view, shows only a small step above it.
        const visibleTop = Math.max(previous.top, header);
        if (card.top > visibleTop) {
          expect(card.top - visibleTop).toBeLessThanOrEqual(MOBILE_STEP + 0.5);
        }
      });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow).toBe(0);
    });

    test(`every heading, paragraph, treatment and CTA is reachable unobscured at ${size}`, async ({ page }) => {
      await open(page, viewport);
      await expect(stack(page)).toHaveAttribute("data-stack", "on");
      expect(await unreachableContent(page)).toEqual([]);
    });

    test(`card 04 settles on the real page after momentum flicks at ${size}`, async ({ page }) => {
      await open(page, viewport, "/#services");
      await expect(stack(page)).toHaveAttribute("data-stack", "on");
      const low = viewport.height - 120;
      const high = Math.max(120, low - 360);
      let previous = -1;
      for (let flick = 0; flick < 30; flick++) {
        await touchDrag(page, low, high, "flick");
        const samples = await waitForScrollRest(page);
        const now = samples[samples.length - 1];
        if (now === previous) break;
        previous = now;
      }
      const atEnd = await page.evaluate(
        () => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1
      );
      expect(atEnd).toBe(true);

      const { cards, pinLine, bottom, viewport: height, listTop, rowGap } = await stackGeometry(page);
      // Every card rests at its own sticky top: the stack is complete.
      for (const card of cards) expect(Math.abs(card.rectTop - card.top)).toBeLessThanOrEqual(0.5);
      const last = cards[3];
      expect(last.rectBottom).toBeLessThanOrEqual(pinLine + 1);
      expect(await isUnobscured(page.getByRole("button", { name: "Explore Skin" }))).toBe(true);
      // The trailing space is only what card 04 needs to reach its sticky top.
      const naturalTop = listTop + cards.slice(0, 3).reduce((sum, card) => sum + card.height + rowGap, 0);
      expect(naturalTop).toBeLessThanOrEqual(last.top + 0.5);
      expect(naturalTop).toBeGreaterThanOrEqual(last.top - 2);
      if (viewport.restsOnPinLine) {
        // No empty band below the stack beyond the band's own inset.
        expect(height - last.rectBottom).toBeLessThanOrEqual(bottom + 2);
      }
    });

    test(`slow swipes, momentum flicks and reversal stay native at ${size}`, async ({ page }) => {
      await open(page, viewport);
      await stack(page).evaluate((list) =>
        window.scrollTo({ top: list.getBoundingClientRect().top + window.scrollY - 200, behavior: "instant" })
      );
      await waitForScrollRest(page);
      const low = viewport.height - 120;
      const distance = Math.min(420, low - 160);

      // A slow swipe follows the finger one-to-one (less the touch slop).
      let before = await scrollPosition(page);
      await touchDrag(page, low, low - distance, "swipe");
      await waitForScrollRest(page);
      const swiped = (await scrollPosition(page)) - before;
      expect(swiped).toBeGreaterThan(distance - 40);
      expect(swiped).toBeLessThanOrEqual(distance + 1);

      // A flick carries momentum past the finger, always forwards, then rests.
      before = await scrollPosition(page);
      await touchDrag(page, low, low - 200, "flick");
      let samples = await waitForScrollRest(page);
      // Past the 200px the finger moved: momentum carried the page further.
      expect(samples[samples.length - 1] - before).toBeGreaterThan(260);
      samples.forEach((y, i) => i > 0 && expect(y).toBeGreaterThanOrEqual(samples[i - 1]));

      // Reverse: a flick upwards does the same in the other direction.
      before = await scrollPosition(page);
      await touchDrag(page, low - 200, low, "flick");
      samples = await waitForScrollRest(page);
      expect(before - samples[samples.length - 1]).toBeGreaterThan(260);
      samples.forEach((y, i) => i > 0 && expect(y).toBeLessThanOrEqual(samples[i - 1]));

      // Exit upwards: above the section every card is back in normal position.
      for (let flick = 0; flick < 30; flick++) {
        const { listTop } = await stackGeometry(page);
        if (listTop > viewport.height) break;
        await touchDrag(page, 200, low, "flick");
        await waitForScrollRest(page);
      }
      const { cards, rowGap } = await stackGeometry(page);
      cards.forEach((card, index) => {
        if (index > 0) {
          expect(Math.abs(card.rectTop - (cards[index - 1].rectBottom + rowGap))).toBeLessThanOrEqual(0.5);
        }
      });
      const depths = await items(page).locator("[data-service-card]").evaluateAll((elements) =>
        elements.map((element) => Number(element.style.getPropertyValue("--service-stack-depth")))
      );
      expect(depths).toEqual([0, 0, 0, 0]);
    });
  }

  test("covered cards overlap and recede from 1 to 0.95 at 390x844, reversing on the way up", async ({ page }) => {
    await open(page, { width: 390, height: 844 });
    const { listTop } = await stackGeometry(page);
    const start = (await scrollPosition(page)) + listTop - 400;
    const samples: { y: number; scale: number; overlap: number; nextTop: number; header: number }[] = [];
    const sample = async (y: number) => {
      await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
      await settle(page);
      const { cards, header } = await stackGeometry(page);
      const scale = await items(page).first().locator("[data-service-card]").evaluate((card) => {
        const transform = getComputedStyle(card).transform;
        return transform === "none" ? 1 : new DOMMatrix(transform).a;
      });
      return { y, scale, overlap: cards[0].rectBottom - cards[1].rectTop, nextTop: cards[1].rectTop, header };
    };
    for (let y = start; y <= start + 1600; y += 40) samples.push(await sample(y));

    // Card 02 visibly rises over card 01 while both are in view.
    expect(samples.some((s) => s.overlap > 100 && s.nextTop > s.header + 100)).toBe(true);
    for (const [i, s] of samples.entries()) {
      // Untouched until the overlap begins, then never larger, never below 0.95.
      if (s.overlap <= 0) expect(s.scale).toBe(1);
      if (i > 0) expect(s.scale).toBeLessThanOrEqual(samples[i - 1].scale + 1e-6);
      expect(s.scale).toBeGreaterThanOrEqual(0.95 - 1e-3);
    }
    expect(samples[samples.length - 1].scale).toBeCloseTo(0.95, 3);
    const scales = new Set(samples.map((s) => s.scale.toFixed(3)));
    expect(scales.size).toBeGreaterThan(8); // continuous, not a jump

    // Scrolling back up reverses the same path.
    for (const s of [...samples].reverse()) {
      const back = await sample(s.y);
      expect(Math.abs(back.scale - s.scale)).toBeLessThanOrEqual(1e-3);
    }
  });

  test("rotation re-measures: landscape falls back, portrait stacks again", async ({ page }) => {
    await open(page, { width: 390, height: 844 });
    await expect(stack(page)).toHaveAttribute("data-stack", "on");
    // Mid-stack in portrait.
    const { listTop } = await stackGeometry(page);
    await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), (await scrollPosition(page)) + listTop + 900);
    await settle(page);

    await page.setViewportSize({ width: 844, height: 390 });
    await expect(stack(page)).toHaveAttribute("data-stack", "off");
    await expectNormalFlow(page);

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(stack(page)).toHaveAttribute("data-stack", "on");
    const { cards, pinLine } = await stackGeometry(page);
    for (const card of cards) expect(card.top + card.height).toBeLessThanOrEqual(pinLine + 1);
    // Still inside the Services section after both rotations.
    const section = await page.locator("section#services").evaluate((s) => s.getBoundingClientRect());
    expect(section.top).toBeLessThan(0);
    expect(section.bottom).toBeGreaterThan(844);
    expect(await unreachableContent(page)).toEqual([]);
  });

  test("tablet rotation to 1024x768 uses the desktop rule, then stacks again", async ({ page }) => {
    await open(page, { width: 768, height: 1024 });
    await expect(stack(page)).toHaveAttribute("data-stack", "on");
    await page.setViewportSize({ width: 1024, height: 768 });
    await expect(stack(page)).toHaveAttribute("data-stack", "off");
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(stack(page)).toHaveAttribute("data-stack", "on");
  });

  test("enlarged text is re-measured without a resize and stays fully reachable (390px)", async ({ page }) => {
    await open(page, { width: 390, height: 844 });
    await expect(stack(page)).toHaveAttribute("data-stack", "on");
    const before = await stackGeometry(page);
    await page.addStyleTag({
      content: "[data-service-card] li, [data-service-card] p { font-size: 22px !important; line-height: 34px !important; }",
    });
    // The card ResizeObserver re-measures; no resize event is dispatched. With
    // stale offsets the taller cards would end below the pin line.
    await expect
      .poll(async () => {
        const { cards, pinLine } = await stackGeometry(page);
        return (
          cards[1].height > before.cards[1].height + 50 &&
          cards.every((card) => card.top + card.height <= pinLine + 1)
        );
      })
      .toBe(true);
    const clipped = await page.locator("[data-service-card]").evaluateAll((cards) =>
      cards.some((card) => card.scrollHeight > card.clientHeight + 1)
    );
    expect(clipped).toBe(false);
    expect(await unreachableContent(page)).toEqual([]);
  });

  test("CTAs open the development notice for each category on touch (390px)", async ({ page }) => {
    await open(page, { width: 390, height: 844 });
    const url = page.url();
    for (const category of categories) {
      const cta = page.getByRole("button", { name: category.cta.label });
      // Just above the viewport bottom: before the card pins or is covered.
      await cta.evaluate((element) => {
        element.scrollIntoView({ block: "end", behavior: "instant" });
        window.scrollBy({ top: 8, behavior: "instant" });
      });
      await settle(page);
      expect(await isUnobscured(cta)).toBe(true);
      await cta.tap();
      const dialog = page.getByRole("dialog", {
        name: `Development Preview: ${category.cta.destinationName}`,
      });
      await expect(dialog).toBeVisible();
      await expect(dialog).toContainText(category.cta.href);
      await dialog.getByRole("button", { name: "Understood" }).tap();
      await expect(page.getByRole("dialog")).toHaveCount(0);
      expect(page.url()).toBe(url);
    }
    // Touch targets keep the 52px control height (layout size, before any recede scale).
    const heights = await page.locator("[data-service-card] button").evaluateAll((buttons) =>
      buttons.map((button) => (button as HTMLElement).offsetHeight)
    );
    for (const height of heights) expect(height).toBeGreaterThanOrEqual(52);
  });
});

test.describe("touch scrolling on desktop", () => {
  test.use({ hasTouch: true });

  test("passes through the stack in both directions at 1440px", async ({ page }) => {
    await open(page, { width: 1440, height: 900 });
    await page.locator("section#services").evaluate((s) =>
      window.scrollTo(0, s.getBoundingClientRect().top + window.scrollY)
    );
    await waitForScrollRest(page);
    const start = await scrollPosition(page);
    await touchDrag(page, 750, 250, "swipe");
    await waitForScrollRest(page);
    const down = await scrollPosition(page);
    expect(down - start).toBeGreaterThan(300);
    await touchDrag(page, 250, 750, "swipe");
    await waitForScrollRest(page);
    expect(down - (await scrollPosition(page))).toBeGreaterThan(300);
  });
});

test.describe("normal-flow fallbacks", () => {
  const VIEWPORTS = [
    { name: "laptop 1024x768 (tallest card does not fit; desktop never pins tall cards)", width: 1024, height: 768 },
    { name: "short desktop 1440x620", width: 1440, height: 620 },
    // Visible stacking window (viewport - header - gap - bottom) below 400px.
    { name: "phone landscape 844x390 (265px window)", width: 844, height: 390 },
    { name: "phone landscape 667x375 (266px window)", width: 667, height: 375 },
  ];

  for (const viewport of VIEWPORTS) {
    test(`cards flow without overlap: ${viewport.name}`, async ({ page }) => {
      await open(page, viewport);
      await expectNormalFlow(page);
      for (const category of categories) {
        const card = page.getByRole("article", { name: category.title, exact: true });
        await card.scrollIntoViewIfNeeded();
        for (const item of await card.getByRole("listitem").all()) await expect(item).toBeVisible();
        const cta = card.getByRole("button", { name: category.cta.label });
        await cta.evaluate((element) => element.scrollIntoView({ block: "center", behavior: "instant" }));
        await expect(cta).toBeInViewport({ ratio: 1 });
      }
    });
  }

  test("cards flow at 200% zoom (1440x900 at 2x, 341px window)", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 720, height: 450 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    await open(page, { width: 720, height: 450 });
    await expectNormalFlow(page);
    await context.close();
  });

  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    test(`cards flow with reduced motion at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await open(page, viewport);
      await expectNormalFlow(page);
    });
  }

  test("the desktop stack turns off when enlarged text no longer fits", async ({ page }) => {
    await open(page, { width: 1440, height: 900 });
    await expect(stack(page)).toHaveAttribute("data-stack", "on");
    await page.addStyleTag({
      content: "[data-service-card] li, [data-service-card] p { font-size: 32px !important; line-height: 44px !important; }",
    });
    await page.evaluate(() => window.dispatchEvent(new Event("resize")));
    await expectNormalFlow(page);
  });

  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    test(`all content is available without JavaScript at ${viewport.width}x${viewport.height}`, async ({ browser }) => {
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();
      await page.setViewportSize(viewport);
      await page.goto("/");
      await expectNormalFlow(page);
      const section = page.locator("section#services");
      await expect(section.getByRole("heading", { level: 3 })).toHaveText(
        categories.map((category) => category.title)
      );
      for (const item of await section.locator("article li").all()) await expect(item).toBeVisible();
      await context.close();
    });
  }
});
