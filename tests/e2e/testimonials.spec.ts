import { expect, test, type Page } from "@playwright/test";
import { testimonialsContent } from "../../src/content/testimonials";

/*
 * Homepage "Client Experiences" testimonials (#client-experiences), shown in
 * development and preview only (fictional samples; omitted in production):
 * - Directly after The AKSH Experience; exact intro (no disclosure notice),
 *   the nine supplied entries as blockquotes with attribution and a Sample badge
 * - Three columns desktop, two tablet, one mobile; all nine entries in every
 *   layout, each once for assistive technology; duplicates hidden and inert
 * - Seamless loops: -50% of each track is exactly one group; 35/45/40s
 * - One "Pause testimonials" control; pauses on hover, focus, off screen and
 *   in hidden tabs; a manual pause holds and resumes from the same position
 * - Reduced motion: a normal-flow grid of all nine; no ratings or portraits
 */

const { id, artwork, heading, description, badge, testimonials } = testimonialsContent;
const names = testimonials.map((t) => t.name);
const section = (page: Page) => page.locator(`section#${id}`);
const overflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

async function open(page: Page, width: number, height: number) {
  await page.setViewportSize({ width, height });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(section(page)).toBeAttached();
}

async function reveal(page: Page) {
  await section(page)
    .locator("[data-testimonials-viewport]")
    .evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
}

/** Each column's current vertical offset, in px. */
const offsets = (page: Page) =>
  section(page)
    .locator("[data-testimonials-track]")
    .evaluateAll((tracks) => tracks.map((t) => new DOMMatrixReadOnly(getComputedStyle(t).transform).m42));

const playing = (page: Page) => section(page).locator("[data-testimonials-scroller]").getAttribute("data-playing");
const control = (page: Page) => section(page).getByRole("button", { name: /testimonials$/ });

test("follows The AKSH Experience with the exact intro and no disclosure notice", async ({ page }) => {
  await open(page, 1440, 900);
  const order = await page.evaluate(() => [...document.querySelectorAll("main > section")].map((s) => s.id));
  expect(order.at(-1)).toBe("faq");
  expect(order.at(-2)).toBe(id);
  expect(order.at(-3)).toBe("experience");

  const s = section(page);
  await expect(s).toHaveAttribute("aria-labelledby", "client-experiences-heading");
  // The lettering artwork replaces the typed label: no visible duplicate.
  await expect(s.getByRole("img", { name: artwork.alt, exact: true })).toBeVisible();
  for (const label of ["CLIENT EXPERIENCES", "Client Experiences"]) {
    await expect(s.getByText(label, { exact: true })).toHaveCount(0);
  }
  await expect(s.locator("span.bg-signal-red")).toHaveCount(0);
  await expect(s.getByRole("heading", { level: 2 })).toHaveText(heading.join(" "));
  await expect(s.getByRole("heading")).toHaveCount(1);
  await expect(s.getByText(description, { exact: true })).toBeVisible();
  // The introduction is the last line before the columns; no disclosure notice.
  await expect(s.locator("[data-sample-notice]")).toHaveCount(0);
  await expect(s).not.toContainText("Illustrative sample testimonials");
  await expect(s).not.toContainText("Real experiences.");
});

