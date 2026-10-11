import Image from "next/image";
import type { ServiceCategory } from "@/content/services";
import { ServiceCta } from "@/components/sections/service-cta";

/**
 * Numbered editorial service card: text left, image right on desktop; a 16:9
 * image first in a single column on tablet and mobile. Height follows
 * content; while stacked, ServiceStack may extend a card's minimum height.
 */
export function ServiceCard({ category }: { category: ServiceCategory }) {
  const headingId = `service-${category.id}-heading`;

  return (
    <article
      data-service-card
      aria-labelledby={headingId}
      className="grid grid-cols-1 desktop:grid-cols-2 gap-16 tablet:gap-24 desktop:gap-(--media-column-gap) p-16 tablet:p-(--card-padding) bg-brand-ivory border border-warm-stone rounded-card"
    >
      <div className="flex flex-col">
        <p aria-hidden="true" className="font-ui text-label text-muted-text tabular-nums mb-(--element-gap)">
          {category.number}
        </p>
        <h3 id={headingId} className="font-display text-feature-heading text-logo-black">
          {category.title}
        </h3>
        <p className="font-display text-card-heading font-medium text-soft-charcoal mt-(--space-card-heading-description)">
          {category.tagline}
        </p>
        <p className="font-body text-body text-soft-charcoal max-w-(--measure-prose) mt-(--element-gap)">
          {category.description}
        </p>
        <ul className="flex flex-col gap-(--space-list-item) mt-(--element-gap) pt-16 border-t border-warm-stone">
          {category.treatments.map((treatment) => (
            <li key={treatment.name} className="font-body text-body text-soft-charcoal">
              <strong className="font-bold text-logo-black">{treatment.name}</strong> —{" "}
              {treatment.descriptor}
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-(--space-body-action)">
          <ServiceCta {...category.cta} />
        </div>
      </div>

      {/* overflow-clip (not hidden) lets a placeholder grow past 16:9 rather than clip. */}
      <div className="relative grid order-first desktop:order-none aspect-video desktop:aspect-auto rounded-image overflow-clip">
        {category.image ? (
          <Image
            src={category.image.src}
            alt={category.image.alt}
            fill
            className="object-cover"
            sizes="(max-width: 1023px) 100vw, 50vw"
          />
        ) : (
          <ServiceImagePlaceholder title={category.title} />
        )}
      </div>
    </article>
  );
}

/** Stands in for approved photography; never presented as an AKSH image. */
function ServiceImagePlaceholder({ title }: { title: string }) {
  return (
    <div
      data-service-image-placeholder
      className="flex flex-col items-center justify-center gap-8 tablet:gap-12 p-12 tablet:p-24 text-center bg-warm-stone border border-dashed border-control-outline rounded-image"
    >
      <span
        aria-hidden="true"
        className="w-32 h-40 tablet:w-48 tablet:h-64 rounded-t-button border border-control-outline"
      />
      <span className="font-ui text-eyebrow uppercase tracking-eyebrow text-muted-text">
        Development placeholder
      </span>
      <span className="font-ui text-body-small text-soft-charcoal">
        {title} imagery to be supplied
      </span>
    </div>
  );
}
