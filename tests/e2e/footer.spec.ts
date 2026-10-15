import { expect, test, type Page } from "@playwright/test";
import { footerContent } from "../../src/content/footer";
import { servicesContent } from "../../src/content/services";

/*
 * Site footer (development mode, as the suite runs):
 * - One contentinfo landmark after <main>, in normal flow, holding two areas:
 *   the full-width charcoal area topped by four layered waves, and below it a
 *   full-width ivory band with the logo, once, and the copyright line
 * - Charcoal area, inside the site container: Explore (homepage sections,
 *   with FAQs), Our Services (the four service cards), Visit AKSH and Connect
 *   (placeholder details: labelled, plain text, no actions). Four columns on
 *   desktop, two on tablet, stacked on mobile; 44px targets; no overflow
 * - Waves: edge to edge, charcoal at rising opacity, the opaque front layer
 *   joined to the body; text clear of them; each layer drifts on its own
 *   seamless loop; paused off screen, in a hidden tab or by the control;
 *   complete and still under reduced motion and without JavaScript
 * - Service links land on their card, uncovered by the sticky stack
 */

const { explore, services, contact, rights } = footerContent;

const footer = (page: Page) => page.getByRole("contentinfo");
const surface = (page: Page) => page.locator("footer [data-footer-surface]");
const body = (page: Page) => page.locator("footer [data-footer-body]");
const brand = (page: Page) => page.locator("footer [data-footer-brand]");
const layers = (page: Page) => page.locator("footer [data-wave-layer]");
const control = (page: Page) => footer(page).locator("[data-footer-body] button");
const waveState = (page: Page) => surface(page).getAttribute("data-wave-state");
/** Each layer's current transform, to tell moving waves from still ones. */
const transforms = (page: Page) => layers(page).evaluateAll((els) => els.map((el) => getComputedStyle(el).transform));
const overflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

async function open(page: Page, width: number, height: number) {
  await page.setViewportSize({ width, height });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(footer(page)).toBeAttached();
  await page.waitForLoadState("networkidle");
}

/** The wave band's top just below the header. */
async function toWaves(page: Page) {
  await page.evaluate(() => {
    const header = document.querySelector("header")!.getBoundingClientRect().height;
    const top = document.querySelector("footer")!.getBoundingClientRect().top + window.scrollY - header - 24;
    window.scrollTo({ top, behavior: "instant" });
  });
  await page.waitForTimeout(300);
}

const toBottom = (page: Page) =>
  page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));

const setHidden = (page: Page, hidden: boolean) =>
  page.evaluate((value) => {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => value });
    document.dispatchEvent(new Event("visibilitychange"));
  }, hidden);

const VIEWPORTS = [
  { width: 1440, height: 900, gap: 90, gutter: 48, wave: 128 },
  { width: 768, height: 1024, gap: 72, gutter: 32, wave: 96 },
  { width: 390, height: 844, gap: 56, gutter: 20, wave: 64 },
  { width: 320, height: 568, gap: 56, gutter: 16, wave: 64 },
];

