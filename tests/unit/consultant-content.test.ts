import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { consultantContent } from "@/content/consultant";

// The owner-supplied copy, verbatim. **Bold** marks the emphasised runs.
const BIOGRAPHY = [
  "With a deep passion for aesthetic science, skin health, and holistic wellbeing, Dr. Priyanka Masharkar believes that true confidence begins with feeling your best, inside and out.",
  "With a background in medical practice and advanced training in clinical dermatology, aesthetic medicine, lasers, injectables, and regenerative therapies, she brings together scientific knowledge, modern techniques, and a thoughtful understanding of individual needs.",
  "At AKSH, her approach reflects a belief that wellness and aesthetics should go hand in hand. By focusing on personalised care, informed choices, and natural-looking results, she helps individuals explore treatments aligned with their unique goals.",
  "Her philosophy is rooted in a simple belief: **enhancing your natural beauty while embracing your individuality.**",
  "Because at AKSH, it's not about becoming someone different. **It's about feeling like the best version of yourself.**",
];

// JPEG baseline/progressive SOF segment: height and width follow the marker.
function jpegSize(file: Buffer) {
  let offset = 2;
  while (offset < file.length) {
    const marker = file[offset + 1];
    const length = file.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xc2) {
      return [file.readUInt16BE(offset + 7), file.readUInt16BE(offset + 5)];
    }
    offset += 2 + length;
  }
  throw new Error("No SOF segment");
}

describe("homepage consultant content", () => {
  it("labels the section with the owner's wordmark, served exactly as archived", () => {
    const { artwork } = consultantContent;
    expect(consultantContent).not.toHaveProperty("eyebrow");
    expect(artwork.alt).toBe("Meet Our Consultant");
    expect(artwork.src).toBe("/brand/meet-our-consultant-masthead-2026-10-15.png");
    const original = readFileSync(join(process.cwd(), "assets/source/brand/meet-our-consultant-artwork-2026-10-15.png"));
    const display = readFileSync(join(process.cwd(), "public", artwork.src));
    expect(createHash("sha256").update(original).digest("hex")).toBe(
      "8918555fac471cf9536f4cd74a162f49bb2708ad6ce25d37f36924bd46300e58"
    );
    expect(display.equals(original)).toBe(true);
    // PNG IHDR: width and height are big-endian uint32 at bytes 16 and 20.
    expect([display.readUInt32BE(16), display.readUInt32BE(20)]).toEqual([artwork.width, artwork.height]);
    expect([artwork.width, artwork.height]).toEqual([2048, 682]);
    expect(artwork.ink).toEqual({ top: 281, bottom: 394 });
  });

  it("matches the supplied heading wording", () => {
    expect(consultantContent.name).toBe("Dr. Priyanka Masharkar");
    expect(consultantContent.role).toBe("Aesthetic Dermatologist | Wellness & Aesthetic Consultant");
    expect(consultantContent.tagline).toBe(
      "Where medical expertise meets a personalised approach to wellbeing."
    );
  });

  it("matches the supplied biography, including its bold runs", () => {
    const rendered = consultantContent.biography.map((paragraph) =>
      paragraph.map((run) => (run.bold ? `**${run.text}**` : run.text)).join("")
    );
    expect(rendered).toEqual(BIOGRAPHY);
  });

  it("has no CTA of its own", () => {
    expect(consultantContent).not.toHaveProperty("cta");
  });

  it("uses the unedited portrait with its real intrinsic size", () => {
    const { portrait } = consultantContent;
    expect(portrait.alt).toBe("Dr. Priyanka Masharkar");
    const display = readFileSync(join(process.cwd(), "public", portrait.src));
    const original = readFileSync(
      join(process.cwd(), "assets/source/team/Dr.Priyanka-Masharkar-Twacha-Aesthetic.jpg")
    );
    expect(display.equals(original)).toBe(true);
    expect(jpegSize(display)).toEqual([portrait.width, portrait.height]);
  });
});
