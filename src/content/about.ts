/**
 * AKSH Homepage About Us Section Content
 *
 * Status: OWNER-SUPPLIED CONTENT
 * Source: Attached About Us Artwork & Editorial Brief
 */

export interface AboutSectionContent {
  id: string;
  artwork: {
    src: string;
    alt: string;
    width: number;
    height: number;
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
  artwork: {
    src: "/brand/about-us-artwork.png",
    alt: "", // Empty alt attribute for decorative masthead artwork per accessibility spec
    width: 741,
    height: 229,
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
