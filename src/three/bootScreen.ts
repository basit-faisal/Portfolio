/**
 * Draws what the CRT displays, as a 2D canvas used for the screen texture.
 *
 * Two phases: an Award BIOS POST, then a miniature of the Windows 95 desktop
 * the user is about to fly into. Mirroring the real desktop is deliberate —
 * the cross-fade at the end of the fly-in reads as the same screen getting
 * closer rather than one scene being swapped for another.
 *
 * Framework-free so it can be reasoned about and tested without a WebGL
 * context. Hit regions are exported in canvas space and converted from UVs by
 * the caller.
 */
import { profile } from '../data/profile';
import { sections, type SectionId } from '../data/sections';

/** 4:3, matching the measured screen quad. */
export const SCREEN_TEXTURE_WIDTH = 1024;
export const SCREEN_TEXTURE_HEIGHT = 768;

type BootLine = {
  /** Seconds from power-on until the line appears. */
  at: number;
  text: string;
  dim?: boolean;
};

const owner = profile.name.toUpperCase().replace(/\s+/g, '-');

/** Award BIOS POST, as a Gateway 2000 of this vintage would have printed it. */
export const BOOT_LINES: BootLine[] = [
  { at: 0.0, text: 'Award Modular BIOS v4.51PG' },
  { at: 0.12, text: 'Copyright (C) 1984-95, Award Software, Inc.', dim: true },
  { at: 0.5, text: '' },
  { at: 0.6, text: 'Gateway 2000  P5-90' },
  { at: 0.85, text: 'Main Processor  : Pentium 90MHz' },
  { at: 1.1, text: 'Memory Test     : 16384K OK' },
  { at: 1.5, text: '' },
  { at: 1.65, text: `Primary Master  : ${owner}` },
  { at: 1.9, text: 'Primary Slave   : None' },
  { at: 2.15, text: 'Display Adapter : VGA/PCI' },
  { at: 2.6, text: '' },
  { at: 2.75, text: 'Starting MS-DOS...' },
  { at: 3.3, text: '' },
  { at: 3.45, text: 'C:\\> WIN' }
];

export const BOOT_DURATION = 4.1;
/** Length of the white flash as the machine switches into the GUI. */
const SWITCH_DURATION = 0.35;

const MONO = '"Courier New", ui-monospace, monospace';
const LINE_HEIGHT = 38;
const MARGIN_X = 56;
const MARGIN_Y = 78;

// --- desktop layout, in canvas pixels ---

const ICON_ORIGIN_X = 74;
const ICON_ORIGIN_Y = 58;
const ICON_GLYPH = 68;
const TASKBAR_HEIGHT = 58;

/** Glyph plus gap plus caption: the full height one icon occupies. */
const ICON_BLOCK = ICON_GLYPH + 12 + 22;

/** Breathing room between the last caption and the taskbar. */
const ICON_FOOT_MARGIN = 16;

// Derived from the section count, capped so a short list does not end up
// absurdly spread out. Fixed spacing meant adding a section pushed the last
// caption down behind the taskbar.
const ICON_SPACING = Math.min(
  134,
  Math.floor(
    (SCREEN_TEXTURE_HEIGHT - TASKBAR_HEIGHT - ICON_FOOT_MARGIN - ICON_ORIGIN_Y - ICON_BLOCK) /
      Math.max(1, sections.length - 1)
  )
);

type HitRegion = { id: SectionId; x: number; y: number; width: number; height: number };

/** Clickable areas, generous enough to include each caption. */
export const ICON_HIT_REGIONS: HitRegion[] = sections.map((section, index) => ({
  id: section.id,
  x: ICON_ORIGIN_X - 24,
  y: ICON_ORIGIN_Y + index * ICON_SPACING - 10,
  width: ICON_GLYPH + 100,
  height: ICON_GLYPH + 46
}));

/**
 * Maps a raycast UV hit to a section.
 * UV origin is bottom-left, canvas origin is top-left, hence the v flip.
 */
export const hitTestScreen = (u: number, v: number): SectionId | null => {
  const x = u * SCREEN_TEXTURE_WIDTH;
  const y = (1 - v) * SCREEN_TEXTURE_HEIGHT;

  const hit = ICON_HIT_REGIONS.find(
    (region) =>
      x >= region.x &&
      x <= region.x + region.width &&
      y >= region.y &&
      y <= region.y + region.height
  );

  return hit?.id ?? null;
};

export const createScreenCanvas = () => {
  const canvas = document.createElement('canvas');
  canvas.width = SCREEN_TEXTURE_WIDTH;
  canvas.height = SCREEN_TEXTURE_HEIGHT;
  return canvas;
};

/**
 * Renders one frame of screen content.
 * @param elapsed Seconds since the machine was switched on.
 * @param hovered Section currently under the pointer, for icon highlighting.
 */
