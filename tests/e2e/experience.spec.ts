import { expect, test, type Page } from "@playwright/test";
import { consultantContent } from "../../src/content/consultant";
import { experienceContent } from "../../src/content/experience";

/*
 * Homepage "The AKSH Experience" section (#experience):
 * - Order: Hero → About → Services → Meet Our Consultant → The AKSH Experience,
 *   with the shared section gap between the consultant and this section
 * - Exact owner-supplied copy: H2 heading, italic tagline, five ordered steps
 *   with H3 titles, bold closing line, Begin Your Journey CTA
 * - Vertical timeline below 1280px, five cards in one row from 1280px; dots
 *   level with each step number (vertical) or centred over each card (row)
 * - Illustrations: decorative, fixed boxes (no layout shift), loaded as they
 *   near view, revealed once then looping continuously, paused off screen,
 *   in hidden tabs and by the one Pause/Resume animations control (a manual
 *   pause holds when scrolling back), resumed without new players; static
 *   SVG under reduced motion (no control), without JavaScript and when
 *   loading fails
 * - Navigation: Our Experience (desktop and drawer) and the old /experience
 *   route land on #experience 24px below the sticky header
 * - CTA reuses the Book a Consultation development notice
 * - No horizontal overflow and no external requests
 */

const { id, artwork, heading, tagline, steps, closing, cta } = experienceContent;
const section = (page: Page) => page.locator(`section#${id}`);
const illustrations = (page: Page) => section(page).locator("[data-journey-illustration]");
const states = (page: Page) =>
  illustrations(page).evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.state));
const allInState = (page: Page, state: string) =>
  page.waitForFunction(
    (wanted) =>
      [...document.querySelectorAll<HTMLElement>("[data-journey-illustration]")].every((e) => e.dataset.state === wanted),
    state
  );
const overflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

async function open(page: Page, width: number, height: number) {
  await page.setViewportSize({ width, height });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
}

/** Scrolls the whole journey (wide rows) or one step's illustration into the middle of the view. */
async function reveal(page: Page, selector = "[data-journey]") {
  await section(page)
    .locator(selector)
    .evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
}

/** Distance from the bottom of the sticky header to the top of the section. */
const landing = (page: Page) =>
  page.evaluate(
    (sectionId) =>
      document.getElementById(sectionId)!.getBoundingClientRect().top -
      document.querySelector("header")!.getBoundingClientRect().bottom,
    id
  );

/**
 * The section sits 24px below the header or, when the page ends first (the
 * compact section is the last one, shorter than a tall desktop view), as
 * close as the end of the page allows.
 */
async function expectLanded(page: Page) {
  await expect
    .poll(() =>
      page.evaluate((sectionId) => {
        const top =
          document.getElementById(sectionId)!.getBoundingClientRect().top -
          document.querySelector("header")!.getBoundingClientRect().bottom;
        const atEnd = Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight;
        return Math.abs(top - 24) < 0.5 || (atEnd && top > 24);
      }, id)
    )
    .toBe(true);
}

const VIEWPORTS = [
  { width: 1440, height: 900, layout: "row", art: 72, gap: 90 },
  { width: 1280, height: 800, layout: "row", art: 72, gap: 90 },
  { width: 1024, height: 768, layout: "vertical", art: 96, gap: 90 },
  { width: 768, height: 1024, layout: "vertical", art: 96, gap: 72 },
  { width: 390, height: 844, layout: "vertical", art: 80, gap: 56 },
  { width: 320, height: 568, layout: "vertical", art: 80, gap: 56 },
] as const;

type Box = { top: number; bottom: number; left: number; right: number; width: number; height: number };

