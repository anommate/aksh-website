import { describe, expect, it } from "vitest";
import { testimonialsContent } from "@/content/testimonials";

// The supplied sample entries, verbatim: [name, role, quote].
const SAMPLES: [string, string, string][] = [
  ["Ananya S.", "Biohacking Experience", "I had heard about biohacking but never really understood where to begin. The team explained everything so clearly and helped me choose an experience that suited my lifestyle. It felt like a completely new approach to self-care."],
  ["Riya M.", "Recovery & Relaxation", "Between work and everyday responsibilities, I rarely make time for myself. My session at AKSH was exactly the kind of break I needed. The atmosphere was calming, and I loved how thoughtfully everything was arranged."],
  ["Karan P.", "Body Contouring", "What impressed me most was how personalised the consultation felt. There was no pressure to choose a treatment. Everything was explained patiently, including what to expect. I felt comfortable making my own decision."],
  ["Sneha R.", "Advanced Skin Treatments", "I've always been particular about my skin, so I appreciated how carefully my concerns were understood. The consultation felt detailed and reassuring, and the recommendations were tailored to what my skin actually needed."],
  ["Meera D.", "AKSH Wellness Experience", "From the moment I walked in, AKSH felt different. The beautiful interiors, welcoming team, and attention to detail made the entire experience feel special. It's a place where you genuinely enjoy taking time for yourself."],
  ["Aditya K.", "Cryotherapy Experience", "Trying whole-body cryotherapy for the first time was exciting and a little intimidating. But the team made me feel comfortable, explained the process, and answered all my questions. It was definitely a unique experience."],
  ["Pooja T.", "Personalised Wellness", "I loved that the consultation wasn't just about recommending treatments. They took the time to understand my goals and gave me a clear wellness plan to take home. It made the whole journey feel much more personal."],
  ["Ishita A.", "Sound Healing Experience", "The sound healing session was such a peaceful experience. For once, I could disconnect from everything and simply enjoy the moment. It's become the kind of self-care I genuinely look forward to."],
  ["Rahul N.", "AKSH Client Experience", "What stood out to me was the care beyond the actual session. The team checked in, answered my questions, and made sure I understood the next steps. It's those small gestures that make an experience memorable."],
];

describe("Client Experiences testimonials", () => {
  it("holds the nine supplied entries verbatim, in order", () => {
    expect(testimonialsContent.testimonials.map(({ name, role, text }) => [name, role, text])).toEqual(SAMPLES);
  });

  it("uses the sample introduction and badge, without a disclosure notice", () => {
    expect(testimonialsContent).toMatchObject({
      id: "client-experiences",
      artwork: { src: "/brand/client-experiences-masthead.png", alt: "Client Experiences", width: 1625, height: 188 },
      heading: ["The Art of Feeling Good,", "Through Their Eyes."],
      description: "Personal journeys. A shared commitment to feeling your best.",
      badge: "Sample",
    });
    expect(testimonialsContent).not.toHaveProperty("notice");
    // The artwork replaces the typed label.
    expect(testimonialsContent).not.toHaveProperty("eyebrow");
  });

  it("is recorded as fictional samples, without portraits or ratings", () => {
    expect(testimonialsContent.status).toBe("fictional_sample");
    for (const testimonial of testimonialsContent.testimonials) {
      expect(testimonial.image).toBeUndefined();
      expect(Object.keys(testimonial).sort()).toEqual(["name", "role", "text"]);
    }
    expect(JSON.stringify(testimonialsContent)).not.toMatch(/★|rating|stars|verified client\b(?! reviews)|google/i);
  });
});
