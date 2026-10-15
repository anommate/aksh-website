import { describe, expect, it } from "vitest";
import { footerWaves } from "@/components/layout/footer-wave";

// A layer's top edge as on-curve points: the path starts "M0 100 L0 y", then
// one cubic segment per step, then closes along the bottom.
function edgePoints(path: string) {
  const start = /^M0 100 L0 (\S+)/.exec(path);
  const points = [{ x: 0, y: Number(start![1]) }];
  for (const segment of path.matchAll(/C(\S+ \S+ \S+ \S+ \S+ \S+)/g)) {
    const n = segment[1].split(" ").map(Number);
    points.push({ x: n[4], y: n[5] });
  }
  return points;
}

describe("footer waves", () => {
  const { period, viewBox, layers } = footerWaves;
  const [, , width, height] = viewBox.split(" ").map(Number);
  const edges = layers.map(edgePoints);

  it("has four distinct layers", () => {
    expect(layers).toHaveLength(4);
    expect(new Set(layers).size).toBe(4);
  });

  it("each is one period wide, drawn over two, and closed along the bottom", () => {
    expect(width).toBe(period);
    for (const [index, points] of edges.entries()) {
      expect(points.at(-1)!.x).toBe(period * 2);
      expect(layers[index]).toMatch(new RegExp(`L${period * 2} ${height} Z$`));
    }
  });

  it("each repeats exactly after one period, so its drift loops without a seam", () => {
    for (const points of edges) {
      for (const point of points.filter((p) => p.x <= period)) {
        const later = points.find((p) => p.x === point.x + period)!;
        expect(later.y).toBeCloseTo(point.y, 1);
      }
    }
  });

  it("layers sit back (higher) to front (lower); the front trough stays clear of the body", () => {
    const tops = edges.map((points) => Math.min(...points.map((p) => p.y)));
    const bottoms = edges.map((points) => Math.max(...points.map((p) => p.y)));
    for (let i = 1; i < edges.length; i++) {
      expect(tops[i]).toBeGreaterThan(tops[i - 1]);
      expect(bottoms[i]).toBeGreaterThan(bottoms[i - 1]);
    }
    expect(tops[0]).toBeGreaterThanOrEqual(1.9);
    expect(bottoms.at(-1)!).toBeLessThanOrEqual(86.1);
    // Broad but clearly wavy: each layer spans at least 40% of the band.
    for (let i = 0; i < edges.length; i++) expect(bottoms[i] - tops[i]).toBeGreaterThan(40);
  });

  it("each shows two or three broad crests across the width", () => {
    for (const points of edges) {
      const one = points.filter((p) => p.x < period);
      const crests = one.filter((p, i) => {
        const before = one[(i - 1 + one.length) % one.length];
        const after = one[(i + 1) % one.length];
        return p.y < before.y && p.y <= after.y;
      });
      expect(crests.length).toBeGreaterThanOrEqual(2);
      expect(crests.length).toBeLessThanOrEqual(3);
    }
  });
});
