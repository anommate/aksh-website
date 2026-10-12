// Generates the five "The AKSH Experience" journey illustrations.
//
// Original artwork authored for AKSH (no third-party assets). Each icon is
// defined once below and written twice into public/animations/experience/:
// - NN-name.json: a Lottie (Bodymovin 5.x) animation, played by
//   src/components/experience/journey-illustration.tsx: the "reveal" marker
//   once, then the "loop" marker repeated while the step is in view;
// - NN-name.svg: a static SVG of the settled illustration (the end of the
//   reveal, which is also the start and end of the loop), used for initial
//   loading, reduced motion, failed loading and no JavaScript.
//
// Run: node scripts/generate-experience-animations.mjs
//
// Style: 160x160 canvas, transparent background, 4-unit round-capped strokes
// in Soft Charcoal, Warm Stone fills, small Signal Red accents, Brand Ivory
// fills only where one shape must cover another. 30fps. Reveal: frames 0–66
// (2.2s); every element has settled by frame 66. Loop: frames 66–186 (4s) of
// small idle pulses that start and end at rest, so the loop joins seamlessly
// and every symbol stays in place and visible throughout.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "animations", "experience");
const SIZE = 160;
const FPS = 30;
const REVEAL_FRAMES = 66;
const LOOP_FRAMES = 120;
const FRAMES = REVEAL_FRAMES + LOOP_FRAMES;
const STROKE = 4;

const COLORS = {
  charcoal: "#282826",
  stone: "#E4DED3",
  red: "#FF0000",
  ivory: "#F9F8F4",
};

// ---------------------------------------------------------------- geometry

const rect = (x, y, w, h, r) => ({ kind: "rect", x, y, w, h, r });
const dot = (cx, cy, r) => ({ kind: "ellipse", cx, cy, rx: r, ry: r });
// Points are [x, y] or [x, y, inX, inY, outX, outY] (tangents relative to the point).
const path = (points, closed = false) => ({
  kind: "path",
  closed,
  points: points.map(([x, y, ix = 0, iy = 0, ox = 0, oy = 0]) => ({ x, y, ix, iy, ox, oy })),
});
const line = (x1, y1, x2, y2) => path([[x1, y1], [x2, y2]]);

function centre(shape) {
  if (shape.kind === "rect") return [shape.x + shape.w / 2, shape.y + shape.h / 2];
  if (shape.kind === "ellipse") return [shape.cx, shape.cy];
  const xs = shape.points.map((p) => p.x);
  const ys = shape.points.map((p) => p.y);
  return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
}

// An element is one shape with a style, an entrance and an idle motion:
// - draw: [from, to] frames over which the stroke draws on (trim path);
// - appear: { from, to, scale?, dy?, scaleY?, origin?, fade? } fades/scales/moves in;
// - idle: pulses during the loop, [{ at, len, dy?, scale?, rotate?, opacity? }]:
//   from loop frame `at` the element eases to the given offset by half of
//   `len` and back to rest by its end;
// - origin: [x, y] for scaling and rotation (else appear.origin, else centre);
// - fill and stroke are colour names.
const el = (shape, options) => ({ shape, ...options });
const withIdle = (idle, elements) => elements.map((element) => ({ ...element, idle }));

// A gentle rise and settle, used for message bubbles and the document.
const bob = (at, len, dy = -3) => [{ at, len, dy }];

// ------------------------------------------------------------------- icons

