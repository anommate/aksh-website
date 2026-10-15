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

// Height of the end-of-page spacer inside the stack (0 when there is none).
async function stackSpacer(page: Page) {
  return stack(page).evaluate((list) => {
    const spacer = getComputedStyle(list, "::after");
    return spacer.content === "none" ? 0 : Number.parseFloat(spacer.height);
  });
}

// Scrolls to the exact point where card 04's natural top reaches its sticky
// top: the moment the whole stack has settled, just before it leaves.
async function scrollToSettlePoint(page: Page) {
  await stack(page).evaluate((list) => {
    const cards = [...list.children] as HTMLElement[];
    const gap = Number.parseFloat(getComputedStyle(list).rowGap);
    const naturalTop =
      list.getBoundingClientRect().top +
      cards.slice(0, 3).reduce((sum, card) => sum + card.getBoundingClientRect().height + gap, 0);
    const stickyTop = Number.parseFloat(getComputedStyle(cards[3]).top);
    window.scrollBy({ top: naturalTop - stickyTop, behavior: "instant" });
  });
  await settle(page);
}

// Distance from card 04's bottom to the top of the consultant section.
async function gapBelowStack(page: Page) {
  return page.evaluate(() => {
    const last = document.querySelector("[data-service-stack-item]:last-child")!;
    const next = document.querySelector("#meet-our-consultant")!;
    return Math.round(next.getBoundingClientRect().top - last.getBoundingClientRect().bottom);
  });
}

