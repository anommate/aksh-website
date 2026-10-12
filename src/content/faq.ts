/**
 * Homepage FAQ section content (#faq, after Client Experiences; directly
 * after The AKSH Experience where the sample testimonials are omitted).
 *
 * Status: owner-supplied wording (12 Oct 2026), published as supplied,
 * including the booking channels ("website enquiry form, WhatsApp, or a phone
 * call"), reports and support statements. No phone number, WhatsApp link,
 * appointment availability or confirmation is published; see
 * docs/content/CONTENT_STATUS.md for the unresolved contact details.
 *
 * The supplied H2 "A Little Clarity, Before You Begin." and its introduction
 * were removed at the owner's request (12 Oct 2026); the lettering artwork is
 * now the H2.
 *
 * Emphasis is structured: `bold` runs render as strong emphasis; the support
 * text renders italic.
 */

/** A run of answer text; `bold` runs render as strong emphasis. */
export interface FaqTextRun {
  text: string;
  bold?: boolean;
}

export interface FaqItem {
  /** Two-digit display number, 01–06. */
  number: string;
  /** Rendered as an H3. */
  question: string;
  answer: readonly FaqTextRun[];
}

export interface FaqContent {
  /** Section anchor (#faq). */
  id: string;
  /**
   * Owner-supplied "FREQUENTLY ASKED QUESTIONS" lettering: the section's H2,
   * its alt text the heading's accessible name.
   */
  artwork: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  eyebrow: string;
  items: readonly FaqItem[];
  support: {
    eyebrow: string;
    /** Rendered as an H3. */
    heading: string;
    /** Rendered italic. */
    text: string;
  };
  /** Same destination and behaviour as the header "Book a Consultation" CTA. */
  cta: { label: string; destinationName: string; href: string };
  status: "owner_supplied";
}

export const faqContent: FaqContent = {
  id: "faq",
  // Trimmed display copy of assets/source/brand/faq-artwork.png: the measured
  // lettering plus a 28px transparent margin on every side; a pixel crop, not
  // redrawn or rescaled.
  artwork: {
    src: "/brand/faq-masthead.png",
    alt: "Frequently Asked Questions",
    width: 1995,
    height: 199,
  },
  eyebrow: "EVERYTHING YOU NEED TO KNOW",
  items: [
    {
      number: "01",
      question: "What services does AKSH offer?",
      answer: [
        { text: "AKSH brings together four specialised wellness categories: " },
        { text: "Biohacking, Recovery, Body Contouring, and Advanced Skin Treatments", bold: true },
        {
          text: ". From cryotherapy and relaxation therapies to non-invasive body contouring and advanced skin solutions, our services are designed to support your individual wellness and aesthetic goals.",
        },
      ],
    },
    {
      number: "02",
      question: "How do I know which treatment is right for me?",
      answer: [
        {
          text: "Every journey at AKSH begins with a personalised consultation. Our consultant takes the time to understand your concerns, lifestyle, and goals before recommending treatments that suit your individual needs.",
        },
      ],
    },
    {
      number: "03",
      question: "How can I book an appointment at AKSH?",
      answer: [
        { text: "Booking your AKSH experience is simple. You can schedule a consultation through our " },
        { text: "website enquiry form, WhatsApp, or a phone call", bold: true },
        { text: ". Our team will help you find a convenient appointment slot." },
      ],
    },
    {
      number: "04",
      question: "Are AKSH treatments safe and non-surgical?",
      answer: [
        {
          text: "AKSH offers a range of non-surgical wellness and aesthetic treatments using modern technologies. Suitability and safety depend on the individual treatment, your health history, and personal needs. Our team will guide you through the relevant precautions and expectations during your consultation.",
        },
      ],
    },
    {
      number: "05",
      question: "Will I receive a personalised treatment plan?",
      answer: [
        {
          text: "Yes. Following your consultation, you'll receive a personalised wellness docket outlining your recommended treatments, relevant reports, and suggested next steps, helping you make informed decisions about your wellness journey.",
        },
      ],
    },
    {
      number: "06",
      question: "What happens after my treatment?",
      answer: [
        {
          text: "Your AKSH experience extends beyond your session. Our team provides follow-up guidance, aftercare recommendations, and ongoing support to help you navigate your wellness journey with confidence. You can also reach out through our dedicated support channels whenever you need assistance.",
        },
      ],
    },
  ],
  support: {
    eyebrow: "STILL HAVE QUESTIONS?",
    heading: "We're Here to Help.",
    text: "Every journey begins with a conversation. Connect with our team and take the first step towards feeling your best.",
  },
  // The arrow is drawn by the CTA component (aria-hidden), after the label.
  cta: { label: "Book Your Consultation", destinationName: "Book a Consultation", href: "/book" },
  status: "owner_supplied",
};