function measure(page: Page) {
  return section(page).evaluate((s) => {
    const box = (el: Element): Box => {
      const r = el.getBoundingClientRect();
      return {
        top: r.top + window.scrollY,
        bottom: r.bottom + window.scrollY,
        left: r.left,
        right: r.right,
        width: r.width,
        height: r.height,
      };
    };
    const consultant = document.getElementById("meet-our-consultant")!;
    return {
      gap: box(s).top - box(consultant).bottom,
      steps: [...s.querySelectorAll("[data-journey] > [data-journey-step]")].map((step) => {
        const card = step.querySelector(":scope > div")!;
        const title = card.querySelector("h3")!;
        const description = card.querySelector("h3 + p")!;
        return {
          card: box(card),
          dot: box(step.querySelector("[data-journey-dot]")!),
          number: box(card.querySelector("p")!),
          art: box(card.querySelector("[data-journey-illustration]")!),
          title: box(title),
          description: box(description),
          clipped: [title, description].some((el) => el.scrollWidth > el.clientWidth + 0.5),
        };
      }),
    };
  });
}

test("homepage order ends Meet Our Consultant → The AKSH Experience", async ({ page }) => {
  await open(page, 1440, 900);
  const order = await page.evaluate(() =>
    [...document.querySelectorAll("main > section")].map((s) => ({
      id: s.id,
      hasH1: !!s.querySelector("h1"),
    }))
  );
  const ids = order.map((s) => s.id);
  expect(order[0].hasH1).toBe(true); // Hero
  expect(ids.indexOf("about-aksh")).toBe(1);
  expect(ids.indexOf("services")).toBe(2);
  expect(ids.indexOf(consultantContent.id)).toBe(3);
  expect(ids.indexOf(id)).toBe(4);
  // Then the Client Experiences samples (development and preview only),
  // streamed in after the rest of the page.
  await expect(page.locator("main > section").nth(5)).toHaveAttribute("id", "client-experiences");
  // Then the FAQ (every mode).
  await expect(page.locator("main > section").nth(6)).toHaveAttribute("id", "faq");
  await expect(page.locator("main > section")).toHaveCount(7);
});

test("renders the exact copy with H2, H3 step titles and a bold closing line", async ({ page }) => {
  await open(page, 1440, 900);
  const experience = section(page);

  // The wordmark artwork labels the section; the typed label is gone.
  const masthead = experience.getByRole("img", { name: artwork.alt });
  await expect(masthead).toBeVisible();
  await expect(experience.getByText("THE AKSH EXPERIENCE", { exact: true })).toHaveCount(0);
  await expect(experience.locator(":scope > .aksh-container > div:first-child > :first-child")).toHaveAttribute("alt", artwork.alt);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(experience.getByRole("heading", { level: 2 })).toHaveText(heading);
  await expect(experience).toHaveAttribute("aria-labelledby", "experience-heading");
  const taglineText = experience.getByText(tagline, { exact: true });
  await expect(taglineText).toBeVisible();
  expect(await taglineText.evaluate((e) => getComputedStyle(e).fontStyle)).toBe("italic");

  const items = experience.locator("ol > li");
  await expect(items).toHaveCount(steps.length);
  await expect(experience.getByRole("heading", { level: 3 })).toHaveText(steps.map((step) => step.title));
  await expect(experience.getByRole("heading")).toHaveCount(1 + steps.length);
  for (const [i, step] of steps.entries()) {
    await expect(items.nth(i)).toContainText(step.number);
    await expect(items.nth(i).getByText(step.description, { exact: true })).toBeVisible();
  }

  const strong = experience.locator("strong");
  await expect(strong).toHaveText(closing);
  expect(Number(await strong.evaluate((e) => getComputedStyle(e).fontWeight))).toBeGreaterThanOrEqual(600);

  await expect(experience.getByRole("button", { name: cta.label })).toHaveText(`${cta.label}→`);
  // Copy only as supplied: no contact details are published.
  await expect(experience).not.toContainText(/\+?\d[\d\s-]{7,}\d/);
  await expect(experience.locator("a[href^='tel:'], a[href*='wa.me']")).toHaveCount(0);
});

