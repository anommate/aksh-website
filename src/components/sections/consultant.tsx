import Image from "next/image";
import { Container } from "@/components/layout/container";
import { consultantContent } from "@/content/consultant";

/**
 * Homepage "Meet Our Consultant" Section
 *
 * - Ivory surface; Cormorant Garamond name (H2), Manrope role and biography
 * - Desktop: portrait left (5 of 12 parts), profile right (7 of 12 parts)
 * - Tablet/mobile: eyebrow, name and role; then the portrait; then tagline,
 *   biography (DOM order, so reading order matches the layout); no CTA of
 *   its own, so it reads straight into The AKSH Experience
 * - The supplied photograph is shown whole at its natural ratio
 * - Anchor target #meet-our-consultant lands 24px below the sticky header
 */
export function ConsultantSection() {
  const { id, eyebrow, name, role, tagline, biography, portrait } = consultantContent;

  return (
    <section
      id={id}
      aria-labelledby="consultant-heading"
      className="w-full my-(--section-gap) scroll-mt-[calc(var(--header-height)+var(--border-width)+var(--spacing-24))]"
    >
      <Container>
        <div className="grid grid-cols-1 desktop:grid-cols-[5fr_7fr] desktop:grid-rows-[auto_1fr] gap-y-20 tablet:gap-y-24 desktop:gap-x-(--media-column-gap) desktop:gap-y-(--space-heading-intro)">
          <div className="desktop:col-start-2 desktop:row-start-1">
            <div className="flex items-center gap-8 mb-(--space-eyebrow-heading)">
              <span
                className="size-(--signal-dot-size) rounded-circle bg-signal-red inline-block shrink-0"
                aria-hidden="true"
              />
              <p className="font-ui text-eyebrow text-muted-text uppercase tracking-eyebrow">{eyebrow}</p>
            </div>
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
