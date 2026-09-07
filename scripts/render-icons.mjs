/**
 * Dev-only preview: rasterises the pixel icons into a PNG contact sheet so the
 * artwork can be eyeballed without booting the app.
 *
 *   node scripts/render-icons.mjs
 */
import { deflateSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SCALE = 7;
const CELL = 16 * SCALE;
const PAD = 8;
const COLS = 4;

// Bundle the TS icon data to plain ESM so this script can import it.
const outDir = mkdtempSync(join(tmpdir(), 'pixel-icons-'));
const bundlePath = join(outDir, 'icons.mjs');
execFileSync(
  'npx',
  ['esbuild', 'src/retro/pixelIconData.ts', '--bundle', '--format=esm', `--outfile=${bundlePath}`],
  { stdio: 'pipe' }
);
const { ICONS } = await import(bundlePath);

const names = Object.keys(ICONS);
const rows = Math.ceil(names.length / COLS);
const width = COLS * CELL + (COLS + 1) * PAD;
const height = rows * CELL + (rows + 1) * PAD;

// RGBA canvas, prefilled with Win95 face grey.
const canvas = Buffer.alloc(width * height * 4);
for (let i = 0; i < width * height; i++) {
  canvas.writeUInt32BE(0xc0c0c0ff, i * 4);
}

const hexToRgb = (hex) => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16)
];

const fillRect = (px, py, w, h, hex) => {
  const [r, g, b] = hexToRgb(hex);
  for (let y = py; y < py + h; y++) {
    if (y < 0 || y >= height) continue;
    for (let x = px; x < px + w; x++) {
      if (x < 0 || x >= width) continue;
      const offset = (y * width + x) * 4;
      canvas[offset] = r;
      canvas[offset + 1] = g;
      canvas[offset + 2] = b;
      canvas[offset + 3] = 255;
    }
  }
};

names.forEach((name, index) => {
  const col = index % COLS;
  const row = Math.floor(index / COLS);
  const originX = PAD + col * (CELL + PAD);
  const originY = PAD + row * (CELL + PAD);

  // White cell so icon edges read clearly, like an icon editor canvas.
  fillRect(originX, originY, CELL, CELL, '#ffffff');

  for (const [x, y, w, h, fill] of ICONS[name]) {
    fillRect(originX + x * SCALE, originY + y * SCALE, w * SCALE, h * SCALE, fill);
  }
});

// Minimal PNG encoder (truecolour + alpha, no interlacing).
const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const byte of buf) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

const chunk = (type, data) => {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
};

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(width, 0);
ihdr.writeUInt32BE(height, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 6; // colour type RGBA

// Each scanline needs a leading filter byte.
const raw = Buffer.alloc(height * (width * 4 + 1));
for (let y = 0; y < height; y++) {
  const src = y * width * 4;
  const dest = y * (width * 4 + 1);
  raw[dest] = 0;
  canvas.copy(raw, dest + 1, src, src + width * 4);
}

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0))
]);

const target = 'icon-preview.png';
writeFileSync(target, png);
console.log(`Wrote ${target} (${width}x${height}) with ${names.length} icons:`);
names.forEach((name, i) => console.log(`  r${Math.floor(i / COLS) + 1}c${(i % COLS) + 1}  ${name}`));
