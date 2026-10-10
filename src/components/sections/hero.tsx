"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useDevelopmentNotice } from "@/components/ui/development-modal";

/**
 * Hero Section
 *
 * Target Geometry per Image B reference:
 * - Starts immediately beneath the navbar (6-8px top gap)
 * - 6-8px outer margins on left and right
 * - ~7-8px bottom margin above viewport bottom at reference height
 * - All four rounded corners visible (28px desktop/tablet, 20px mobile)
 * - Responsive viewport-aware height on desktop (min-h-[calc(100vh-80px-14px)])
 * - Natural scrolling on short screens / zoomed text
 * - Self-contained charcoal card in normal document flow
 */
export function Hero() {
  const { openUnavailableNotice } = useDevelopmentNotice();

  const handleCtaClick = (name: string, path: string) => {
    openUnavailableNotice(name, path);
  };

  return (
    <section className="w-full px-8 pt-8 pb-8">
      {/* Dark Hero Surface:
          - Background: Soft Charcoal (#282826)
          - Radius: 28px desktop/tablet, 20px mobile (--radius-card)
          - Text on charcoal: Brand Ivory (#F9F8F4) / Warm Stone (#E4DED3)
          - Desktop: Fits initial viewport below navbar without internal scrollbars
          - Natural height expansion for short viewports or enlarged text
      */}
      <div className="relative w-full bg-soft-charcoal text-brand-ivory rounded-card p-20 tablet:p-32 desktop:px-48 desktop:py-32 flex flex-col justify-between desktop:min-h-[calc(100vh-80px-16px)]">
        {/* Top Right "Prototype imagery" Badge */}
        <div className="absolute top-16 right-16 tablet:top-20 tablet:right-20 z-10">
          <span className="inline-flex items-center px-12 py-4 rounded-button bg-logo-black/60 border border-warm-stone/30 font-ui text-eyebrow font-weight-medium text-brand-ivory tracking-normal select-none">
            Prototype imagery
          </span>
        </div>

        {/* Main Content Grid: 2 Columns on Desktop, Responsive Stack on Tablet/Mobile */}
        <div className="grid grid-cols-1 desktop:grid-cols-12 gap-24 desktop:gap-40 items-center pt-4 desktop:pt-8">
          {/* Mobile / Tablet Image Placement */}
          <div className="block desktop:hidden w-full mb-16 tablet:mb-20">
            <div className="relative w-full aspect-[16/10] max-h-[240px] tablet:max-h-[300px] rounded-image overflow-hidden bg-logo-black/40 border border-warm-stone/20">
              <Image
                src="/images/hero-architecture-prototype.jpg"
                alt="AKSH architectural wellness alcove with serene stone sphere"
                fill
                className="object-cover object-[center_52%]"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 50vw"
              />
            </div>
          </div>

          {/* Left Content Column (7 cols on desktop) */}
          <div className="desktop:col-span-7 flex flex-col justify-center">
            {/* Eyebrow with Signal Red Dot */}
            <div className="flex items-center gap-8 mb-10 tablet:mb-12">
              <span
                className="w-6 h-6 rounded-circle bg-signal-red inline-block shrink-0"
                aria-hidden="true"
              />
              <span className="font-ui text-eyebrow font-weight-semibold text-warm-stone uppercase tracking-eyebrow">
                Personalised Wellness at AKSH
              </span>
            </div>

            {/* H1 Display Headline: Cormorant Garamond Semibold 600 */}
            <h1 className="font-display text-hero-display font-weight-semibold text-brand-ivory tracking-display max-w-(--measure-hero) mb-16 tablet:mb-20">
              Wellness, Reimagined Around You.
            </h1>

            {/* Lead Paragraph: Manrope 400 */}
            <p className="font-body text-lead text-warm-stone/95 max-w-(--measure-lead) mb-20 tablet:mb-24">
              Explore biohacking, recovery, body contouring and skin treatments at AKSH.
            </p>

            {/* Two CTAs */}
            <div className="flex flex-col tablet:flex-row items-stretch tablet:items-center gap-12 pt-2">
              <Button
                variant="inverse-primary"
                onClick={() => handleCtaClick("Treatments Directory", "/treatments")}
                className="w-full tablet:w-auto"
              >
                <span>Explore Treatments</span>
                <span aria-hidden="true" className="font-bold">
                  &rarr;
                </span>
              </Button>

              <Button
                variant="inverse-secondary"
                onClick={() => handleCtaClick("Book a Consultation", "/book")}
                className="w-full tablet:w-auto"
              >
                Book a Consultation
              </Button>
            </div>
          </div>

          {/* Right Architectural Image Column (Desktop only: 5 cols) */}
          <div className="hidden desktop:block desktop:col-span-5 relative">
            <div className="relative aspect-[4/3] max-h-[340px] w-full max-w-[440px] ml-auto rounded-image overflow-hidden bg-logo-black/40 border border-warm-stone/20 shadow-2xl">
              <Image
                src="/images/hero-architecture-prototype.jpg"
                alt="AKSH architectural wellness alcove with serene stone sphere"
                fill
                className="object-cover object-[center_52%]"
                priority
                sizes="(min-width: 1024px) 440px, 40vw"
              />
            </div>
          </div>
        </div>

        {/* Three Supporting Items at bottom of hero card */}
        <div className="mt-28 tablet:mt-36 pt-20 tablet:pt-24 border-t border-warm-stone/20">
          <div className="grid grid-cols-1 tablet:grid-cols-3 gap-16 tablet:gap-0">
            {/* Supporting Item 1 */}
            <div className="tablet:pr-24">
              <p className="font-ui text-nav font-weight-semibold text-brand-ivory mb-4">
                Consultation first
              </p>
              <p className="font-body text-body-small text-warm-stone/80">
                The clinic contacts you to confirm.
              </p>
            </div>

            {/* Supporting Item 2 */}
            <div className="pt-12 tablet:pt-0 border-t tablet:border-t-0 tablet:border-l border-warm-stone/20 tablet:px-24">
              <p className="font-ui text-nav font-weight-semibold text-brand-ivory mb-4">
                Four disciplines
              </p>
              <p className="font-body text-body-small text-warm-stone/80">
                Biohacking, recovery, body contouring and skin.
              </p>
            </div>

            {/* Supporting Item 3 */}
            <div className="pt-12 tablet:pt-0 border-t tablet:border-t-0 tablet:border-l border-warm-stone/20 tablet:pl-24">
              <p className="font-ui text-nav font-weight-semibold text-brand-ivory mb-4">
                Modern wellness
              </p>
              <p className="font-body text-body-small text-warm-stone/80">
                Considered treatments and care.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
