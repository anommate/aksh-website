import { describe, expect, it } from "vitest";
import { faqContent } from "@/content/faq";

// The supplied answers, verbatim, with **bold** marking the emphasised runs.
const ANSWERS = [
  "AKSH brings together four specialised wellness categories: **Biohacking, Recovery, Body Contouring, and Advanced Skin Treatments**. From cryotherapy and relaxation therapies to non-invasive body contouring and advanced skin solutions, our services are designed to support your individual wellness and aesthetic goals.",
  "Every journey at AKSH begins with a personalised consultation. Our consultant takes the time to understand your concerns, lifestyle, and goals before recommending treatments that suit your individual needs.",
  "Booking your AKSH experience is simple. You can schedule a consultation through our **website enquiry form, WhatsApp, or a phone call**. Our team will help you find a convenient appointment slot.",
  "AKSH offers a range of non-surgical wellness and aesthetic treatments using modern technologies. Suitability and safety depend on the individual treatment, your health history, and personal needs. Our team will guide you through the relevant precautions and expectations during your consultation.",
  "Yes. Following your consultation, you'll receive a personalised wellness docket outlining your recommended treatments, relevant reports, and suggested next steps, helping you make informed decisions about your wellness journey.",
  "Your AKSH experience extends beyond your session. Our team provides follow-up guidance, aftercare recommendations, and ongoing support to help you navigate your wellness journey with confidence. You can also reach out through our dedicated support channels whenever you need assistance.",
];

const QUESTIONS = [
  "What services does AKSH offer?",
  "How do I know which treatment is right for me?",
  "How can I book an appointment at AKSH?",
  "Are AKSH treatments safe and non-surgical?",
  "Will I receive a personalised treatment plan?",
  "What happens after my treatment?",
];

describe("FAQ content", () => {
  it("uses the lettering artwork as its heading, the eyebrow, support block and CTA", () => {
    expect(faqContent).toMatchObject({
      id: "faq",
      artwork: { src: "/brand/faq-masthead.png", alt: "Frequently Asked Questions", width: 1995, height: 199 },
      eyebrow: "EVERYTHING YOU NEED TO KNOW",
      support: {
        eyebrow: "STILL HAVE QUESTIONS?",
        heading: "We're Here to Help.",
        text: "Every journey begins with a conversation. Connect with our team and take the first step towards feeling your best.",
      },
      cta: { label: "Book Your Consultation", destinationName: "Book a Consultation", href: "/book" },
      status: "owner_supplied",
    });
    // The typed title, the H2 and its introduction were removed.
    for (const removed of ["label", "heading", "introduction"]) expect(faqContent).not.toHaveProperty(removed);
    expect(JSON.stringify(faqContent)).not.toMatch(/A Little Clarity|should feel effortless/);
  });

  it("holds the six numbered questions and answers verbatim, with their emphasis", () => {
    expect(faqContent.items.map((item) => item.number)).toEqual(["01", "02", "03", "04", "05", "06"]);
    expect(faqContent.items.map((item) => item.question)).toEqual(QUESTIONS);
    expect(
      faqContent.items.map((item) => item.answer.map((run) => (run.bold ? `**${run.text}**` : run.text)).join(""))
    ).toEqual(ANSWERS);
  });

  it("publishes no contact numbers, links, timestamps or emoji", () => {
    const text = JSON.stringify(faqContent);
    expect(text).not.toMatch(/\+?\d[\d\s-]{7,}\d|https?:|wa\.me|tel:|\d{1,2}:\d{2}|\p{Extended_Pictographic}/u);
  });
});
