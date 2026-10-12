import { expect, test, type Page } from "@playwright/test";
import { faqContent } from "../../src/content/faq";

/*
 * Homepage FAQ (#faq), every mode:
 * - After Client Experiences (development/preview; after The AKSH Experience
 *   in production, where the samples are omitted). Lettering artwork as the
 *   H2 (whole, centred, up to 960px), eyebrow, six numbered H3 questions,
 *   support block and CTA; the former typed H2 and introduction are gone
 * - Single-open, collapsible, initially closed Radix accordion; closed answers
 *   hidden and inert; about 300ms open/close, immediate under reduced motion
 * - Server markup and no-JavaScript: native disclosures sharing one name
 * - Geometry: 880px column, answers indented 48/32/16px, icons at the right
 *   edge, 44px targets, nothing clipped, no overflow
 */

const { id, artwork, eyebrow, items, support, cta } = faqContent;
const answerText = (index: number) => items[index].answer.map((run) => run.text).join("");
const boldRuns = (index: number) => items[index].answer.filter((run) => run.bold).map((run) => run.text);

const section = (page: Page) => page.locator(`section#${id}`);
const accordion = (page: Page) => section(page).locator('[data-faq-mode="accordion"]');
const triggers = (page: Page) => accordion(page).locator("h3 > button");
const overflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

async function open(page: Page, width: number, height: number) {
  await page.setViewportSize({ width, height });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(accordion(page)).toBeAttached();
  // The sections above are hydrated and streamed in, so nothing above shifts later.
  await expect(page.locator("[data-testimonials-scroller], [data-testimonials-grid]").first()).toBeAttached();
  await page.waitForLoadState("networkidle");
}

/** The answer region a question controls. */
const panelFor = (page: Page, index: number) =>
  triggers(page)
    .nth(index)
    .getAttribute("aria-controls")
    .then((controls) => page.locator(`[id="${controls}"]`));

async function reveal(page: Page) {
  await accordion(page).evaluate((el) => el.scrollIntoView({ block: "start", behavior: "instant" }));
}

test("follows Client Experiences with the artwork heading, eyebrow, questions and support block", async ({ page }) => {
  await open(page, 1440, 900);
  const order = await page.evaluate(() => [...document.querySelectorAll("main > section")].map((s) => s.id));
  expect(order.at(-1)).toBe(id);
  expect(order.at(-2)).toBe("client-experiences");

  const s = section(page);
  await expect(s).toHaveAttribute("aria-labelledby", "faq-heading");
  // The artwork is the H2; its alt text is the heading's (and section's) name.
  const h2 = s.getByRole("heading", { level: 2 });
  await expect(h2).toHaveCount(1);
  await expect(h2).toHaveAccessibleName(artwork.alt);
  await expect(h2).toHaveAttribute("id", "faq-heading");
  await expect(h2.getByRole("img", { name: artwork.alt, exact: true })).toBeVisible();
  await expect(s).toHaveAccessibleName(artwork.alt);
  // No duplicate visible title, and the removed H2 and introduction are gone.
  await expect(s.getByText(/frequently asked questions/i)).toHaveCount(0);
  await expect(s).not.toContainText("A Little Clarity, Before You Begin.");
  await expect(s).not.toContainText("Your wellness journey should feel effortless.");
  await expect(s.getByText(eyebrow, { exact: true })).toBeVisible();

  // Six numbered H3 questions, in order; the number is part of each heading.
  const questions = s.locator("[data-faq] h3");
  await expect(questions).toHaveCount(6);
  for (const [index, item] of items.entries()) {
    expect(item.number).toBe(String(index + 1).padStart(2, "0"));
    await expect(questions.nth(index)).toHaveText(`${item.number}${item.question}`);
  }

  // Support block: eyebrow, H3, italic text, CTA.
  const block = s.locator("[data-faq-support]");
  await expect(block.getByText(support.eyebrow, { exact: true })).toBeVisible();
  await expect(block.getByRole("heading", { level: 3 })).toHaveText(support.heading);
  const text = block.getByText(support.text, { exact: true });
  expect(await text.evaluate((el) => getComputedStyle(el).fontStyle)).toBe("italic");
  await expect(block.getByRole("button", { name: cta.label })).toHaveText(`${cta.label}→`);

  // No timestamps, emoji or demo content; no phone numbers or WhatsApp links.
  await expect(s).not.toContainText(/\d{1,2}:\d{2}|ago\b|\p{Extended_Pictographic}/u);
  await expect(s.locator('a[href^="tel:"], a[href*="wa.me"], a[href*="whatsapp"]')).toHaveCount(0);
});

