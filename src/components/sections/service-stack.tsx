"use client";

import { useEffect, useRef, type ReactNode } from "react";

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const cssNumber = (style: CSSStyleDeclaration, name: string) =>
  Number.parseFloat(style.getPropertyValue(name)) || 0;

type StackLayout = {
  /** Sticky top of each card, in viewport pixels. */
  tops: number[];
  /** Height of each card while stacked. */
  heights: number[];
  /** Natural offset of each card from the top of the list. */
  offsets: number[];
  /** Bottom of the sticky header: the top of the visible stacking area. */
  visibleTop: number;
  /**
   * Where reading starts: the first card's sticky top, below the header and
   * the progress line's band (which fills the gap between them).
   */
  readingTop: number;
};

/**
 * Scroll distances, from the list's top, at which progress starts (the first
 * card's top reaches the reading line) and ends (the last card settles).
 */
type ProgressRange = { start: number; end: number };

/**
 * Ordered list of service cards with an optional "card stack".
 *
 * The server markup is a plain list in normal flow, so every card is readable
 * without JavaScript. After hydration this component turns the stack on when
 * CSS allows it (no reduced-motion preference; see globals.css) and the cards
 * can stack safely:
 * - Fit: every card fits below the header at its stepped sticky top. Heights
 *   are equalised so a covered card shows only its top edge.
 * - Tall (tablet and mobile, --service-stack-tall): a card taller than the
 *   visible area sticks with its bottom on the pin line, so its whole content
 *   scrolls into view before the next card rises over it. Shorter cards are
 *   extended only as far as needed to cover the card beneath, leaving a
 *   one-step edge. This needs at least --service-stack-min-window of visible
 *   height; otherwise cards keep normal flow (for example, phones in
 *   landscape).
 * If the page would end before the last card settles, it adds only the
 * missing distance as a spacer inside the list.
 *
 * Scrolling stays native: the script never intercepts wheel, touch, or keys.
 * It reads card positions on scroll to let covered cards recede, and scrolls a
 * covered card back into view when it receives keyboard focus or is the
 * target of a link (#service-<id>).
 *
 * Above the list, a thin progress line (decorative, aria-hidden, hidden
 * without JavaScript) sticks in the gap between the header and the first
 * card's sticky top, on a band of page colour that content scrolls beneath.
 * It fills from 0 when the first card's top reaches the reading line to 1 when
 * the last card settles at its sticky top (a bottom-pinned tall card
 * included), or, in normal flow, when the last card's top reaches the reading
 * line. The same scroll frame that updates the cards sets it, through a CSS
 * variable, so React never re-renders on scroll. Heights are
 * measured against the small viewport (100svh), which stays fixed while
 * mobile toolbars show and hide, so pinned cards do not jump.
 *
 * Children must be <li data-service-stack-item> elements, each holding one
 * [data-service-card] element.
 */