const ICONS = [
  {
    file: "01-book-consultation",
    name: "Calendar with an enquiry message",
    elements: [
      el(rect(26, 38, 96, 86, 12), { stroke: "charcoal", draw: [0, 26] }),
      el(line(26, 60, 122, 60), { stroke: "charcoal", draw: [12, 30] }),
      el(line(52, 28, 52, 46), { stroke: "charcoal", draw: [16, 28] }),
      el(line(96, 28, 96, 46), { stroke: "charcoal", draw: [19, 31] }),
      ...[
        [40, 72], [62, 72], [84, 72],
        [40, 92], [62, 92],
      ].map(([x, y], i) =>
        el(rect(x, y, 14, 11, 3), { fill: "stone", appear: { from: 24 + 3 * i, to: 34 + 3 * i, scale: 70 } })
      ),
      // Enquiry message: bubble, tail (ivory fill hides the edge behind it), dots.
      el(rect(86, 88, 50, 36, 12), { fill: "ivory", stroke: "charcoal", appear: { from: 38, to: 54, scale: 80 } }),
      el(path([[97, 121], [111, 121], [92, 136]], true), { fill: "ivory", appear: { from: 38, to: 54, scale: 80, origin: [111, 106] } }),
      el(path([[98, 124], [92, 136], [110, 124]]), { stroke: "charcoal", appear: { from: 38, to: 54, scale: 80, origin: [111, 106] } }),
      // Typing dots: two staggered waves per loop.
      ...[101, 111, 121].map((x, i) =>
        el(dot(x, 106, 3), {
          fill: "red",
          appear: { from: 50 + 4 * i, to: 58 + 4 * i, scale: 40 },
          idle: [0, 60].map((at) => ({ at: at + 8 * i, len: 28, dy: -3, scale: 125 })),
        })
      ),
    ],
  },
  {
    file: "02-personalised-consultation",
    name: "Two conversation bubbles",
    elements: [
      // The bubbles take turns: the reply rises, then the first message.
      ...withIdle(bob(60, 60), [
        el(rect(22, 30, 82, 56, 16), { stroke: "charcoal", draw: [0, 26] }),
        el(path([[36, 83], [50, 83], [32, 100]], true), { fill: "ivory", appear: { from: 16, to: 26 } }),
        el(path([[38, 86], [32, 100], [50, 86]]), { stroke: "charcoal", draw: [16, 28] }),
        el(rect(36, 47, 50, 7, 3.5), { fill: "stone", appear: { from: 22, to: 34 } }),
        el(rect(36, 61, 34, 7, 3.5), { fill: "stone", appear: { from: 26, to: 38 } }),
      ]),
      ...withIdle(bob(0, 60), [
        el(rect(58, 68, 82, 54, 16), { fill: "ivory", stroke: "charcoal", appear: { from: 28, to: 48, scale: 90, dy: 6 } }),
        el(path([[110, 119], [124, 119], [130, 136]], true), { fill: "ivory", appear: { from: 28, to: 48, scale: 90, dy: 6, origin: [99, 95] } }),
        el(path([[110, 122], [130, 136], [124, 122]]), { stroke: "charcoal", appear: { from: 28, to: 48, scale: 90, dy: 6, origin: [99, 95] } }),
      ]),
      el(dot(78, 95, 3.5), {
        fill: "red",
        appear: { from: 44, to: 54, scale: 40 },
        idle: [...bob(0, 60), { at: 14, len: 32, scale: 130 }],
      }),
      el(rect(88, 91, 36, 8, 4), { fill: "stone", appear: { from: 48, to: 60 }, idle: bob(0, 60) }),
    ],
  },
  {
    file: "03-wellness-docket",
    name: "A folder opening to reveal a document",
    elements: [
      // Folder back with its tab.
      el(path([[24, 46], [58, 46], [66, 56], [136, 56], [136, 124], [24, 124]], true), {
        fill: "stone",
        appear: { from: 8, to: 22 },
      }),
      el(path([[24, 46], [58, 46], [66, 56], [136, 56], [136, 124], [24, 124]], true), { stroke: "charcoal", draw: [0, 26] }),
      // Document rises out of the folder, then lifts a little and settles.
      ...withIdle(bob(0, 70, -4), [
        el(rect(46, 28, 68, 74, 6), { fill: "ivory", stroke: "charcoal", appear: { from: 18, to: 48, dy: 22, fade: false } }),
        el(rect(56, 40, 44, 6, 3), { fill: "stone", appear: { from: 18, to: 48, dy: 22, fade: false } }),
        el(rect(56, 52, 48, 6, 3), { fill: "stone", appear: { from: 18, to: 48, dy: 22, fade: false } }),
        el(path([[58, 68], [65, 75], [80, 60]]), { stroke: "red", draw: [50, 62] }),
      ]),
      // Folder front: lowers from closed (taller) to open.
      el(path([[22, 80], [138, 80], [136, 124], [24, 124]], true), {
        fill: "ivory",
        appear: { from: 12, to: 40, scaleY: 125, origin: [80, 124], fade: false },
      }),
      el(path([[22, 80], [138, 80], [136, 124], [24, 124]], true), {
        stroke: "charcoal",
        draw: [6, 30],
        appear: { from: 12, to: 40, scaleY: 125, origin: [80, 124], fade: false },
      }),
    ],
  },
  {
    file: "04-experience-aksh",
    name: "A calm wellness leaf with a restrained radiating accent",
    elements: [
      // The leaf sways a few degrees each way from the foot of its stem.
      ...withIdle(
        [
          { at: 0, len: 60, rotate: -3 },
          { at: 60, len: 60, rotate: 3 },
        ],
        [
          el(
            path(
              [
                [50, 116, -1.3, -45.2, 44.7, -6.6],
                [112, 42, 4.4, 41.5, -41.6, 2.9],
              ],
              true
            ),
            { fill: "stone", appear: { from: 18, to: 36 } }
          ),
          el(
            path(
              [
                [50, 116, -1.3, -45.2, 44.7, -6.6],
                [112, 42, 4.4, 41.5, -41.6, 2.9],
              ],
              true
            ),
            { stroke: "charcoal", draw: [0, 34] }
          ),
          el(line(50, 116, 38, 130), { stroke: "charcoal", draw: [26, 36] }),
          el(path([[56, 108, 0, 0, 14, -12], [104, 52, -8, 20, 0, 0]]), { stroke: "charcoal", draw: [28, 46] }),
        ].map((element) => ({ ...element, origin: [38, 130] }))
      ),
      // The rays shimmer in turn, twice per loop, without disappearing.
      ...[
        [line(124, 26, 127, 16), [46, 56]],
        [line(132, 34, 141, 30), [50, 60]],
        [line(131, 45, 140, 48), [54, 64]],
      ].map(([shape, draw], i) =>
        el(shape, {
          stroke: "red",
          draw,
          idle: [4, 64].map((at) => ({ at: at + 6 * i, len: 36, opacity: 35 })),
        })
      ),
    ],
  },
  {
    file: "05-continued-care",
    name: "A headset with a supportive conversation bubble",
    elements: [
      el(path([[38, 92, 0, 0, 0, -30], [80, 40, -24, 0, 24, 0], [122, 92, 0, -30, 0, 0]]), { stroke: "charcoal", draw: [0, 26] }),
      el(rect(28, 86, 22, 36, 9), { fill: "stone", stroke: "charcoal", appear: { from: 14, to: 30, scale: 70 } }),
      el(rect(110, 86, 22, 36, 9), { fill: "stone", stroke: "charcoal", appear: { from: 17, to: 33, scale: 70 } }),
      el(path([[39, 122, 0, 0, 0, 12], [69, 138, -18, 0, 0, 0]]), { stroke: "charcoal", draw: [28, 42] }),
      // Microphone dot: one soft pulse after the bubble settles.
      el(dot(74, 138, 4.5), { fill: "red", appear: { from: 40, to: 48, scale: 0 }, idle: [{ at: 64, len: 40, scale: 135 }] }),
      // Support bubble: rises and settles, its dot pulsing.
      ...withIdle(bob(0, 60), [
        el(rect(98, 18, 44, 30, 10), { fill: "ivory", stroke: "charcoal", appear: { from: 44, to: 58, scale: 80 } }),
        el(path([[103, 45], [115, 45], [100, 58]], true), { fill: "ivory", appear: { from: 44, to: 58, scale: 80, origin: [120, 33] } }),
        el(path([[106, 48], [100, 58], [114, 48]]), { stroke: "charcoal", appear: { from: 44, to: 58, scale: 80, origin: [120, 33] } }),
      ]),
      el(dot(110, 33, 3), {
        fill: "red",
        appear: { from: 54, to: 62, scale: 40 },
        idle: [...bob(0, 60), { at: 14, len: 32, scale: 130 }],
      }),
      el(rect(117, 30, 16, 6, 3), { fill: "stone", appear: { from: 56, to: 66 }, idle: bob(0, 60) }),
    ],
  },
];

