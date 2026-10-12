"use client";

import { createContext, useContext, useState, useSyncExternalStore, type ReactNode } from "react";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

type JourneyMotion = { paused: boolean; setPaused: (paused: boolean) => void };

const JourneyMotionContext = createContext<JourneyMotion>({ paused: false, setPaused: () => {} });

/** The visitor's choice to pause the journey illustrations, shared by all five. */
export function JourneyMotionProvider({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(false);
  return <JourneyMotionContext value={{ paused, setPaused }}>{children}</JourneyMotionContext>;
}

export const useJourneyMotion = () => useContext(JourneyMotionContext);

const subscribeToMotionPreference = (onChange: () => void) => {
  const media = window.matchMedia(REDUCED_MOTION);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};

/**
 * Pauses or resumes all five journey illustrations.
 *
 * - Its row is always reserved, so nothing shifts when it appears
 * - Hidden (and out of the tab order) until JavaScript runs; the row is
 *   removed entirely under reduced motion, when nothing animates
 * - A manual pause holds while the steps scroll away and back
 */
export function JourneyMotionToggle({ className }: { className?: string }) {
  const { paused, setPaused } = useJourneyMotion();
  const motionAllowed = useSyncExternalStore(
    subscribeToMotionPreference,
    () => !window.matchMedia(REDUCED_MOTION).matches,
    () => false
  );

  return (
    <div
      data-journey-motion
      className={`flex justify-end min-h-(--target-min-size) motion-reduce:hidden ${className ?? ""}`.trim()}
    >
      <button
        type="button"
        onClick={() => setPaused(!paused)}
        className={`inline-flex items-center gap-8 min-h-(--target-min-size) px-16 rounded-button border border-warm-stone bg-brand-ivory font-ui text-body-small font-weight-medium text-soft-charcoal hover:text-logo-black hover:border-control-outline transition-colors duration-standard ease-standard cursor-pointer ${motionAllowed ? "" : "invisible"}`.trim()}
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
        <span>{paused ? "Resume animations" : "Pause animations"}</span>
      </button>
    </div>
  );
}
