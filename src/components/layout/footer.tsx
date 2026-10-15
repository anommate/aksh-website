import Image from "next/image";
import Link from "next/link";
import { Fragment, Suspense, type ReactNode } from "react";
import { connection } from "next/server";
import { FooterWaves } from "@/components/layout/footer-waves";
import { footerWaves } from "@/components/layout/footer-wave";
import { CopyrightYear } from "@/components/layout/copyright-year";
import { getServerConfig } from "@/lib/config/server";
import { footerContent, type FooterContactValue, type FooterLink } from "@/content/footer";

// Read when the module loads (at build), so the page prerenders fully static
// with no revalidation; CopyrightYear corrects it in the browser if a new
// year has begun since the build.
const BUILD_YEAR = new Date().getFullYear();

// One row: a line of 14/22px footer text with the inset above and below that
// makes it 44px. Links, the address and contact details all use it.
const row = "py-(--footer-row-inset) font-ui text-footer";

// Links sit on charcoal, so their focus outline switches to ivory.
const linkClasses = `inline-block ${row} rounded-link text-brand-ivory underline-offset-4 decoration-signal-red hover:underline focus-visible:outline-brand-ivory`;

function GroupHeading({ id, heading }: { id: string; heading: string }) {
  return (
    <div className="flex items-center gap-8">
      <span className="size-(--signal-dot-size) rounded-circle bg-signal-red inline-block shrink-0" aria-hidden="true" />
      <h2 id={id} className="font-ui text-eyebrow text-warm-stone uppercase tracking-eyebrow">
        {heading}
      </h2>
    </div>
  );
}

/**
 * `native`: plain anchors, so a link to a service card is an ordinary
 * same-document jump that the service stack can settle (ServiceStack).
 */
