/**
 * Dev-only: checks that the curved screen overlay sits correctly inside the
 * model's bezel.
 *
 *   node scripts/verify-screen-fit.mjs
 *
 * Builds the real overlay geometry from src/three (not a reimplementation),
 * places it exactly as Computer.tsx does, and renders it against the model
 * with the overlay in magenta. Also reports how far the bulge protrudes past
 * the model's own screen plane, which is the number that decides whether the
 * glass reads as a tube or as a sticker floating off the front.
 */
import { writeFileSync, rmSync, mkdirSync, existsSync } from 'node:fs';
import esbuild from 'esbuild';
import { encodePng } from './lib/png.mjs';
import { parseGlb, collectTriangles } from './lib/glb.mjs';
import { renderView, blit } from './lib/raster.mjs';

const OUT_DIR = '.model-candidates';
const ENTRY = `${OUT_DIR}/screen-fit-entry.ts`;
const BUNDLE = `${OUT_DIR}/screen-fit.bundle.mjs`;
const TILE = 340;

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

writeFileSync(
  ENTRY,
  `export * from '../src/three/sceneConstants';
export { createCurvedScreenGeometry } from '../src/three/screenGeometry';
`
);

await esbuild.build({
  entryPoints: [ENTRY],
  outfile: BUNDLE,
  bundle: true,
  format: 'esm',
  platform: 'node',
  external: ['three'],
  // sceneConstants reads the Vite base for the model url, which has no
  // meaning in node; any value works since we load the file directly.
  define: { 'import.meta.env.BASE_URL': '"/"' },
  logLevel: 'error'
});

const {
  MODEL_SCALE,
  SCREEN_CENTER,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  SCREEN_NORMAL,
  SCREEN_OFFSET,
  SCREEN_TILT,
  SCREEN_BULGE,
  SCREEN_MATERIALS,
  createCurvedScreenGeometry
} = await import(`../${BUNDLE}`);

// --- build the overlay exactly as the component does ---

const geometry = createCurvedScreenGeometry(SCREEN_WIDTH, SCREEN_HEIGHT, SCREEN_BULGE);
const position = geometry.attributes.position;
const index = geometry.index;

const overlayOrigin = [
  SCREEN_CENTER[0] + SCREEN_NORMAL[0] * SCREEN_OFFSET,
  SCREEN_CENTER[1] + SCREEN_NORMAL[1] * SCREEN_OFFSET,
  SCREEN_CENTER[2] + SCREEN_NORMAL[2] * SCREEN_OFFSET
];

const cosTilt = Math.cos(SCREEN_TILT);
const sinTilt = Math.sin(SCREEN_TILT);

/** Rotate about X by the tilt, then translate into place. */
const placeVertex = (i) => {
  const x = position.getX(i);
  const y = position.getY(i);
  const z = position.getZ(i);
  return [
    x + overlayOrigin[0],
    y * cosTilt - z * sinTilt + overlayOrigin[1],
    y * sinTilt + z * cosTilt + overlayOrigin[2]
  ];
};

const overlayTriangles = [];
for (let i = 0; i < index.count; i += 3) {
  overlayTriangles.push({
    a: placeVertex(index.getX(i)),
    b: placeVertex(index.getX(i + 1)),
    c: placeVertex(index.getX(i + 2)),
    color: [1, 0, 0.6, 1],
    material: 'OVERLAY',
    node: 'overlay'
  });
}

// --- model triangles, scaled the way the scene scales them ---

const { triangles: rawModel } = collectTriangles(parseGlb('public/models/computer-90s.glb'));
const scaled = rawModel.map((tri) => ({
  ...tri,
  a: tri.a.map((v) => v * MODEL_SCALE),
  b: tri.b.map((v) => v * MODEL_SCALE),
  c: tri.c.map((v) => v * MODEL_SCALE)
}));

// The component hides these, so exclude them here too or the preview shows
// geometry that never actually renders.
const modelTriangles = scaled.filter((tri) => !SCREEN_MATERIALS.includes(tri.material));
const originalScreen = scaled.filter((tri) => tri.material === SCREEN_MATERIALS[0]);

// --- clearance report ---

/** Signed distance of a point from the model's own screen plane, along the normal. */
const distanceAlongNormal = (p) =>
  (p[0] - SCREEN_CENTER[0]) * SCREEN_NORMAL[0] +
  (p[1] - SCREEN_CENTER[1]) * SCREEN_NORMAL[1] +
  (p[2] - SCREEN_CENTER[2]) * SCREEN_NORMAL[2];

