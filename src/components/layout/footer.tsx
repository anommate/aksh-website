import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { connection } from "next/server";
import { Container } from "@/components/layout/container";
import { FooterWaves } from "@/components/layout/footer-waves";
import { footerWaves } from "@/components/layout/footer-wave";
import { CopyrightYear } from "@/components/layout/copyright-year";
import { Logo } from "@/components/ui/logo";
import { getServerConfig } from "@/lib/config/server";
import { footerContent, type FooterContactValue, type FooterLink } from "@/content/footer";

// Read when the module loads (at build), so the page prerenders fully static
// with no revalidation; CopyrightYear corrects it in the browser if a new
// year has begun since the build.
const BUILD_YEAR = new Date().getFullYear();

// Links sit on charcoal, so their focus outline switches to ivory.
const linkClasses =
  "inline-flex items-center min-h-(--target-min-size) rounded-link font-ui text-footer text-brand-ivory underline-offset-4 decoration-signal-red hover:underline focus-visible:outline-brand-ivory";

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
      <ul className="mt-4 flex flex-col">
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
      {placeholderLabel && (
        <p className="mt-12 inline-flex rounded-chip border border-dashed border-warm-stone/60 px-8 py-4 font-ui text-eyebrow text-warm-stone uppercase tracking-eyebrow">
          {placeholderLabel}
        </p>
      )}
      {children}
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
    <span className="font-ui text-footer text-brand-ivory">{value.display}</span>
  );
}

/**
 * Visit AKSH and Connect. Placeholder details render only in development and
 * preview, labelled and without actions; production omits them until real,
 * approved details replace them. APP_MODE is read per request because one
 * build serves both (docs/adr/0001-stack.md).
 */
async function ContactGroups() {
  await connection();
  const { status, label, visit, connect } = footerContent.contact;
  if (status !== "approved" && getServerConfig().appMode === "production") return null;
  const placeholderLabel = status === "approved" ? undefined : label;

  return (
    <>
      <ContactGroup id="footer-visit-heading" heading={visit.heading} placeholderLabel={placeholderLabel}>
        <address className="mt-16 not-italic font-ui text-footer text-brand-ivory">
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

      <ContactGroup id="footer-connect-heading" heading={connect.heading} placeholderLabel={placeholderLabel}>
        <dl className="mt-16 flex flex-col gap-12">
          {[connect.phone, connect.email, connect.instagram].map((value) => (
            <div key={value.label}>
              <dt className="font-ui text-eyebrow text-warm-stone uppercase tracking-eyebrow">{value.label}</dt>
              <dd>
                <ContactValue value={value} />
              </dd>
            </div>
          ))}
        </dl>
      </ContactGroup>
    </>
  );
}

/**
 * Site footer: one landmark with two areas, in normal flow below the last
 * section.
 *
 * - A full-width charcoal area topped by four layered, slowly flowing waves
 *   (src/components/layout/footer-waves.tsx). Inside the site container:
 *   Explore (homepage sections), Our Services (the four service cards), Visit
 *   AKSH and Connect (placeholder details, development and preview only).
 *   Four columns on desktop, two on tablet, stacked on mobile
 * - Below it, a full-width ivory band with the supplied logo, unaltered and
 *   centred, linking home, and the copyright line
 * - No contact, social, map or policy links until real details and routes
 *   exist. Red only as the group signal dots and link hover underlines.
 *   Independent of the development-only testimonial samples
 */
export function Footer() {
  const { explore, services, rights } = footerContent;

  return (
    <footer className="w-full">
      <FooterWaves waves={footerWaves}>
        <div className="grid gap-x-32 gap-y-40 tablet:grid-cols-2 desktop:grid-cols-4">
          <LinkGroup id="footer-explore-heading" heading={explore.heading} links={explore.links} />
          <LinkGroup id="footer-services-heading" heading={services.heading} links={services.links} native />
          <Suspense fallback={null}>
            <ContactGroups />
          </Suspense>
        </div>
      </FooterWaves>

      <div data-footer-brand className="bg-brand-ivory py-48 tablet:py-56 desktop:py-64">
        <Container className="flex flex-col items-center text-center">
          <Link href="/" aria-label="AKSH Wellness - Return to home" className="inline-flex rounded-panel p-4">
            <Logo size="footer" priority={false} />
          </Link>
          <p className="mt-16 font-ui text-footer text-muted-text">
            &copy; <CopyrightYear buildYear={BUILD_YEAR} /> {rights}
          </p>
        </Container>
      </div>
    </footer>
  );
}
