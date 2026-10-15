import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { experienceContent } from "@/content/experience";

// PNG IHDR: width and height are big-endian uint32 at bytes 16 and 20.
const pngSize = (file: Buffer) => [file.readUInt32BE(16), file.readUInt32BE(20)];

describe("The AKSH Experience masthead", () => {
  const { artwork } = experienceContent;

  const SUPPLIED_SHA256 = "8509eae0f9dad2a9391a41ad656874ccb24638d55e32cd74aab4ebafb4231ad7";
  const sha256 = (file: Buffer) => createHash("sha256").update(file).digest("hex");

  it("uses the owner's wordmark, with its real intrinsic size, as the section label", () => {
    expect(artwork.alt).toBe("The AKSH Experience");
    expect(artwork.src).toBe("/brand/the-aksh-experience-masthead-2026-10-15.png");
    const display = readFileSync(join(process.cwd(), "public", artwork.src));
    expect(pngSize(display)).toEqual([artwork.width, artwork.height]);
    expect([artwork.width, artwork.height]).toEqual([2048, 682]);
  });

  it("serves the supplied file exactly as archived, byte for byte", () => {
    const original = readFileSync(join(process.cwd(), "assets/source/brand/the-aksh-experience-artwork-2026-10-15.png"));
    const display = readFileSync(join(process.cwd(), "public", artwork.src));
    expect(sha256(original)).toBe(SUPPLIED_SHA256);
    expect(display.equals(original)).toBe(true);
  });

  it("records the lettering rows inside the file's transparent margin", () => {
    expect(artwork.ink).toEqual({ top: 210, bottom: 408 });
    expect(artwork.ink.top).toBeGreaterThan(0);
    expect(artwork.ink.bottom).toBeLessThan(artwork.height - 1);
  });

  it("no longer carries a typed label", () => {
    expect(experienceContent).not.toHaveProperty("eyebrow");
  });
});
