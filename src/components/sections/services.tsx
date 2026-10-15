import type { CSSProperties } from "react";
import Image from "next/image";
import { Container } from "@/components/layout/container";
import { ServiceCard } from "@/components/sections/service-card";
import { ServiceStack } from "@/components/sections/service-stack";
import { serviceCardId, servicesContent } from "@/content/services";

/**
 * Homepage Services Section
 *
 * - One continuous ivory surface: owner-supplied "OUR SERVICES" artwork
 *   centred above the eyebrow with signal dot, H2 and introduction, then the
 *   card stack
 * - Ivory cards with a fine stone outline (design spec: stone outline on ivory)
 * - Four numbered cards; where they can stack safely they do so with native
 *   sticky scrolling (see ServiceStack), otherwise they flow normally
 * - Bottom inset keeps the stack's settled end clear of what follows
 * - Anchor target #services lands 24px below the sticky header
 */
export function ServicesSection() {
  return (
    <section
      id={servicesContent.id}
      aria-labelledby="services-heading"
      className="w-full pb-(--section-band-inset) bg-brand-ivory scroll-mt-[calc(var(--header-height)+var(--border-width)+var(--spacing-24))]"
    >
      {/* One ivory surface for the artwork, introduction and card stack. */}
      <Container>
        <div data-services-masthead className="pb-(--space-intro-content)">
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
