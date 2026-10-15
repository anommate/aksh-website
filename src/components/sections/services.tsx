import type { CSSProperties } from "react";
import Image from "next/image";
import { Container } from "@/components/layout/container";
import { ServiceCard } from "@/components/sections/service-card";
import { ServiceStack } from "@/components/sections/service-stack";
import { serviceCardId, servicesContent } from "@/content/services";

/**
 * Homepage Services Section
 *
 * - One continuous ivory surface: owner-supplied single-line "OUR SERVICES"
 *   wordmark centred above the eyebrow with signal dot, H2 and introduction,
 *   then the card stack. The wordmark is shown whole and as supplied
 *   (transparent margins included) up to 640px wide, the container width
 *   below that; negative margins sized from its measured lettering rows (in %
 *   of its own width) offset those margins, so the lettering starts at the
 *   section top and sits --space-intro-content above the eyebrow. Its box is
 *   rounded to whole pixels, so the content below never lands between pixels
 * - Ivory cards with a fine stone outline (design spec: stone outline on ivory)
 * - Four numbered cards; where they can stack safely they do so with native
 *   sticky scrolling (see ServiceStack), otherwise they flow normally
 * - Bottom inset keeps the stack's settled end clear of what follows
 * - Anchor target #services lands 24px below the sticky header
 */
export function ServicesSection() {
  const { artwork } = servicesContent;
  // Transparent rows above and below the lettering, as % of the image width
  // (vertical margin percentages resolve against the wrapper's width, which is
  // the image's).
  const marginAbove = (artwork.ink.top / artwork.width) * 100;
  const marginBelow = ((artwork.height - 1 - artwork.ink.bottom) / artwork.width) * 100;
  const letteringRatio = (artwork.ink.bottom - artwork.ink.top + 1) / artwork.width;

  return (
    <section
      id={servicesContent.id}
      aria-labelledby="services-heading"
      className="w-full pb-(--section-band-inset) bg-brand-ivory scroll-mt-[calc(var(--header-height)+var(--border-width)+var(--spacing-24))]"
    >
      {/* One ivory surface for the artwork, introduction and card stack. */}
      <Container>
        <div data-services-masthead className="pb-(--space-intro-content)">
          {/* A size container, so the wordmark's box can be sized from its own width. */}
          <div className="@container flex justify-center">
            {/*
              The box holds the lettering rows only, rounded to a whole pixel;
              the image overflows it into its own transparent margins. Without
              round() the image's negative margins give the same layout, unrounded.
            */}
            <div
              data-services-wordmark
              className="w-full max-w-(--services-masthead-width) mb-(--space-intro-content)"
              style={{
                height: `round(nearest, min(var(--services-masthead-width), 100cqw) * ${letteringRatio}, 1px)`,
              }}
            >
              <Image
                src={artwork.src}
                alt={artwork.alt}
                width={artwork.width}
                height={artwork.height}
                // The supplied file itself, never a resized or re-encoded copy.
                unoptimized
                style={{
                  aspectRatio: `${artwork.width} / ${artwork.height}`,
                  marginTop: `${-marginAbove}%`,
                  marginBottom: `${-marginBelow}%`,
                }}
                className="w-full h-auto object-contain select-none pointer-events-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 desktop:grid-cols-12 gap-(--space-heading-intro) desktop:gap-24 desktop:items-end">
            <div className="desktop:col-span-6">
              <div className="flex items-center gap-8 mb-(--space-eyebrow-heading)">
                <span
                  className="size-(--signal-dot-size) rounded-circle bg-signal-red inline-block shrink-0"
                  aria-hidden="true"
                />
                <p className="font-ui text-eyebrow text-muted-text uppercase tracking-eyebrow">
                  {servicesContent.eyebrow}
                </p>
              </div>
              <h2
                id="services-heading"
                className="font-display text-section-heading text-logo-black max-w-(--measure-section-heading)"
              >
                {servicesContent.heading}
              </h2>
            </div>
            <p className="desktop:col-span-6 desktop:col-start-7 font-body text-body text-soft-charcoal max-w-(--measure-prose)">
              {servicesContent.introduction}
            </p>
          </div>
        </div>

        <ServiceStack className="flex flex-col gap-(--grid-gap)">
          {servicesContent.categories.map((category, index) => (
            <li
              key={category.id}
              // Footer "Our Services" links land here, below the sticky header.
              id={serviceCardId(category.id)}
              className="scroll-mt-[calc(var(--header-height)+var(--border-width)+var(--service-stack-gap))]"
              data-service-stack-item
              style={{ "--service-stack-index": index } as CSSProperties}
            >
              <ServiceCard category={category} />
            </li>
          ))}
        </ServiceStack>
      </Container>
    </section>
  );
}
