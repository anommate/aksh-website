import Image from "next/image";
import { Suspense } from "react";
import { connection } from "next/server";
import { Container } from "@/components/layout/container";
import { TestimonialsScroller } from "@/components/sections/testimonials-scroller";
import { getServerConfig } from "@/lib/config/server";
import { testimonialsContent } from "@/content/testimonials";

/**
 * Homepage "Client Experiences" testimonials section (#client-experiences)
 *
 * - Directly after The AKSH Experience; the shared section gap separates them
 * - Owner-supplied "CLIENT EXPERIENCES" lettering centred above the H2 (up to
 *   800px wide, the container width below that), then the H2 and
 *   introduction, server-rendered; the columns and their control run on the
 *   client. The artwork's 28px built-in margin plus 20px (mobile) or 12px
 *   (tablet up) keeps its lettering about 24px above the H2
 * - The entries are fictional samples (src/content/testimonials.ts): the
 *   section renders only in development and preview, each card labelled with
 *   its "Sample" badge, and
 *   nothing in production. APP_MODE is read per request because one build
 *   serves both (docs/adr/0001-stack.md)
 * - Anchor target lands 24px below the sticky header
 */
export function TestimonialsSection() {
  return (
    <Suspense fallback={null}>
      <SampleTestimonials />
    </Suspense>
  );
}

async function SampleTestimonials() {
  await connection();
  if (getServerConfig().appMode === "production") return null;

  const { id, artwork, heading, description, badge, testimonials } = testimonialsContent;

  return (
    <section
      id={id}
      aria-labelledby="client-experiences-heading"
      data-content-status="fictional-sample"
      className="w-full my-(--section-gap) scroll-mt-[calc(var(--header-height)+var(--border-width)+var(--spacing-24))]"
    >
      <Container>
        <div className="flex flex-col items-center text-center">
          <Image
            src={artwork.src}
            alt={artwork.alt}
            width={artwork.width}
            height={artwork.height}
            sizes="(min-width: 1024px) 800px, (min-width: 768px) calc(100vw - 64px), calc(100vw - 40px)"
            // The box keeps the artwork's own ratio, whichever resized copy loads.
            style={{ aspectRatio: `${artwork.width} / ${artwork.height}` }}
            className="w-full max-w-(--testimonials-masthead-width) h-auto object-contain select-none mb-20 tablet:mb-12"
          />
          <h2
            id="client-experiences-heading"
            className="font-display text-section-heading text-logo-black max-w-(--measure-section-heading) tablet:max-w-none"
          >
            <span className="tablet:block">{heading[0]}</span> <span className="tablet:block">{heading[1]}</span>
          </h2>
          <p className="font-body text-body text-soft-charcoal max-w-(--measure-prose) mt-(--space-heading-intro)">
            {description}
          </p>
        </div>

        <div className="mt-(--space-intro-content)">
          <TestimonialsScroller testimonials={testimonials} badge={badge} />
        </div>
      </Container>
    </section>
  );
}
