/**
 * AKSH Homepage About Us Section Content
 *
 * Status: OWNER-SUPPLIED CONTENT
 * Source: Attached About Us Artwork & Editorial Brief
 */

export interface AboutSectionContent {
  id: string;
  /** Owner-supplied "ABOUT US" masthead artwork (oversized A and lettering). */
  artwork: {
    src: string;
    alt: string;
    width: number;
    height: number;
    /**
     * First and last pixel rows holding lettering (alpha >= 2); the rows
     * outside them are the file's own transparent margin, which the layout
     * offsets rather than crops.
     */
    ink: { top: number; bottom: number };
  };
  eyebrow: string;
  heading: string;
  tagline: string;
  paragraphs: {
    p1: string;
    p2: {
      before: string;
      bold: string;
      after: string;
    };
    p3: string;
  };
  cta: {
    label: string;
    destinationName: string;
    href: string;
  };
  status: "owner_supplied";
}

export const aboutContent: AboutSectionContent = {
  id: "about-aksh",
  // The owner-supplied file exactly as received (15 Oct 2026), byte-identical
  // to assets/source/brand/about-us-artwork-2026-10-15.png: not cropped,
  // resized, recoloured or re-encoded, and served unoptimised.
  artwork: {
    src: "/brand/about-us-masthead-2026-10-15.png",
    alt: "About Us",
    width: 1774,
    height: 887,
    ink: { top: 281, bottom: 617 },
  },
  eyebrow: "ABOUT AKSH",
  heading: "The Art of Feeling Your Best.",
  tagline: "Where science, self-care, and modern wellness come together.",
  paragraphs: {
    p1: "At AKSH, we believe true wellness goes beyond appearances. It's about feeling energised, moving with ease, embracing confidence, and finding balance in everyday life.",
    p2: {
      before: "Bringing together ",
      bold: "Biohacking, Recovery, Body Contouring, and Advanced Skin Treatments",
      after: ", AKSH is a thoughtfully designed wellness destination dedicated to helping you look, feel, and live your best.",
    },
    p3: "Whether you're looking to recharge, support recovery, refine your contours, or rejuvenate your skin, AKSH offers a space where modern innovation meets thoughtful, personalised care.",
  },
  cta: {
    label: "Discover AKSH",
    destinationName: "Discover AKSH",
    href: "/about",
  },
  status: "owner_supplied",
};