/** The wordmark's box, its container, and the gap from its lettering to the H2. */
async function measureMasthead(page: Page) {
  const image = section(page).getByRole("img", { name: artwork.alt });
  await image.scrollIntoViewIfNeeded();
  await image.evaluate((img: HTMLImageElement) => img.decode());
  return image.evaluate((img: HTMLImageElement, margin) => {
    const rect = img.getBoundingClientRect();
    const container = img.closest(".aksh-container")!.getBoundingClientRect();
    const parent = img.parentElement!.getBoundingClientRect();
    const heading = img.parentElement!.querySelector("h2")!.getBoundingClientRect();
    return {
      left: rect.left,
      right: rect.right,
      width: rect.width,
      ratio: rect.height / rect.width,
      naturalRatio: img.naturalHeight / img.naturalWidth,
      fit: getComputedStyle(img).objectFit,
      centreOffset: rect.left + rect.width / 2 - (container.left + container.width / 2),
      containerWidth: container.width,
      insideParent: rect.left >= parent.left - 0.5 && rect.right <= parent.right + 0.5 && rect.top >= parent.top - 0.5,
      boxGap: heading.top - rect.bottom,
      // The artwork keeps a 28px margin (of 261px) below its lettering.
      letteringGap: heading.top - (rect.bottom - rect.height * margin),
    };
  }, 28 / artwork.height);
}

const MASTHEAD_SIZES = [
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
  { width: 320, height: 568 },
];

for (const viewport of MASTHEAD_SIZES) {
  test(`masthead is whole, centred, proportional and 24-32px above the H2 at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await open(page, viewport.width, viewport.height);
    const m = await measureMasthead(page);
    expect(Math.abs(m.centreOffset)).toBeLessThanOrEqual(0.5);
    expect(Math.abs(m.width - Math.min(640, m.containerWidth))).toBeLessThanOrEqual(0.5);
    expect(Math.abs(m.ratio - artwork.height / artwork.width)).toBeLessThanOrEqual(0.003);
    expect(Math.abs(m.naturalRatio - artwork.height / artwork.width)).toBeLessThanOrEqual(0.003);
    expect(m.fit).toBe("contain");
    expect(m.insideParent).toBe(true);
    expect(m.letteringGap).toBeGreaterThanOrEqual(24 - 0.5);
    expect(m.letteringGap).toBeLessThanOrEqual(32 + 0.5);
    expect(await overflow(page)).toBe(0);
  });
}

// Desktop: after #experience the whole section shows below the real header.
for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1366, height: 768 },
  { width: 1280, height: 800 },
]) {
  test(`the whole section fits one view below the header after #experience at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto(`/#${id}`);
    await page.evaluate(() => document.fonts.ready);
    await expectLanded(page);

    const fit = await section(page).evaluate((s) => {
      const header = document.querySelector("header")!.getBoundingClientRect().bottom;
      const box = (el: Element) => el.getBoundingClientRect();
      const inView = (el: Element) => {
        const r = box(el);
        return r.top >= header - 0.5 && r.bottom <= window.innerHeight + 0.5 && r.left >= 0 && r.right <= window.innerWidth;
      };
      const parts: Record<string, Element> = {
        masthead: s.querySelector("img")!,
        heading: s.querySelector("h2")!,
        tagline: s.querySelector("p.italic")!,
        control: s.querySelector("[data-journey-motion] button")!,
        closing: s.querySelector("strong")!,
        cta: s.querySelector("[data-journey] ~ div button")!,
      };
      s.querySelectorAll("[data-journey-step] > div").forEach((card, i) => (parts[`step ${i + 1}`] = card));
      const outOfView = Object.entries(parts).filter(([, el]) => !inView(el)).map(([name]) => name);

      // Nothing clipped, scrolled internally or shrunk to fit.
      const ancestors: Element[] = [];
      for (let el: Element | null = s; el; el = el.parentElement) ancestors.push(el);
      const transformed = ancestors.filter((el) => getComputedStyle(el).transform !== "none").map((el) => el.tagName);
      const sectionStyle = getComputedStyle(s);
      const scrollers = [...s.querySelectorAll("*")].filter((el) => ["auto", "scroll"].includes(getComputedStyle(el).overflowY));
      const tagline = box(parts.tagline);
      const control = box(parts.control);
      const heading = parts.heading as HTMLElement;
      const description = s.querySelector("[data-journey-step] h3 + p")!;
      return {
        outOfView,
        transformed,
        sectionOverflow: sectionStyle.overflowY,
        sectionMaxHeight: sectionStyle.maxHeight,
        scrollers: scrollers.length,
        controlClear: control.left >= tagline.right || control.top >= tagline.bottom,
        headingLines: Math.round(heading.getBoundingClientRect().height / parseFloat(getComputedStyle(heading).lineHeight)),
        descriptionSize: parseFloat(getComputedStyle(description).fontSize),
        art: box(s.querySelector("[data-journey-illustration]")!).width,
      };
    });
    expect(fit.outOfView).toEqual([]);
    expect(fit.transformed).toEqual([]);
    expect(fit.sectionOverflow).toBe("visible");
    expect(fit.sectionMaxHeight).toBe("none");
    expect(fit.scrollers).toBe(0);
    expect(fit.controlClear).toBe(true);
    expect(fit.headingLines).toBe(1);
    expect(fit.descriptionSize).toBeGreaterThanOrEqual(14);
    expect(fit.art).toBeGreaterThanOrEqual(64);
    expect(fit.art).toBeLessThanOrEqual(80);
    await expect(section(page).getByRole("button", { name: cta.label })).toBeInViewport({ ratio: 1 });
    expect(await overflow(page)).toBe(0);
  });
}

