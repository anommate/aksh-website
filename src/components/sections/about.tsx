"use client";

import React from "react";
import Image from "next/image";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { useDevelopmentNotice } from "@/components/ui/development-modal";
import { aboutContent } from "@/content/about";

/**
 * Homepage About Us Section (The AKSH Philosophy / About AKSH)
 *
 * Visual Direction per AKSH_DESIGN.md v2.0:
 * - Background: Warm Brand Ivory (#F9F8F4)
 * - Masthead: the owner-supplied "ABOUT US" artwork (oversized A and lettering),
 *   whole and as supplied, transparent margins included, centred up to 560px
 *   wide (the container width below). Negative margins sized from its
 *   measured lettering rows (in % of its own width) offset those margins, so
 *   the lettering starts at the content top and sits 24px (28px from tablet)
 *   above the eyebrow; its box is rounded to whole pixels
 * - Typography: Cormorant Garamond (display/quote) & Manrope (body/UI)
 * - Spacing: Section gap tokens (90px desktop, 72px tablet, 56px mobile)
 * - Desktop: 2-column editorial grid (left: eyebrow, H2, tagline; right: paragraphs, CTA)
 * - Tablet/Mobile: Natural vertical reading flow
 * - Target scroll margin for sticky header (80px desktop, 64px tablet/mobile)
 */
export function AboutSection() {
  const { openUnavailableNotice } = useDevelopmentNotice();
  const { artwork } = aboutContent;
  // Transparent rows above and below the lettering, as % of the image width
  // (vertical margin percentages resolve against the wrapper's width, which is
  // the image's).
  const marginAbove = (artwork.ink.top / artwork.width) * 100;
  const marginBelow = ((artwork.height - 1 - artwork.ink.bottom) / artwork.width) * 100;
  const letteringRatio = (artwork.ink.bottom - artwork.ink.top + 1) / artwork.width;

  const handleCtaClick = () => {
    openUnavailableNotice(aboutContent.cta.destinationName, aboutContent.cta.href);
  };

  return (
    <section
      id={aboutContent.id}
      aria-labelledby="about-heading"
      className="w-full py-32 tablet:py-40 desktop:py-32 bg-brand-ivory scroll-mt-80 tablet:scroll-mt-64"
    >
      <Container>
        {/* Masthead artwork, centred; a size container so its box can be sized from its own width. */}
        <div className="@container w-full flex justify-center mb-24 tablet:mb-28">
          {/*
            The box holds the lettering rows only, rounded to a whole pixel;
            the image overflows it into its own transparent margins. Without
            round() the image's negative margins give the same layout, unrounded.
          */}
          <div
            data-about-masthead
            className="w-full max-w-(--about-masthead-width)"
            style={{
              height: `round(nearest, min(var(--about-masthead-width), 100cqw) * ${letteringRatio}, 1px)`,
            }}
          >
            <Image
              src={artwork.src}
              alt={artwork.alt}
              width={artwork.width}
              height={artwork.height}
              priority
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

        {/* Editorial Content: 2 Columns on Desktop, Stack on Tablet/Mobile */}
        <div className="grid grid-cols-1 desktop:grid-cols-12 gap-24 desktop:gap-48 items-start">
          {/* Left Column (Desktop 5 cols): Eyebrow, H2 Display Heading, Italic Tagline */}
          <div className="desktop:col-span-5 flex flex-col">
            {/* Eyebrow with Signal Red Dot */}
            <div className="flex items-center gap-8 mb-10 tablet:mb-12">
              <span
                className="size-(--signal-dot-size) rounded-circle bg-signal-red inline-block shrink-0"
                aria-hidden="true"
              />
              <span className="font-ui text-eyebrow font-weight-semibold text-muted-text uppercase tracking-eyebrow">
                {aboutContent.eyebrow}
              </span>
            </div>

            {/* H2 Heading: Cormorant Garamond 600 */}
            <h2
              id="about-heading"
              className="font-display text-section-heading font-weight-semibold text-logo-black tracking-display max-w-(--measure-section-heading) mb-12 tablet:mb-16"
            >
              {aboutContent.heading}
            </h2>

            {/* Italic Tagline */}
            <p className="font-display italic text-quote font-weight-medium text-soft-charcoal leading-quote max-w-(--measure-lead)">
              {aboutContent.tagline}
            </p>
          </div>

          {/* Right Column (Desktop 7 cols): Three Paragraphs & Discover CTA */}
          <div className="desktop:col-span-7 flex flex-col justify-center space-y-16 tablet:space-y-16">
            {/* Paragraph 1 */}
            <p className="font-body text-body text-soft-charcoal leading-body max-w-(--measure-prose)">
              {aboutContent.paragraphs.p1}
            </p>

            {/* Paragraph 2 with bold service pillars */}
            <p className="font-body text-body text-soft-charcoal leading-body max-w-(--measure-prose)">
              {aboutContent.paragraphs.p2.before}
              <strong className="font-weight-bold text-logo-black">
                {aboutContent.paragraphs.p2.bold}
              </strong>
              {aboutContent.paragraphs.p2.after}
            </p>

            {/* Paragraph 3 */}
            <p className="font-body text-body text-soft-charcoal leading-body max-w-(--measure-prose)">
              {aboutContent.paragraphs.p3}
            </p>

            {/* CTA Button */}
            <div className="pt-8 tablet:pt-8">
              <Button
                variant="primary"
                onClick={handleCtaClick}
                className="w-full tablet:w-auto"
              >
                <span>{aboutContent.cta.label}</span>
                <span aria-hidden="true" className="font-bold">
                  &rarr;
                </span>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
