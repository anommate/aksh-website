"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { AnimationItem } from "lottie-web";
import { useJourneyMotion } from "@/components/experience/journey-motion";

type LottiePlayer = typeof import("lottie-web/build/player/lottie_light").default;
type Segment = [number, number];

// The runtime (SVG renderer only, no expression engine) is bundled with this
// site and loaded on demand, the first time an illustration nears view.
let runtime: Promise<LottiePlayer> | null = null;
const loadRuntime = () =>
  (runtime ??= import("lottie-web/build/player/lottie_light").then((module) => module.default));

/**
 * The reveal, played once, then the loop, repeated: from the animation's
 * "reveal" and "loop" markers, or the whole timeline looped without them.
 */
function segmentsOf(animationData: { ip: number; op: number; markers?: { cm: string; tm: number; dr: number }[] }) {
  const marker = (name: string): Segment | null => {
    const found = animationData.markers?.find((m) => m.cm === name);
    return found ? [found.tm, found.tm + found.dr] : null;
  };
  const reveal = marker("reveal");
  const loop = marker("loop");
  return reveal && loop ? [reveal, loop] : [[animationData.ip, animationData.op] as Segment];
}

/**
 * Decorative journey illustration: a static SVG with a Lottie animation that
 * reveals once when the step is at least half in view, then loops gently.
 *
 * - The static SVG (the settled illustration, where the loop starts and
 *   ends) shows while loading, under reduced motion, without JavaScript, and
 *   if loading fails.
 * - Playback pauses while the step is off screen, the tab is hidden, or the
 *   visitor has paused the animations (JourneyMotionToggle), and resumes the
 *   same player from where it stopped.
 * - The animation instance is destroyed on unmount.
 * - Its box is sized by the caller, so nothing shifts when it starts.
 *
 * data-state (static, loading, ready, playing, paused, fallback) drives which
 * layer is visible (globals.css).
 */
export function JourneyIllustration({
  animation,
  poster,
  className,
}: {
  animation: string;
  poster: string;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const { paused } = useJourneyMotion();
  const pausedRef = useRef(paused);
  const syncRef = useRef<() => void>(() => {});

  useEffect(() => {
    pausedRef.current = paused;
    syncRef.current();
  }, [paused]);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage || typeof IntersectionObserver === "undefined") return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    let item: AnimationItem | null = null;
    let segments: Segment[] = [];
    let started = false;
    let inView = false;
    let disposed = false;
    const state = () => root.dataset.state;
    const setState = (next: string) => {
      root.dataset.state = next;
    };

    // Play while in view, visible and not paused by the visitor; otherwise
    // hold the current frame.
    const sync = () => {
      if (!item) return;
      const shouldPlay = inView && !document.hidden && !pausedRef.current;
      if (shouldPlay && state() !== "playing") {
        if (started) item.play();
        else {
          started = true;
          item.playSegments(segments, true);
        }
        setState("playing");
      } else if (!shouldPlay && state() === "playing") {
        item.pause();
        setState("paused");
      }
    };
    syncRef.current = sync;

    const load = async () => {
      setState("loading");
      try {
        const [lottie, response] = await Promise.all([loadRuntime(), fetch(animation)]);
        if (!response.ok) throw new Error(`${animation}: ${response.status}`);
        const animationData = await response.json();
        if (disposed) return;
        segments = segmentsOf(animationData);
        item = lottie.loadAnimation({
          container: stage,
          renderer: "svg",
          // With the reveal and loop queued, looping repeats only the loop.
          loop: true,
          autoplay: false,
          animationData,
          rendererSettings: {
            preserveAspectRatio: "xMidYMid meet",
            progressiveLoad: false,
            hideOnTransparent: true,
            focusable: false,
          },
        });
        item.addEventListener("data_failed", fail);
        setState("ready");
        sync();
      } catch {
        fail();
      }
    };

    const fail = () => {
      item?.destroy();
      item = null;
      if (!disposed) setState("fallback");
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting && entry.intersectionRatio >= 0.5;
        if (entry.isIntersecting && state() === "static") void load();
        sync();
      },
      { threshold: [0, 0.5] }
    );
    observer.observe(root);

    document.addEventListener("visibilitychange", sync);

    // Switching to reduced motion mid-way shows the static illustration.
    const onMotionChange = () => {
      if (!reducedMotion.matches) return;
      observer.disconnect();
      item?.destroy();
      item = null;
      setState("static");
    };
    reducedMotion.addEventListener("change", onMotionChange);

    return () => {
      disposed = true;
      syncRef.current = () => {};
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reducedMotion.removeEventListener("change", onMotionChange);
      item?.destroy();
      item = null;
    };
  }, [animation]);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      data-journey-illustration
      data-state="static"
      className={`relative shrink-0 ${className ?? ""}`.trim()}
    >
      <Image
        data-poster
        src={poster}
        alt=""
        width={160}
        height={160}
        unoptimized
        className="absolute inset-0 size-full"
      />
      <div ref={stageRef} data-lottie className="absolute inset-0" />
    </div>
  );
}
