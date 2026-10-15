import { expect, test, type Page } from "@playwright/test";
import { aboutContent } from "../../src/content/about";
import { servicesContent } from "../../src/content/services";
import { consultantContent } from "../../src/content/consultant";
import { experienceContent } from "../../src/content/experience";
import { testimonialsContent } from "../../src/content/testimonials";

/*
 * Section mastheads at every size (development mode, so Client Experiences'
 * development-only samples render):
 * - One image element per section, visible at every width: the same file as
 *   on desktop (served unchanged, never a resized or art-directed variant)
 * - Whole and in proportion (width 100% of its box, height auto, object-fit
 *   contain), never clipped, inside the container's gutters
 * - One accessible name, with no typed duplicate of the lettering
 * - No horizontal overflow
 */

const MASTHEADS = [
  { section: "about-aksh", alt: "About Us", artwork: aboutContent.artwork },
  { section: "services", alt: "Our Services", artwork: servicesContent.artwork },
  { section: "meet-our-consultant", alt: "Meet Our Consultant", artwork: consultantContent.artwork },
  { section: "experience", alt: "The AKSH Experience", artwork: experienceContent.artwork },
  { section: "client-experiences", alt: "Client Experiences", artwork: testimonialsContent.artwork },
];

const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
  { width: 360, height: 800 },
  { width: 320, height: 568 },
];

async function measure(page: Page, section: string, alt: string) {
  const image = page.locator(`section#${section}`).getByRole("img", { name: alt, exact: true });
  await expect(image).toHaveCount(1);
  await image.scrollIntoViewIfNeeded();
  await image.evaluate((img: HTMLImageElement) => img.decode());
  return image.evaluate((img: HTMLImageElement) => {
    const rect = img.getBoundingClientRect();
    const style = getComputedStyle(img);
    const container = img.closest(".aksh-container")!.getBoundingClientRect();
    let clipped: string | null = null;
    for (let el: Element | null = img.parentElement; el; el = el.parentElement) {
      const s = getComputedStyle(el);
      if (s.overflowX !== "visible" || s.overflowY !== "visible" || s.clipPath !== "none") clipped = clipped ?? el.tagName;
    }
    return {
      src: new URL(img.currentSrc).pathname,
      attrSrc: img.getAttribute("src"),
      srcset: img.getAttribute("srcset"),
      display: style.display,
      visibility: style.visibility,
      fit: style.objectFit,
      width: rect.width,
      ratio: rect.height / rect.width,
      naturalRatio: img.naturalHeight / img.naturalWidth,
      inside: rect.left >= container.left - 0.5 && rect.right <= container.right + 0.5,
      inViewport: rect.left >= 0 && rect.right <= document.documentElement.clientWidth,
      clipped,
    };
  });
}

test("every section's masthead uses the desktop file at 1440, 768, 390, 360 and 320px, whole and unclipped", async ({ page }) => {
  test.setTimeout(120_000);
  const desktop: Record<string, string> = {};

  for (const viewport of VIEWPORTS) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);

    for (const { section, alt, artwork } of MASTHEADS) {
      const m = await measure(page, section, alt);
      const where = `${section} at ${viewport.width}px`;

      // The same file everywhere: the content's own path, as on desktop.
      expect(m.src, where).toBe(artwork.src);
      expect(m.attrSrc, where).toBe(artwork.src);
      expect(m.srcset, where).toBeNull();
      if (viewport.width === 1440) desktop[section] = m.src;
      else expect(m.src, where).toBe(desktop[section]);

      // Visible, whole and in proportion, fitted, never clipped, inside the gutters.
      expect(m.display, where).not.toBe("none");
      expect(m.visibility, where).toBe("visible");
      expect(m.fit, where).toBe("contain");
      expect(m.width, where).toBeGreaterThan(0);
      expect(Math.abs(m.ratio - artwork.height / artwork.width), where).toBeLessThanOrEqual(0.003);
      expect(Math.abs(m.naturalRatio - artwork.height / artwork.width), where).toBeLessThanOrEqual(0.003);
      expect(m.clipped, where).toBeNull();
      expect(m.inside, where).toBe(true);
      expect(m.inViewport, where).toBe(true);

      // One accessible name, with no typed duplicate of the lettering.
      const sectionLocator = page.locator(`section#${section}`);
      await expect(sectionLocator.getByRole("img", { name: alt, exact: true })).toHaveCount(1);
      await expect(sectionLocator.getByText(alt, { exact: true })).toHaveCount(0);
    }

    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
      `overflow at ${viewport.width}px`
    ).toBe(0);
  }
});
