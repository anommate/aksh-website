/**
 * Homepage "Client Experiences" testimonials section content
 * (#client-experiences, after The AKSH Experience).
 *
 * Status: FICTIONAL DEVELOPMENT SAMPLES. Every entry below is an illustrative
 * placeholder written for layout work, not feedback from a real AKSH client.
 * PRD §6 and DECISIONS D-10 forbid fabricated testimonials, so the section is
 * shown only as a labelled draft in development and preview and is omitted in
 * production (src/components/sections/testimonials.tsx). Replace the entries
 * with genuine, consented, approved feedback before it can be published; the
 * "Real experiences." introduction is reserved for that version.
 *
 * No ratings, review counts, verification badges or third-party review
 * branding. No portraits: avatars show initials until approved images exist.
 */

/** Optional portrait. Must be a locally served, licensed or consented image. */
export interface TestimonialImage {
  src: string;
  /** Describe the image, never as an AKSH client photograph. */
  alt: string;
  width: number;
  height: number;
}

/** One testimonial, shared by the content, the section and the columns. */
export interface Testimonial {
  /** The quote, verbatim. */
  text: string;
  name: string;
  /** The experience the quote refers to. */
  role: string;
  image?: TestimonialImage;
}

export interface TestimonialsContent {
  /** Section anchor (#client-experiences). */
  id: string;
  /** Owner-supplied "CLIENT EXPERIENCES" masthead lettering; replaces a typed label. */
  artwork: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  /** The H2, in its two lines from tablet up; mobile wraps it naturally. */
  heading: readonly [string, string];
  /** Introduction for the sample version. */
  description: string;
  /** Visible on every card while the entries are samples. */
  badge: string;
  testimonials: readonly Testimonial[];
  status: "fictional_sample";
}

export const testimonialsContent: TestimonialsContent = {
  id: "client-experiences",
  // Trimmed display copy of assets/source/brand/client-experiences-artwork.png:
  // the measured lettering plus a 28px transparent margin on every side; a
  // pixel crop, not redrawn or rescaled.
  artwork: {
    src: "/brand/client-experiences-masthead.png",
    alt: "Client Experiences",
    width: 1625,
    height: 188,
  },
  heading: ["The Art of Feeling Good,", "Through Their Eyes."],
  description: "Personal journeys. A shared commitment to feeling your best.",
  badge: "Sample",
  testimonials: [
    {
      name: "Ananya S.",
      role: "Biohacking Experience",
      text: "I had heard about biohacking but never really understood where to begin. The team explained everything so clearly and helped me choose an experience that suited my lifestyle. It felt like a completely new approach to self-care.",
    },
    {
      name: "Riya M.",
      role: "Recovery & Relaxation",
      text: "Between work and everyday responsibilities, I rarely make time for myself. My session at AKSH was exactly the kind of break I needed. The atmosphere was calming, and I loved how thoughtfully everything was arranged.",
    },
    {
      name: "Karan P.",
      role: "Body Contouring",
      text: "What impressed me most was how personalised the consultation felt. There was no pressure to choose a treatment. Everything was explained patiently, including what to expect. I felt comfortable making my own decision.",
    },
    {
      name: "Sneha R.",
      role: "Advanced Skin Treatments",
      text: "I've always been particular about my skin, so I appreciated how carefully my concerns were understood. The consultation felt detailed and reassuring, and the recommendations were tailored to what my skin actually needed.",
    },
    {
      name: "Meera D.",
      role: "AKSH Wellness Experience",
      text: "From the moment I walked in, AKSH felt different. The beautiful interiors, welcoming team, and attention to detail made the entire experience feel special. It's a place where you genuinely enjoy taking time for yourself.",
    },
    {
      name: "Aditya K.",
      role: "Cryotherapy Experience",
      text: "Trying whole-body cryotherapy for the first time was exciting and a little intimidating. But the team made me feel comfortable, explained the process, and answered all my questions. It was definitely a unique experience.",
    },
    {
      name: "Pooja T.",
      role: "Personalised Wellness",
      text: "I loved that the consultation wasn't just about recommending treatments. They took the time to understand my goals and gave me a clear wellness plan to take home. It made the whole journey feel much more personal.",
    },
    {
      name: "Ishita A.",
      role: "Sound Healing Experience",
      text: "The sound healing session was such a peaceful experience. For once, I could disconnect from everything and simply enjoy the moment. It's become the kind of self-care I genuinely look forward to.",
    },
    {
      name: "Rahul N.",
      role: "AKSH Client Experience",
      text: "What stood out to me was the care beyond the actual session. The team checked in, answered my questions, and made sure I understood the next steps. It's those small gestures that make an experience memorable.",
    },
  ],
  status: "fictional_sample",
};