// ------------------------------------------------------------------ lottie

const rgba = (name) => {
  const hex = COLORS[name].slice(1);
  return [0, 2, 4].map((i) => Math.round((parseInt(hex.slice(i, i + 2), 16) / 255) * 10000) / 10000).concat(1);
};
const still = (k) => ({ a: 0, k });
const arr = (v) => (Array.isArray(v) ? v : [v]);
// Reveal moves ease out; loop moves ease in and out, so each starts and ends
// at rest and the loop joins without a jump.
const EASE_OUT = { o: 0.33, i: 0.2 };
const EASE_IN_OUT = { o: 0.42, i: 0.58 };
const easing = ({ o, i }, n) => ({
  o: { x: Array(n).fill(o), y: Array(n).fill(0) },
  i: { x: Array(n).fill(i), y: Array(n).fill(1) },
});

// One animated property. It holds the value between moves
// ({ from, to, a, b, ease }), which must not overlap and must join up.
function animated(rest, moves) {
  if (!moves.length) return still(rest);
  const n = arr(rest).length;
  const keyframes = [];
  for (const move of [...moves].sort((p, q) => p.from - q.from)) {
    const last = keyframes.at(-1);
    if (last && (last.t > move.from || JSON.stringify(last.s) !== JSON.stringify(arr(move.a)))) {
      throw new Error(`Moves overlap or do not join at frame ${move.from}`);
    }
    if (last && last.t === move.from) Object.assign(last, easing(move.ease, n));
    else {
      if (last) Object.assign(last, easing(EASE_IN_OUT, n)); // hold until this move
      keyframes.push({ t: move.from, s: arr(move.a), ...easing(move.ease, n) });
    }
    keyframes.push({ t: move.to, s: arr(move.b) });
  }
  return { a: 1, k: keyframes };
}

