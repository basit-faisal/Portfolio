/**
 * Dev-only: prints the node/mesh/material structure and per-primitive bounding
 * boxes of a .glb, to check whether a model's screen is its own surface.
 *
 *   node scripts/inspect-glb.mjs path/to/model.glb
 */
import { readFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('usage: node scripts/inspect-glb.mjs <model.glb>');
  process.exit(1);
}

const buf = readFileSync(file);
if (buf.readUInt32LE(0) !== 0x46546c67) {
  console.error('not a GLB file');
  process.exit(1);
}

// GLB: 12-byte header, then chunks of [length, type, data]. First chunk is JSON.
let offset = 12;
let json = null;
while (offset < buf.length) {
  const length = buf.readUInt32LE(offset);
  const type = buf.readUInt32LE(offset + 4);
  const data = buf.subarray(offset + 8, offset + 8 + length);
  if (type === 0x4e4f534a) json = JSON.parse(data.toString('utf8'));
  offset += 8 + length + ((4 - (length % 4)) % 4);
}

const fmt = (n) => Number(n.toFixed(3));
const size = (min, max) => max.map((v, i) => fmt(v - min[i]));

console.log(`\n### ${file}`);
console.log(`materials: ${(json.materials ?? []).map((m) => m.name ?? '(unnamed)').join(', ')}`);
console.log(`meshes: ${(json.meshes ?? []).length}, nodes: ${(json.nodes ?? []).length}`);

(json.meshes ?? []).forEach((mesh, meshIndex) => {
  console.log(`\n  mesh[${meshIndex}] "${mesh.name ?? '(unnamed)'}" primitives=${mesh.primitives.length}`);

  mesh.primitives.forEach((prim, primIndex) => {
    const accessor = json.accessors[prim.attributes.POSITION];
    const material = prim.material != null ? json.materials[prim.material] : null;
    const baseColor = material?.pbrMetallicRoughness?.baseColorFactor;
    const hasTexture = Boolean(material?.pbrMetallicRoughness?.baseColorTexture);

    console.log(
      `    prim[${primIndex}] mat="${material?.name ?? 'none'}"` +
        ` verts=${accessor.count}` +
        ` uv=${prim.attributes.TEXCOORD_0 != null ? 'yes' : 'NO'}` +
        ` tex=${hasTexture ? 'yes' : 'no'}` +
        (baseColor ? ` color=[${baseColor.map((c) => fmt(c)).join(', ')}]` : '')
    );
    console.log(
      `              min=[${accessor.min.map(fmt).join(', ')}]` +
        ` max=[${accessor.max.map(fmt).join(', ')}]` +
        ` size=[${size(accessor.min, accessor.max).join(', ')}]`
    );
  });
});

console.log('\n  node tree:');
const walk = (index, depth) => {
  const node = json.nodes[index];
  const label = node.name ?? '(unnamed)';
  const meshRef = node.mesh != null ? ` -> mesh[${node.mesh}]` : '';
  console.log(`  ${'  '.repeat(depth + 1)}${label}${meshRef}`);
  (node.children ?? []).forEach((child) => walk(child, depth + 1));
};
(json.scenes?.[0]?.nodes ?? []).forEach((n) => walk(n, 0));