test("one landmark after main: charcoal groups, then the logo band; no removed content", async ({ page }) => {
  await open(page, 1440, 900);
  const f = footer(page);
  await expect(f).toHaveCount(1);
  expect(await page.evaluate(() => document.querySelector("main")!.nextElementSibling?.tagName)).toBe("FOOTER");
  // Both areas inside the one footer, in order.
  expect(
    await f.evaluate((el) => [...el.children].map((child) => Object.keys((child as HTMLElement).dataset)[0]))
  ).toEqual(["footerSurface", "footerBrand"]);

  // Group headings, in order.
  await expect(f.getByRole("heading", { level: 2 })).toHaveText(["Explore", "Our Services", "Visit AKSH", "Connect"]);

  // Explore: the homepage sections, including the FAQs.
  const exploreNav = f.getByRole("navigation", { name: "Explore" });
  expect(explore.links.map((l) => l.label)).toEqual([
    "About AKSH",
    "Our Services",
    "Meet Our Consultant",
    "The AKSH Experience",
    "FAQs",
  ]);
  await expect(exploreNav.getByRole("link")).toHaveText(explore.links.map((l) => l.label));
  for (const link of explore.links) {
    await expect(exploreNav.getByRole("link", { name: link.label, exact: true })).toHaveAttribute("href", link.href);
    await expect(page.locator(`main section${link.href.slice(1)}`)).toHaveCount(1);
  }

  // Our Services: the four service cards, by their own titles.
  const servicesNav = f.getByRole("navigation", { name: "Our Services" });
  expect(services.links.map((l) => l.label)).toEqual(["Biohacking", "Recovery", "Body Contouring", "Skin"]);
  for (const [index, category] of servicesContent.categories.entries()) {
    const link = servicesNav.getByRole("link").nth(index);
    await expect(link).toHaveText(category.title);
    await expect(link).toHaveAttribute("href", `/#service-${category.id}`);
    await expect(page.locator(`main li#service-${category.id} [data-service-card]`)).toHaveCount(1);
  }

  // The logo once, in the ivory band, linking home; the copyright beneath it.
  await expect(f.locator('img[src*="aksh-wellness-logo"]')).toHaveCount(1);
  const home = brand(page).getByRole("link", { name: "AKSH Wellness - Return to home" });
  await expect(home).toHaveAttribute("href", "/");
  await expect(brand(page).getByText(`© ${new Date().getFullYear()} ${rights}`, { exact: true })).toBeVisible();
  await expect(body(page).locator("img")).toHaveCount(0);

  // The former brand tagline and invitation block are gone.
  await expect(f).not.toContainText("Modern wellness. Personalised care.");
  await expect(f).not.toContainText("Your Next Chapter of Wellbeing.");
  await expect(f.getByRole("button", { name: "Book Your Consultation" })).toHaveCount(0);

  // Links: home, Explore and Our Services only.
  await expect(f.getByRole("link")).toHaveCount(1 + explore.links.length + services.links.length);
  await expect(f).not.toContainText(/privacy|terms|cookie/i);
});

test("placeholder details are labelled, plain text and inactive", async ({ page }) => {
  await open(page, 1440, 900);
  const f = footer(page);
  expect(contact.status).toBe("placeholder");
  for (const name of ["Visit AKSH", "Connect"]) {
    const group = f.getByRole("region", { name });
    await expect(group).toHaveAttribute("data-content-status", "placeholder");
    await expect(group.getByText("Placeholder details", { exact: true })).toBeVisible();
  }
  await expect(f.getByRole("region", { name: "Visit AKSH" }).locator("address")).toHaveText(
    contact.visit.addressLines.join("")
  );
  const connect = f.getByRole("region", { name: "Connect" });
  for (const value of [contact.connect.phone, contact.connect.email, contact.connect.instagram]) {
    await expect(connect.getByText(value.display, { exact: true })).toBeVisible();
    expect(value.href).toBeNull();
  }
  expect(contact.visit.mapHref).toBeNull();
  // No actions anywhere: no tel:, mailto:, external or map links.
  await expect(f.locator('a[href^="tel:"], a[href^="mailto:"], a[href^="http"], a[href*="instagram"]')).toHaveCount(0);
  await expect(f.getByRole("region", { name: "Visit AKSH" }).getByRole("link")).toHaveCount(0);
  await expect(connect.getByRole("link")).toHaveCount(0);
});

