/**
 * AKSH Homepage Services Section Content
 *
 * Status: OWNER-SUPPLIED CONTENT
 * Source: Services section copy brief (four categories, twelve treatments)
 *
 * Imagery: no approved service photography has been supplied. Each category
 * keeps `image: null` until a clinic or licensed asset exists; the card then
 * shows a labelled development placeholder instead of a photograph.
 */

/** Pillar route parameters (TRD §4). */
export type PillarId = "biohacking" | "recovery" | "body-contouring" | "skin";

export interface ServiceImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  source: "clinic" | "licensed" | "prototype";
}

export interface ServiceTreatment {
  /** Shown in bold. */
  name: string;
  descriptor: string;
}

export interface ServiceCategory {
  id: PillarId;
  number: string;
  title: string;
  tagline: string;
  description: string;
  treatments: readonly ServiceTreatment[];
  cta: {
    label: string;
    destinationName: string;
    href: string;
  };
  image: ServiceImage | null;
}

export interface ServicesSectionContent {
  id: string;
  /** Owner-supplied "OUR SERVICES" masthead lettering; replaces a typed label. */
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
  introduction: string;
  categories: readonly ServiceCategory[];
  status: "owner_supplied";
}

/** Anchor id of a homepage service card (src/components/sections/services.tsx). */
export const serviceCardId = (id: string) => `service-${id}`;

export const servicesContent: ServicesSectionContent = {
  id: "services",
  // The owner-supplied single-line file exactly as received (15 Oct 2026),
  // byte-identical to assets/source/brand/our-services-artwork-2026-10-15.png:
  // not cropped, resized, recoloured or re-encoded, and served unoptimised.
  artwork: {
    src: "/brand/our-services-masthead-2026-10-15.png",
    alt: "Our Services",
    width: 2048,
    height: 682,
    ink: { top: 273, bottom: 425 },
  },
  eyebrow: "DISCOVER WELLNESS AT AKSH",
  heading: "Thoughtfully Designed Around You.",
  introduction:
    "Explore a world of modern wellness where innovative treatments meet personalised care. From enhancing your recovery and relaxation to refining your contours and rejuvenating your skin, discover experiences designed around your individual goals.",
  categories: [
    {
      id: "biohacking",
      number: "01",
      title: "Biohacking",
      tagline: "Elevate Your Everyday.",
      description:
        "Explore innovative wellness technologies designed to complement your lifestyle, encourage rejuvenation, and introduce a new dimension to self-care.",
      treatments: [
        { name: "Cryo Chamber", descriptor: "Whole-Body Cryotherapy" },
        { name: "Aerion Oxy Pod", descriptor: "Oxygen & Hydrogen Therapy" },
      ],
      cta: {
        label: "Explore Biohacking",
        destinationName: "Biohacking Treatments",
        href: "/treatments/biohacking",
      },
      image: null,
    },
    {
      id: "recovery",
      number: "02",
      title: "Recovery",
      tagline: "Restore. Recharge. Reconnect.",
      description:
        "Make space to slow down, release everyday tension, and reconnect with yourself through calming, restorative wellness experiences.",
      treatments: [
        { name: "Gamma Wavelength Therapy", descriptor: "Mind & Body Massager" },
        { name: "Recliner Chair Relaxation", descriptor: "Comfort & Relaxation" },
        { name: "Sound Healing Room", descriptor: "Immersive Sound Relaxation" },
        { name: "Salt Sauna", descriptor: "Heat & Relaxation Experience" },
      ],
      cta: {
        label: "Explore Recovery",
        destinationName: "Recovery Treatments",
        href: "/treatments/recovery",
      },
      image: null,
    },
    {
      id: "body-contouring",
      number: "03",
      title: "Body Contouring",
      tagline: "Confidence in Every Contour.",
      description:
        "Discover advanced non-surgical aesthetic technologies designed to support your body contouring goals with a personalised approach.",
      treatments: [
        { name: "EMSculpt Neo", descriptor: "Muscle Building & Fat Reduction" },
        { name: "Cryolipolysis", descriptor: "Fat Freezing" },
        { name: "RF Skin Tightening", descriptor: "Radiofrequency Skin Tightening" },
      ],
      cta: {
        label: "Explore Body Contouring",
        destinationName: "Body Contouring Treatments",
        href: "/treatments/body-contouring",
      },
      image: null,
    },
    {
      id: "skin",
      number: "04",
      title: "Skin",
      tagline: "Reveal Your Natural Radiance.",
      description:
        "Experience modern skin-focused treatments designed to address aesthetic concerns and complement your natural beauty.",
      treatments: [
        { name: "Red Light Therapy", descriptor: "Skin Rejuvenation" },
        { name: "Q-Switch Laser", descriptor: "Pigmentation & Skin Brightening" },
        { name: "Diode Laser Hair Removal", descriptor: "Long-Term Hair Reduction" },
      ],
      cta: {
        label: "Explore Skin",
        destinationName: "Skin Treatments",
        href: "/treatments/skin",
      },
      image: null,
    },
  ],
  status: "owner_supplied",
};
