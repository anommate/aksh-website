import type { CSSProperties } from "react";
import Image from "next/image";
import { Container } from "@/components/layout/container";
import { ServiceCard } from "@/components/sections/service-card";
import { ServiceStack } from "@/components/sections/service-stack";
import { servicesContent } from "@/content/services";

/**
 * Homepage Services Section
 *
 * - Ivory masthead: owner-supplied "OUR SERVICES" artwork centred above the
 *   eyebrow with signal dot, H2 and introduction
 * - Warm Stone band with ivory cards (design spec: ivory against stone)
 * - Four numbered cards; on tall-enough desktop viewports they stack with
 *   native sticky scrolling (see ServiceStack), otherwise they flow normally
 * - Anchor target #services lands 24px below the sticky header
 */
export function ServicesSection() {
  return (
    <section
      id={servicesContent.id}
      aria-labelledby="services-heading"
      className="w-full mt-(--section-gap) scroll-mt-[calc(var(--header-height)+var(--border-width)+var(--spacing-24))]"
    >
      {/* Ivory masthead surface to carry the artwork's own textured ivory ground. */}
      <div data-services-masthead className="bg-brand-ivory pb-(--space-intro-content)">
        <Container>
          <div className="flex justify-center mb-20 tablet:mb-24">
            <Image
              src={servicesContent.artwork.src}
              alt={servicesContent.artwork.alt}
              width={servicesContent.artwork.width}
              height={servicesContent.artwork.height}
              sizes="(max-width: 767px) 100vw, 440px"
              className="w-full max-w-(--masthead-artwork-width) h-auto object-contain select-none"
            />
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
        </Container>
      </div>

      <div className="bg-warm-stone py-(--section-band-inset)">
        <Container>
          <ServiceStack className="flex flex-col gap-(--grid-gap)">
            {servicesContent.categories.map((category, index) => (
              <li
                key={category.id}
                data-service-stack-item
                style={{ "--service-stack-index": index } as CSSProperties}
              >
                <ServiceCard category={category} />
              </li>
            ))}
          </ServiceStack>
        </Container>
      </div>
    </section>
  );
}
