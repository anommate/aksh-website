import { test, type Page } from "@playwright/test";
import { captureFile } from "./output";

/*
 * FAQ (#faq): the introduction and closed questions, then the longest answer
 * (04) open, at desktop, tablet and mobile sizes; the support block; plus 200%
 * zoom, reduced motion and no JavaScript.
 */

const VIEWPORTS = [
  { name: "desktop-1440x900", width: 1440, height: 900 },
  { name: "short-desktop-1366x768", width: 1366, height: 768 },
  { name: "tablet-768x1024", width: 768, height: 1024 },
  { name: "mobile-390x844", width: 390, height: 844 },
  { name: "mobile-320x568", width: 320, height: 568 },
];

async function openSection(page: Page) {
  await page.goto("/#faq");
  await page.evaluate(() => document.fonts.ready);
  await page.locator("#faq").waitFor();
  // Let the streamed sections above settle, then show the section top below the header.
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => {
    const header = document.querySelector("header")!.getBoundingClientRect().height;
    const top = document.getElementById("faq")!.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top - header - 24, behavior: "instant" });
  });
  await page.waitForTimeout(500);
}

const showQuestions = (page: Page) =>
  page.evaluate(() => {
    const header = document.querySelector("header")!.getBoundingClientRect().height;
    const top = document.querySelector("#faq [data-faq]")!.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top - header - 24, behavior: "instant" });
  });

async function openQuestion(page: Page, number: string) {
  const item = page.locator("#faq [data-faq-item]").filter({ hasText: number }).first();
  await item.locator("button, summary").first().click();
  await page.waitForTimeout(600);
  await item.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
}

for (const vp of VIEWPORTS) {
  test(`capture FAQ ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await openSection(page);
    await page.screenshot({ path: captureFile(`${vp.name}-1-intro.png`) });
    await showQuestions(page);
    await page.screenshot({ path: captureFile(`${vp.name}-2-closed.png`) });
    await openQuestion(page, "04");
    await page.mouse.move(0, 0);
    await page.screenshot({ path: captureFile(`${vp.name}-3-expanded-04.png`) });
    await page.evaluate(() =>
      document.querySelector("#faq [data-faq-support]")!.scrollIntoView({ block: "center", behavior: "instant" })
    );
    await page.screenshot({ path: captureFile(`${vp.name}-4-support.png`) });
  });
}

test("capture FAQ at 200% zoom (1440x900 at 2x)", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 720, height: 450 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await openSection(page);
  await openQuestion(page, "01");
  await page.screenshot({ path: captureFile("zoom-200pct-1440x900-expanded-01.png") });
  await context.close();
});

test("capture FAQ with reduced motion (390x844)", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await openSection(page);
  await openQuestion(page, "03");
  await page.screenshot({ path: captureFile("reduced-motion-390x844-expanded-03.png") });
});

test("capture FAQ without JavaScript (1440x900, 390x844)", async ({ browser }) => {
  for (const [width, height] of [[1440, 900], [390, 844]]) {
    const context = await browser.newContext({ viewport: { width, height }, javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    await page.locator("#faq").scrollIntoViewIfNeeded();
    await openQuestion(page, "01");
    await page.screenshot({ path: captureFile(`no-js-${width}x${height}-expanded-01.png`) });
    await context.close();
  }
});
