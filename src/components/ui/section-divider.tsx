"use client";

import { useEffect, useRef } from "react";

/**
 * Decorative interrupted rule between homepage sections (design spec "Signal
 * Dot and Interrupted Rule"): a 1px charcoal line across the content
 * container, broken by a red signal dot with an 8px clear gap on each side.
 *
 * The server renders it complete, so it is visible without JavaScript. On its
 * first entry into the viewport the two segments draw outwards from the dot.
 * Only transforms change, so its box never moves. It is armed only while off
 * screen, so a divider already in view never flashes; under reduced motion it
 * stays complete. Hidden from assistive technology.
 */
export function SectionDivider({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const divider = ref.current;
    if (!divider || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = divider.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < window.innerHeight) return;

    divider.dataset.reveal = "pending";
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        divider.dataset.reveal = "drawn";
      },
      // Start once the divider is a little way into the viewport.
      { rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(divider);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-section-divider
      className={`aksh-container flex items-center gap-8${className ? ` ${className}` : ""}`}
    >
      <span data-divider-segment className="flex-1 border-t border-soft-charcoal origin-right" />
      <span
        aria-hidden="true"
        className="size-(--signal-dot-size) rounded-circle bg-signal-red shrink-0"
      />
      <span data-divider-segment className="flex-1 border-t border-soft-charcoal origin-left" />
    </div>
  );
}
