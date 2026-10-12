"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useAnimate } from "motion/react";
import type { Testimonial } from "@/content/testimonials";

/*
 * Testimonial columns, adapted from the 21st.dev "testimonials-columns-1"
 * component: a column of cards that scrolls upwards in a seamless loop.
 * Changes from the original: the shared Testimonial type, AKSH tokens with no
 * shadows, semantic quotes, decorative initials instead of remote portraits,
 * a visible sample badge, the duplicate copy hidden from assistive
 * technology, and playback that can be paused and resumed in place.
 */

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part.replace(/[^\p{L}]/gu, "").charAt(0))
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

/** One quote with its attribution and sample badge. */
export function TestimonialCard({ testimonial, badge }: { testimonial: Testimonial; badge: string }) {
  const { text, name, role, image } = testimonial;
  return (
    <figure
      data-testimonial-card
      className="flex h-full flex-col gap-20 p-(--card-padding) bg-warm-stone/30 border border-warm-stone rounded-quote-card"
    >
      <span className="self-start rounded-chip border border-control-outline px-8 font-ui text-eyebrow uppercase tracking-eyebrow text-muted-text">
        {badge}
      </span>
      <blockquote className="font-body text-body text-soft-charcoal">
        <p>{text}</p>
      </blockquote>
      <figcaption className="flex items-center gap-12">
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            className="size-40 shrink-0 rounded-circle object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="grid size-40 shrink-0 place-items-center rounded-circle bg-warm-stone font-ui text-label text-soft-charcoal"
          >
            {initials(name)}
          </span>
        )}
        <span className="flex flex-col">
          <span className="font-ui text-label text-logo-black">{name}</span>
          <span className="font-ui text-body-small text-muted-text">{role}</span>
        </span>
      </figcaption>
    </figure>
  );
}

function CardList({ testimonials, badge, duplicate = false }: { testimonials: readonly Testimonial[]; badge: string; duplicate?: boolean }) {
  return (
    <ul
      role="list"
      data-testimonials-group={duplicate ? "duplicate" : "original"}
      aria-hidden={duplicate || undefined}
      inert={duplicate || undefined}
      className="flex flex-col gap-(--grid-gap)"
    >
      {testimonials.map((testimonial) => (
        <li key={testimonial.name}>
          <TestimonialCard testimonial={testimonial} badge={badge} />
        </li>
      ))}
    </ul>
  );
}

/**
 * One column moving up by exactly one group per loop. The track holds the
 * group twice with the shared gap between and after them, so -50% of its
 * height is one group plus one gap: the copy lands where the original began
 * and the jump back to the start is invisible. The copy is hidden from
 * assistive technology and can never take focus.
 */
export function TestimonialsColumn({
  testimonials,
  badge,
  duration,
  playing,
  className,
}: {
  testimonials: readonly Testimonial[];
  badge: string;
  /** Seconds for one loop. */
  duration: number;
  playing: boolean;
  className?: string;
}) {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const controls = useRef<{ play: () => void; pause: () => void; stop: () => void } | null>(null);
  const playingRef = useRef(playing);

  useEffect(() => {
    const animation = animate(scope.current, { y: ["0%", "-50%"] }, { duration, ease: "linear", repeat: Infinity });
    if (!playingRef.current) animation.pause();
    controls.current = animation;
    return () => {
      animation.stop();
      controls.current = null;
    };
  }, [animate, scope, duration]);

  // Pausing keeps the current position; playing continues from it.
  useEffect(() => {
    playingRef.current = playing;
    if (playing) controls.current?.play();
    else controls.current?.pause();
  }, [playing]);

  return (
    <div data-testimonials-column data-duration={duration} className={className}>
      <div ref={scope} data-testimonials-track className="flex flex-col gap-(--grid-gap) pb-(--grid-gap)">
        <CardList testimonials={testimonials} badge={badge} />
        <CardList testimonials={testimonials} badge={badge} duplicate />
      </div>
    </div>
  );
}

/** All entries once, in normal flow: no JavaScript or reduced motion. */
export function TestimonialsGrid({ testimonials, badge }: { testimonials: readonly Testimonial[]; badge: string }) {
  return (
    <ul
      role="list"
      data-testimonials-grid
      className="grid grid-cols-1 gap-(--grid-gap) tablet:grid-cols-2 desktop:grid-cols-3"
    >
      {testimonials.map((testimonial) => (
        <li key={testimonial.name}>
          <TestimonialCard testimonial={testimonial} badge={badge} />
        </li>
      ))}
    </ul>
  );
}
