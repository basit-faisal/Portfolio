/** Tiny software rasteriser (z-buffered, flat-shaded) for offline model previews. */
import { transformPoint } from './glb.mjs';

export const BACKGROUND = [24, 24, 32, 255];
const HIGHLIGHT = [1, 0, 0.6, 1];

export const normalize = (v) => {
  const length = Math.hypot(...v) || 1;
  return v.map((c) => c / length);
};

const subtract = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0]
];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

const LIGHT = normalize([0.4, 0.75, 0.55]);

const lookAt = (eye, target, up = [0, 1, 0]) => {
  const z = normalize(subtract(eye, target));
  const x = normalize(cross(up, z));
  const y = cross(z, x);
  return [
    x[0], y[0], z[0], 0,
    x[1], y[1], z[1], 0,
    x[2], y[2], z[2], 0,
    -dot(x, eye), -dot(y, eye), -dot(z, eye), 1
  ];
};

/**
 * Renders one camera angle to an RGBA buffer of `size` x `size`.
 * `dir` is the camera offset direction from the model centre.
 */
export const renderView = (triangles, bounds, dir, { size = 320, highlight = null } = {}) => {
  const center = bounds.min.map((v, i) => (v + bounds.max[i]) / 2);
  const radius = Math.hypot(...bounds.max.map((v, i) => v - bounds.min[i])) / 2 || 1;

  const fov = (38 * Math.PI) / 180;
  const distance = (radius / Math.sin(fov / 2)) * 1.15;
  const unit = normalize(dir);
  const eye = center.map((c, i) => c + unit[i] * distance);
  const view = lookAt(eye, center);
  const focal = 1 / Math.tan(fov / 2);

  const pixels = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i++) pixels.set(BACKGROUND, i * 4);
  const depths = new Float64Array(size * size).fill(Infinity);

  const project = (point) => {
    const [vx, vy, vz] = transformPoint(view, point);
    if (vz > -1e-6) return null; // behind the camera
    return {
      x: (((focal * vx) / -vz) * 0.5 + 0.5) * size,
      y: (1 - (((focal * vy) / -vz) * 0.5 + 0.5)) * size,
      z: -vz
    };
  };

  for (const tri of triangles) {
    const pa = project(tri.a);
    const pb = project(tri.b);
    const pc = project(tri.c);
    if (!pa || !pb || !pc) continue;

    const area = (pb.x - pa.x) * (pc.y - pa.y) - (pb.y - pa.y) * (pc.x - pa.x);
    if (Math.abs(area) < 1e-9) continue;

    // Winding is inconsistent across free models, so shade on |dot|.
    const normal = normalize(cross(subtract(tri.b, tri.a), subtract(tri.c, tri.a)));
    const shade = 0.28 + 0.72 * Math.abs(dot(normal, LIGHT));

    const base = highlight && tri.material === highlight ? HIGHLIGHT : tri.color;
    const rgb = [0, 1, 2].map((i) =>
      Math.round(Math.pow(Math.min(1, Math.max(0, base[i] * shade)), 1 / 2.2) * 255)
    );

    const minX = Math.max(0, Math.floor(Math.min(pa.x, pb.x, pc.x)));
    const maxX = Math.min(size - 1, Math.ceil(Math.max(pa.x, pb.x, pc.x)));
    const minY = Math.max(0, Math.floor(Math.min(pa.y, pb.y, pc.y)));
    const maxY = Math.min(size - 1, Math.ceil(Math.max(pa.y, pb.y, pc.y)));

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const px = x + 0.5;
        const py = y + 0.5;
        const w0 = ((pb.x - pa.x) * (py - pa.y) - (pb.y - pa.y) * (px - pa.x)) / area;
        const w1 = ((pc.x - pb.x) * (py - pb.y) - (pc.y - pb.y) * (px - pb.x)) / area;
        const w2 = ((pa.x - pc.x) * (py - pc.y) - (pa.y - pc.y) * (px - pc.x)) / area;
        if (w0 < 0 || w1 < 0 || w2 < 0) continue;

        const depth = 1 / (w1 / pa.z + w2 / pb.z + w0 / pc.z);
        const index = y * size + x;
        if (depth >= depths[index]) continue;

        depths[index] = depth;
        pixels[index * 4] = rgb[0];
        pixels[index * 4 + 1] = rgb[1];
        pixels[index * 4 + 2] = rgb[2];
        pixels[index * 4 + 3] = 255;
      }
    }
  }

  return pixels;
};

/** Copies a square tile into a larger sheet buffer at the given origin. */
export const blit = (tile, tileSize, sheet, sheetWidth, originX, originY) => {
  for (let y = 0; y < tileSize; y++) {
    const src = y * tileSize * 4;
    const dest = ((originY + y) * sheetWidth + originX) * 4;
    tile.copy(sheet, dest, src, src + tileSize * 4);
  }
};