test("Explore links scroll to their sections", async ({ page }) => {
  await open(page, 1440, 900);
  await toBottom(page);
  await footer(page).getByRole("link", { name: "FAQs" }).click();
  await expect(page).toHaveURL(/\/#faq$/);
  await expect(page.locator("section#faq")).toBeInViewport();
});

for (const [width, height] of [
  [1440, 900],
  [768, 1024],
  [390, 844],
  [320, 568],
]) {
  test(`service links land on their card, uncovered by the stack, at ${width}x${height}`, async ({ page }) => {
    test.setTimeout(60_000);
    await open(page, width, height);
    for (const category of servicesContent.categories) {
      await toBottom(page);
      await page.waitForTimeout(200);
      await footer(page).getByRole("link", { name: category.title, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`/#service-${category.id}$`));
      // The heading is in view below the header and nothing covers it.
      await expect
        .poll(() =>
          page.evaluate((id) => {
            const heading = document.getElementById(`service-${id}-heading`)!;
            const box = heading.getBoundingClientRect();
            const header = document.querySelector("header")!.getBoundingClientRect().bottom;
            const hit = document.elementFromPoint(box.left + 4, box.top + box.height / 2);
            return box.top >= header && box.bottom <= window.innerHeight && !!hit && heading.contains(hit);
          }, category.id)
        )
        .toBe(true);
    }
  });
}

test("keyboard: every footer control is reachable with a visible focus ring", async ({ page }) => {
  await open(page, 1440, 900);
  // Start from the last FAQ control, then tab forward into the footer.
  await page.locator("#faq [data-faq-support] button").focus();
  const onCharcoal = [...explore.links.map((l) => l.label), ...services.links.map((l) => l.label), "Pause waves"];
  for (const name of onCharcoal) {
    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    await expect(focused).toHaveAccessibleName(name);
    expect(await focused.evaluate((el) => el.closest("[data-footer-body]") !== null)).toBe(true);
    // Retrying: controls with transition-colors fade the outline colour in.
    await expect(focused).toHaveCSS("outline-width", "2px");
    await expect(focused).toHaveCSS("outline-style", "solid");
    await expect(focused).toHaveCSS("outline-color", "rgb(249, 248, 244)");
  }
  // The logo, on ivory, keeps the standard black ring.
  await page.keyboard.press("Tab");
  const logo = page.locator(":focus");
  await expect(logo).toHaveAccessibleName("AKSH Wellness - Return to home");
  await expect(logo).toHaveCSS("outline-style", "solid");
  await expect(logo).toHaveCSS("outline-color", "rgb(0, 0, 0)");
  // The waves are decorative: nothing in them takes focus or is announced.
  await expect(footer(page).locator("[data-footer-wave]")).toHaveAttribute("aria-hidden", "true");
});

for (const vp of VIEWPORTS) {
  test(`layout at ${vp.width}x${vp.height}: full width, waves, columns, logo band, targets, no overflow`, async ({ page }) => {
    await open(page, vp.width, vp.height);
    await toWaves(page);
    expect(await overflow(page)).toBe(0);

    await expect(body(page)).toHaveCSS("background-color", "rgb(40, 40, 38)");
    await expect(body(page)).toHaveCSS("border-radius", "0px");
    await expect(body(page)).toHaveCSS("box-shadow", "none");
    await expect(footer(page)).toHaveCSS("position", "static");
    await expect(brand(page)).toHaveCSS("background-color", "rgb(249, 248, 244)");

    // Four layers of charcoal, rising opacity back to front; the front opaque.
    await expect(layers(page)).toHaveCount(4);
    expect(await layers(page).evaluateAll((els) => els.map((el) => getComputedStyle(el).fillOpacity))).toEqual([
      "0.14",
      "0.28",
      "0.5",
      "1",
    ]);
    await expect(footer(page).locator("[data-footer-wave] svg")).toHaveCSS("fill", "rgb(40, 40, 38)");

    const g = await page.evaluate(() => {
      const box = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
      const faq = box("#faq");
      const footer = box("footer");
      const surface = box("footer [data-footer-surface]");
      const band = box("footer [data-footer-wave]");
      const svg = box("footer [data-footer-wave] svg");
      const body = box("footer [data-footer-body]");
      const brand = box("footer [data-footer-brand]");
      const container = box("#faq .aksh-container");
      const grid = box("footer [data-footer-body] .aksh-container > div:first-child");
      const bodyEl = document.querySelector("footer [data-footer-body]")!;
      const content = Math.min(
        ...[...bodyEl.querySelectorAll("a, button, p, h2, li, dt, dd, address")].map((el) => el.getBoundingClientRect().top)
      );
      // Every layer's top edge, sampled across the visible window.
      const edges = [...document.querySelectorAll<SVGPathElement>("footer [data-wave-layer]")].map((path) => {
        const matrix = path.getScreenCTM()!;
        const length = path.getTotalLength();
        const ys: number[] = [];
        for (let at = 0; at <= length; at += length / 800) {
          const point = path.getPointAtLength(at);
          if (point.y >= 99.5) continue;
          const screen = new DOMPoint(point.x, point.y).matrixTransform(matrix);
          if (screen.x < svg.left || screen.x > svg.right) continue;
          ys.push(screen.y);
        }
        return { highest: Math.min(...ys), deepest: Math.max(...ys) };
      });
      return {
        viewport: document.documentElement.clientWidth,
        gap: footer.top - faq.bottom,
        surface: { left: surface.left, width: surface.width },
        band: { top: band.top, height: band.height },
        svg: { left: svg.left, width: svg.width, bottom: svg.bottom },
        body: { left: body.left, width: body.width, top: body.top, bottom: body.bottom },
        brand: { left: brand.left, width: brand.width, top: brand.top, bottom: brand.bottom + window.scrollY },
        container: { left: container.left, width: container.width },
        grid: { left: grid.left, width: grid.width },
        page: document.documentElement.scrollHeight,
        content,
        edges,
      };
    });

    // Edge to edge, in flow: the FAQ's section gap above, nothing below the logo band.
    expect(Math.round(g.gap)).toBe(vp.gap);
    for (const area of [g.surface, g.svg, g.body, g.brand]) {
      expect(area.left).toBe(0);
      expect(area.width).toBe(g.viewport);
    }
    expect(Math.round(g.brand.top)).toBe(Math.round(g.body.bottom));
    expect(Math.round(g.brand.bottom)).toBe(g.page);
    // Content in the site container, with its gutters.
    expect(g.grid.left).toBeCloseTo(g.container.left, 0);
    expect(g.grid.width).toBeCloseTo(g.container.width, 0);
    if (vp.width < 1376) expect(Math.round(g.grid.left)).toBe(vp.gutter);

    // Waves: the token's depth, each layer inside the band, the front layer
    // overlapping the body (no seam), and the text well below every layer.
    expect(g.band.height).toBeCloseTo(vp.wave, 0);
    expect(g.svg.bottom).toBeGreaterThan(g.body.top);
    for (const edge of g.edges) {
      expect(edge.highest).toBeGreaterThanOrEqual(g.band.top - 0.5);
      expect(edge.deepest).toBeLessThan(g.body.top);
      // Visibly wavy at every width.
      expect(edge.deepest - edge.highest).toBeGreaterThan(vp.wave * 0.3);
    }
    expect(g.content - Math.max(...g.edges.map((e) => e.deepest))).toBeGreaterThanOrEqual(24);

    // Columns: Explore, Our Services, Visit AKSH, Connect.
    const groups = await page.evaluate(() =>
      [...document.querySelectorAll("footer [data-footer-body] .aksh-container > div:first-child > *")].map((el) => {
        const r = el.getBoundingClientRect();
        return { top: Math.round(r.top), left: Math.round(r.left), bottom: Math.round(r.bottom) };
      })
    );
    expect(groups).toHaveLength(4);
    if (vp.width >= 1024) {
      expect(new Set(groups.map((b) => b.top)).size).toBe(1);
      for (let i = 1; i < 4; i++) expect(groups[i].left).toBeGreaterThan(groups[i - 1].left);
    } else if (vp.width >= 768) {
      expect(groups[1].top).toBe(groups[0].top);
      expect(groups[1].left).toBeGreaterThan(groups[0].left);
      expect(groups[2].top).toBeGreaterThan(Math.max(groups[0].bottom, groups[1].bottom));
      expect(groups[3].top).toBe(groups[2].top);
      expect(groups[2].left).toBe(groups[0].left);
      expect(groups[3].left).toBe(groups[1].left);
    } else {
      for (let i = 1; i < 4; i++) expect(groups[i].top).toBeGreaterThan(groups[i - 1].bottom);
      expect(new Set(groups.map((b) => b.left)).size).toBe(1);
    }

    // Targets at least 44px tall.
    for (const target of await footer(page).locator("a, button").all()) {
      expect((await target.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }

    // Logo band: the artwork unaltered and centred, the copyright small beneath it.
    const logo = brand(page).locator('img[src*="aksh-wellness-logo"]');
    await expect(logo).toHaveCSS("width", "240px");
    await expect(logo).toHaveCSS("height", "184px");
    const frame = (await brand(page).getByRole("link").boundingBox())!;
    expect(frame.x + frame.width / 2).toBeCloseTo(g.viewport / 2, 0);
    const copyright = brand(page).getByText(rights, { exact: false });
    await expect(copyright).toHaveCSS("font-size", "14px");
    expect((await copyright.boundingBox())!.y).toBeGreaterThan(frame.y + frame.height);
  });
}

test("each wave layer drifts on its own loop while in view; the text never moves", async ({ page }) => {
  await open(page, 1440, 900);
  // Off screen at first: still.
  expect(await waveState(page)).toBe("paused");
  await toWaves(page);
  await expect(surface(page)).toHaveAttribute("data-wave-state", "playing");
  const first = await transforms(page);
  await page.waitForTimeout(600);
  const later = await transforms(page);
  // All four move, and no two in step.
  for (let i = 0; i < 4; i++) {
    expect(first[i]).not.toBe("none");
    expect(later[i]).not.toBe(first[i]);
  }
  expect(new Set(later).size).toBe(4);

  const before = await body(page).boundingBox();
  const text = await footer(page).getByRole("link", { name: "FAQs" }).boundingBox();
  await page.waitForTimeout(500);
  expect(await body(page).boundingBox()).toEqual(before);
  expect(await footer(page).getByRole("link", { name: "FAQs" }).boundingBox()).toEqual(text);
  await expect(body(page)).toHaveCSS("transform", "none");
  await expect(body(page)).toHaveCSS("animation-name", "none");

  // Scrolled away: paused on the current frame.
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(surface(page)).toHaveAttribute("data-wave-state", "paused");
  const held = await transforms(page);
  await page.waitForTimeout(400);
  expect(await transforms(page)).toEqual(held);

  // Back in view, then a hidden tab: paused; visible again: moving.
  await toWaves(page);
  await expect(surface(page)).toHaveAttribute("data-wave-state", "playing");
  await setHidden(page, true);
  await expect(surface(page)).toHaveAttribute("data-wave-state", "paused");
  await setHidden(page, false);
  await expect(surface(page)).toHaveAttribute("data-wave-state", "playing");
});

test("the Pause/Resume control holds a pause by keyboard, and shifts nothing", async ({ page }) => {
  await open(page, 1440, 900);
  await toWaves(page);
  const c = control(page);
  await expect(c).toHaveAccessibleName("Pause waves");
  await c.focus();
  const before = await body(page).boundingBox();
  await page.keyboard.press("Enter");
  await expect(c).toHaveAccessibleName("Resume waves");
  await expect(c).toBeFocused();
  await expect(surface(page)).toHaveAttribute("data-wave-state", "paused");
  const held = await transforms(page);
  await page.waitForTimeout(400);
  expect(await transforms(page)).toEqual(held);
  expect(await body(page).boundingBox()).toEqual(before);

  // Away and back: still paused.
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await toWaves(page);
  await expect(surface(page)).toHaveAttribute("data-wave-state", "paused");

  await c.focus();
  await page.keyboard.press("Space");
  await expect(c).toHaveAccessibleName("Pause waves");
  await expect(surface(page)).toHaveAttribute("data-wave-state", "playing");
});

test("reduced motion: the complete waves stay still and the control is removed", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, 1440, 900);
  await toWaves(page);
  expect(await waveState(page)).toBe("static");
  expect(await transforms(page)).toEqual(["none", "none", "none", "none"]);
  expect(await layers(page).evaluateAll((els) => els.map((el) => getComputedStyle(el).animationName))).toEqual([
    "none",
    "none",
    "none",
    "none",
  ]);
  await expect(footer(page).locator("[data-footer-wave] svg")).toBeVisible();
  await expect(footer(page).getByRole("button", { name: /waves/ })).toHaveCount(0);
  expect(await overflow(page)).toBe(0);
});

test("the control's row is reserved: it is the same height with and without JavaScript", async ({ browser }) => {
  const measure = async (javaScriptEnabled: boolean) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled });
    const page = await context.newPage();
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    if (javaScriptEnabled) await expect(control(page)).toBeVisible();
    const row = (await control(page).locator("..").boundingBox())!.height;
    const brandHeight = (await brand(page).boundingBox())!.height;
    await context.close();
    return { row, brandHeight };
  };
  expect(await measure(true)).toEqual(await measure(false));
});

test("without JavaScript: the waves, links and logo band are complete and usable", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  const f = footer(page);
  await f.scrollIntoViewIfNeeded();
  expect(await waveState(page)).toBe("static");
  await expect(layers(page)).toHaveCount(4);
  await expect(f.locator("[data-footer-wave] svg")).toBeVisible();
  expect(await transforms(page)).toEqual(["none", "none", "none", "none"]);
  await expect(control(page)).toBeHidden();
  for (const link of [...explore.links, ...services.links]) {
    await expect(f.getByRole("link", { name: link.label, exact: true }).first()).toHaveAttribute("href", link.href);
  }
  await expect(brand(page).locator('img[src*="aksh-wellness-logo"]')).toBeVisible();
  await expect(brand(page)).toContainText(rights);
  // The placeholder groups are read per request and stream in with
  // JavaScript (like the testimonial samples); they never reach production.
  await expect(f.getByRole("region", { name: "Visit AKSH" })).toHaveCount(0);
  expect(await overflow(page)).toBe(0);
  await context.close();
});