export function ServiceStack({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const listRef = useRef<HTMLOListElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const list = listRef.current;
    const progress = progressRef.current;
    if (!list) return;

    const items = Array.from(
      list.querySelectorAll<HTMLElement>(":scope > [data-service-stack-item]")
    );
    const cards = items.map((item) =>
      item.querySelector<HTMLElement>("[data-service-card]")
    );
    if (items.length < 2 || cards.some((card) => card === null)) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    // 100svh (with a 100vh fallback) ignores mobile toolbars showing and hiding.
    const viewportProbe = document.createElement("div");
    viewportProbe.setAttribute("aria-hidden", "true");
    viewportProbe.style.cssText =
      "position:fixed;top:0;left:0;width:0;height:100vh;height:100svh;visibility:hidden;pointer-events:none";
    document.body.append(viewportProbe);
    const stableViewportHeight = () =>
      viewportProbe.getBoundingClientRect().height || document.documentElement.clientHeight;

    let active = false;
    let layout: StackLayout | null = null;
    let range: ProgressRange | null = null;
    let measuredWidth = -1;
    let measuredViewport = -1;
    let frame = 0;
    let disposed = false;

    const turnOff = () => {
      active = false;
      layout = null;
      list.dataset.stack = "off";
      list.style.removeProperty("--service-stack-card-height");
      list.style.removeProperty("--service-stack-tail");
      delete list.dataset.stackTail;
      items.forEach((item, index) => {
        item.style.removeProperty("--service-stack-top");
        item.style.removeProperty("--service-stack-origin");
        item.style.removeProperty("--service-stack-card-height");
        cards[index]?.style.removeProperty("--service-stack-depth");
      });
    };

    // Each card recedes by how far the cards above it have covered it.
    const updateDepth = () => {
      if (!active || !layout) return;
      const { tops: stuck, heights, visibleTop } = layout;
      const tops = items.map((item) => item.getBoundingClientRect().top);
      const coverage = items.map((_, index) => {
        if (index === 0) return 0;
        // Overlap starts when this card reaches the previous card's stuck
        // bottom, and is complete once this card has settled or has risen to
        // the header, hiding the previous card.
        const touch = stuck[index - 1] + heights[index - 1];
        const complete = Math.max(stuck[index], visibleTop);
        return touch > complete ? clamp01((touch - tops[index]) / (touch - complete)) : 0;
      });
      cards.forEach((card, index) => {
        let depth = 0;
        for (let above = index + 1; above < items.length; above++) {
          depth += coverage[above];
        }
        card?.style.setProperty("--service-stack-depth", depth.toFixed(4));
      });
    };

    const measureStack = () => {
      turnOff();
      if (reducedMotion.matches) return;

      const natural = cards.map((card) => card?.getBoundingClientRect().height ?? 0);

      list.dataset.stack = "on";
      // CSS owns the motion condition; respect its decision.
      if (getComputedStyle(items[0]).position !== "sticky") {
        turnOff();
        return;
      }

      // Header-aware tops, one step lower per card (from CSS).
      const stepped = items.map((item) => Number.parseFloat(getComputedStyle(item).top));
      if (!stepped.every(Number.isFinite)) {
        turnOff();
        return;
      }
      const listStyle = getComputedStyle(list);
      const gap = cssNumber(listStyle, "--service-stack-gap");
      const bottom = cssNumber(listStyle, "--service-stack-bottom");
      const allowTall = cssNumber(listStyle, "--service-stack-tall") === 1;
      const minWindow = cssNumber(listStyle, "--service-stack-min-window");
      const rowGap = Number.parseFloat(listStyle.rowGap) || 0;
      const viewportHeight = stableViewportHeight();
      const pinLine = viewportHeight - bottom;
      const visibleTop = stepped[0] - gap;
      const tallest = Math.ceil(Math.max(...natural));

      let tops: number[];
      let heights: number[];
      if (stepped.every((top) => top + tallest <= pinLine)) {
        // Fit: every card, at its own stepped top, fits above the pin line.
        heights = items.map(() => tallest);
        tops = stepped;
        list.style.setProperty("--service-stack-card-height", `${tallest}px`);
      } else if (allowTall && pinLine - stepped[0] >= minWindow) {
        // Tall: each card aims to stick one step below the visible top of the
        // previous card. A card too tall for that sticks with its bottom on
        // the pin line instead, so its whole content has scrolled into view
        // before the next card covers it. A shorter card is extended just
        // enough to reach the previous card's stuck bottom, so a covered card
        // shows only a step at the top and never shows beneath its cover.
        const step = stepped[1] - stepped[0];
        tops = [];
        heights = [];
        natural.forEach((height, index) => {
          const aim =
            index === 0 ? stepped[0] : Math.max(tops[index - 1], visibleTop) + step;
          const top = Math.min(aim, pinLine - height);
          const previousBottom = index === 0 ? 0 : tops[index - 1] + heights[index - 1];
          tops.push(top);
          heights.push(Math.max(height, previousBottom - top));
          const item = items[index];
          item.style.setProperty("--service-stack-top", `${top}px`);
          if (heights[index] > height) {
            item.style.setProperty("--service-stack-card-height", `${Math.ceil(heights[index])}px`);
          }
          // A bottom-pinned card recedes towards its visible bottom edge.
          if (top < aim) item.style.setProperty("--service-stack-origin", "50% 100%");
        });
      } else {
        turnOff();
        return;
      }

      const offsets = heights.map((_, index) =>
        heights.slice(0, index).reduce((sum, height) => sum + height + rowGap, 0)
      );

      // The last card settles once its natural top reaches its sticky top.
      // If the page ends sooner, add only the missing distance below the stack
      // as a spacer inside the list. One extra pixel absorbs sub-pixel
      // rounding; the stuck cards hold their place over it.
      const last = items.length - 1;
      const listBottom = list.getBoundingClientRect().bottom + window.scrollY;
      const belowStack = document.documentElement.scrollHeight - listBottom;
      const tail = Math.ceil(viewportHeight - tops[last] - heights[last] - belowStack) + 1;
      if (tail > 0) {
        list.style.setProperty("--service-stack-tail", `${tail}px`);
        list.dataset.stackTail = "";
      }

      layout = { tops, heights, offsets, visibleTop, readingTop: stepped[0] };
      active = true;
      updateDepth();
    };

    // From the stack's own geometry while stacked; otherwise from the cards'
    // natural positions. The reading line is the progress line's sticky top.
    const measureProgress = () => {
      range = null;
      if (!progress) return;
      const readingTop = layout?.readingTop ?? Number.parseFloat(getComputedStyle(progress).top);
      if (!Number.isFinite(readingTop)) return;
      const last = items.length - 1;
      if (active && layout) {
        range = { start: layout.offsets[0] - readingTop, end: layout.offsets[last] - layout.tops[last] };
      } else {
        const listTop = list.getBoundingClientRect().top;
        const natural = (index: number) => items[index].getBoundingClientRect().top - listTop;
        range = { start: natural(0) - readingTop, end: natural(last) - readingTop };
      }
    };

    const updateProgress = () => {
      if (!progress || !range) return;
      const scrollY = window.scrollY;
      const listTop = list.getBoundingClientRect().top + scrollY;
      const start = listTop + range.start;
      // The page may end before the last card reaches the line (normal flow).
      const end = Math.min(
        listTop + range.end,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const value = end > start ? clamp01((scrollY - start) / (end - start)) : scrollY >= start ? 1 : 0;
      progress.style.setProperty("--service-progress", value.toFixed(4));
    };

    // One scroll frame updates both the cards' depth and the progress line.
    const update = () => {
      updateDepth();
      updateProgress();
    };

    const measure = () => {
      // Measuring briefly returns cards to normal flow, which can shorten the
      // page and clamp the scroll position; restore it before the next paint.
      // When the view starts below the stack (a link to a later section such
      // as /#experience, or reading on), keep that content in place instead,
      // so a change in the stack's height does not move it.
      const scrollY = window.scrollY;
      const bottomBefore = list.getBoundingClientRect().bottom;
      measureStack();
      measuredWidth = document.documentElement.clientWidth;
      measuredViewport = stableViewportHeight();
      const viewBelowStack = bottomBefore <= (layout?.visibleTop ?? 0);
      const growth = list.getBoundingClientRect().bottom + window.scrollY - (bottomBefore + scrollY);
      const target = viewBelowStack ? scrollY + growth : scrollY;
      if (window.scrollY !== target) window.scrollTo({ top: target, behavior: "instant" });
      measureProgress();
      updateProgress();
    };

    const schedule = (task: () => void) => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        task();
      });
    };
    const scheduleMeasure = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
      schedule(measure);
    };

    const onScroll = () => schedule(update);
    // Mobile toolbars resize the window while scrolling. The layout depends
    // only on the width and the small-viewport height, so re-measure (an
    // orientation change, a window resize) only when one of those changes.
    const onResize = () => {
      const width = document.documentElement.clientWidth;
      if (width === measuredWidth && stableViewportHeight() === measuredViewport) {
        schedule(update);
        return;
      }
      scheduleMeasure();
    };

    // Font loading, image loading or enlarged text can change card heights.
    let initialObservation = true;
    const resizeObserver = new ResizeObserver(() => {
      if (initialObservation) {
        initialObservation = false;
        return;
      }
      scheduleMeasure();
    });

    // A stuck card can be covered by later cards, or rest partly under the
    // header. When keyboard focus lands inside it, scroll to the point where
    // that card has just settled and the next card has not yet overlapped it.
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!active || !(target instanceof HTMLElement)) return;
      if (!target.matches(":focus-visible")) return;
      const index = items.findIndex((item) => item.contains(target));
      if (index < 0) return;

      window.requestAnimationFrame(() => {
        if (!active || !layout) return;
        const targetRect = target.getBoundingClientRect();
        const covered = items
          .slice(index + 1)
          .some((later) => later.getBoundingClientRect().top < targetRect.bottom);
        const underHeader = targetRect.top < layout.readingTop;
        if (!covered && !underHeader) return;
        const naturalTop = list.getBoundingClientRect().top + layout.offsets[index];
        window.scrollBy({ top: naturalTop - layout.tops[index], behavior: "instant" });
      });
    };

    // A link to a card (#service-<id>, from the footer) would jump to where
    // every stuck card lies on top of the others, so it is covered. Land
    // where that card has just settled instead, as for keyboard focus.
    const settleOnHash = () => {
      if (!active || !layout) return;
      const id = decodeURIComponent(window.location.hash.slice(1));
      const index = id ? items.findIndex((item) => item.id === id) : -1;
      if (index < 0) return;
      const naturalTop = list.getBoundingClientRect().top + layout.offsets[index];
      // A card taller than the window is pinned by its bottom edge; show its
      // start instead, just below the header and progress band, before it pins.
      const landing = Math.max(layout.tops[index], layout.readingTop);
      window.scrollBy({ top: naturalTop - landing, behavior: "instant" });
    };
    // After the browser's own jump.
    const onHashChange = () => window.requestAnimationFrame(settleOnHash);
    // The same link again fires no hashchange, but the browser jumps again.
    const onClick = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest("a") : null;
      if (!link || !link.hash || link.pathname !== window.location.pathname) return;
      if (link.hash === window.location.hash) window.requestAnimationFrame(settleOnHash);
    };

    // The progress line is decorative and needs this script: show it now.
    if (progress) progress.hidden = false;
    measure();
    if (window.location.hash) window.requestAnimationFrame(settleOnHash);
    document.fonts?.ready.then(() => {
      if (!disposed) scheduleMeasure();
    });
    for (const card of cards) if (card) resizeObserver.observe(card);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    reducedMotion.addEventListener("change", scheduleMeasure);
    list.addEventListener("focusin", onFocusIn);
    window.addEventListener("hashchange", onHashChange);
    document.addEventListener("click", onClick);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      reducedMotion.removeEventListener("change", scheduleMeasure);
      list.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("hashchange", onHashChange);
      document.removeEventListener("click", onClick);
      viewportProbe.remove();
      turnOff();
      if (progress) {
        progress.hidden = true;
        progress.style.removeProperty("--service-progress");
      }
    };
  }, []);

  return (
    <>
      {/* Takes no height: the list and the cards keep their positions. */}
      <div ref={progressRef} data-service-progress aria-hidden="true" hidden>
        <div data-service-progress-band />
        <div data-service-progress-track>
          <div data-service-progress-fill />
        </div>
      </div>
      <ol ref={listRef} data-stack="off" className={className}>
        {children}
      </ol>
    </>
  );
}
