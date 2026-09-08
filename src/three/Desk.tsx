/**
 * The desk the computer stands on, plus the floor under it and the clutter on
 * top of it.
 *
 * The shapes themselves live in deskLayout as plain data. This file only turns
 * that data into meshes and adds the one thing data cannot describe: the lamp
 * actually emitting light.
 *
 * Geometries and materials are cached by value, so the ~60 parts collapse onto
 * a couple of dozen of each, and both are disposed when the scene unmounts —
 * the stage is torn down after the fly-in, so leaking here would leak on every
 * visit.
 */
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import {
  DESK_PARTS,
  FLOOR_Y,
  LAMP_BULB,
  PROPS,
  type Part,
  type Shape
} from './deskLayout';

const buildGeometry = (shape: Shape): THREE.BufferGeometry => {
  switch (shape.kind) {
    case 'box':
      return new THREE.BoxGeometry(...shape.size);
    case 'cylinder':
      return new THREE.CylinderGeometry(shape.top, shape.bottom, shape.height, shape.sides ?? 12);
    case 'sphere': {
      const sides = shape.sides ?? 12;
      return new THREE.SphereGeometry(shape.radius, sides, Math.max(3, Math.round(sides / 2)));
    }
    case 'ring':
      return new THREE.TorusGeometry(shape.radius, shape.tube, shape.sides ?? 6, 12);
  }
};

/** Longest edge of a part, used to keep pen nibs and duck eyes out of the shadow pass. */
const span = (shape: Shape): number => {
  switch (shape.kind) {
    case 'box':
      return Math.max(...shape.size);
    case 'cylinder':
      return Math.max(shape.height, shape.top * 2, shape.bottom * 2);
    case 'sphere':
      return shape.radius * 2;
    case 'ring':
      return (shape.radius + shape.tube) * 2;
  }
};

const useDressing = () => {
  const cache = useMemo(() => {
    const geometries = new Map<string, THREE.BufferGeometry>();
    const materials = new Map<string, THREE.MeshStandardMaterial>();

    const geometry = (shape: Shape) => {
      const key = JSON.stringify(shape);
      const existing = geometries.get(key);
      if (existing) return existing;

      const created = buildGeometry(shape);
      geometries.set(key, created);
      return created;
    };

    const material = (part: Part) => {
      const roughness = part.roughness ?? 0.7;
      const metalness = part.metalness ?? 0;
      const emissiveIntensity = part.emissiveIntensity ?? 0;
      const key = `${part.colour}|${roughness}|${metalness}|${part.emissive ?? ''}|${emissiveIntensity}`;

      const existing = materials.get(key);
      if (existing) return existing;

      const created = new THREE.MeshStandardMaterial({
        color: part.colour,
        roughness,
        metalness,
        // Flat shading to sit alongside the model, which is flat-shaded too.
        flatShading: true,
        ...(part.emissive ? { emissive: part.emissive, emissiveIntensity } : {})
      });
      materials.set(key, created);
      return created;
    };

    return { geometry, material, geometries, materials };
  }, []);

  useEffect(
    () => () => {
      cache.geometries.forEach((entry) => entry.dispose());
      cache.materials.forEach((entry) => entry.dispose());
    },
    [cache]
  );

  return cache;
};

const Desk = () => {
  const { geometry, material } = useDressing();

  // The spotlight needs something in the scene graph to aim at; this is where
  // the shade actually points once the lamp is placed and turned.
  const lampTarget = useMemo(() => new THREE.Object3D(), []);

  const renderPart = (part: Part, index: number) => (
    <mesh
      key={index}
      geometry={geometry(part.shape)}
      material={material(part)}
      position={part.position}
      rotation={part.rotation}
      scale={part.scale}
      castShadow={span(part.shape) > 0.06}
      receiveShadow
      // Geometry and material are shared between parts, so they must outlive
      // any single mesh. The cache above owns them and disposes them itself.
      dispose={null}
    />
  );

  return (
    <group>
      {/* Room floor. Large enough that the fog closes it out rather than an edge. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#171319" roughness={1} metalness={0} />
      </mesh>

      {DESK_PARTS.map(renderPart)}

      {PROPS.map((prop) => (
        <group
          key={prop.id}
          position={prop.position}
          rotation={[0, prop.rotationY ?? 0, 0]}
        >
          {prop.parts.map(renderPart)}
        </group>
      ))}

      <primitive object={lampTarget} position={[-0.7, 0, 0.35]} />

      {/* Warm pool on the desk, to play against the screen's blue. Neither of
          these casts shadows: one shadow map for the room is enough, and the
          scene still has to hold up on a phone. */}
      <spotLight
        position={LAMP_BULB}
        target={lampTarget}
        color="#ffc98a"
        intensity={7}
        angle={0.62}
        penumbra={0.85}
        distance={4.5}
        decay={2}
      />
      {/* Spill, so the shade and the lamp's own arm are not lit from nowhere. */}
      <pointLight position={LAMP_BULB} color="#ffbe7a" intensity={0.55} distance={1.6} decay={2} />
    </group>
  );
};

export default Desk;
