/**
 * Minimal GLB reader: parses the JSON + BIN chunks, resolves node transforms,
 * and flattens the scene into world-space triangles tagged by material.
 * Enough to inspect and preview a model offline; not a general glTF loader.
 */
import { readFileSync } from 'node:fs';

const COMPONENT_SIZE = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 };
const TYPE_COUNT = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };

const readComponent = (buf, offset, componentType) => {
  switch (componentType) {
    case 5120: return buf.readInt8(offset);
    case 5121: return buf.readUInt8(offset);
    case 5122: return buf.readInt16LE(offset);
    case 5123: return buf.readUInt16LE(offset);
    case 5125: return buf.readUInt32LE(offset);
    default: return buf.readFloatLE(offset);
  }
};

// --- column-major 4x4 helpers (glTF convention) ---

export const identity = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

export const multiply = (a, b) => {
  const out = new Array(16);
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      out[col * 4 + row] =
        a[row] * b[col * 4] +
        a[4 + row] * b[col * 4 + 1] +
        a[8 + row] * b[col * 4 + 2] +
        a[12 + row] * b[col * 4 + 3];
    }
  }
  return out;
};

export const transformPoint = (m, [x, y, z]) => [
  m[0] * x + m[4] * y + m[8] * z + m[12],
  m[1] * x + m[5] * y + m[9] * z + m[13],
  m[2] * x + m[6] * y + m[10] * z + m[14]
];

const fromTRS = (t, q, s) => {
  const [x, y, z, w] = q;
  const x2 = x + x, y2 = y + y, z2 = z + z;
  const xx = x * x2, xy = x * y2, xz = x * z2;
  const yy = y * y2, yz = y * z2, zz = z * z2;
  const wx = w * x2, wy = w * y2, wz = w * z2;
  const [sx, sy, sz] = s;
  return [
    (1 - (yy + zz)) * sx, (xy + wz) * sx, (xz - wy) * sx, 0,
    (xy - wz) * sy, (1 - (xx + zz)) * sy, (yz + wx) * sy, 0,
    (xz + wy) * sz, (yz - wx) * sz, (1 - (xx + yy)) * sz, 0,
    t[0], t[1], t[2], 1
  ];
};

const nodeMatrix = (node) =>
  node.matrix ??
  fromTRS(node.translation ?? [0, 0, 0], node.rotation ?? [0, 0, 0, 1], node.scale ?? [1, 1, 1]);

export const parseGlb = (file) => {
  const buf = readFileSync(file);
  if (buf.readUInt32LE(0) !== 0x46546c67) throw new Error(`${file} is not a GLB`);

  let offset = 12;
  let json = null;
  let bin = null;
  while (offset < buf.length) {
    const length = buf.readUInt32LE(offset);
    const type = buf.readUInt32LE(offset + 4);
    const data = buf.subarray(offset + 8, offset + 8 + length);
    if (type === 0x4e4f534a) json = JSON.parse(data.toString('utf8'));
    if (type === 0x004e4942) bin = data;
    offset += 8 + length + ((4 - (length % 4)) % 4);
  }
  return { json, bin };
};

export const readAccessor = ({ json, bin }, index) => {
  const accessor = json.accessors[index];
  const view = json.bufferViews[accessor.bufferView];
  const components = TYPE_COUNT[accessor.type];
  const componentSize = COMPONENT_SIZE[accessor.componentType];
  const stride = view.byteStride ?? components * componentSize;
  const base = (view.byteOffset ?? 0) + (accessor.byteOffset ?? 0);

  const out = [];
  for (let i = 0; i < accessor.count; i++) {
    const element = [];
    for (let c = 0; c < components; c++) {
      element.push(readComponent(bin, base + i * stride + c * componentSize, accessor.componentType));
    }
    out.push(element);
  }
  return out;
};

/**
 * Flattens the default scene into world-space triangles.
 * @returns {{triangles: Array, bounds: {min: number[], max: number[]}}}
 */
export const collectTriangles = (glb, { skipNodes = [] } = {}) => {
  const { json } = glb;
  const triangles = [];
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];

  const visit = (nodeIndex, parentMatrix) => {
    const node = json.nodes[nodeIndex];
    if (skipNodes.includes(node.name)) return;

    const world = multiply(parentMatrix, nodeMatrix(node));

    if (node.mesh != null) {
      for (const prim of json.meshes[node.mesh].primitives) {
        if (prim.mode != null && prim.mode !== 4) continue; // triangles only

        const positions = readAccessor(glb, prim.attributes.POSITION).map((p) =>
          transformPoint(world, p)
        );
        const indices = prim.indices != null
          ? readAccessor(glb, prim.indices).map(([i]) => i)
          : positions.map((_, i) => i);

        const material = prim.material != null ? json.materials[prim.material] : null;
        const color = material?.pbrMetallicRoughness?.baseColorFactor ?? [0.8, 0.8, 0.8, 1];

        for (const p of positions) {
          for (let axis = 0; axis < 3; axis++) {
            if (p[axis] < min[axis]) min[axis] = p[axis];
            if (p[axis] > max[axis]) max[axis] = p[axis];
          }
        }

        for (let i = 0; i + 2 < indices.length; i += 3) {
          triangles.push({
            a: positions[indices[i]],
            b: positions[indices[i + 1]],
            c: positions[indices[i + 2]],
            color,
            material: material?.name ?? 'none',
            node: node.name ?? '(unnamed)'
          });
        }
      }
    }

    for (const child of node.children ?? []) visit(child, world);
  };

  for (const root of json.scenes?.[0]?.nodes ?? []) visit(root, identity());
  return { triangles, bounds: { min, max } };
};