test("masthead fits the gutters at 200% zoom (1440x900 at 2x)", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 720, height: 450 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const m = await measureMasthead(page);
  expect(Math.abs(m.width - Math.min(640, m.containerWidth))).toBeLessThanOrEqual(0.5);
  expect(Math.abs(m.centreOffset)).toBeLessThanOrEqual(0.5);
  expect(Math.abs(m.ratio - artwork.height / artwork.width)).toBeLessThanOrEqual(0.003);
  expect(await overflow(page)).toBe(0);
  await context.close();
});

for (const viewport of VIEWPORTS) {
  test(`${viewport.layout} layout and consultant gap at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await open(page, viewport.width, viewport.height);
    const { gap, steps: measured } = await measure(page);
    expect(await overflow(page)).toBe(0);
    // Readable descriptions: body size (16px+) below the compact wide row, 14px in it.
    const descriptionSize = await section(page)
      .locator("[data-journey-step] h3 + p")
      .first()
      .evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
    expect(descriptionSize).toBeGreaterThanOrEqual(viewport.layout === "row" ? 14 : 16);
    // One shared section gap after Meet Our Consultant (collapsed margins).
    expect(Math.abs(gap - viewport.gap)).toBeLessThanOrEqual(0.5);

    for (const step of measured) {
      expect(step.clipped).toBe(false);
      expect(step.art.width).toBe(viewport.art);
      expect(step.art.height).toBe(viewport.art);
      for (const part of [step.number, step.art, step.title, step.description]) {
        expect(part.left).toBeGreaterThanOrEqual(step.card.left);
        expect(part.right).toBeLessThanOrEqual(step.card.right);
      }
    }

    for (const [i, step] of measured.entries()) {
      const next = measured[i + 1];
      if (viewport.layout === "row") {
        // One row, in order; each dot centred above its card.
        expect(Math.abs(step.card.top - measured[0].card.top)).toBeLessThanOrEqual(0.5);
        if (next) expect(next.card.left).toBeGreaterThan(step.card.right);
        expect(Math.abs(step.dot.left + step.dot.width / 2 - (step.card.left + step.card.width / 2))).toBeLessThanOrEqual(1);
        expect(step.dot.bottom).toBeLessThanOrEqual(step.card.top);
        expect(step.art.bottom).toBeLessThanOrEqual(step.title.top);
      } else {
        // Stacked in order; each dot left of its card, level with the number.
        if (next) expect(next.card.top).toBeGreaterThan(step.card.bottom);
        expect(Math.abs(step.dot.top + step.dot.height / 2 - (step.number.top + step.number.height / 2))).toBeLessThanOrEqual(0.5);
        expect(step.dot.right).toBeLessThanOrEqual(step.card.left);
        if (viewport.width >= 768) expect(step.art.right).toBeLessThan(step.title.left);
        else expect(step.art.bottom).toBeLessThanOrEqual(step.title.top);
      }
    }
  });
}

/**
 * Samples each illustration's rendered frame (a hash of its Lottie markup)
 * and state every `interval` ms for `duration` ms, inside the page.
 */
function sampleFrames(page: Page, duration: number, interval = 200) {
  return section(page).evaluate(
    async (s, { duration, interval }) => {
      const hash = (text: string) => {
        let h = 0;
        for (let i = 0; i < text.length; i++) h = (Math.imul(31, h) + text.charCodeAt(i)) | 0;
        return h;
      };
      const els = [...s.querySelectorAll<HTMLElement>("[data-journey-illustration]")];
      const samples = els.map(() => [] as { t: number; state?: string; frame: number; poster: string; stage: string }[]);
      const start = performance.now();
      while (performance.now() - start < duration) {
        els.forEach((el, i) =>
          samples[i].push({
            t: performance.now() - start,
            state: el.dataset.state,
            frame: hash(el.querySelector("[data-lottie]")!.innerHTML),
            poster: getComputedStyle(el.querySelector("[data-poster]")!).opacity,
            stage: getComputedStyle(el.querySelector("[data-lottie]")!).opacity,
          })
        );
        await new Promise((resolve) => setTimeout(resolve, interval));
      }
      return samples;
    },
    { duration, interval }
  );
}

const distinctFrames = (samples: { frame: number }[]) => new Set(samples.map((sample) => sample.frame)).size;

/** Marks each player's SVG so a test can tell whether it was recreated. */
const tagPlayers = (page: Page) =>
  section(page).evaluate((s) => s.querySelectorAll<SVGElement>("[data-lottie] > svg").forEach((svg) => (svg.dataset.player = "kept")));
const keptPlayers = (page: Page) => section(page).locator('[data-lottie] > svg[data-player="kept"]').count();

const toggle = (page: Page) => section(page).locator("[data-journey-motion] button");

test("illustrations are decorative, loop continuously across several cycles and shift nothing", async ({ page }) => {
  test.setTimeout(60_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const external: string[] = [];
  page.on("request", (request) => {
    if (!request.url().startsWith("http://localhost")) external.push(request.url());
  });

  await open(page, 1440, 900);
  for (const illustration of await illustrations(page).all()) {
    await expect(illustration).toHaveAttribute("aria-hidden", "true");
    await expect(illustration.locator("img[data-poster]")).toHaveAttribute("alt", "");
  }
  // Nothing loads or plays until the section is reached.
  expect(await states(page)).toEqual(Array(steps.length).fill("static"));
  const before = await measure(page);

  await reveal(page);
  await allInState(page, "playing");
  for (const illustration of await illustrations(page).all()) {
    expect(await illustration.locator("[data-lottie] svg").count()).toBe(1);
  }
  await tagPlayers(page);

  // After the 2.2s reveal, sample 10s: two and a half 4s loops.
  await page.waitForTimeout(2500);
  const samples = await sampleFrames(page, 10_000);
  for (const [i, frames] of samples.entries()) {
    // Always the playing animation: no poster flash, no hidden stage.
    expect(frames.every((f) => f.state === "playing" && f.poster === "0" && f.stage === "1"), `step ${i + 1}`).toBe(true);
    // Moving in every 2s window, so the loop never stops or holds at its end.
    for (let window = 0; window < 5; window++) {
      const inWindow = frames.filter((f) => f.t >= window * 2000 && f.t < (window + 1) * 2000);
      expect(distinctFrames(inWindow), `step ${i + 1}, ${window * 2}-${window * 2 + 2}s`).toBeGreaterThan(1);
    }
  }
  expect(await keptPlayers(page)).toBe(steps.length);

  const after = await measure(page);
  expect(after.steps.map((step) => step.card)).toEqual(before.steps.map((step) => step.card));
  expect(after.gap).toBe(before.gap);
  expect(external).toEqual([]);
  expect(errors).toEqual([]);
});

test("loads each animation only as its step nears view (390px)", async ({ page }) => {
  const fetched: string[] = [];
  page.on("request", (request) => {
    if (request.url().endsWith(".json")) fetched.push(new URL(request.url()).pathname);
  });
  await open(page, 390, 844);
  expect(fetched).toEqual([]);

  await reveal(page, "[data-journey-step]:first-child [data-journey-illustration]");
  await expect(illustrations(page).first()).toHaveAttribute("data-state", "playing");
  expect((await states(page)).at(-1)).toBe("static");
  expect(fetched).not.toContain(steps.at(-1)!.illustration.animation);

  await reveal(page, "[data-journey-step]:last-child [data-journey-illustration]");
  await expect(illustrations(page).last()).toHaveAttribute("data-state", "playing");
  expect(fetched.filter((path) => path === steps.at(-1)!.illustration.animation)).toHaveLength(1);
});

test("pauses off screen and resumes the same player in view (390px)", async ({ page }) => {
  await open(page, 390, 844);
  const firstStep = "[data-journey-step]:first-child [data-journey-illustration]";
  await reveal(page, firstStep);
  const first = illustrations(page).first();
  await expect(first).toHaveAttribute("data-state", "playing");
  await tagPlayers(page);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(first).toHaveAttribute("data-state", "paused");
  const [held] = await sampleFrames(page, 1000);
  expect(distinctFrames(held)).toBe(1);

  await reveal(page, firstStep);
  await expect(first).toHaveAttribute("data-state", "playing");
  const [moving] = await sampleFrames(page, 1500);
  expect(distinctFrames(moving)).toBeGreaterThan(1);
  await expect(first.locator('[data-lottie] > svg[data-player="kept"]')).toHaveCount(1);
});

test("pauses while the tab is hidden and resumes when visible", async ({ page }) => {
  await open(page, 1440, 900);
  await reveal(page);
  await allInState(page, "playing");
  await tagPlayers(page);
  const setHidden = (hidden: boolean) =>
    page.evaluate((value) => {
      Object.defineProperty(document, "hidden", { configurable: true, get: () => value });
      document.dispatchEvent(new Event("visibilitychange"));
    }, hidden);

  await setHidden(true);
  expect(await states(page)).toEqual(Array(steps.length).fill("paused"));
  for (const frames of await sampleFrames(page, 1500)) expect(distinctFrames(frames)).toBe(1);

  await setHidden(false);
  await allInState(page, "playing");
  for (const frames of await sampleFrames(page, 1500)) expect(distinctFrames(frames)).toBeGreaterThan(1);
  expect(await keptPlayers(page)).toBe(steps.length);
});

test("one keyboard control pauses and resumes all five, and a pause holds when scrolling away and back", async ({ page }) => {
  await open(page, 1440, 900);
  await reveal(page);
  await allInState(page, "playing");
  await tagPlayers(page);

  // Reached by keyboard straight after the last Services CTA (Meet Our Consultant has none).
  await page.getByRole("button", { name: "Explore Skin" }).focus();
  await page.keyboard.press("Tab");
  const control = toggle(page);
  await expect(control).toBeFocused();
  await expect(control).toHaveAccessibleName("Pause animations");
  expect(await control.evaluate((e) => getComputedStyle(e).outlineStyle)).toBe("solid");
  expect((await control.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await expect(section(page).locator("[data-journey-motion] button")).toHaveCount(1);

  await page.keyboard.press("Enter");
  await expect(control).toHaveAccessibleName("Resume animations");
  await expect(control).toBeFocused();
  expect(await states(page)).toEqual(Array(steps.length).fill("paused"));
  for (const frames of await sampleFrames(page, 1500)) expect(distinctFrames(frames)).toBe(1);

  // Away and back: still paused.
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(300);
  await reveal(page);
  await page.waitForTimeout(500);
  expect(await states(page)).toEqual(Array(steps.length).fill("paused"));
  for (const frames of await sampleFrames(page, 1000)) expect(distinctFrames(frames)).toBe(1);

  await control.focus();
  await page.keyboard.press("Space");
  await expect(control).toHaveAccessibleName("Pause animations");
  await allInState(page, "playing");
  for (const frames of await sampleFrames(page, 1500)) expect(distinctFrames(frames)).toBeGreaterThan(1);
  expect(await keptPlayers(page)).toBe(steps.length);
});

test("pausing before the section is reached keeps the still illustrations until resumed (390px)", async ({ page }) => {
  await open(page, 390, 844);
  await toggle(page).click();
  await expect(toggle(page)).toHaveAccessibleName("Resume animations");
  await reveal(page, "[data-journey-step]:first-child [data-journey-illustration]");
  const first = illustrations(page).first();
  // Loading the animation can take longer than the default wait when many tests run at once.
  await expect(first).toHaveAttribute("data-state", "ready", { timeout: 15_000 });
  expect(await posterShown(page).then((shown) => shown[0])).toEqual(["1", "0"]);

  await toggle(page).click();
  await expect(first).toHaveAttribute("data-state", "playing", { timeout: 15_000 });
});

test("the control's row is reserved, so nothing moves when it appears", async ({ browser }) => {
  const journeyTop = async (javaScriptEnabled: boolean) => {
    const context = await browser.newContext({ javaScriptEnabled, viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    // With JavaScript, the control appears on hydration: wait for it rather than racing it.
    if (javaScriptEnabled) await expect(toggle(page)).toBeVisible();
    const visible = await toggle(page).isVisible();
    const top = await section(page).locator("[data-journey]").evaluate((list) => list.getBoundingClientRect().top + window.scrollY - document.getElementById("experience")!.getBoundingClientRect().top - window.scrollY);
    await context.close();
    return { visible, top };
  };
  const withoutScript = await journeyTop(false);
  const withScript = await journeyTop(true);
  expect(withoutScript.visible).toBe(false);
  expect(withScript.visible).toBe(true);
  expect(withScript.top).toBe(withoutScript.top);
});

const posterShown = (page: Page) =>
  illustrations(page).evaluateAll((els) =>
    els.map((e) => [
      getComputedStyle(e.querySelector("[data-poster]")!).opacity,
      getComputedStyle(e.querySelector("[data-lottie]")!).opacity,
    ])
  );

test("reduced motion shows the static illustrations and loads no animation", async ({ page }) => {
  const fetched: string[] = [];
  page.on("request", (request) => {
    if (request.url().endsWith(".json")) fetched.push(request.url());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, 390, 844);
  for (const illustration of await illustrations(page).all()) await illustration.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  expect(fetched).toEqual([]);
  expect(await states(page)).toEqual(Array(steps.length).fill("static"));
  expect(await posterShown(page)).toEqual(Array(steps.length).fill(["1", "0"]));
  expect(await overflow(page)).toBe(0);
  // Nothing animates, so there is no control; the timeline keeps its usual
  // distance (--space-intro-content, 28px on mobile) from the tagline.
  await expect(section(page).locator("[data-journey-motion]")).toBeHidden();
  const gap = await section(page).evaluate((s) => {
    const tagline = s.querySelector("p.italic")!.getBoundingClientRect().bottom;
    return s.querySelector("[data-journey]")!.getBoundingClientRect().top - tagline;
  });
  expect(gap).toBeCloseTo(28, 0);
});

test("failed animation loading falls back to the static illustrations", async ({ page }) => {
  await page.route("**/animations/experience/*.json", (route) => route.fulfill({ status: 404, body: "" }));
  await open(page, 1440, 900);
  await reveal(page);
  await allInState(page, "fallback");
  expect(await posterShown(page)).toEqual(Array(steps.length).fill(["1", "0"]));
  await expect(section(page).locator("[data-lottie] svg")).toHaveCount(0);
});

test("without JavaScript the section and its static illustrations still render", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto("/");
  await expect(section(page).getByRole("heading", { level: 2 })).toHaveText(heading);
  await expect(section(page).getByRole("heading", { level: 3 })).toHaveCount(steps.length);
  const poster = illustrations(page).first().locator("img[data-poster]");
  await expect(poster).toHaveAttribute("src", steps[0].illustration.poster);
  await poster.scrollIntoViewIfNeeded();
  await expect
    .poll(() => poster.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0))
    .toBe(true);
  expect(await posterShown(page)).toEqual(Array(steps.length).fill(["1", "0"]));
  await context.close();
});

test("CTA follows the motion control by keyboard, opens the Book a Consultation notice and returns focus", async ({ page }) => {
  await open(page, 1440, 900);
  const button = section(page).getByRole("button", { name: cta.label });
  await page.getByRole("button", { name: "Explore Skin" }).focus();
  await page.keyboard.press("Tab");
  await expect(toggle(page)).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(button).toBeFocused();
  expect(await button.evaluate((e) => getComputedStyle(e).outlineStyle)).toBe("solid");
  await expect(button).toBeInViewport({ ratio: 1 });

  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: `Development Preview: ${cta.destinationName}` });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(cta.href);
  await expect(dialog.locator("form, input")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(button).toBeFocused();
});

test("CTA works by touch on mobile (390px)", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const page = await context.newPage();
  await page.goto("/");
  const button = section(page).getByRole("button", { name: cta.label });
  await button.scrollIntoViewIfNeeded();
  expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await button.tap();
  await expect(page.getByRole("dialog", { name: `Development Preview: ${cta.destinationName}` })).toBeVisible();
  await page.getByRole("button", { name: "Understood" }).tap();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await context.close();
});

test("200% zoom (1440x900 at 2x) keeps the timeline within the page and lets it grow", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 720, height: 450 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  expect(await overflow(page)).toBe(0);
  const { steps: measured } = await measure(page);
  for (const step of measured) expect(step.clipped).toBe(false);
  // Enlarged: the stacked timeline, taller than the view, read by scrolling.
  expect(measured[1].card.top).toBeGreaterThan(measured[0].card.bottom);
  expect(await section(page).evaluate((s) => s.getBoundingClientRect().height)).toBeGreaterThan(450 * 2);
  await context.close();
});

test.describe("anchor navigation", () => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
  ]) {
    test(`/#experience lands 24px below the header at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto(`/#${id}`);
      await page.evaluate(() => document.fonts.ready);
      await expectLanded(page);
      await expect(section(page).getByRole("heading", { level: 2 })).toBeInViewport();
    });
  }

  // The services stack grows when it measures after hydration; links to the
  // sections after it must still land in place.
  for (const width of [1440, 390]) {
    test(`/#${consultantContent.id} also lands 24px below the header at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(`/#${consultantContent.id}`);
      await page.evaluate(() => document.fonts.ready);
      await expect
        .poll(() =>
          page.evaluate(
            (target) =>
              document.getElementById(target)!.getBoundingClientRect().top -
              document.querySelector("header")!.getBoundingClientRect().bottom,
            consultantContent.id
          )
        )
        .toBeCloseTo(24, 0);
    });
  }

  test("desktop Our Experience scrolls to the section; About AKSH still works", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await open(page, 1440, 900);
    const link = page.getByRole("link", { name: "Our Experience" });
    await expect(link).toHaveAttribute("href", `/#${id}`);
    await link.click();
    await expect(page).toHaveURL(new RegExp(`/#${id}$`));
    await expectLanded(page);

    await page.getByRole("banner").getByRole("link", { name: "About AKSH" }).click();
    await expect(page).toHaveURL(/\/#about-aksh$/);
    await expect(page.locator("section#about-aksh")).toBeInViewport();
    expect(errors).toEqual([]);
  });

  test("mobile drawer Our Experience closes the drawer and scrolls to the section (390px)", async ({ page }) => {
    await open(page, 390, 844);
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    const drawer = page.getByRole("dialog", { name: "Navigation Menu" });
    const link = drawer.getByRole("link", { name: "Our Experience" });
    await expect(link).toHaveAttribute("href", `/#${id}`);
    await link.click();
    await expect(drawer).not.toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/#${id}$`));
    await expectLanded(page);
    // The page scrolls again once the drawer has released it.
    await page.mouse.wheel(0, 400);
    await expect.poll(() => landing(page)).toBeLessThan(0);
  });

  test("the old /experience route redirects to /#experience", async ({ page }) => {
    const response = await page.request.get("/experience", { maxRedirects: 0 });
    expect(response.status()).toBe(307);
    expect(response.headers()["location"]).toBe(`/#${id}`);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/experience");
    await expect(page).toHaveURL(new RegExp(`/#${id}$`));
    await expectLanded(page);
  });
});