for (const [width, height] of [[1440, 900], [1024, 768], [768, 1024], [390, 844], [320, 568]]) {
  test(`masthead artwork is whole, centred, proportional and about 24px above the H2 at ${width}x${height}`, async ({ page }) => {
    await open(page, width, height);
    const img = section(page).getByRole("img", { name: artwork.alt, exact: true });
    // Lazy-loaded: bring it into view, then wait for it to decode.
    await img.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
    await expect(img).toHaveJSProperty("complete", true);
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
    const m = await img.evaluate((el: HTMLImageElement, margin) => {
      const rect = el.getBoundingClientRect();
      const heading = el.parentElement!.querySelector("h2")!.getBoundingClientRect();
      const container = el.closest("section")!.firstElementChild!.getBoundingClientRect();
      return {
        width: rect.width,
        containerWidth: container.width,
        centreOffset: rect.left + rect.width / 2 - (container.left + container.width / 2),
        ratio: rect.height / rect.width,
        naturalRatio: el.naturalHeight / el.naturalWidth,
        fit: getComputedStyle(el).objectFit,
        background: getComputedStyle(el).backgroundColor,
        inside: rect.left >= container.left - 0.5 && rect.right <= container.right + 0.5,
        // The artwork keeps a 28px margin (of 188px) below its lettering.
        letteringGap: heading.top - (rect.bottom - rect.height * margin),
        headingAfter: el.nextElementSibling?.tagName,
      };
    }, 28 / artwork.height);
    expect(Math.abs(m.width - Math.min(800, m.containerWidth))).toBeLessThanOrEqual(0.5);
    expect(Math.abs(m.centreOffset)).toBeLessThanOrEqual(0.5);
    expect(Math.abs(m.ratio - artwork.height / artwork.width)).toBeLessThanOrEqual(0.003);
    expect(Math.abs(m.naturalRatio - artwork.height / artwork.width)).toBeLessThanOrEqual(0.003);
    expect(m.fit).toBe("contain");
    expect(m.background).toBe("rgba(0, 0, 0, 0)");
    expect(m.inside).toBe(true);
    expect(m.letteringGap).toBeGreaterThanOrEqual(22);
    expect(m.letteringGap).toBeLessThanOrEqual(28);
    expect(m.headingAfter).toBe("H2");
    expect(await overflow(page)).toBe(0);
  });
}

test("mobile keeps the H2's natural wrapping at 36px (390px)", async ({ page }) => {
  await open(page, 390, 844);
  const h2 = section(page).getByRole("heading", { level: 2 });
  expect(await h2.evaluate((el) => getComputedStyle(el).fontSize)).toBe("36px");
  expect(await h2.evaluate((el) => getComputedStyle(el.querySelector("span")!).display)).toBe("inline");
});

for (const [width, height] of [[1440, 900], [1366, 768], [1024, 768], [768, 1024]]) {
  test(`the heading sets in two lines, broken after "Good," at ${width}x${height}`, async ({ page }) => {
    await open(page, width, height);
    const lines = await section(page)
      .getByRole("heading", { level: 2 })
      .evaluate((h2) => {
        const lineHeight = parseFloat(getComputedStyle(h2).lineHeight);
        const tops = [...h2.querySelectorAll("span")].map((span) => [...span.getClientRects()].map((r) => r.top));
        return { count: Math.round(h2.getBoundingClientRect().height / lineHeight), tops };
      });
    expect(lines.count).toBe(2);
    // Each half fits on one line.
    expect(lines.tops.map((rects) => rects.length)).toEqual([1, 1]);
  });
}

test("renders the nine entries verbatim, each once for assistive technology", async ({ page }) => {
  await open(page, 1440, 900);
  const s = section(page);
  const quotes = s.getByRole("blockquote");
  await expect(quotes).toHaveCount(9);
  await expect(quotes).toHaveText(testimonials.map((t) => t.text));
  const figures = s.getByRole("figure");
  await expect(figures).toHaveCount(9);
  for (const [i, t] of testimonials.entries()) {
    const caption = figures.nth(i).locator("figcaption");
    await expect(caption).toContainText(t.name);
    await expect(caption).toContainText(t.role);
    await expect(figures.nth(i).getByText(badge, { exact: true })).toBeVisible();
  }

  // Duplicates: hidden from assistive technology, inert, identical to the originals.
  const groups = await s.locator("[data-testimonials-track]").evaluateAll((tracks) =>
    tracks.map((t) => {
      const [original, duplicate] = [...t.querySelectorAll("[data-testimonials-group]")] as HTMLElement[];
      return {
        hidden: duplicate.getAttribute("aria-hidden"),
        inert: duplicate.inert,
        same: original.innerHTML === duplicate.innerHTML,
        originalHidden: original.getAttribute("aria-hidden"),
      };
    })
  );
  expect(groups.every((g) => g.hidden === "true" && g.inert && g.same && g.originalHidden === null)).toBe(true);

  // Avatars are decorative initials; no portraits, ratings or review branding.
  await expect(s.locator("figure img")).toHaveCount(0);
  const avatars = s.locator('[data-testimonials-group="original"] figcaption > [aria-hidden="true"]');
  await expect(avatars).toHaveCount(9);
  await expect(avatars.first()).toHaveText("AS");
  await expect(s).not.toContainText(/★|☆|rating|stars|reviews? count|google|verified client(?! reviews)/i);
});

