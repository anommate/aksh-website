/**
 * AKSH Homepage "Meet Our Consultant" Section Content
 *
 * Status: OWNER-SUPPLIED CONTENT
 * Source: Consultant section brief (wording) and the owner-supplied portrait
 * (assets/source/team/Dr.Priyanka-Masharkar-Twacha-Aesthetic.jpg).
 *
 * The role and biography are reproduced as supplied. Qualifications, training
 * and registration have not been independently verified; add nothing beyond
 * this wording.
 */

/** A run of biography text; `bold` runs render as strong emphasis. */
export interface ConsultantTextRun {
  text: string;
  bold?: boolean;
}

export interface ConsultantContent {
  id: string;
  eyebrow: string;
  name: string;
  /** Rendered bold. */
  role: string;
  /** Rendered italic. */
  tagline: string;
  biography: readonly (readonly ConsultantTextRun[])[];
  portrait: {
    src: string;
    alt: string;
    width: number;
    height: number;
    source: "clinic" | "licensed" | "prototype";
  };
  status: "owner_supplied";
}

export const consultantContent: ConsultantContent = {
  id: "meet-our-consultant",
  eyebrow: "MEET OUR CONSULTANT",
  name: "Dr. Priyanka Masharkar",
  role: "Aesthetic Dermatologist | Wellness & Aesthetic Consultant",
  tagline: "Where medical expertise meets a personalised approach to wellbeing.",
  biography: [
    [
      {
        text: "With a deep passion for aesthetic science, skin health, and holistic wellbeing, Dr. Priyanka Masharkar believes that true confidence begins with feeling your best, inside and out.",
      },
    ],
    [
      {
        text: "With a background in medical practice and advanced training in clinical dermatology, aesthetic medicine, lasers, injectables, and regenerative therapies, she brings together scientific knowledge, modern techniques, and a thoughtful understanding of individual needs.",
      },
    ],
    [
      {
        text: "At AKSH, her approach reflects a belief that wellness and aesthetics should go hand in hand. By focusing on personalised care, informed choices, and natural-looking results, she helps individuals explore treatments aligned with their unique goals.",
      },
    ],
    [
      { text: "Her philosophy is rooted in a simple belief: " },
      { text: "enhancing your natural beauty while embracing your individuality.", bold: true },
    ],
    [
      { text: "Because at AKSH, it's not about becoming someone different. " },
      { text: "It's about feeling like the best version of yourself.", bold: true },
    ],
  ],
  // Byte-for-byte copy of the supplied photograph; no edits.
  portrait: {
    src: "/team/dr-priyanka-masharkar.jpg",
    alt: "Dr. Priyanka Masharkar",
    width: 619,
    height: 856,
    source: "clinic",
  },
  status: "owner_supplied",
};
