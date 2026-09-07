/**
 * Builds the curved glass for the CRT overlay.
 *
 * A CRT's tube bulges toward the viewer, so instead of faking barrel
 * distortion in a shader we curve the geometry itself: the texture then
 * distorts correctly from every angle, including during the camera fly-in.
 * The bulge falls to zero at the edges so the plane still sits flush inside
 * the model's bezel.
 */
import * as THREE from 'three';

export const createCurvedScreenGeometry = (
  width: number,
  height: number,
  bulge: number,
  segments = 24
) => {
  const geometry = new THREE.PlaneGeometry(width, height, segments, segments);
  const position = geometry.attributes.position as THREE.BufferAttribute;

  const halfWidth = width / 2;
  const halfHeight = height / 2;

  for (let i = 0; i < position.count; i++) {
    // Normalised distance from centre on each axis, 0 at middle, 1 at edge.
    const u = position.getX(i) / halfWidth;
    const v = position.getY(i) / halfHeight;

    // Quadratic falloff on both axes gives a dome that flattens at the rim.
    const falloff = (1 - u * u) * (1 - v * v);
    position.setZ(i, falloff * bulge);
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
};