// No stuck or leaving card ever reaches into the consultant section.
async function expectStackClearOfConsultant(page: Page) {
  const { bottoms, next } = await page.evaluate(() => ({
    bottoms: [...document.querySelectorAll("[data-service-stack-item]")].map(
      (item) => item.getBoundingClientRect().bottom
    ),
    next: document.querySelector("#meet-our-consultant")!.getBoundingClientRect().top,
  }));
  for (const bottom of bottoms) expect(bottom).toBeLessThanOrEqual(next);
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

  // Artwork: up to 640px, the container width below. Gap: from the lettering
  // (not the file's transparent margin) to the eyebrow, --space-intro-content.
  const MASTHEAD_VIEWPORTS = [
    { width: 1440, height: 900, artwork: 640, gap: 40, cards: 40 },
    { width: 1366, height: 768, artwork: 640, gap: 40, cards: 40 },
    { width: 768, height: 1024, artwork: 640, gap: 32, cards: 32 },
    { width: 390, height: 844, artwork: 350, gap: 28, cards: 28 },
    { width: 320, height: 568, artwork: 288, gap: 28, cards: 28 },
  ];
  const { ink } = servicesContent.artwork;
  const inkRows = { top: ink.top / servicesContent.artwork.height, bottom: (ink.bottom + 1) / servicesContent.artwork.height };

  for (const viewport of MASTHEAD_VIEWPORTS) {
    test(`masthead artwork is whole, proportional and compact at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await open(page, viewport, "/#services");
      const artwork = page.locator("section#services").getByRole("img", { name: "Our Services" });
      await artwork.evaluate((img: HTMLImageElement) => img.decode());

      const geometry = await artwork.evaluate((img: HTMLImageElement, rows) => {
        const rect = img.getBoundingClientRect();
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
          // Whole and uncropped: nothing above the image clips it.
          clipped: (() => {
            for (let el: Element | null = img.parentElement; el; el = el.parentElement) {
              const style = getComputedStyle(el);
              if (style.overflowY !== "visible" || style.clipPath !== "none") return el.tagName;
            }
            return null;
          })(),
          // The lettering starts at the section top; its transparent margin overlaps the gap above.
          inkTopOffset: rect.top + rect.height * rows.top - section.getBoundingClientRect().top,
          gapToIntroduction: eyebrow.top - (rect.top + rect.height * rows.bottom),
          boxHeight: img.closest("[data-services-wordmark]")!.getBoundingClientRect().height,
          src: img.getAttribute("src"),
          introToCards: list.getBoundingClientRect().top - eyebrow.bottom,
          surfaces,
        };
      }, inkRows);

      // The supplied file itself, at its intrinsic size and proportions.
      expect(geometry.src).toBe(servicesContent.artwork.src);
      expect(geometry.intrinsic).toEqual([servicesContent.artwork.width, servicesContent.artwork.height]);
      const ratio = servicesContent.artwork.height / servicesContent.artwork.width;
      expect(Math.abs(geometry.naturalRatio - ratio)).toBeLessThanOrEqual(0.005);
      expect(Math.abs(geometry.width - viewport.artwork)).toBeLessThanOrEqual(0.5);
      expect(Math.abs(geometry.height - geometry.width * ratio)).toBeLessThanOrEqual(1);
      expect(geometry.fit).toBe("contain");
      expect(Math.abs(geometry.centreOffset)).toBeLessThanOrEqual(0.5);
      expect(geometry.insideContainer).toBe(true);
      expect(geometry.clipped).toBeNull();
      expect(Math.abs(geometry.inkTopOffset)).toBeLessThanOrEqual(1);
      // The box is rounded to a whole pixel: up to half a pixel either way, plus measuring error.
      expect(Math.abs(geometry.gapToIntroduction - viewport.gap)).toBeLessThanOrEqual(0.75);
      expect(geometry.boxHeight % 1).toBe(0);
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

  test("#services lands 24px below the sticky header, the wordmark lettering fully visible", async ({ page }) => {
    for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
      await open(page, viewport, "/#services");
      await settle(page);
      const top = await page.locator("section#services").evaluate((s) => s.getBoundingClientRect().top);
      expect(Math.abs(top - (await headerBottom(page)) - 24)).toBeLessThanOrEqual(1);
      // The lettering rows; the file's transparent margin above them may sit under the header.
      const lettering = await page.getByRole("img", { name: "Our Services" }).evaluate((img, rows) => {
        const rect = img.getBoundingClientRect();
        return { top: rect.top + rect.height * rows.top, bottom: rect.top + rect.height * rows.bottom };
      }, inkRows);
      expect(lettering.top).toBeGreaterThanOrEqual((await headerBottom(page)) - 0.5);
      expect(lettering.bottom).toBeLessThanOrEqual(viewport.height);
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
    // Up to 80 wheel steps: from Services to the end of the homepage (which grows as sections are added).

    for (let step = 0; step < 80 && previousY < maxScroll; step++) {
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

    for (let step = 0; step < 80 && previousY > start; step++) {
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
    test(`card 04 settles, then the stack exits cleanly into the consultant section at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await open(page, viewport, "/#services");
      const header = await headerBottom(page);
      const stickyTops = [0, 1, 2, 3].map((index) => header + STACK_GAP + index * STACK_STEP);

      // A real section follows, so no end-of-page spacer is added.
      expect(await stackSpacer(page)).toBe(0);

      // At the settle point every card rests at its sticky offset.
      await scrollToSettlePoint(page);
      for (const [index, top] of (await itemTops(page)).entries()) {
        expect(Math.abs(top - stickyTops[index])).toBeLessThanOrEqual(0.5);
      }
      const depth = await items(page).first().locator("[data-service-card]").evaluate((card) =>
        Number(card.style.getPropertyValue("--service-stack-depth"))
      );
      expect(depth).toBeCloseTo(3, 3);
      expect(await isUnobscured(page.getByRole("button", { name: "Explore Skin" }))).toBe(true);
      // Only the band's inset and the section gap separate card 04 from the
      // consultant section: no extra blank band.
      expect(await gapBelowStack(page)).toBe(64 + 90);

      // Real wheel scrolling: the last card moves 1:1 with the page, the
      // covered cards fold in behind it, and no card covers the next section.
      await page.mouse.move(viewport.width / 2, viewport.height / 2);
      let previousLastTop = stickyTops[3];
      for (let step = 0; step < 20; step++) {
        await page.mouse.wheel(0, 120);
        await settle(page);
        const tops = await itemTops(page);
        expect(Math.abs(previousLastTop - tops[3] - 120)).toBeLessThanOrEqual(0.5);
        previousLastTop = tops[3];
        for (const [index, top] of tops.entries()) {
          if (index > 0) expect(top).toBeGreaterThanOrEqual(tops[index - 1] - 0.5);
          expect(top).toBeLessThanOrEqual(tops[3] + 0.5);
        }
        await expectStackClearOfConsultant(page);
        const bottoms = await items(page).evaluateAll((elements) =>
          elements.map((element) => element.getBoundingClientRect().bottom)
        );
        if (bottoms[3] < header) break;
      }
      const bottoms = await items(page).evaluateAll((elements) =>
        elements.map((element) => element.getBoundingClientRect().bottom)
      );
      for (const bottom of bottoms) expect(bottom).toBeLessThan(header);
      await expect(page.getByRole("heading", { level: 2, name: "Dr. Priyanka Masharkar" })).toBeInViewport();
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
      await expectKeyboardExposure(page);
    });
  }
});