for (const [width, height] of [[1440, 900], [1024, 768], [768, 1024], [390, 844], [320, 568]]) {
  test(`heading artwork is whole, centred, proportional and compact above the questions at ${width}x${height}`, async ({ page }) => {
    await open(page, width, height);
    const img = section(page).getByRole("img", { name: artwork.alt, exact: true });
    await img.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
    await expect(img).toHaveJSProperty("complete", true);
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
    const m = await img.evaluate((el: HTMLImageElement) => {
      const rect = el.getBoundingClientRect();
      const s = el.closest("section")!;
      const container = s.firstElementChild!.getBoundingClientRect();
      const eyebrow = s.querySelector("h2 + div")!.getBoundingClientRect();
      const list = s.querySelector("[data-faq]")!.getBoundingClientRect();
      return {
        width: rect.width,
        containerWidth: container.width,
        centreOffset: rect.left + rect.width / 2 - (container.left + container.width / 2),
        inside: rect.left >= container.left - 0.5 && rect.right <= container.right + 0.5,
        ratio: rect.height / rect.width,
        naturalRatio: el.naturalHeight / el.naturalWidth,
        naturalWidth: el.naturalWidth,
        fit: getComputedStyle(el).objectFit,
        background: getComputedStyle(el).backgroundColor,
        artToEyebrow: eyebrow.top - rect.bottom,
        eyebrowToList: list.top - eyebrow.bottom,
      };
    });
    expect(Math.abs(m.width - Math.min(960, m.containerWidth))).toBeLessThanOrEqual(0.5);
    expect(Math.abs(m.centreOffset)).toBeLessThanOrEqual(0.5);
    expect(m.inside).toBe(true);
    expect(Math.abs(m.ratio - artwork.height / artwork.width)).toBeLessThanOrEqual(0.003);
    // The loaded (possibly resized) copy rounds its height to a whole pixel.
    expect(Math.abs(m.naturalRatio - artwork.height / artwork.width)).toBeLessThanOrEqual(1 / m.naturalWidth + 0.0005);
    expect(m.fit).toBe("contain");
    expect(m.background).toBe("rgba(0, 0, 0, 0)");
    // Tight spacing: 12–16px to the eyebrow, 24–32px from it to the questions.
    expect(m.artToEyebrow).toBeGreaterThanOrEqual(12 - 0.5);
    expect(m.artToEyebrow).toBeLessThanOrEqual(16 + 0.5);
    expect(m.eyebrowToList).toBeGreaterThanOrEqual(24 - 0.5);
    expect(m.eyebrowToList).toBeLessThanOrEqual(32 + 0.5);
    expect(await overflow(page)).toBe(0);
  });
}

test("starts closed: every answer hidden and inert, controls pointing at them", async ({ page }) => {
  await open(page, 1440, 900);
  await expect(triggers(page)).toHaveCount(6);
  for (let index = 0; index < 6; index++) {
    const trigger = triggers(page).nth(index);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    const panel = await panelFor(page, index);
    await expect(panel).toHaveCount(1);
    await expect(panel).toBeHidden();
    await expect(panel).toHaveAttribute("hidden", "");
    await expect(panel).toHaveAttribute("inert", "");
  }
  // Closed answers are outside the accessibility tree.
  await expect(accordion(page).getByRole("region")).toHaveCount(0);
  const snapshot = await accordion(page).ariaSnapshot();
  expect(snapshot).not.toContain(answerText(0).slice(0, 30));
});

test("all six answers open complete, with their bold emphasis", async ({ page }) => {
  await open(page, 1440, 900);
  for (let index = 0; index < 6; index++) {
    await triggers(page).nth(index).click();
    const panel = await panelFor(page, index);
    await expect(panel).toBeVisible();
    await expect(panel).toHaveAttribute("role", "region");
    await expect(panel).not.toHaveAttribute("inert", "");
    const bubble = panel.locator("[data-faq-answer]");
    await expect(bubble).toHaveText(answerText(index));
    await expect(bubble.locator("strong")).toHaveText(boldRuns(index));
    // Not clipped once open.
    await expect
      .poll(() => panel.locator("> div").evaluate((el) => el.scrollHeight - el.clientHeight))
      .toBeLessThanOrEqual(0);
  }
  expect(boldRuns(0)).toEqual(["Biohacking, Recovery, Body Contouring, and Advanced Skin Treatments"]);
  expect(boldRuns(2)).toEqual(["website enquiry form, WhatsApp, or a phone call"]);
});

