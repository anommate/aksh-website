import Image from "next/image";
import { Container } from "@/components/layout/container";
import { JourneyCta } from "@/components/experience/journey-cta";
import { FaqChatAccordion } from "@/components/ui/faq-chat-accordion";
import { faqContent } from "@/content/faq";

function Eyebrow({ children, className = "mb-(--space-eyebrow-heading)" }: { children: string; className?: string }) {
  return (
    <div className={`flex items-center gap-8 ${className}`}>
      <span className="size-(--signal-dot-size) rounded-circle bg-signal-red inline-block shrink-0" aria-hidden="true" />
      <p className="font-ui text-eyebrow text-muted-text uppercase tracking-eyebrow">{children}</p>
    </div>
  );
}

/**
 * Homepage FAQ section (#faq)
 *
 * - After Client Experiences; in production, where those samples are omitted,
 *   directly after The AKSH Experience. Owner-supplied wording in every mode
 * - Owner-supplied "FREQUENTLY ASKED QUESTIONS" lettering as the H2 (its alt
 *   text the heading's name), centred, up to 960px wide and the container
 *   width below that; then the eyebrow with signal dot and the six numbered
 *   questions (H3) in an accordion up to 880px wide: one answer open at a
 *   time, all closable, none open at first. Native disclosures without
 *   JavaScript (src/components/ui/faq-chat-accordion.tsx)
 * - Closes with the "Still Have Questions?" support block (a bordered panel
 *   from tablet up; a top rule on mobile, so the CTA keeps the full width) and
 *   the consultation CTA, which opens the Book a Consultation development notice like the
 *   header CTA
 * - Anchor target lands 24px below the sticky header
 */
export function FaqSection() {
  const { id, artwork, eyebrow, items, support, cta } = faqContent;

  return (
    <section
      id={id}
      aria-labelledby="faq-heading"
      className="w-full my-(--section-gap) scroll-mt-[calc(var(--header-height)+var(--border-width)+var(--spacing-24))]"
    >
      <Container>
        <div className="flex flex-col items-center text-center">
          <h2 id="faq-heading" className="flex w-full justify-center">
            <Image
              src={artwork.src}
              alt={artwork.alt}
              width={artwork.width}
              height={artwork.height}
              sizes="(min-width: 1056px) 960px, (min-width: 1024px) calc(100vw - 96px), (min-width: 768px) calc(100vw - 64px), calc(100vw - 40px)"
              // The box keeps the artwork's own ratio, whichever resized copy loads.
              style={{ aspectRatio: `${artwork.width} / ${artwork.height}` }}
              className="w-full max-w-(--faq-masthead-width) h-auto object-contain select-none"
            />
          </h2>
          <Eyebrow className="mt-12 tablet:mt-16">{eyebrow}</Eyebrow>
        </div>

        <div className="mx-auto w-full max-w-(--faq-width) mt-24 tablet:mt-32">
          <FaqChatAccordion items={items} />
        </div>

        <div
          data-faq-support
          className="mx-auto w-full max-w-(--faq-width) mt-(--section-band-inset) flex flex-col items-center text-center border-t border-warm-stone pt-40 tablet:rounded-card tablet:border tablet:px-(--card-padding) tablet:py-40"
        >
          <Eyebrow>{support.eyebrow}</Eyebrow>
          <h3 className="font-display text-feature-heading text-logo-black">{support.heading}</h3>
          <p className="font-display italic text-card-heading font-weight-medium text-soft-charcoal max-w-(--measure-lead) mt-(--space-heading-intro)">
            {support.text}
          </p>
          <div className="mt-(--space-body-action) w-full tablet:w-auto">
            <JourneyCta {...cta} />
          </div>
        </div>
      </Container>
    </section>
  );
}
