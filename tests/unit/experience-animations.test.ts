import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { experienceContent } from "@/content/experience";

// The journey animations (scripts/generate-experience-animations.mjs): a
// reveal played once, then a loop that must join seamlessly and keep every
// symbol visible.

type Keyframe = { t: number; s: number[]; o?: { y: number[] }; i?: { y: number[] } };
type Property = { a: 0; k: unknown } | { a: 1; k: Keyframe[] };
type Marker = { cm: string; tm: number; dr: number };

const read = (publicPath: string) => readFileSync(join(process.cwd(), "public", publicPath), "utf8");

/** Every animated transform and trim property, with a readable path. */
function animatedProperties(node: unknown, path = ""): [string, Keyframe[]][] {
  if (Array.isArray(node)) return node.flatMap((child, i) => animatedProperties(child, `${path}[${i}]`));
  if (!node || typeof node !== "object") return [];
  const record = node as Record<string, unknown>;
  const found: [string, Keyframe[]][] = [];
  if (record.ty === "tr" || record.ty === "tm") {
    for (const key of ["p", "s", "r", "o", "e"]) {
      const property = record[key] as Property | undefined;
      if (property?.a === 1) found.push([`${path}.${record.ty}.${key}`, property.k]);
    }
  }
  for (const [key, child] of Object.entries(record)) found.push(...animatedProperties(child, `${path}.${key}`));
  return found;
}

/** The value at frame t; throws if the property is mid-move at t. */
function valueAt(keyframes: Keyframe[], t: number) {
  if (t <= keyframes[0].t) return keyframes[0].s;
  for (let i = 0; i < keyframes.length - 1; i++) {
    const [current, next] = [keyframes[i], keyframes[i + 1]];
    if (t === current.t) return current.s;
    if (t > current.t && t < next.t) {
      if (JSON.stringify(current.s) !== JSON.stringify(next.s)) throw new Error(`moving at frame ${t}`);
      return current.s;
    }
  }
  return keyframes.at(-1)!.s;
}

describe.each(experienceContent.steps.map((step) => [step.number, step.illustration] as const))(
  "step %s animation",
  (_, illustration) => {
    const data = JSON.parse(read(illustration.animation));
    const markers = data.markers as Marker[];
    const reveal = markers.find((marker) => marker.cm === "reveal")!;
    const loop = markers.find((marker) => marker.cm === "loop")!;
    const loopStart = loop.tm;
    const loopEnd = loop.tm + loop.dr;
    const properties = animatedProperties(data.layers);

    it("has a 160x160, 30fps reveal followed by a loop that ends the timeline", () => {
      expect([data.w, data.h, data.fr]).toEqual([160, 160, 30]);
      expect(reveal).toMatchObject({ tm: 0 });
      expect(loopStart).toBe(reveal.tm + reveal.dr);
      expect(loopEnd).toBe(data.op);
      expect(data.layers.every((layer: { op: number }) => layer.op === data.op)).toBe(true);
      expect(data.assets).toEqual([]);
      expect(properties.length).toBeGreaterThan(0);
    });

    it("loops seamlessly: every property is at rest and equal at the loop's start and end", () => {
      for (const [path, keyframes] of properties) {
        expect(valueAt(keyframes, loopEnd), path).toEqual(valueAt(keyframes, loopStart));
        expect(keyframes.at(-1)!.t, path).toBeLessThanOrEqual(loopEnd);
      }
    });

    it("eases every loop move in and out, with no overshoot", () => {
      for (const [path, keyframes] of properties) {
        for (const keyframe of keyframes.filter((k) => k.t >= loopStart && k.o)) {
          expect(keyframe.o!.y.every((y) => y === 0), path).toBe(true);
          expect(keyframe.i!.y.every((y) => y === 1), path).toBe(true);
        }
      }
    });

    it("keeps every symbol visible during the loop", () => {
      const opacities = properties.filter(([path]) => path.endsWith(".tr.o"));
      for (const [path, keyframes] of opacities) {
        for (const keyframe of keyframes.filter((k) => k.t >= loopStart)) {
          expect(keyframe.s[0], path).toBeGreaterThanOrEqual(30);
        }
      }
      // Trims (drawn strokes) are complete before the loop and stay complete.
      for (const [path, keyframes] of properties.filter(([p]) => p.endsWith(".tm.e"))) {
        expect(valueAt(keyframes, loopStart), path).toEqual([100]);
        expect(keyframes.at(-1)!.t, path).toBeLessThanOrEqual(loopStart);
      }
    });

    it("moves during the loop", () => {
      const moving = properties.filter(([, keyframes]) => keyframes.some((k) => k.t > loopStart && k.t < loopEnd));
      expect(moving.length).toBeGreaterThan(0);
    });

    it("has a 160x160 static SVG", () => {
      expect(read(illustration.poster)).toContain('viewBox="0 0 160 160"');
    });
  }
);