// Gentle ease-out between two values; the first value holds before `from`.
const tween = (from, to, a, b) => animated(b, [{ from, to, a, b, ease: EASE_OUT }]);

function lottieShape(shape) {
  if (shape.kind === "rect") {
    const [cx, cy] = centre(shape);
    return { ty: "rc", nm: "rect", d: 1, p: still([cx, cy]), s: still([shape.w, shape.h]), r: still(shape.r) };
  }
  if (shape.kind === "ellipse") {
    return { ty: "el", nm: "ellipse", d: 1, p: still([shape.cx, shape.cy]), s: still([shape.rx * 2, shape.ry * 2]) };
  }
  return {
    ty: "sh",
    nm: "path",
    ks: still({
      i: shape.points.map((p) => [p.ix, p.iy]),
      o: shape.points.map((p) => [p.ox, p.oy]),
      v: shape.points.map((p) => [p.x, p.y]),
      c: shape.closed,
    }),
  };
}

function groupTransform(element) {
  const { appear, idle = [], draw } = element;
  const [ox, oy] = element.origin ?? appear?.origin ?? centre(element.shape);
  const rest = { p: [ox, oy], s: [100, 100], r: 0, o: 100 };
  const moves = { p: [], s: [], r: [], o: [] };

  if ((appear && appear.to > REVEAL_FRAMES) || (draw && draw[1] > REVEAL_FRAMES)) {
    throw new Error(`${element.shape.kind}: the reveal must settle by frame ${REVEAL_FRAMES}`);
  }
  if (appear) {
    const reveal = (key, a) => moves[key].push({ from: appear.from, to: appear.to, a, b: rest[key], ease: EASE_OUT });
    if (appear.dy) reveal("p", [ox, oy + appear.dy]);
    if (appear.scale !== undefined) reveal("s", [appear.scale, appear.scale]);
    if (appear.scaleY !== undefined) reveal("s", [100, appear.scaleY]);
    if (appear.fade !== false) reveal("o", 0);
  }
  for (const pulse of idle) {
    if (pulse.at < 0 || pulse.at + pulse.len > LOOP_FRAMES) {
      throw new Error(`Idle pulse at ${pulse.at} (+${pulse.len}) leaves the ${LOOP_FRAMES}-frame loop`);
    }
    const from = REVEAL_FRAMES + pulse.at;
    const mid = from + pulse.len / 2;
    const to = from + pulse.len;
    const there = (key, peak) =>
      moves[key].push(
        { from, to: mid, a: rest[key], b: peak, ease: EASE_IN_OUT },
        { from: mid, to, a: peak, b: rest[key], ease: EASE_IN_OUT }
      );
    if (pulse.dy) there("p", [ox, oy + pulse.dy]);
    if (pulse.scale !== undefined) there("s", [pulse.scale, pulse.scale]);
    if (pulse.rotate) there("r", pulse.rotate);
    if (pulse.opacity !== undefined) there("o", pulse.opacity);
  }

  return {
    ty: "tr",
    nm: "Transform",
    a: still([ox, oy]),
    p: animated(rest.p, moves.p),
    s: animated(rest.s, moves.s),
    r: animated(rest.r, moves.r),
    o: animated(rest.o, moves.o),
    sk: still(0),
    sa: still(0),
  };
}

