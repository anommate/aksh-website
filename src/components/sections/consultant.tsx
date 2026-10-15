import Image from "next/image";
import type { CSSProperties } from "react";
import { Container } from "@/components/layout/container";
import { consultantContent } from "@/content/consultant";

/**
 * Homepage "Meet Our Consultant" Section
 *
 * - Owner-supplied "MEET OUR CONSULTANT" wordmark centred above the section
 *   (up to 640px wide, the container width below that), in place of a typed
 *   eyebrow. The file is shown whole and as supplied, transparent margins
 *   included; negative margins sized from its measured lettering rows (in % of
 *   its own width) offset those margins, so the lettering starts at the
 *   section top and sits --space-intro-content above the profile. Its box is
 *   rounded to whole pixels, so the content below never lands between pixels
 * - Ivory surface; Cormorant Garamond name (H2), Manrope role and biography
 * - Desktop: portrait left (5 of 12 parts), profile right (7 of 12 parts)
 * - Tablet/mobile: name and role; then the portrait; then tagline,
 *   biography (DOM order, so reading order matches the layout); no CTA of
 *   its own, so it reads straight into The AKSH Experience
 * - The supplied photograph is shown whole at its natural ratio
 * - Anchor target #meet-our-consultant lands 24px below the sticky header
 */
export function ConsultantSection() {
  const { id, artwork, name, role, tagline, biography, portrait } = consultantContent;
  // Transparent rows above and below the lettering, as % of the image width
  // (vertical margin percentages resolve against the wrapper's width, which is
  // the image's).
  const marginAbove = (artwork.ink.top / artwork.width) * 100;
  const marginBelow = ((artwork.height - 1 - artwork.ink.bottom) / artwork.width) * 100;
  const letteringRatio = (artwork.ink.bottom - artwork.ink.top + 1) / artwork.width;

  return (
    <section
      id={id}
      aria-labelledby="consultant-heading"
      className="w-full my-(--section-gap) scroll-mt-[calc(var(--header-height)+var(--border-width)+var(--spacing-24))]"
    >
      <Container>
        {/* A size container, so the wordmark's box can be sized from its own width. */}
        <div className="@container flex justify-center">
          {/*
            The box holds the lettering rows only, rounded to a whole pixel;
            the image overflows it into its own transparent margins. Without
            round() the image's negative margins give the same layout, unrounded.
          */}
          <div
            data-consultant-masthead
            className="w-full max-w-(--consultant-masthead-width) mb-(--space-intro-content)"
            style={{
              height: `round(nearest, min(var(--consultant-masthead-width), 100cqw) * ${letteringRatio}, 1px)`,
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
        </div>

        <div className="grid grid-cols-1 desktop:grid-cols-[5fr_7fr] desktop:grid-rows-[auto_1fr] gap-y-20 tablet:gap-y-24 desktop:gap-x-(--media-column-gap) desktop:gap-y-(--space-heading-intro)">
          <div className="desktop:col-start-2 desktop:row-start-1">
            <h2 id="consultant-heading" className="font-display text-section-heading text-logo-black">
              {name}
            </h2>
            <p className="font-ui text-body font-bold text-soft-charcoal mt-(--space-card-heading-description)">
              {role}
            </p>
          </div>

          <div className="desktop:col-start-1 desktop:row-start-1 desktop:row-span-2 self-start w-full max-w-(--portrait-max-width) mx-auto desktop:max-w-none">
            <Image
              src={portrait.src}
              alt={portrait.alt}
              width={portrait.width}
              height={portrait.height}
              sizes="(max-width: 1023px) min(440px, 100vw), 520px"
              className="w-full h-auto rounded-image"
            />
          </div>

          <div className="desktop:col-start-2 desktop:row-start-2">
            <p className="font-display italic text-quote text-soft-charcoal max-w-(--measure-lead)">
              {tagline}
            </p>
            <div
              data-consultant-biography
              className="flex flex-col gap-(--space-paragraph) mt-(--space-heading-intro) max-w-(--measure-prose)"
            >
              {biography.map((paragraph, index) => (
                <p key={index} className="font-body text-body text-soft-charcoal">
                  {paragraph.map((run, runIndex) =>
                    run.bold ? (
                      <strong key={runIndex} className="font-bold text-logo-black">
                        {run.text}
                      </strong>
                    ) : (
                      run.text
                    )
                  )}
                </p>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