function LinkGroup({
  id,
  heading,
  links,
  native = false,
}: {
  id: string;
  heading: string;
  links: readonly FooterLink[];
  native?: boolean;
}) {
  return (
    <nav aria-labelledby={id}>
      <GroupHeading id={id} heading={heading} />
      <ul className="mt-(--footer-heading-gap) flex flex-col">
        {links.map((link) => (
          <li key={link.href}>
            {native ? (
              <a href={link.href} className={linkClasses}>
                {link.label}
              </a>
            ) : (
              <Link href={link.href} className={linkClasses}>
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

function ContactGroup({
  id,
  heading,
  placeholderLabel,
  children,
}: {
  id: string;
  heading: string;
  placeholderLabel?: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} data-content-status={placeholderLabel ? "placeholder" : undefined}>
      <GroupHeading id={id} heading={heading} />
      <div className="mt-(--footer-heading-gap)">{children}</div>
      {/* Last, so the details' first lines align with the links beside them. */}
      {placeholderLabel && (
        <p className="py-(--footer-row-inset)">
          <span className="inline-flex rounded-chip border border-dashed border-warm-stone/60 px-8 py-4 font-ui text-eyebrow text-warm-stone uppercase tracking-eyebrow">
            {placeholderLabel}
          </span>
        </p>
      )}
    </section>
  );
}

/** A contact value: a link once its action is supplied, plain text until then. */
function ContactValue({ value }: { value: FooterContactValue }) {
  return value.href ? (
    <a href={value.href} className={linkClasses}>
      {value.display}
    </a>
  ) : (
    <span className="text-brand-ivory">{value.display}</span>
  );
}

/**
 * Visit AKSH and Connect details. Placeholder details render only in
 * development and preview, labelled and without actions; production omits
 * them until real, approved details replace them. APP_MODE is read per
 * request because one build serves both (docs/adr/0001-stack.md).
 */
async function contactDetails() {
  await connection();
  const { status, label, visit, connect } = footerContent.contact;
  if (status !== "approved" && getServerConfig().appMode === "production") return null;
  return { placeholderLabel: status === "approved" ? undefined : label, visit, connect };
}

async function VisitGroup() {
  const details = await contactDetails();
  if (!details) return null;
  const { placeholderLabel, visit } = details;

  return (
    <ContactGroup id="footer-visit-heading" heading={visit.heading} placeholderLabel={placeholderLabel}>
      <address className={`${row} not-italic text-brand-ivory`}>
        {visit.addressLines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </address>
      {visit.mapHref && (
        <a href={visit.mapHref} className={linkClasses}>
          Get directions
        </a>
      )}
    </ContactGroup>
  );
}

async function ConnectGroup() {
  const details = await contactDetails();
  if (!details) return null;
  const { placeholderLabel, connect } = details;

  return (
    <ContactGroup id="footer-connect-heading" heading={connect.heading} placeholderLabel={placeholderLabel}>
      {/* Label and value side by side on a shared baseline; values aligned in one column. */}
      <dl className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-16">
        {[connect.phone, connect.email, connect.instagram].map((value) => (
          <Fragment key={value.label}>
            <dt className="py-(--footer-row-inset) font-ui text-eyebrow text-warm-stone uppercase tracking-eyebrow">
              {value.label}
            </dt>
            <dd className={`${row} min-w-0 break-words`}>
              <ContactValue value={value} />
            </dd>
          </Fragment>
        ))}
      </dl>
    </ContactGroup>
  );
}

/**
 * The footer's one logo, centred in the Connect column after its details.
 * The file is shown whole and as supplied, transparent margins included:
 * negative margins sized from its artwork rows (in % of its own width) offset
 * those margins, and the link's box holds the artwork rows only (rounded to a
 * whole pixel), so the space above is exactly --footer-logo-gap and nothing
 * below or beside it shifts.
 */
function FooterLogo() {
  const { logo } = footerContent;
  const marginAbove = (logo.ink.top / logo.width) * 100;
  const marginBelow = ((logo.height - 1 - logo.ink.bottom) / logo.width) * 100;
  const artworkRatio = (logo.ink.bottom - logo.ink.top + 1) / logo.width;

  return (
    <div data-footer-logo className="@container w-full flex justify-center mt-(--footer-logo-gap)">
      <Link
        href="/"
        aria-label="AKSH Wellness - Return to home"
        className="block w-full max-w-(--footer-logo-width) rounded-panel focus-visible:outline-brand-ivory"
        style={{ height: `round(nearest, min(var(--footer-logo-width), 100cqw) * ${artworkRatio}, 1px)` }}
      >
        <Image
          src={logo.src}
          alt={logo.alt}
          width={logo.width}
          height={logo.height}
          sizes="240px"
          style={{
            aspectRatio: `${logo.width} / ${logo.height}`,
            marginTop: `${-marginAbove}%`,
            marginBottom: `${-marginBelow}%`,
          }}
          // Its transparent margins reach over the details: let them through.
          className="block w-full h-auto object-contain select-none pointer-events-none"
        />
      </Link>
    </div>
  );
}

/**
 * Site footer: one landmark, in normal flow below the last section.
 *
 * - A full-width charcoal area topped by four layered, slowly flowing waves
 *   (src/components/layout/footer-waves.tsx). Inside the site container, one
 *   grid: Explore (homepage sections), Our Services (the four service cards),
 *   Visit AKSH and Connect (placeholder details, development and preview
 *   only). Four equal columns on desktop, two on tablet, one stack on mobile;
 *   headings on one line, every column left-aligned on the same 44px row
 *   rhythm (src/styles/tokens.css, --footer-row-*)
 * - The one footer logo (transparent inverse artwork) closes the Connect
 *   column, centred in it after the details, linking home. The Connect column
 *   always renders, so production, which omits the placeholder details,
 *   still shows the logo
 * - Beneath the grid, under a fine rule, the copyright, centred; then the
 *   wave control
 * - No contact, social, map or policy links until real details and routes
 *   exist. Red only as the group signal dots and link hover underlines.
 *   Independent of the development-only testimonial samples
 */
export function Footer() {
  const { explore, services, rights } = footerContent;

  return (
    <footer className="w-full">
      <FooterWaves waves={footerWaves}>
        <div data-footer-grid className="grid gap-x-32 gap-y-28 tablet:grid-cols-2 tablet:gap-y-40 desktop:grid-cols-4">
          <LinkGroup id="footer-explore-heading" heading={explore.heading} links={explore.links} />
          <LinkGroup id="footer-services-heading" heading={services.heading} links={services.links} native />
          <Suspense fallback={null}>
            <VisitGroup />
          </Suspense>
          {/* Always rendered: the details stream in (development, preview), the logo stays. */}
          <div data-footer-connect className="flex flex-col">
            <Suspense fallback={null}>
              <ConnectGroup />
            </Suspense>
            <FooterLogo />
          </div>
        </div>

        <p
          data-footer-copyright
          className="mt-40 border-t border-warm-stone/25 pt-24 text-center font-ui text-footer text-warm-stone"
        >
          &copy; <CopyrightYear buildYear={BUILD_YEAR} /> {rights}
        </p>
      </FooterWaves>
    </footer>
  );
}
