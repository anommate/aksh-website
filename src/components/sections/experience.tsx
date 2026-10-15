import Image from "next/image";
import type { CSSProperties } from "react";
import { Container } from "@/components/layout/container";
import { Journey } from "@/components/experience/journey";
import { JourneyCta } from "@/components/experience/journey-cta";
import { JourneyMotionProvider, JourneyMotionToggle } from "@/components/experience/journey-motion";
import { experienceContent } from "@/content/experience";

/**
 * Homepage "The AKSH Experience" Section
 *
 * - Directly after Meet Our Consultant; the shared section gap separates them
 * - Owner-supplied "THE AKSH EXPERIENCE" wordmark centred above the H2 (up to
 *   640px wide, the container width below that), then the italic tagline, the
 *   five-step journey (H3 step titles), the bold closing line and the CTA. The
 *   file is shown whole and as supplied, transparent margins included; negative
 *   margins sized from its measured lettering rows (in % of its own width)
 *   offset those margins, so the lettering starts at the section top and sits
 *   --experience-masthead-gap (24px mobile, 28px up) above the H2. Its box is
 *   rounded to whole pixels, so the content below never lands between pixels
 * - The looping step illustrations share one Pause/Resume animations control,
 *   after the tagline; under reduced motion it is removed and the timeline
 *   keeps its usual distance from the tagline
 * - Wide screens (five cards in a row) are compact so the whole section fits
 *   one 1366×768 viewport below the header: a smaller one-line H2, the control
 *   beside the tagline, and the closing line beside the CTA. Narrower screens
 *   keep the roomier stacked layout and grow with their content
 * - Only the illustrations, that control and the CTA run on the client
 * - Anchor target #experience lands 24px below the sticky header; the old
 *   /experience route redirects here (next.config.ts)
 */
export function ExperienceSection() {
  const { id, artwork, heading, tagline, steps, closing, cta } = experienceContent;
  // Transparent rows above and below the lettering, as % of the image width
  // (vertical margin percentages resolve against the wrapper's width, which is
  // the image's).
  const marginAbove = (artwork.ink.top / artwork.width) * 100;
  const marginBelow = ((artwork.height - 1 - artwork.ink.bottom) / artwork.width) * 100;
  const letteringRatio = (artwork.ink.bottom - artwork.ink.top + 1) / artwork.width;

  return (
    <section
      id={id}
      aria-labelledby="experience-heading"
      className="w-full my-(--section-gap) scroll-mt-[calc(var(--header-height)+var(--border-width)+var(--spacing-24))]"
    >
      <Container>
        <JourneyMotionProvider>
          {/* A size container, so the wordmark's box can be sized from its own width. */}
          <div className="@container flex flex-col items-center text-center">
            {/*
              The box holds the lettering rows only, rounded to a whole pixel so
              everything below stays on whole pixels; the image overflows it
              into its own transparent margins. Without round() the image's
              negative margins give the same layout, unrounded.
            */}
            <div
              data-experience-masthead
              className="w-full max-w-(--experience-masthead-width) mb-(--experience-masthead-gap)"
              style={{
                height: `round(nearest, min(var(--experience-masthead-width), 100cqw) * ${letteringRatio}, 1px)`,
              }}
            >
              <Image
                src={artwork.src}
                alt={artwork.alt}
                width={artwork.width}
                height={artwork.height}
                // The supplied file itself, never a resized or re-encoded copy.
                unoptimized
                style={
                  {
                    aspectRatio: `${artwork.width} / ${artwork.height}`,
                    marginTop: `${-marginAbove}%`,
                    marginBottom: `${-marginBelow}%`,
                  } as CSSProperties
                }
                className="w-full h-auto object-contain select-none pointer-events-none"
              />
            </div>
            <h2
              id="experience-heading"
              className="font-display text-section-heading text-logo-black max-w-(--measure-section-heading) wide:text-feature-heading wide:max-w-none"
            >
              {heading}
            </h2>
            {/* Wide: [space][tagline][control], so the two never overlap. */}
            <div className="w-full flex flex-col items-center mt-(--space-heading-intro) wide:mt-8 wide:grid wide:grid-cols-[1fr_auto_1fr] wide:items-center wide:gap-x-24">
              <p className="font-display italic text-quote text-soft-charcoal max-w-(--measure-lead) wide:max-w-none wide:col-start-2">
                {tagline}
              </p>
              <JourneyMotionToggle className="self-stretch mt-(--space-heading-intro) wide:mt-0 wide:col-start-3" />
            </div>
          </div>

          <Journey
            steps={steps}
            className="mt-(--space-eyebrow-heading) motion-reduce:mt-(--space-intro-content) wide:mt-24 wide:motion-reduce:mt-24"
          />
        </JourneyMotionProvider>

        <div className="flex flex-col items-center text-center mt-(--section-band-inset) wide:mt-24 wide:flex-row wide:justify-center wide:gap-x-32">
          <p className="font-display text-feature-heading text-logo-black wide:text-card-heading">
            <strong className="font-semibold">{closing}</strong>
          </p>
          <div className="mt-(--space-body-action) w-full tablet:w-auto wide:mt-0">
            <JourneyCta {...cta} />
          </div>
        </div>
      </Container>
    </section>
  );
}
