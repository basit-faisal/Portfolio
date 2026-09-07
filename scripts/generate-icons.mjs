/**
 * Dev-only: generates the favicon / PWA / Apple touch icons.
 *
 *   node scripts/generate-icons.mjs
 *
 * The artwork is a beige CRT on the Win95 teal desktop, drawn from primitives
 * at whatever size is asked for so every icon stays crisp instead of being
 * resampled from one bitmap. Run this after changing the palette.
 */
import { writeFileSync } from 'node:fs';
import { createCanvas } from '@napi-rs/canvas';

const OUT = 'public';

const TEAL = '#008080';
const BEIGE = '#c8bda0';
const BEIGE_DARK = '#8e846c';
const SCREEN = '#10303a';
const PHOSPHOR = '#7CFFB0';
const BLACK = '#000000';

/**
 * Draws the CRT badge into a square canvas of the given size.
 * All geometry is expressed in fractions of `size` so it scales cleanly.
 */
const drawIcon = (ctx, size, { background = true } = {}) => {
  const u = size / 32; // design grid is 32x32
  const px = (n) => Math.round(n * u);

  if (background) {
    ctx.fillStyle = TEAL;
    ctx.fillRect(0, 0, size, size);
  }

  // Monitor body.
  ctx.fillStyle = BEIGE;
  ctx.fillRect(px(3), px(5), px(26), px(19));
  ctx.fillStyle = BLACK;
  ctx.lineWidth = Math.max(1, px(1));
  ctx.strokeStyle = BLACK;
  ctx.strokeRect(px(3), px(5), px(26), px(19));

  // Glass.
  ctx.fillStyle = SCREEN;
  ctx.fillRect(px(6), px(8), px(20), px(13));

  // A couple of phosphor scanlines, enough to read as a CRT at 32px.
  ctx.fillStyle = PHOSPHOR;
  ctx.fillRect(px(8), px(11), px(11), px(2));
  ctx.fillRect(px(8), px(15), px(15), px(2));

  // Stand and base.
  ctx.fillStyle = BEIGE_DARK;
  ctx.fillRect(px(13), px(24), px(6), px(3));
  ctx.fillStyle = BEIGE;
  ctx.fillRect(px(9), px(27), px(14), px(3));
  ctx.strokeRect(px(9), px(27), px(14), px(3));
};

const renderPng = (size, options) => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  drawIcon(ctx, size, options);
  return canvas.toBuffer('image/png');
};

/**
 * Maskable variant: Android crops icons to arbitrary shapes, so the badge is
 * inset to sit inside the 80% safe zone with teal bleeding to the edges.
 */
const renderMaskablePng = (size) => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = TEAL;
  ctx.fillRect(0, 0, size, size);

  const inner = Math.round(size * 0.62);
  const badge = createCanvas(inner, inner);
  drawIcon(badge.getContext('2d'), inner, { background: false });

  const offset = Math.round((size - inner) / 2);
  ctx.drawImage(badge, offset, offset);
  return canvas.toBuffer('image/png');
};

// --- PNG icons ---

const pngs = [
  ['pwa-192x192.png', 192],
  ['pwa-512x512.png', 512],
  ['apple-touch-icon.png', 180],
  ['favicon-32x32.png', 32]
];

for (const [name, size] of pngs) {
  writeFileSync(`${OUT}/${name}`, renderPng(size));
  console.log(`wrote ${OUT}/${name} (${size}x${size})`);
}

writeFileSync(`${OUT}/pwa-512x512-maskable.png`, renderMaskablePng(512));
console.log(`wrote ${OUT}/pwa-512x512-maskable.png (512x512, maskable)`);

// --- favicon.ico ---

/**
 * Minimal single-image .ico wrapping a PNG payload, which every current
 * browser accepts. Avoids pulling in an image toolchain just for this.
 */
const buildIco = (pngBuffer, size) => {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // image count

  const entry = Buffer.alloc(16);
  entry[0] = size >= 256 ? 0 : size; // width  (0 means 256)
  entry[1] = size >= 256 ? 0 : size; // height
  entry[2] = 0; // palette size
  entry[3] = 0; // reserved
  entry.writeUInt16LE(1, 4); // colour planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(pngBuffer.length, 8);
  entry.writeUInt32LE(header.length + entry.length, 12); // payload offset

  return Buffer.concat([header, entry, pngBuffer]);
};

const icoSize = 32;
writeFileSync(`${OUT}/favicon.ico`, buildIco(renderPng(icoSize), icoSize));
console.log(`wrote ${OUT}/favicon.ico (${icoSize}x${icoSize})`);

// --- mask-icon.svg ---

/**
 * Safari pinned-tab icons are a single-colour silhouette, so this is a
 * flattened outline rather than the full badge.
 */
const maskIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <path d="M3 5h26v19H3V5zm3 3v13h20V8H6zm7 16h6v3h-6v-3zm-4 3h14v3H9v-3z"/>
</svg>
`;

writeFileSync(`${OUT}/mask-icon.svg`, maskIcon);
console.log(`wrote ${OUT}/mask-icon.svg`);

// --- preview sheet ---

const preview = createCanvas(192 + 180 + 32 + 48, 192);
const previewCtx = preview.getContext('2d');
previewCtx.fillStyle = '#101018';
previewCtx.fillRect(0, 0, preview.width, preview.height);

let x = 0;
for (const size of [192, 180, 32]) {
  const canvas = createCanvas(size, size);
  drawIcon(canvas.getContext('2d'), size);
  previewCtx.drawImage(canvas, x, 0);
  x += size + 24;
}

writeFileSync('.model-candidates/icon-preview.png', preview.toBuffer('image/png'));
console.log('\nwrote .model-candidates/icon-preview.png (192, 180, 32)');