test("one answer at a time; the open one closes again", async ({ page }) => {
  await open(page, 1440, 900);
  const [first, second] = [triggers(page).nth(0), triggers(page).nth(1)];
  const [firstPanel, secondPanel] = [await panelFor(page, 0), await panelFor(page, 1)];

  await first.click();
  await expect(first).toHaveAttribute("aria-expanded", "true");
  await expect(firstPanel).toBeVisible();

  await second.click();
  await expect(second).toHaveAttribute("aria-expanded", "true");
  await expect(first).toHaveAttribute("aria-expanded", "false");
  await expect(firstPanel).toBeHidden();
  await expect(secondPanel).toBeVisible();
  await expect(accordion(page).locator('h3 > button[aria-expanded="true"]')).toHaveCount(1);

  await second.click();
  await expect(second).toHaveAttribute("aria-expanded", "false");
  await expect(secondPanel).toBeHidden();
  await expect(accordion(page).locator('h3 > button[aria-expanded="true"]')).toHaveCount(0);
});

test("the whole question row toggles, including its number and icon", async ({ page }) => {
  await open(page, 1440, 900);
  const trigger = triggers(page).nth(2);
  await trigger.locator("[data-faq-number]").click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await trigger.locator("span[aria-hidden]").last().click();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  // Click near the right padding edge.
  const box = (await trigger.boundingBox())!;
  await page.mouse.click(box.x + box.width - 4, box.y + box.height / 2);
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
});

test("keyboard: Tab and arrow keys move between questions, Enter and Space toggle, focus is visible", async ({ page }) => {
  await open(page, 1440, 900);
  await section(page).locator("h2").evaluate((el) => el.scrollIntoView());
  // From the H2 area, Tab reaches the first question (no controls before it).
  await page.locator("#experience").getByRole("button", { name: "Begin Your Journey" }).focus();
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press("Tab");
    if (await triggers(page).nth(0).evaluate((el) => el === document.activeElement)) break;
  }
  await expect(triggers(page).nth(0)).toBeFocused();
  const outline = await triggers(page).nth(0).evaluate((el) => {
    const style = getComputedStyle(el);
    return { style: style.outlineStyle, width: style.outlineWidth, visible: el.matches(":focus-visible") };
  });
  expect(outline).toEqual({ style: "solid", width: "2px", visible: true });

  await page.keyboard.press("Enter");
  await expect(triggers(page).nth(0)).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("ArrowDown");
  await expect(triggers(page).nth(1)).toBeFocused();
  await page.keyboard.press("Space");
  await expect(triggers(page).nth(1)).toHaveAttribute("aria-expanded", "true");
  await expect(triggers(page).nth(0)).toHaveAttribute("aria-expanded", "false");
  await page.keyboard.press("End");
  await expect(triggers(page).nth(5)).toBeFocused();
  await page.keyboard.press("Home");
  await expect(triggers(page).nth(0)).toBeFocused();

  // Tab from the last question skips the closed answers and reaches the CTA.
  await triggers(page).nth(1).press("Space");
  await expect(triggers(page).nth(1)).toHaveAttribute("aria-expanded", "false");
  await expect(await panelFor(page, 1)).toBeHidden();
  await triggers(page).nth(5).focus();
  await page.keyboard.press("Tab");
  await expect(section(page).getByRole("button", { name: cta.label })).toBeFocused();
});

