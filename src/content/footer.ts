/**
 * Site footer content (src/components/layout/footer.tsx).
 *
 * Explore and Our Services point at homepage anchors, taken from each
 * section's own content so they cannot drift. Service links go to the matching
 * service cards (#service-<id>); the category pages are not built yet.
 *
 * Visit AKSH and Connect hold DUMMY PLACEHOLDER DETAILS for layout only
 * (`contact.status: "placeholder"`). They render as plain text under a
 * "Placeholder details" label in development and preview, and are omitted in
 * production. Every action (`href`) stays null until real details are
 * supplied (docs/content/CONTENT_STATUS.md, "Missing clinic inputs"). To
 * publish real details: replace the values, set each href (tel:, mailto:, the
 * Instagram profile URL, a map link), and set status to "approved".
 */

import { aboutContent } from "@/content/about";
import { serviceCardId, servicesContent } from "@/content/services";
import { consultantContent } from "@/content/consultant";
import { experienceContent } from "@/content/experience";
import { faqContent } from "@/content/faq";

export interface FooterLink {
  label: string;
  href: string;
}

/** A contact value; `href` is the action, null while inactive. */
export interface FooterContactValue {
  label: string;
  display: string;
  href: string | null;
}

export interface FooterContent {
  explore: { heading: string; links: readonly FooterLink[] };
  services: { heading: string; links: readonly FooterLink[] };
  contact: {
    /** "placeholder": development and preview only, labelled, no actions. */
    status: "placeholder" | "approved";
    label: string;
    visit: { heading: string; addressLines: readonly string[]; mapHref: string | null };
    connect: {
      heading: string;
      phone: FooterContactValue;
      email: FooterContactValue;
      instagram: FooterContactValue & { profileUrl: string };
    };
  };
  /** Follows "© <year> ". */
  rights: string;
}

const anchor = (id: string) => `/#${id}`;

export const footerContent: FooterContent = {
  explore: {
    heading: "Explore",
    links: [
      { label: "About AKSH", href: anchor(aboutContent.id) },
      { label: "Our Services", href: anchor(servicesContent.id) },
      { label: "Meet Our Consultant", href: anchor(consultantContent.id) },
      { label: "The AKSH Experience", href: anchor(experienceContent.id) },
      { label: "FAQs", href: anchor(faqContent.id) },
    ],
  },
  services: {
    heading: "Our Services",
    links: servicesContent.categories.map((category) => ({
      label: category.title,
      href: anchor(serviceCardId(category.id)),
    })),
  },
  contact: {
    // DUMMY VALUES: not clinic information. Replace before setting "approved".
    status: "placeholder",
    label: "Placeholder details",
    visit: {
      heading: "Visit AKSH",
      addressLines: ["123 Wellness Avenue, Sample Locality,", "Nagpur, Maharashtra, India — PIN 000000"],
      mapHref: null,
    },
    connect: {
      heading: "Connect",
      phone: { label: "Phone", display: "+91 XXXXX XXXXX", href: null },
      email: { label: "Email", display: "hello@aksh.example", href: null },
      instagram: {
        label: "Instagram",
        display: "@your_aksh_handle",
        // Kept for replacement only; never linked while a placeholder.
        profileUrl: "https://www.instagram.com/your_aksh_handle/",
        href: null,
      },
    },
  },
  rights: "AKSH. All rights reserved.",
};