const LAYOUTS = [
  { width: 1440, height: 900, columns: [3, 3, 3], durations: [35, 45, 40] },
  { width: 1366, height: 768, columns: [3, 3, 3], durations: [35, 45, 40] },
  { width: 768, height: 1024, columns: [5, 4], durations: [58, 60] },
  { width: 390, height: 844, columns: [9], durations: [105] },
  { width: 320, height: 568, columns: [9], durations: [105] },
];

for (const layout of LAYOUTS) {
  test(`all nine across ${layout.columns.length} column(s), seamless loops, no overflow at ${layout.width}x${layout.height}`, async ({ page }) => {
    await open(page, layout.width, layout.height);
    const columns = await section(page).locator("[data-testimonials-column]").evaluateAll((cols) =>
      cols.map((col) => {
        const track = col.querySelector<HTMLElement>("[data-testimonials-track]")!;
        const [original, duplicate] = [...track.querySelectorAll<HTMLElement>("[data-testimonials-group]")];
        const cards = [...original.querySelectorAll<HTMLElement>("figure")];
        return {
          names: cards.map((c) => c.querySelector("figcaption .text-logo-black")!.textContent),
          duration: Number(col.getAttribute("data-duration")),
          half: track.getBoundingClientRect().height / 2,
          step: duplicate.getBoundingClientRect().top - original.getBoundingClientRect().top,
          clipped: cards.filter((c) => c.scrollWidth > c.clientWidth + 0.5).length,
        };
      })
    );
    expect(columns.map((c) => c.names.length)).toEqual(layout.columns);
    expect(columns.flatMap((c) => c.names)).toEqual(names);
    expect(columns.map((c) => c.duration)).toEqual(layout.durations);
    for (const column of columns) {
      // -50% of the track is exactly one group plus its trailing gap.
      expect(Math.abs(column.half - column.step)).toBeLessThanOrEqual(0.5);
      expect(column.clipped).toBe(0);
    }
    const viewport = await section(page).locator("[data-testimonials-viewport]").boundingBox();
    expect(viewport!.height).toBeLessThanOrEqual(layout.height * 0.8 + 0.5);
    expect(await overflow(page)).toBe(0);
  });
}

test("columns move continuously while playing", async ({ page }) => {
  await open(page, 1440, 900);
  await reveal(page);
  await expect.poll(() => playing(page)).toBe("true");
  const first = await offsets(page);
  await page.waitForTimeout(1500);
  const later = await offsets(page);
  later.forEach((y, i) => expect(y).toBeLessThan(first[i]));
});