/** Samples one panel's height for 800ms after toggling its question. */
const toggleTiming = (page: Page, index: number) =>
  page.evaluate(async (index) => {
    const button = document.querySelectorAll<HTMLButtonElement>('#faq [data-faq-mode="accordion"] h3 > button')[index];
    const panel = document.getElementById(button.getAttribute("aria-controls")!)!;
    const inner = panel.firstElementChild as HTMLElement;
    const samples: [number, number][] = [];
    const start = performance.now();
    button.click();
    await new Promise<void>((resolve) => {
      const tick = () => {
        samples.push([performance.now() - start, inner.getBoundingClientRect().height]);
        if (performance.now() - start < 800) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
    const final = samples.at(-1)![1];
    const settled = samples.find(([, height]) => Math.abs(height - final) < 0.5)![0];
    return {
      final,
      settled,
      between: samples.some(([, height]) => height > 1 && height < Math.max(...samples.map(([, h]) => h)) - 1),
      hidden: panel.hidden,
      clipped: inner.scrollHeight - inner.clientHeight,
    };
  }, index);

test("opens and closes smoothly in about 300ms, without clipping the answer", async ({ page }) => {
  await open(page, 1440, 900);
  await reveal(page);
  const opening = await toggleTiming(page, 3);
  expect(opening.between).toBe(true);
  expect(opening.settled).toBeGreaterThanOrEqual(220);
  expect(opening.settled).toBeLessThanOrEqual(420);
  expect(opening.final).toBeGreaterThan(100);
  expect(opening.clipped).toBeLessThanOrEqual(0);

  const closing = await toggleTiming(page, 3);
  expect(closing.between).toBe(true);
  expect(closing.settled).toBeGreaterThanOrEqual(220);
  expect(closing.settled).toBeLessThanOrEqual(420);
  expect(closing.hidden).toBe(true);
});

test("reduced motion: answers open and close immediately", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, 390, 844);
  await reveal(page);
  const opening = await toggleTiming(page, 0);
  expect(opening.between).toBe(false);
  expect(opening.settled).toBeLessThanOrEqual(50);
  expect(opening.clipped).toBeLessThanOrEqual(0);
  const closing = await toggleTiming(page, 0);
  expect(closing.hidden).toBe(true);
  expect(closing.settled).toBeLessThanOrEqual(50);
});

test("opening a question does not scroll the page", async ({ page }) => {
  await open(page, 390, 844);
  // Centred, clear of the sticky header, so the click itself needs no scrolling.
  await triggers(page).nth(0).evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
  const before = await page.evaluate(() => window.scrollY);
  await triggers(page).nth(0).click();
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => window.scrollY)).toBe(before);
});

const LAYOUTS = [
  { width: 1440, height: 900, indent: 48 },
  { width: 1366, height: 768, indent: 48 },
  { width: 768, height: 1024, indent: 32 },
  { width: 390, height: 844, indent: 16 },
  { width: 320, height: 568, indent: 16 },
];

for (const layout of LAYOUTS) {
  test(`layout at ${layout.width}x${layout.height}: centred column, indented answers, right-edge icons, no overflow`, async ({ page }) => {
    await open(page, layout.width, layout.height);
    await reveal(page);
    // The longest answer.
    await triggers(page).nth(3).click();
    const panel = await panelFor(page, 3);
    await expect(panel).toBeVisible();
    await page.waitForTimeout(450);

    const g = await section(page).evaluate((s) => {
      const box = (el: Element) => el.getBoundingClientRect();
      const container = box(s.firstElementChild!);
      const list = box(s.querySelector("[data-faq]")!);
      const rows = [...s.querySelectorAll("[data-faq] h3 > button")].map((button) => {
        const row = box(button);
        const icon = box(button.querySelector("span[aria-hidden]:last-child")!);
        return { height: row.height, width: row.width, left: row.left, iconGap: row.right - icon.right, iconHidden: button.querySelector("svg")!.getAttribute("aria-hidden") };
      });
      const trigger = box(s.querySelectorAll("[data-faq] h3 > button")[3]);
      const bubble = box(s.querySelector("[data-faq-answer]:not([hidden] *)")!);
      const inner = s.querySelectorAll<HTMLElement>("[data-faq-panel]")[3].firstElementChild as HTMLElement;
      const answer = s.querySelector("[data-faq-answer]:not([hidden] *)")!;
      const support = box(s.querySelector("[data-faq-support]")!);
      const button = box(s.querySelector("[data-faq-support] button")!);
      return {
        containerWidth: container.width,
        listWidth: list.width,
        centre: list.left + list.width / 2 - (container.left + container.width / 2),
        rows,
        indent: bubble.left - trigger.left,
        rightAligned: Math.abs(bubble.right - trigger.right),
        clipped: inner.scrollHeight - inner.clientHeight,
        bubbleInside: bubble.bottom <= inner.getBoundingClientRect().bottom + 0.5,
        answerColours: [getComputedStyle(answer).backgroundColor, getComputedStyle(answer).color],
        answerSize: parseFloat(getComputedStyle(answer).fontSize),
        supportCentre: support.left + support.width / 2 - (container.left + container.width / 2),
        ctaLines: Math.round(button.height),
      };
    });
    expect(Math.abs(g.listWidth - Math.min(880, g.containerWidth))).toBeLessThanOrEqual(0.5);
    expect(Math.abs(g.centre)).toBeLessThanOrEqual(0.5);
    for (const row of g.rows) {
      expect(row.height).toBeGreaterThanOrEqual(44);
      expect(Math.abs(row.width - g.listWidth)).toBeLessThanOrEqual(0.5);
      // Every plus/minus sits the same distance from the right edge.
      expect(Math.abs(row.iconGap - g.rows[0].iconGap)).toBeLessThanOrEqual(0.5);
      expect(row.iconHidden).toBe("true");
    }
    expect(g.rows[0].iconGap).toBeGreaterThanOrEqual(20);
    expect(g.rows[0].iconGap).toBeLessThanOrEqual(25);
    expect(Math.abs(g.indent - layout.indent)).toBeLessThanOrEqual(0.5);
    expect(g.rightAligned).toBeLessThanOrEqual(0.5);
    expect(g.clipped).toBeLessThanOrEqual(0);
    expect(g.bubbleInside).toBe(true);
    // Charcoal bubble, ivory text.
    expect(g.answerColours).toEqual(["rgb(40, 40, 38)", "rgb(249, 248, 244)"]);
    expect(g.answerSize).toBeGreaterThanOrEqual(16);
    expect(Math.abs(g.supportCentre)).toBeLessThanOrEqual(0.5);
    // The CTA label stays on one line (52px control).
    expect(g.ctaLines).toBeLessThanOrEqual(53);
    expect(await overflow(page)).toBe(0);
  });
}

