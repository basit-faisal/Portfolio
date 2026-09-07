/**
 * Dev-only: renders what the CRT displays at several moments in time, plus an
 * overlay of the icon hit regions, so the screen content and its click targets
 * can be checked without booting the app.
 *
 *   node scripts/render-screen.mjs
 */
import { writeFileSync, rmSync } from 'node:fs';
import { createCanvas } from '@napi-rs/canvas';
import esbuild from 'esbuild';

const BUNDLE = '.model-candidates/bootScreen.bundle.mjs';

await esbuild.build({
  entryPoints: ['src/three/bootScreen.ts'],
  outfile: BUNDLE,
  bundle: true,
  format: 'esm',
  platform: 'node',
  logLevel: 'error'
});

const {
  drawScreenFrame,
  hitTestScreen,
  ICON_HIT_REGIONS,
  SCREEN_TEXTURE_WIDTH: W,
  SCREEN_TEXTURE_HEIGHT: H
} = await import(`../${BUNDLE}`);

/** Moments worth eyeballing: mid-POST, end of POST, the switch, and settled. */
const FRAMES = [
  { at: 1.2, label: 'POST (1.2s)', hovered: null },
  { at: 3.6, label: 'POST complete (3.6s)', hovered: null },
  { at: 4.25, label: 'switch flash (4.25s)', hovered: null },
  { at: 6.0, label: 'desktop, hovering Projects', hovered: 'projects' }
];

const SCALE = 0.5;
const tileWidth = Math.round(W * SCALE);
const tileHeight = Math.round(H * SCALE);

const sheet = createCanvas(tileWidth * 2, tileHeight * 2);
const sheetCtx = sheet.getContext('2d');
sheetCtx.fillStyle = '#101018';
sheetCtx.fillRect(0, 0, sheet.width, sheet.height);

FRAMES.forEach((frame, index) => {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  drawScreenFrame(ctx, frame.at, { hovered: frame.hovered });

  // Outline the click targets on the last tile to confirm they line up.
  if (index === FRAMES.length - 1) {
    ctx.strokeStyle = '#ff00aa';
    ctx.lineWidth = 3;
    for (const region of ICON_HIT_REGIONS) {
      ctx.strokeRect(region.x, region.y, region.width, region.height);
    }
  }

  sheetCtx.drawImage(
    canvas,
    (index % 2) * tileWidth,
    Math.floor(index / 2) * tileHeight,
    tileWidth,
    tileHeight
  );
});

writeFileSync('.model-candidates/screen-preview.png', sheet.toBuffer('image/png'));

console.log('frames (left-to-right, top-to-bottom):');
FRAMES.forEach((f) => console.log(`  ${f.label}`));

console.log('\nhit regions:');
for (const region of ICON_HIT_REGIONS) {
  console.log(
    `  ${region.id.padEnd(13)} x ${region.x}-${region.x + region.width}, y ${region.y}-${region.y + region.height}`
  );
}

// Round-trip a few UVs to prove the v-flip is right.
console.log('\nUV round-trip:');
for (const region of ICON_HIT_REGIONS) {
  const centreX = region.x + region.width / 2;
  const centreY = region.y + region.height / 2;
  const u = centreX / W;
  const v = 1 - centreY / H;
  const got = hitTestScreen(u, v);
  console.log(
    `  centre of ${region.id.padEnd(13)} -> uv(${u.toFixed(3)}, ${v.toFixed(3)}) -> ${got} ${got === region.id ? 'OK' : 'MISMATCH'}`
  );
}
console.log(`  empty area          -> ${hitTestScreen(0.85, 0.5)} (expected null)`);

rmSync(BUNDLE, { force: true });
console.log('\nwrote .model-candidates/screen-preview.png');