test("one keyboard control pauses and resumes from the same position, and a pause holds off screen", async ({ page }) => {
  await open(page, 1440, 900);
  await reveal(page);
  await expect.poll(() => playing(page)).toBe("true");

  // Reached by keyboard straight after The AKSH Experience CTA.
  await page.locator("#experience").getByRole("button", { name: "Begin Your Journey" }).focus();
  await page.keyboard.press("Tab");
  await expect(control(page)).toBeFocused();
  await expect(control(page)).toHaveAccessibleName("Pause testimonials");
  expect(await control(page).evaluate((e) => getComputedStyle(e).outlineStyle)).toBe("solid");
  expect((await control(page).boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await expect(section(page).getByRole("button")).toHaveCount(1);

  await page.keyboard.press("Enter");
  await expect(control(page)).toHaveAccessibleName("Resume testimonials");
  expect(await playing(page)).toBe("false");
  const held = await offsets(page);
  await page.waitForTimeout(1000);
  expect(await offsets(page)).toEqual(held);

  // Away and back: still paused, same position.
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(300);
  await reveal(page);
  await page.waitForTimeout(500);
  expect(await playing(page)).toBe("false");
  expect(await offsets(page)).toEqual(held);

  await control(page).focus();
  await page.keyboard.press("Space");
  await expect(control(page)).toHaveAccessibleName("Pause testimonials");
  await expect.poll(() => playing(page)).toBe("true");
  await page.waitForTimeout(600);
  const resumed = await offsets(page);
  // Continued from where it stopped, not from the start.
  resumed.forEach((y, i) => {
    expect(y).toBeLessThan(held[i]);
    expect(held[i] - y).toBeLessThan(60);
  });
});

test("pauses while hovered or focused for reading", async ({ page }) => {
  await open(page, 1440, 900);
  await reveal(page);
  await expect.poll(() => playing(page)).toBe("true");
  const viewport = section(page).locator("[data-testimonials-viewport]");

  await viewport.hover();
  await expect.poll(() => playing(page)).toBe("false");
  await page.mouse.move(5, 5);
  await expect.poll(() => playing(page)).toBe("true");

  // Keyboard: the window is the next stop after the control, and holds still while focused.
  await control(page).focus();
  await page.keyboard.press("Tab");
  await expect(viewport).toBeFocused();
  await expect(viewport).toHaveAttribute("aria-label", "Sample testimonials");
  expect(await viewport.evaluate((e) => getComputedStyle(e).outlineStyle)).toBe("solid");
  await expect.poll(() => playing(page)).toBe("false");
  await page.keyboard.press("Shift+Tab");
  await expect.poll(() => playing(page)).toBe("true");
  await expect(control(page)).toHaveAccessibleName("Pause testimonials");
});

test("pauses off screen and in a hidden tab", async ({ page }) => {
  await open(page, 1440, 900);
  expect(await playing(page)).toBe("false"); // not yet reached
  await reveal(page);
  await expect.poll(() => playing(page)).toBe("true");

  const setHidden = (hidden: boolean) =>
    page.evaluate((value) => {
      Object.defineProperty(document, "hidden", { configurable: true, get: () => value });
      document.dispatchEvent(new Event("visibilitychange"));
    }, hidden);
  await setHidden(true);
  await expect.poll(() => playing(page)).toBe("false");
  await setHidden(false);
  await expect.poll(() => playing(page)).toBe("true");

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect.poll(() => playing(page)).toBe("false");
});

test("reduced motion shows a normal-flow grid of all nine, without a control", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, 390, 844);
  const s = section(page);
  await expect(s.locator("[data-testimonials-grid]")).toBeVisible();
  await expect(s.locator("[data-testimonials-viewport], [data-testimonials-track]")).toHaveCount(0);
  await expect(s.getByRole("button")).toHaveCount(0);
  await expect(s.locator("figure")).toHaveCount(9);
  await expect(s.getByRole("blockquote")).toHaveText(testimonials.map((t) => t.text));
  // Normal flow: every card fully inside the section, none clipped.
  const fit = await s.evaluate((el) => {
    const box = el.getBoundingClientRect();
    return [...el.querySelectorAll("figure")].every((f) => {
      const r = f.getBoundingClientRect();
      return r.top >= box.top && r.bottom <= box.bottom && f.scrollHeight <= f.clientHeight + 0.5;
    });
  });
  expect(fit).toBe(true);
  expect(await overflow(page)).toBe(0);
});

test("the server markup is the normal-flow grid of all nine (no JavaScript layout)", async ({ request }) => {
  const html = await (await request.get("/")).text();
  const start = html.indexOf(`id="${id}"`);
  expect(start).toBeGreaterThan(-1);
  const markup = html.slice(start, html.indexOf("</section>", start));
  expect(markup).toContain("data-testimonials-grid");
  expect(markup).not.toContain("data-testimonials-track");
  expect(markup).not.toContain("<button");
  expect(markup.match(/<figure/g)).toHaveLength(9);
  for (const name of names) expect(markup.split(name).length - 1).toBe(1);
  expect(markup).not.toContain("Illustrative sample testimonials");
});

test("enlarged (200% zoom) keeps all nine readable with no overflow", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 720, height: 450 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const columns = section(page).locator("[data-testimonials-column]");
  await expect(columns).toHaveCount(1);
  await expect(section(page).getByRole("blockquote")).toHaveCount(9);
  const clipped = await section(page)
    .locator('[data-testimonials-group="original"] figure')
    .evaluateAll((cards) => cards.filter((c) => c.scrollWidth > c.clientWidth + 0.5).length);
  expect(clipped).toBe(0);
  expect(await overflow(page)).toBe(0);
  await context.close();
});