test("enlarged (200% zoom) keeps questions and the open answer whole, with no overflow", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 720, height: 450 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await page.goto("/");
  await expect(accordion(page)).toBeAttached();
  await triggers(page).nth(0).click();
  const panel = await panelFor(page, 0);
  await expect(panel.locator("[data-faq-answer]")).toHaveText(answerText(0));
  await page.waitForTimeout(450);
  expect(await panel.locator("> div").evaluate((el) => el.scrollHeight - el.clientHeight)).toBeLessThanOrEqual(0);
  for (const trigger of await triggers(page).all()) {
    expect((await trigger.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }
  expect(await overflow(page)).toBe(0);
  await context.close();
});

test("the CTA opens the Book a Consultation notice and returns focus", async ({ page }) => {
  await open(page, 1440, 900);
  const button = section(page).locator("[data-faq-support]").getByRole("button", { name: cta.label });
  await expect(button).toHaveAttribute("aria-haspopup", "dialog");
  await button.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(cta.destinationName);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(button).toBeFocused();
});

test("the server markup is native disclosures with all six answers (no JavaScript layout)", async ({ request }) => {
  const html = await (await request.get("/")).text();
  const start = html.indexOf(`id="${id}"`);
  expect(start).toBeGreaterThan(-1);
  const markup = html.slice(start, html.indexOf("</section>", start));
  expect(markup).toContain('data-faq-mode="static"');
  expect(markup.match(/<details/g)).toHaveLength(6);
  expect(markup.match(/name="aksh-faq"/g)).toHaveLength(6);
  expect(markup).not.toMatch(/<details[^>]*\bopen\b/);
  // Only the CTA is a button; the questions are summaries, not dead buttons.
  expect(markup.match(/<button/g)).toHaveLength(1);
  for (let index = 0; index < 6; index++) {
    for (const run of items[index].answer) expect(markup).toContain(run.text.replace(/'/g, "&#x27;"));
  }
});

test("without JavaScript the disclosures open one at a time and show complete answers", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto("/");
  const disclosures = section(page).locator('[data-faq-mode="static"] details');
  await expect(disclosures).toHaveCount(6);
  await expect(section(page).locator("[data-faq] button")).toHaveCount(0);
  await expect(disclosures.nth(0).locator("[data-faq-answer]")).toBeHidden();

  await disclosures.nth(0).locator("summary").click();
  await expect(disclosures.nth(0)).toHaveAttribute("open", "");
  await expect(disclosures.nth(0).locator("[data-faq-answer]")).toHaveText(answerText(0));
  await expect(disclosures.nth(0).locator("strong")).toHaveText(boldRuns(0));

  await disclosures.nth(3).locator("summary").click();
  await expect(disclosures.nth(3)).toHaveAttribute("open", "");
  await expect(disclosures.nth(0)).not.toHaveAttribute("open", "");
  await expect(disclosures.nth(3).locator("[data-faq-answer]")).toHaveText(answerText(3));

  // Keyboard: Enter toggles the focused summary.
  await disclosures.nth(3).locator("summary").press("Enter");
  await expect(disclosures.nth(3)).not.toHaveAttribute("open", "");
  expect(await overflow(page)).toBe(0);
  await context.close();
});
