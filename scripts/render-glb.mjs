/**
 * Dev-only: software-rasterises a .glb to a PNG contact sheet of four angles,
 * so model geometry can be checked without booting a WebGL context.
 *
 *   node scripts/render-glb.mjs model.glb --out preview.png --highlight Screen
 *
 * --highlight paints every triangle using the named material magenta, which is
 * how we confirm which surface is actually the screen.
 */
import { writeFileSync } from 'node:fs';
import { basename } from 'node:path';
import { encodePng } from './lib/png.mjs';
import { parseGlb, collectTriangles } from './lib/glb.mjs';
import { renderView, blit } from './lib/raster.mjs';

const TILE = 320;
const VIEWS = [
  { name: 'front', dir: [0, 0.12, 1] },
  { name: 'three-quarter', dir: [0.85, 0.45, 1] },
  { name: 'side', dir: [1, 0.15, 0.08] },
  { name: 'back', dir: [0, 0.12, -1] }
];

const args = process.argv.slice(2);
const file = args[0];
if (!file) {
  console.error('usage: node scripts/render-glb.mjs <model.glb> [--out f.png] [--highlight Mat] [--skip Node]');
  process.exit(1);
}
const flag = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? null : args[i + 1];
};

const highlight = flag('--highlight');
const skipNodes = (flag('--skip') ?? '').split(',').filter(Boolean);
const out = flag('--out') ?? `${basename(file, '.glb')}-preview.png`;

const glb = parseGlb(file);
const { triangles, bounds } = collectTriangles(glb, { skipNodes });

const size = bounds.max.map((v, i) => +(v - bounds.min[i]).toFixed(4));
console.log(`${file}: ${triangles.length} triangles, world size = [${size.join(', ')}]`);
if (highlight) {
  const count = triangles.filter((t) => t.material === highlight).length;
  console.log(`  highlighting material "${highlight}": ${count} triangles (magenta)`);
}

const sheetWidth = TILE * 2;
const sheet = Buffer.alloc(sheetWidth * TILE * 2 * 4);

VIEWS.forEach((viewSpec, i) => {
  const tile = renderView(triangles, bounds, viewSpec.dir, { size: TILE, highlight });
  blit(tile, TILE, sheet, sheetWidth, (i % 2) * TILE, Math.floor(i / 2) * TILE);
});

writeFileSync(out, encodePng(sheet, sheetWidth, TILE * 2));
console.log(`  wrote ${out} (clockwise from top-left: ${VIEWS.map((v) => v.name).join(', ')})`);
