/**
 * Dev-only: downloads poly.pizza models by id and renders a single comparison
 * sheet (one three-quarter view per model) to shortlist a CRT candidate.
 *
 *   node scripts/compare-models.mjs
 *
 * Prints an index so each tile in the sheet can be mapped back to a model.
 */
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { encodePng } from './lib/png.mjs';
import { parseGlb, collectTriangles } from './lib/glb.mjs';
import { renderView, blit } from './lib/raster.mjs';

const DIR = '.model-candidates';
const TILE = 300;
const COLUMNS = 4;

const CANDIDATES = [
  { id: 'aSmz6H8aeu', name: 'kenney-tv-vintage', label: 'Television Vintage / Kenney', licence: 'CC0' },
  { id: '9trLeWoBek', name: 'kenney-television', label: 'Television / Kenney', licence: 'CC0' },
  { id: 'PvSjEbz11k', name: 'creativetrio-monitor', label: 'Monitor / CreativeTrio', licence: 'CC0' },
  { id: '7KNoiQlSxi', name: 'creativetrio-computer', label: 'Computer / CreativeTrio', licence: 'CC0' },
  { id: 'or4LLmesjq', name: 'quaternius-computer-lg', label: 'Computer Large / Quaternius', licence: 'CC0' },
  { id: 'M9Lpzbr0bA', name: 'armory-monitor', label: 'Monitor / Armory_3D', licence: 'CC0' },
  { id: 'vsqTUPFSw6', name: 'kenney-keyboard', label: 'Keyboard / Kenney', licence: 'CC0' },
  { id: '8jVB0zIXKCv', name: 'jarlan-crt-monitor', label: 'CRT Monitor / Jarlan Perez', licence: 'CC-BY' },
  { id: 'Bw55oYsbp8', name: 'charlie-computer-90s', label: 'Computer 90s / Charlie', licence: 'CC-BY' },
  { id: 'goeJLARWbs', name: 'charlie-macintosh', label: 'Macintosh Classic / Charlie', licence: 'CC-BY' },
  { id: '4Q4sEDTCk9X', name: 'google-desktop-computer', label: 'Desktop computer / Google', licence: 'CC-BY' },
  { id: '7uQP127OF7z', name: 'jeremy-pc', label: 'PC / jeremy', licence: 'CC-BY' },
  { id: 'doMMnviJrGi', name: 'schlyter-simple-computer', label: 'Simple computer / Schlyter', licence: 'CC-BY' },
  { id: '2EHvZLax4Y3', name: 'google-computer', label: 'Computer / Google', licence: 'CC-BY' }
];

if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true });

/** Scrapes the model page for its direct .glb url. */
const resolveGlbUrl = async (id) => {
  const html = await (await fetch(`https://poly.pizza/m/${id}`)).text();
  const match = html.match(/https:\/\/static\.poly\.pizza\/[a-z0-9-]+\.glb/i);
  return match?.[0] ?? null;
};

const tiles = [];

for (const candidate of CANDIDATES) {
  const path = `${DIR}/${candidate.name}.glb`;

  if (!existsSync(path)) {
    const url = await resolveGlbUrl(candidate.id);
    if (!url) {
      console.log(`SKIP ${candidate.label}: no glb url found`);
      continue;
    }
    const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
    writeFileSync(path, buf);
  }

  try {
    const { triangles, bounds } = collectTriangles(parseGlb(path));
    if (triangles.length === 0) {
      console.log(`SKIP ${candidate.label}: no triangles`);
      continue;
    }
    const dims = bounds.max.map((v, i) => +(v - bounds.min[i]).toFixed(2));
    tiles.push({
      candidate,
      pixels: renderView(triangles, bounds, [0.85, 0.4, 1], { size: TILE }),
      info: `${triangles.length} tris, size [${dims.join(', ')}]`
    });
  } catch (err) {
    console.log(`SKIP ${candidate.label}: ${err.message}`);
  }
}

const rows = Math.ceil(tiles.length / COLUMNS);
const sheetWidth = COLUMNS * TILE;
const sheetHeight = rows * TILE;
const sheet = Buffer.alloc(sheetWidth * sheetHeight * 4);

console.log(`\nsheet is ${COLUMNS} columns, left-to-right, top-to-bottom:\n`);
tiles.forEach((tile, i) => {
  blit(tile.pixels, TILE, sheet, sheetWidth, (i % COLUMNS) * TILE, Math.floor(i / COLUMNS) * TILE);
  const position = `r${Math.floor(i / COLUMNS) + 1}c${(i % COLUMNS) + 1}`;
  console.log(
    `  ${position}  ${tile.candidate.label.padEnd(34)} [${tile.candidate.licence.padEnd(5)}] ${tile.info}`
  );
});

const out = `${DIR}/comparison.png`;
writeFileSync(out, encodePng(sheet, sheetWidth, sheetHeight));
console.log(`\nwrote ${out}`);