export const drawScreenFrame = (
  ctx: CanvasRenderingContext2D,
  elapsed: number,
  { hovered }: { hovered: SectionId | null }
) => {
  if (elapsed < BOOT_DURATION) {
    drawPost(ctx, elapsed);
  } else {
    drawDesktop(ctx, elapsed, hovered);

    const sinceSwitch = elapsed - BOOT_DURATION;
    if (sinceSwitch < SWITCH_DURATION) {
      ctx.fillStyle = `rgba(255, 255, 255, ${1 - sinceSwitch / SWITCH_DURATION})`;
      ctx.fillRect(0, 0, SCREEN_TEXTURE_WIDTH, SCREEN_TEXTURE_HEIGHT);
    }
  }

  drawPhosphor(ctx, elapsed);
};

// --- phase one: POST ---

const drawPost = (ctx: CanvasRenderingContext2D, elapsed: number) => {
  ctx.fillStyle = '#08080c';
  ctx.fillRect(0, 0, SCREEN_TEXTURE_WIDTH, SCREEN_TEXTURE_HEIGHT);

  ctx.font = `28px ${MONO}`;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';

  const visible = BOOT_LINES.filter((line) => elapsed >= line.at);
  visible.forEach((line, index) => {
    ctx.fillStyle = line.dim ? '#7c9c7c' : '#c8f0c8';
    ctx.fillText(line.text, MARGIN_X, MARGIN_Y + index * LINE_HEIGHT);
  });

  const lastLine = visible[visible.length - 1];
  if (lastLine && Math.floor(elapsed * 2) % 2 === 0) {
    const y = MARGIN_Y + (visible.length - 1) * LINE_HEIGHT;
    ctx.fillStyle = '#c8f0c8';
    ctx.fillRect(MARGIN_X + ctx.measureText(lastLine.text).width + 6, y + 4, 16, 26);
  }
};

// --- phase two: miniature desktop ---

const drawDesktop = (
  ctx: CanvasRenderingContext2D,
  elapsed: number,
  hovered: SectionId | null
) => {
  ctx.fillStyle = '#008080';
  ctx.fillRect(0, 0, SCREEN_TEXTURE_WIDTH, SCREEN_TEXTURE_HEIGHT);

  sections.forEach((section, index) => {
    const x = ICON_ORIGIN_X;
    const y = ICON_ORIGIN_Y + index * ICON_SPACING;
    drawIcon(ctx, section.id, x, y);

    ctx.font = '22px ui-sans-serif, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const labelY = y + ICON_GLYPH + 12;
    const labelWidth = ctx.measureText(section.label).width;

    // Selected captions get the Win95 navy highlight.
    if (hovered === section.id) {
      ctx.fillStyle = '#000080';
      ctx.fillRect(x - 6, labelY - 3, labelWidth + 12, 28);
    }

    ctx.fillStyle = '#ffffff';
    ctx.fillText(section.label, x, labelY);
  });

  drawNameplate(ctx, elapsed);
  drawTaskbar(ctx);
};

const drawNameplate = (ctx: CanvasRenderingContext2D, elapsed: number) => {
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 40px ui-sans-serif, system-ui, sans-serif';
  ctx.fillText(profile.name, SCREEN_TEXTURE_WIDTH - 60, 80);

  ctx.font = '24px ui-sans-serif, system-ui, sans-serif';
  ctx.fillStyle = '#d8f0f0';
  ctx.fillText(profile.headline, SCREEN_TEXTURE_WIDTH - 60, 134);

  // Pulsing call to action.
  ctx.globalAlpha = 0.6 + 0.4 * Math.sin(elapsed * 3);
  ctx.font = 'bold 26px ui-sans-serif, system-ui, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('CLICK AN ICON TO ENTER', SCREEN_TEXTURE_WIDTH - 60, 196);
  ctx.globalAlpha = 1;
};

const drawTaskbar = (ctx: CanvasRenderingContext2D) => {
  const top = SCREEN_TEXTURE_HEIGHT - TASKBAR_HEIGHT;

  ctx.fillStyle = '#c0c0c0';
  ctx.fillRect(0, top, SCREEN_TEXTURE_WIDTH, TASKBAR_HEIGHT);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, top, SCREEN_TEXTURE_WIDTH, 3);

  bevel(ctx, 8, top + 8, 128, TASKBAR_HEIGHT - 18);
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 24px ui-sans-serif, system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Start', 46, top + TASKBAR_HEIGHT / 2 - 1);
};

/** Raised Win95 bevel: light on the top-left, dark on the bottom-right. */
const bevel = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  ctx.fillStyle = '#c0c0c0';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, w, 3);
  ctx.fillRect(x, y, 3, h);
  ctx.fillStyle = '#808080';
  ctx.fillRect(x, y + h - 3, w, 3);
  ctx.fillRect(x + w - 3, y, 3, h);
};

// --- icon glyphs, drawn from primitives to stay in the era's visual language ---