// Sanity check the plane itself: every vertex of the model's own screen quad
// should sit at distance ~0 from it. If not, SCREEN_CENTER / SCREEN_NORMAL /
// SCREEN_TILT disagree with the geometry and the overlay will be skewed.
let planeMin = Infinity;
let planeMax = -Infinity;
for (const tri of originalScreen) {
  for (const p of [tri.a, tri.b, tri.c]) {
    const d = distanceAlongNormal(p);
    if (d < planeMin) planeMin = d;
    if (d > planeMax) planeMax = d;
  }
}

let minProtrusion = Infinity;
let maxProtrusion = -Infinity;
for (const tri of overlayTriangles) {
  for (const p of [tri.a, tri.b, tri.c]) {
    const d = distanceAlongNormal(p);
    if (d < minProtrusion) minProtrusion = d;
    if (d > maxProtrusion) maxProtrusion = d;
  }
}

// How deep the bezel is: how far the case sticks out past the glass, measured
// only around the screen so the rest of the chassis does not skew it.
const halfW = SCREEN_WIDTH / 2;
const halfH = SCREEN_HEIGHT / 2;
let bezelFront = -Infinity;
for (const tri of modelTriangles) {
  for (const p of [tri.a, tri.b, tri.c]) {
    const dx = Math.abs(p[0] - SCREEN_CENTER[0]);
    const dy = Math.abs(p[1] - SCREEN_CENTER[1]);
    if (dx > halfW * 1.6 || dy > halfH * 1.6) continue;
    const d = distanceAlongNormal(p);
    if (d > bezelFront) bezelFront = d;
  }
}

const f = (n) => n.toFixed(4);

const planeError = Math.max(Math.abs(planeMin), Math.abs(planeMax));
console.log('plane check: model screen quad vs our assumed plane');
console.log(`  vertex distances : ${f(planeMin)} .. ${f(planeMax)}`);
console.log(
  planeError < 0.005
    ? '  OK - the assumed plane matches the model\'s glass.\n'
    : `  WARNING - off by up to ${f(planeError)}; the overlay is skewed relative to the glass.\n`
);

console.log('measured along the screen normal, 0 = the model\'s own glass plane\n');
console.log(`  overlay rim      : ${f(minProtrusion)}`);
console.log(`  overlay centre   : ${f(maxProtrusion)}  (offset ${f(SCREEN_OFFSET)} + bulge ${f(SCREEN_BULGE)})`);
console.log(`  bezel front face : ${f(bezelFront)}`);

const clearance = bezelFront - maxProtrusion;
console.log(`\n  clearance        : ${f(clearance)}`);
console.log(
  clearance > 0
    ? '  OK - the tube stays behind the bezel front.'
    : '  WARNING - the glass protrudes past the bezel and will look detached.'
);
console.log(`\n  screen size      : ${f(SCREEN_WIDTH)} x ${f(SCREEN_HEIGHT)} (aspect ${(SCREEN_WIDTH / SCREEN_HEIGHT).toFixed(3)})`);

// --- render, framed on the monitor rather than the whole desk ---

const bounds = {
  min: [SCREEN_CENTER[0] - halfW * 1.9, SCREEN_CENTER[1] - halfH * 1.9, SCREEN_CENTER[2] - halfW * 1.9],
  max: [SCREEN_CENTER[0] + halfW * 1.9, SCREEN_CENTER[1] + halfH * 1.9, SCREEN_CENTER[2] + halfW * 1.9]
};

const all = [...modelTriangles, ...overlayTriangles];
const VIEWS = [
  { name: 'head-on', dir: [0, 0.14, 1] },
  { name: 'three-quarter', dir: [0.7, 0.3, 1] },
  { name: 'steep angle', dir: [1.25, 0.2, 0.75] },
  { name: 'from below', dir: [0.25, -0.55, 1] }
];

const sheet = Buffer.alloc(TILE * 2 * TILE * 2 * 4);
VIEWS.forEach((view, i) => {
  const tile = renderView(all, bounds, view.dir, { size: TILE, highlight: 'OVERLAY' });
  blit(tile, TILE, sheet, TILE * 2, (i % 2) * TILE, Math.floor(i / 2) * TILE);
});

writeFileSync(`${OUT_DIR}/screen-fit.png`, encodePng(sheet, TILE * 2, TILE * 2));
console.log(`\nwrote ${OUT_DIR}/screen-fit.png (${VIEWS.map((v) => v.name).join(', ')})`);

rmSync(ENTRY, { force: true });
rmSync(BUNDLE, { force: true });
