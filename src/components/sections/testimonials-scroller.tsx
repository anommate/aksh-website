"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { TestimonialsColumn, TestimonialsGrid } from "@/components/ui/testimonials-columns-1";
import type { Testimonial } from "@/content/testimonials";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const TABLET = "(min-width: 768px)";
const DESKTOP = "(min-width: 1024px)";

// Seconds per loop for a three-card column (desktop); longer columns scale up
// so every column moves at a similar, readable speed.
const DURATIONS = [35, 45, 40];

/** 0 = static grid (server, no JavaScript, reduced motion); else visible columns. */
function columnCount() {
  if (window.matchMedia(REDUCED_MOTION).matches) return 0;
  if (window.matchMedia(DESKTOP).matches) return 3;
  return window.matchMedia(TABLET).matches ? 2 : 1;
}

const subscribeToLayout = (onChange: () => void) => {
  const queries = [REDUCED_MOTION, TABLET, DESKTOP].map((query) => window.matchMedia(query));
  queries.forEach((query) => query.addEventListener("change", onChange));
  return () => queries.forEach((query) => query.removeEventListener("change", onChange));
};

const subscribeToVisibility = (onChange: () => void) => {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
};

/** Every entry, in order, split into `count` consecutive columns of near-equal length. */
function splitIntoColumns<T>(items: readonly T[], count: number) {
  const columns: T[][] = [];
  let start = 0;
  for (let i = 0; i < count; i++) {
    const size = Math.ceil((items.length - start) / (count - i));
    columns.push(items.slice(start, start + size));
    start += size;
  }
  return columns;
}

/**
 * The testimonials: all entries in every layout.
 *
 * - Desktop three columns, tablet two, mobile one, each scrolling upwards in
 *   a seamless loop; every entry appears once in the reading order
 * - Pauses while hovered or focused, off screen, or in a hidden tab, and
 *   while the visitor has paused it ("Pause testimonials"); it resumes from
 *   the same position
 * - Without JavaScript or under reduced motion: one static grid of all
 *   entries in normal flow, no control
 */
export function TestimonialsScroller({ testimonials, badge }: { testimonials: readonly Testimonial[]; badge: string }) {
  const count = useSyncExternalStore(subscribeToLayout, columnCount, () => 0);
  const hidden = useSyncExternalStore(subscribeToVisibility, () => document.hidden, () => false);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [count]);

  if (count === 0) return <TestimonialsGrid testimonials={testimonials} badge={badge} />;

  const playing = !paused && !hovered && !focused && inView && !hidden;
  const columns = splitIntoColumns(testimonials, count);

  return (
    <div data-testimonials-scroller data-playing={playing ? "true" : "false"}>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setPaused(!paused)}
          className="inline-flex items-center gap-8 min-h-(--target-min-size) px-16 rounded-button border border-warm-stone bg-brand-ivory font-ui text-body-small font-weight-medium text-soft-charcoal hover:text-logo-black hover:border-control-outline transition-colors duration-standard ease-standard cursor-pointer"
        >
          {paused ? (
            <svg aria-hidden="true" viewBox="0 0 12 12" className="size-12 fill-current">
              <path d="M3 1.5v9l7.5-4.5z" />
            </svg>
          ) : (
            <svg aria-hidden="true" viewBox="0 0 12 12" className="size-12 fill-current">
              <rect x="2" y="1.5" width="3" height="9" rx="1" />
              <rect x="7" y="1.5" width="3" height="9" rx="1" />
            </svg>
          )}
          <span>{paused ? "Resume testimonials" : "Pause testimonials"}</span>
        </button>
      </div>
      {/* Focusable so keyboard users can hold it still to read; its fade sits inside, the control outside. */}
      <div
        ref={viewportRef}
        role="region"
        aria-label="Sample testimonials"
        tabIndex={0}
        data-testimonials-viewport
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
        }}
        className="mt-(--space-eyebrow-heading) grid gap-(--grid-gap) overflow-hidden h-(--testimonials-viewport-height) tablet:grid-cols-2 desktop:grid-cols-3"
      >
        {columns.map((column, index) => (
          <TestimonialsColumn
            key={`${count}-${index}`}
            testimonials={column}
            badge={badge}
            duration={Math.round((DURATIONS[index] * column.length) / 3)}
            playing={playing}
          />
        ))}
      </div>
    </div>
  );
}