async function expectKeyboardExposure(page: Page) {
  await page.getByRole("button", { name: "Discover AKSH" }).focus();

  for (const category of categories) {
    await page.keyboard.press("Tab");
    const cta = page.getByRole("button", { name: category.cta.label });
    await expect(cta).toBeFocused();
    await settle(page);
    expect(await isUnobscured(cta)).toBe(true);
    expect(await cta.evaluate((e) => getComputedStyle(e).outlineStyle)).toBe("solid");
  }

  // At the settle point, earlier CTAs sit beneath later cards.
  await scrollToSettlePoint(page);
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
  { width: 390, height: 844, restsOnPinLine: true, gapBelow: 32 + 56 },
  { width: 360, height: 800, restsOnPinLine: true, gapBelow: 32 + 56 },
  { width: 320, height: 568, restsOnPinLine: true, gapBelow: 32 + 56 },
  // Tablet portrait: every card fits, so the stack settles at the top.
  { width: 768, height: 1024, restsOnPinLine: false, gapBelow: 48 + 72 },
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

    test(`card 04 settles, then the stack hands over cleanly to the consultant section at ${size}`, async ({ page }) => {
      await open(page, viewport, "/#services");
      await expect(stack(page)).toHaveAttribute("data-stack", "on");
      // A real section follows, so no end-of-page spacer is added.
      expect(await stackSpacer(page)).toBe(0);

      // At the settle point every card rests at its own sticky top.
      await scrollToSettlePoint(page);
      const { cards, pinLine } = await stackGeometry(page);
      for (const card of cards) expect(Math.abs(card.rectTop - card.top)).toBeLessThanOrEqual(0.5);
      expect(cards[3].rectBottom).toBeLessThanOrEqual(pinLine + 1);
      if (viewport.restsOnPinLine) expect(Math.abs(cards[3].rectBottom - pinLine)).toBeLessThanOrEqual(1);
      expect(await isUnobscured(page.getByRole("button", { name: "Explore Skin" }))).toBe(true);
      // Only the band's inset and the section gap lie between card 04 and the
      // consultant section: no extra blank band.
      expect(await gapBelowStack(page)).toBe(viewport.gapBelow);

      // A momentum flick, then slow swipes onwards: the stack leaves and no
      // card ever reaches into the consultant section.
      const low = viewport.height - 120;
      const high = Math.max(140, low - 300);
      await touchDrag(page, low, low - 200, "flick");
      await waitForScrollRest(page);
      await expectStackClearOfConsultant(page);
      // If momentum carried past the section, come back to just above it.
      await page.evaluate(() => {
        const next = document.querySelector("#meet-our-consultant")!.getBoundingClientRect().top;
        if (next < 0) window.scrollBy({ top: next - window.innerHeight, behavior: "instant" });
      });
      for (let swipe = 0; swipe < 30; swipe++) {
        const top = await page.locator("#meet-our-consultant").evaluate((s) => s.getBoundingClientRect().top);
        if (top < viewport.height * 0.6) break;
        await touchDrag(page, low, high, "swipe");
        await waitForScrollRest(page);
        await expectStackClearOfConsultant(page);
      }
      await expect(page.getByRole("heading", { level: 2, name: "Dr. Priyanka Masharkar" })).toBeInViewport();
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

test.describe("services progress line", () => {
  const progress = (page: Page) => page.locator("section#services [data-service-progress]");
  const value = (page: Page) =>
    progress(page).evaluate((el) => Number.parseFloat((el as HTMLElement).style.getPropertyValue("--service-progress")));
  const scrollTo = async (page: Page, top: number) => {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), top);
    await settle(page);
    // The update runs in the next animation frame.
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  };
  // Where the first card's top meets the reading line (the line's sticky top).
  const startPoint = (page: Page) =>
    page.evaluate(() => {
      const list = document.querySelector("section#services ol")!;
      const reading = Number.parseFloat(getComputedStyle(document.querySelector("[data-service-progress]")!).top);
      return list.getBoundingClientRect().top + window.scrollY - reading;
    });
  // The line's geometry against the header and the first card's sticky top.
  const lineGeometry = (page: Page) =>
    progress(page).evaluate((el) => {
      const box = (selector: string) => el.querySelector(selector)!.getBoundingClientRect();
      const track = box("[data-service-progress-track]");
      const band = box("[data-service-progress-band]");
      const container = el.closest(".aksh-container")!.getBoundingClientRect();
      return {
        header: document.querySelector("header")!.getBoundingClientRect().bottom,
        reading: Number.parseFloat(getComputedStyle(el).top),
        track: { top: track.top, bottom: track.bottom, left: track.left, width: track.width, height: track.height },
        band: { top: band.top, bottom: band.bottom },
        container: { left: container.left, width: container.width },
        colours: [
          getComputedStyle(el.querySelector("[data-service-progress-track]")!).backgroundColor,
          getComputedStyle(el.querySelector("[data-service-progress-fill]")!).backgroundColor,
        ],
      };
    });

  const VIEWPORTS = [
    { width: 1440, height: 900, mode: "fit" },
    { width: 768, height: 1024, mode: "tall" },
    { width: 390, height: 844, mode: "tall" },
    { width: 320, height: 568, mode: "tall" },
  ];

  for (const viewport of VIEWPORTS) {
    test(`fills from the first card's reading position to the last card settling, and reverses, at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      test.setTimeout(90_000);
      await open(page, viewport);
      await expect(stack(page)).toHaveAttribute("data-stack", "on");
      const line = progress(page);
      await expect(line).toHaveAttribute("aria-hidden", "true");
      await expect(line).not.toHaveAttribute("hidden", /.*/);
      await expect(line).toHaveCSS("pointer-events", "none");
      await expect(line).toHaveCSS("height", "0px");

      // Elsewhere on the page: empty above the stack.
      await scrollTo(page, 0);
      expect(await value(page)).toBe(0);
      const start = await startPoint(page);
      await scrollTo(page, start - 40);
      expect(await value(page)).toBe(0);

      // Stuck: a thin stone track with a red fill, across the content width,
      // between the header and the first card's sticky top, never over either.
      await scrollTo(page, start + 200);
      const g = await lineGeometry(page);
      expect(g.colours).toEqual(["rgb(228, 222, 211)", "rgb(255, 0, 0)"]);
      expect(g.track.height).toBe(2);
      expect(g.track.left).toBeCloseTo(g.container.left, 0);
      expect(g.track.width).toBeCloseTo(g.container.width, 0);
      expect(g.band.top).toBeCloseTo(g.header, 0);
      expect(g.band.bottom).toBeCloseTo(g.reading, 0);
      expect(g.track.top).toBeGreaterThan(g.header + 2);
      expect(g.track.bottom).toBeLessThan(g.reading - 2);
      if (viewport.mode === "fit") {
        const firstCard = await items(page).first().evaluate((el) => el.getBoundingClientRect().top);
        expect(firstCard).toBeCloseTo(g.reading, 0);
      }

      // Forward: rises steadily to exactly 1 when the last card settles.
      await scrollToSettlePoint(page);
      const end = await scrollPosition(page);
      expect(await value(page)).toBeCloseTo(1, 2);
      const positions = Array.from({ length: 9 }, (_, i) => Math.round(start + ((end - start) * (i + 1)) / 10));
      const forward: number[] = [];
      for (const y of positions) {
        await scrollTo(page, y);
        forward.push(await value(page));
      }
      for (let i = 1; i < forward.length; i++) expect(forward[i]).toBeGreaterThan(forward[i - 1]);
      expect(forward[0]).toBeGreaterThan(0);
      expect(forward.at(-1)!).toBeLessThan(1);
      expect(forward[4]).toBeCloseTo(0.5, 1);

      // Past the stack: full, and the line leaves with the section.
      await scrollTo(page, end + viewport.height * 2);
      expect(await value(page)).toBe(1);
      const after = await lineGeometry(page);
      expect(after.track.bottom).toBeLessThan(after.header);

      // Reverse: the same value at each position on the way back up.
      const backward: number[] = [];
      for (const y of [...positions].reverse()) {
        await scrollTo(page, y);
        backward.push(await value(page));
      }
      expect(backward.reverse()).toEqual(forward);
      await scrollTo(page, start - 40);
      expect(await value(page)).toBe(0);

      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
    });
  }

  test("tall cards scroll beneath the line's band, never over the line (320x568)", async ({ page }) => {
    await open(page, { width: 320, height: 568 });
    const start = await startPoint(page);
    for (const offset of [300, 900, 1500]) {
      await scrollTo(page, start + offset);
      // Directly at the line, the line itself is the hit target: no card
      // content shows over it.
      // Hit-testing skips pointer-events: none, so enable it just to read the
      // painting order, then restore it.
      const hit = await progress(page).evaluate((el) => {
        const marker = el as HTMLElement;
        marker.style.pointerEvents = "auto";
        for (const child of marker.querySelectorAll<HTMLElement>("*")) child.style.pointerEvents = "auto";
        const track = el.querySelector("[data-service-progress-track]")!.getBoundingClientRect();
        const band = el.querySelector("[data-service-progress-band]")!.getBoundingClientRect();
        const atLine = document.elementFromPoint(track.left + track.width / 2, track.top + track.height / 2);
        const atBand = document.elementFromPoint(band.left + band.width / 2, band.top + 1);
        marker.style.removeProperty("pointer-events");
        for (const child of marker.querySelectorAll<HTMLElement>("*")) child.style.removeProperty("pointer-events");
        return atLine !== null && el.contains(atLine) && atBand !== null && el.contains(atBand);
      });
      expect(hit).toBe(true);
    }
  });

  test("resizing re-measures: the line still runs 0 to 1 after rotating", async ({ page }) => {
    test.setTimeout(60_000);
    await open(page, { width: 390, height: 844 });
    await scrollTo(page, (await startPoint(page)) + 500);
    expect(await value(page)).toBeGreaterThan(0);
    // Landscape: the stack falls back to normal flow; the line follows natural positions.
    await page.setViewportSize({ width: 844, height: 390 });
    await expect(stack(page)).toHaveAttribute("data-stack", "off");
    await scrollTo(page, 0);
    expect(await value(page)).toBe(0);
    await scrollTo(page, (await startPoint(page)) + 300);
    const middle = await value(page);
    expect(middle).toBeGreaterThan(0);
    expect(middle).toBeLessThan(1);
    await page.evaluate(() => document.querySelector("#meet-our-consultant")!.scrollIntoView({ behavior: "instant" }));
    await scrollTo(page, await scrollPosition(page));
    expect(await value(page)).toBe(1);
    // And back to portrait: stacked again, from empty.
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(stack(page)).toHaveAttribute("data-stack", "on");
    await scrollTo(page, 0);
    expect(await value(page)).toBe(0);
  });

  test("reduced motion: exact progress in normal flow, without smoothing", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page, { width: 1440, height: 900 });
    await expectNormalFlow(page);
    const fill = progress(page).locator("[data-service-progress-fill]");
    expect(Number.parseFloat(await fill.evaluate((el) => getComputedStyle(el).transitionDuration))).toBeLessThan(0.001);
    const start = await startPoint(page);
    // Normal flow: from the first card's top to the last card's top at the reading line.
    const end = await page.evaluate(() => {
      const last = document.querySelector("[data-service-stack-item]:last-child")!;
      const reading = Number.parseFloat(getComputedStyle(document.querySelector("[data-service-progress]")!).top);
      return last.getBoundingClientRect().top + window.scrollY - reading;
    });
    for (const fraction of [0.25, 0.5, 0.75]) {
      await scrollTo(page, Math.round(start + (end - start) * fraction));
      expect(await value(page)).toBeCloseTo(fraction, 2);
      // The fill shows it at once.
      const scale = await fill.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);
      expect(scale).toBeCloseTo(fraction, 2);
    }
  });

  test("without JavaScript the decorative line is absent", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    await expect(progress(page)).toHaveAttribute("hidden", "");
    await expect(progress(page)).toBeHidden();
    await context.close();
  });
});
