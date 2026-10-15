// Footer wave layers (src/components/layout/footer-waves.tsx). Computed on the
// server and passed down as strings, so the client never recomputes them and
// the markup always matches.

/*
 * Geometry in SVG user units. Each layer's period is exactly the visible
 * width, and each path is drawn over two periods, so moving it one period
 * left loops without a seam. A few low harmonics give two or three broad,
 * unequal swells; every layer has its own mix and phase, so the layers never
 * line up. Each layer stays inside its own band, back (highest) to front
 * (lowest); the front layer is the opaque one that joins the footer body, and
 * its deepest trough stays above the bottom of the band.
 */
const PERIOD = 1200;
const HEIGHT = 100;
const SEGMENTS_PER_PERIOD = 24;

interface Harmonic {
  cycles: number;
  amplitude: number;
  phase: number;
}

const LAYERS: readonly { top: number; bottom: number; harmonics: readonly Harmonic[] }[] = [
  {
    top: 2,
    bottom: 44,
    harmonics: [
      { cycles: 2, amplitude: 1, phase: 0.2 },
      { cycles: 3, amplitude: 0.35, phase: 1.7 },
    ],
  },
  {
    top: 12,
    bottom: 58,
    harmonics: [
      { cycles: 1, amplitude: 0.4, phase: 2.6 },
      { cycles: 2, amplitude: 1, phase: 1.4 },
      { cycles: 3, amplitude: 0.3, phase: 0.5 },
    ],
  },
  {
    top: 26,
    bottom: 72,
    harmonics: [
      { cycles: 2, amplitude: 0.7, phase: 2.9 },
      { cycles: 3, amplitude: 1, phase: 0.9 },
    ],
  },
  {
    top: 42,
    bottom: 86,
    harmonics: [
      { cycles: 1, amplitude: 0.35, phase: 1.1 },
      { cycles: 2, amplitude: 1, phase: 0.4 },
      { cycles: 3, amplitude: 0.45, phase: 2.3 },
    ],
  },
];

/** A filled wave: its curved top edge, then down and across the bottom. */
function wavePath({ top, bottom, harmonics }: (typeof LAYERS)[number]) {
  const turn = (x: number) => (2 * Math.PI * x) / PERIOD;
  const raw = (x: number) => harmonics.reduce((y, h) => y + h.amplitude * Math.sin(h.cycles * turn(x) + h.phase), 0);
  const slope = (x: number) =>
    harmonics.reduce(
      (d, h) => d + h.amplitude * h.cycles * ((2 * Math.PI) / PERIOD) * Math.cos(h.cycles * turn(x) + h.phase),
      0
    );

  const step = PERIOD / SEGMENTS_PER_PERIOD;
  const samples = Array.from({ length: SEGMENTS_PER_PERIOD * 8 }, (_, i) => raw((i * PERIOD) / (SEGMENTS_PER_PERIOD * 8)));
  const [min, max] = [Math.min(...samples), Math.max(...samples)];
  const scale = (bottom - top) / (max - min);
  // Larger raw values are crests, so they map to smaller y.
  const y = (x: number) => top + (max - raw(x)) * scale;
  const dy = (x: number) => -slope(x) * scale;
  const f = (n: number) => Number(n.toFixed(2));

  let d = `M0 ${HEIGHT} L0 ${f(y(0))}`;
  for (let i = 0; i < SEGMENTS_PER_PERIOD * 2; i++) {
    // Cubic Bézier from the curve's own tangents (Hermite form): smooth joins.
    const x0 = i * step;
    const x1 = x0 + step;
    d += ` C${f(x0 + step / 3)} ${f(y(x0) + (dy(x0) * step) / 3)} ${f(x1 - step / 3)} ${f(y(x1) - (dy(x1) * step) / 3)} ${f(x1)} ${f(y(x1))}`;
  }
  return `${d} L${PERIOD * 2} ${HEIGHT} Z`;
}

export interface FooterWaves {
  viewBox: string;
  /** One period in user units: the distance each layer drifts per loop. */
  period: number;
  /** Back to front; the last is the opaque layer that joins the footer body. */
  layers: readonly string[];
}

export const footerWaves: FooterWaves = {
  viewBox: `0 0 ${PERIOD} ${HEIGHT}`,
  period: PERIOD,
  layers: LAYERS.map(wavePath),
};
