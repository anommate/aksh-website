import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { servicesContent } from "@/content/services";

// The owner-supplied copy, verbatim. The model must match it exactly.
const BRIEF = [
  {
    number: "01",
    title: "Biohacking",
    tagline: "Elevate Your Everyday.",
    description:
      "Explore innovative wellness technologies designed to complement your lifestyle, encourage rejuvenation, and introduce a new dimension to self-care.",
    treatments: [
      "Cryo Chamber — Whole-Body Cryotherapy",
      "Aerion Oxy Pod — Oxygen & Hydrogen Therapy",
    ],
    cta: "Explore Biohacking",
  },
  {
    number: "02",
    title: "Recovery",
    tagline: "Restore. Recharge. Reconnect.",
    description:
      "Make space to slow down, release everyday tension, and reconnect with yourself through calming, restorative wellness experiences.",
    treatments: [
      "Gamma Wavelength Therapy — Mind & Body Massager",
      "Recliner Chair Relaxation — Comfort & Relaxation",
      "Sound Healing Room — Immersive Sound Relaxation",
      "Salt Sauna — Heat & Relaxation Experience",
    ],
    cta: "Explore Recovery",
  },
  {
    number: "03",
    title: "Body Contouring",
    tagline: "Confidence in Every Contour.",
    description:
      "Discover advanced non-surgical aesthetic technologies designed to support your body contouring goals with a personalised approach.",
    treatments: [
      "EMSculpt Neo — Muscle Building & Fat Reduction",
      "Cryolipolysis — Fat Freezing",
      "RF Skin Tightening — Radiofrequency Skin Tightening",
    ],
    cta: "Explore Body Contouring",
  },
  {
    number: "04",
    title: "Skin",
    tagline: "Reveal Your Natural Radiance.",
    description:
      "Experience modern skin-focused treatments designed to address aesthetic concerns and complement your natural beauty.",
    treatments: [
      "Red Light Therapy — Skin Rejuvenation",
      "Q-Switch Laser — Pigmentation & Skin Brightening",
      "Diode Laser Hair Removal — Long-Term Hair Reduction",
    ],
    cta: "Explore Skin",
  },
];

describe("homepage services content", () => {
  it("matches the section introduction copy", () => {
    expect(servicesContent.id).toBe("services");
    expect(servicesContent.eyebrow).toBe("DISCOVER WELLNESS AT AKSH");
    expect(servicesContent.heading).toBe("Thoughtfully Designed Around You.");
    expect(servicesContent.introduction).toBe(
      "Explore a world of modern wellness where innovative treatments meet personalised care. From enhancing your recovery and relaxation to refining your contours and rejuvenating your skin, discover experiences designed around your individual goals."
    );
  });

  it("uses the masthead artwork, with its real intrinsic size, as the section label", () => {
    const { artwork } = servicesContent;
    expect(artwork.alt).toBe("Our Services");
    expect(artwork.src).toBe("/brand/our-services-masthead.png");
    // PNG IHDR: width and height are big-endian uint32 at bytes 16 and 20.
    const png = readFileSync(join(process.cwd(), "public", artwork.src));
    expect(png.subarray(1, 4).toString("ascii")).toBe("PNG");
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([artwork.width, artwork.height]);
  });

  it("lists the four categories, in order, with their exact copy and twelve treatments", () => {
    const actual = servicesContent.categories.map((category) => ({
      number: category.number,
      title: category.title,
      tagline: category.tagline,
      description: category.description,
      treatments: category.treatments.map((t) => `${t.name} — ${t.descriptor}`),
      cta: category.cta.label,
    }));
    expect(actual).toEqual(BRIEF);
    expect(actual.flatMap((category) => category.treatments)).toHaveLength(12);
  });

  it("points each CTA at its pillar route without inventing pages", () => {
    expect(servicesContent.categories.map((c) => [c.id, c.cta.href])).toEqual([
      ["biohacking", "/treatments/biohacking"],
      ["recovery", "/treatments/recovery"],
      ["body-contouring", "/treatments/body-contouring"],
      ["skin", "/treatments/skin"],
    ]);
  });

  it("records missing imagery instead of using unapproved photographs", () => {
    for (const category of servicesContent.categories) {
      expect(category.image).toBeNull();
    }
  });
});
