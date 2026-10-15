"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { Container } from "@/components/layout/container";
import type { FooterWaves as FooterWavesGeometry } from "@/components/layout/footer-wave";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

const subscribeToMotionPreference = (onChange: () => void) => {
  const media = window.matchMedia(REDUCED_MOTION);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};

/**
 * The footer's full-width charcoal area, topped by four layered waves.
 *
 * - The waves span the viewport edge to edge over the ivory page: charcoal at
 *   rising opacity from back to front (geometry from footer-wave.ts, computed
 *   on the server). The front layer is opaque and overlaps the body by one
 *   border width, so it joins the solid footer without a seam
 * - Server markup is the complete, still waves (no JavaScript, reduced
 *   motion, loading). Once running, each layer drifts one period on its own
 *   loop and speed (src/app/globals.css); text and controls never move
 * - Pauses while off screen or while the tab is hidden; the Pause/Resume
 *   control holds a manual pause. Its row is always reserved, so nothing
 *   shifts when it appears, and it is removed under reduced motion
 */
export function FooterWaves({ waves, children }: { waves: FooterWavesGeometry; children: ReactNode }) {
  const waveRef = useRef<HTMLDivElement | null>(null);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const motionAllowed = useSyncExternalStore(
    subscribeToMotionPreference,
    () => !window.matchMedia(REDUCED_MOTION).matches,
    () => false
  );

  useEffect(() => {
    const wave = waveRef.current;
    if (!wave || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => setInView(entries.some((entry) => entry.isIntersecting)));
    observer.observe(wave);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const update = () => setTabVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  // "static": never started (server, reduced motion). "paused" keeps the current frame.
  const state = !motionAllowed ? "static" : paused || !inView || !tabVisible ? "paused" : "playing";

  return (
    <div data-footer-surface data-wave-state={state}>
      <div ref={waveRef} data-footer-wave aria-hidden="true" className="relative h-(--footer-wave-height)">
        <svg
          viewBox={waves.viewBox}
          preserveAspectRatio="none"
          focusable="false"
          className="absolute inset-x-0 top-0 w-full h-[calc(100%+var(--border-width))] fill-soft-charcoal"
          style={{ "--footer-wave-period": `${waves.period}px` } as CSSProperties}
        >
          {waves.layers.map((path, index) => (
            <path key={index} data-wave-layer={index + 1} d={path} />
          ))}
        </svg>
      </div>

      <div data-footer-body className="relative bg-soft-charcoal text-brand-ivory pt-24 pb-40 tablet:pb-48 desktop:pt-32 desktop:pb-56">
        <Container>
          {children}

          <div className="mt-40 border-t border-warm-stone/25 pt-24 flex justify-end min-h-(--target-min-size) motion-reduce:hidden">
            <button
              type="button"
              onClick={() => setPaused(!paused)}
              className={`inline-flex items-center gap-8 min-h-(--target-min-size) px-16 rounded-button border border-brand-ivory/40 font-ui text-body-small font-weight-medium text-brand-ivory hover:border-brand-ivory hover:bg-brand-ivory/10 focus-visible:outline-brand-ivory transition-colors duration-standard ease-standard cursor-pointer ${motionAllowed ? "" : "invisible"}`.trim()}
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
              <span>{paused ? "Resume waves" : "Pause waves"}</span>
            </button>
          </div>
        </Container>
      </div>
    </div>
  );
}