function lottieGroups(element, index) {
  // A drawn-on stroke gets its own group so the trim never cuts the fill.
  const groups = [];
  const base = (items, suffix) => ({ ty: "gr", nm: `${index + 1}-${suffix}`, it: [...items, groupTransform(element)] });
  if (element.fill) {
    groups.push(base([lottieShape(element.shape), { ty: "fl", nm: "fill", c: still(rgba(element.fill)), o: still(100), r: 1, bm: 0 }], "fill"));
  }
  if (element.stroke) {
    const items = [lottieShape(element.shape)];
    if (element.draw) {
      items.push({ ty: "tm", nm: "draw", s: still(0), e: tween(element.draw[0], element.draw[1], 0, 100), o: still(0), m: 1 });
    }
    items.push({ ty: "st", nm: "stroke", c: still(rgba(element.stroke)), o: still(100), w: still(STROKE), lc: 2, lj: 2, ml: 4, bm: 0 });
    groups.push(base(items, "stroke"));
  }
  // Within an element the stroke sits above its fill.
  return groups.reverse();
}

function lottie(icon) {
  // Lottie lists shapes front to back; the icon definitions are back to front.
  const shapes = icon.elements.flatMap(lottieGroups).reverse();
  return {
    v: "5.7.4",
    fr: FPS,
    ip: 0,
    op: FRAMES,
    w: SIZE,
    h: SIZE,
    nm: icon.name,
    ddd: 0,
    assets: [],
    markers: [
      { tm: 0, cm: "reveal", dr: REVEAL_FRAMES },
      { tm: REVEAL_FRAMES, cm: "loop", dr: LOOP_FRAMES },
    ],
    meta: {
      g: "scripts/generate-experience-animations.mjs",
      a: "AKSH (original artwork)",
      d: `${icon.name}. Original illustration for The AKSH Experience homepage section.`,
    },
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: icon.name,
        sr: 1,
        ks: { o: still(100), r: still(0), p: still([0, 0, 0]), a: still([0, 0, 0]), s: still([100, 100, 100]) },
        ao: 0,
        shapes,
        ip: 0,
        op: FRAMES,
        st: 0,
        bm: 0,
      },
    ],
  };
}

// --------------------------------------------------------------------- svg

const n = (v) => Math.round(v * 100) / 100;

function svgShape(shape) {
  if (shape.kind === "rect") {
    return `<rect x="${n(shape.x)}" y="${n(shape.y)}" width="${n(shape.w)}" height="${n(shape.h)}" rx="${n(shape.r)}"`;
  }
  if (shape.kind === "ellipse") {
    return `<ellipse cx="${n(shape.cx)}" cy="${n(shape.cy)}" rx="${n(shape.rx)}" ry="${n(shape.ry)}"`;
  }
  const p = shape.points;
  let d = `M${n(p[0].x)} ${n(p[0].y)}`;
  const segment = (a, b) =>
    a.ox === 0 && a.oy === 0 && b.ix === 0 && b.iy === 0
      ? ` L${n(b.x)} ${n(b.y)}`
      : ` C${n(a.x + a.ox)} ${n(a.y + a.oy)} ${n(b.x + b.ix)} ${n(b.y + b.iy)} ${n(b.x)} ${n(b.y)}`;
  for (let i = 1; i < p.length; i++) d += segment(p[i - 1], p[i]);
  if (shape.closed) d += `${segment(p[p.length - 1], p[0])} Z`;
  return `<path d="${d}"`;
}

function svg(icon) {
  // The settled frame: every element fully drawn and at rest.
  const body = icon.elements
    .map((element) => {
      const fill = element.fill ? COLORS[element.fill] : "none";
      const stroke = element.stroke
        ? ` stroke="${COLORS[element.stroke]}" stroke-width="${STROKE}" stroke-linecap="round" stroke-linejoin="round"`
        : "";
      return `  ${svgShape(element.shape)} fill="${fill}"${stroke}/>`;
    })
    .join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}" aria-hidden="true" focusable="false">
  <!-- ${icon.name}. Original AKSH artwork; settled frame (end of the reveal) of ${icon.file}.json. -->
${body}
</svg>
`;
}

mkdirSync(OUT, { recursive: true });
for (const icon of ICONS) {
  writeFileSync(join(OUT, `${icon.file}.json`), `${JSON.stringify(lottie(icon))}\n`);
  writeFileSync(join(OUT, `${icon.file}.svg`), svg(icon));
}
console.log(`Wrote ${ICONS.length} animations and static SVGs to ${OUT}`);
