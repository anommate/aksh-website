import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { experienceContent } from "@/content/experience";

// PNG IHDR: width and height are big-endian uint32 at bytes 16 and 20.
const pngSize = (file: Buffer) => [file.readUInt32BE(16), file.readUInt32BE(20)];

describe("The AKSH Experience masthead", () => {
  const { artwork } = experienceContent;

  it("uses the owner's wordmark, with its real intrinsic size, as the section label", () => {
    expect(artwork.alt).toBe("The AKSH Experience");
    expect(artwork.src).toBe("/brand/the-aksh-experience-masthead.png");
    const display = readFileSync(join(process.cwd(), "public", artwork.src));
    expect(pngSize(display)).toEqual([artwork.width, artwork.height]);
    expect([artwork.width, artwork.height]).toEqual([1920, 261]);
  });

  it("keeps the original archived and the display copy within it", () => {
    const original = readFileSync(join(process.cwd(), "assets/source/brand/the-aksh-experience-artwork.png"));
    const [width, height] = pngSize(original);
    expect([width, height]).toEqual([2172, 724]);
    expect(artwork.width).toBeLessThanOrEqual(width);
    expect(artwork.height).toBeLessThanOrEqual(height);
  });

  it("no longer carries a typed label", () => {
    expect(experienceContent).not.toHaveProperty("eyebrow");
  });
});