const drawIcon = (ctx: CanvasRenderingContext2D, id: SectionId, x: number, y: number) => {
  switch (id) {
    case 'about':
      return drawPerson(ctx, x, y);
    case 'projects':
      return drawFolder(ctx, x, y);
    case 'work-history':
      return drawBriefcase(ctx, x, y);
    case 'contact':
      return drawEnvelope(ctx, x, y);
    case 'compose':
      return drawComposeEnvelope(ctx, x, y);
  }
};

const drawPerson = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
  ctx.fillStyle = '#d8d8d8';
  ctx.fillRect(x + 6, y + 4, 56, 60);

  ctx.fillStyle = '#f0c8a0'; // head
  ctx.beginPath();
  ctx.arc(x + 34, y + 26, 13, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#000080'; // shoulders
  ctx.beginPath();
  ctx.moveTo(x + 14, y + 60);
  ctx.quadraticCurveTo(x + 34, y + 38, x + 54, y + 60);
  ctx.closePath();
  ctx.fill();

  outline(ctx, x + 6, y + 4, 56, 60);
};

const drawFolder = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
  ctx.fillStyle = '#ffd040';
  ctx.fillRect(x + 4, y + 18, 60, 42);
  ctx.fillRect(x + 4, y + 10, 26, 10); // tab
  ctx.fillStyle = '#c89000';
  ctx.fillRect(x + 4, y + 56, 60, 4);
  outline(ctx, x + 4, y + 10, 60, 50);
};

const drawBriefcase = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(x + 4, y + 20, 60, 40);
  ctx.fillStyle = '#000000';
  ctx.fillRect(x + 24, y + 12, 20, 8); // handle
  ctx.fillStyle = '#c0c0c0';
  ctx.fillRect(x + 28, y + 36, 12, 8); // latch
  outline(ctx, x + 4, y + 20, 60, 40);
};

const drawEnvelope = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 4, y + 16, 60, 40);

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.beginPath(); // flap
  ctx.moveTo(x + 4, y + 16);
  ctx.lineTo(x + 34, y + 40);
  ctx.lineTo(x + 64, y + 16);
  ctx.stroke();

  outline(ctx, x + 4, y + 16, 60, 40);
};

/** The contact envelope with a pencil laid across it, for the composer. */
const drawComposeEnvelope = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 2, y + 14, 52, 36);

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.beginPath(); // flap
  ctx.moveTo(x + 2, y + 14);
  ctx.lineTo(x + 28, y + 36);
  ctx.lineTo(x + 54, y + 14);
  ctx.stroke();

  outline(ctx, x + 2, y + 14, 52, 36);

  // Pencil, angled up out of the envelope's bottom-right corner.
  ctx.save();
  ctx.translate(x + 46, y + 46);
  ctx.rotate(-Math.PI / 4);
  ctx.fillStyle = '#ffd040'; // barrel
  ctx.fillRect(0, 0, 26, 9);
  outline(ctx, 0, 0, 26, 9);
  ctx.fillStyle = '#f0c8a0'; // tip
  ctx.beginPath();
  ctx.moveTo(26, 0);
  ctx.lineTo(35, 4.5);
  ctx.lineTo(26, 9);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
};

const outline = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, w, h);
};

// --- phosphor artefacts ---

/**
 * Drawn into the texture rather than applied as a full-screen pass, so these
 * affect the glass only and never the room around it.
 */
const drawPhosphor = (ctx: CanvasRenderingContext2D, elapsed: number) => {
  ctx.save();

  ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
  for (let y = 0; y < SCREEN_TEXTURE_HEIGHT; y += 3) {
    ctx.fillRect(0, y, SCREEN_TEXTURE_WIDTH, 1);
  }

  // Refresh band rolling slowly down the tube.
  const bandY = (((elapsed * 0.12) % 1.4) - 0.2) * SCREEN_TEXTURE_HEIGHT;
  const band = ctx.createLinearGradient(0, bandY, 0, bandY + 150);
  band.addColorStop(0, 'rgba(255, 255, 255, 0)');
  band.addColorStop(0.5, 'rgba(255, 255, 255, 0.035)');
  band.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = band;
  ctx.fillRect(0, bandY, SCREEN_TEXTURE_WIDTH, 150);

  // Corner falloff, so the tube reads as glass rather than a flat panel.
  const vignette = ctx.createRadialGradient(
    SCREEN_TEXTURE_WIDTH / 2,
    SCREEN_TEXTURE_HEIGHT / 2,
    SCREEN_TEXTURE_HEIGHT * 0.32,
    SCREEN_TEXTURE_WIDTH / 2,
    SCREEN_TEXTURE_HEIGHT / 2,
    SCREEN_TEXTURE_HEIGHT * 0.78
  );
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, SCREEN_TEXTURE_WIDTH, SCREEN_TEXTURE_HEIGHT);

  ctx.restore();
};
