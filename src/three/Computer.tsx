/**
 * The Gateway 2000 model plus our own screen surface.
 *
 * The .glb's screen is a flat-coloured quad whose UVs we don't control, so we
 * hide it and lay our own plane over the glass using the measured transform in
 * sceneConstants. That keeps the boot texture mapped predictably.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { SectionId } from '../data/sections';
import {
  MODEL_URL,
  MODEL_SCALE,
  SCREEN_CENTER,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  SCREEN_NORMAL,
  SCREEN_OFFSET,
  SCREEN_TILT,
  SCREEN_BULGE,
  SCREEN_MATERIALS,
  SCREEN_REFRESH_HZ
} from './sceneConstants';
import { createScreenCanvas, drawScreenFrame, hitTestScreen } from './bootScreen';
import { createCurvedScreenGeometry } from './screenGeometry';

type ComputerProps = {
  /** Seconds since power-on, driving the boot animation. */
  bootStart: number;
  /** Called with the icon clicked, or null for anywhere else on the glass. */
  onActivate: (section: SectionId | null) => void;
  interactive: boolean;
};

const Computer = ({ bootStart, onActivate, interactive }: ComputerProps) => {
  const { scene } = useGLTF(MODEL_URL);
  const glowRef = useRef<THREE.PointLight>(null);
  const [hovered, setHovered] = useState<SectionId | null>(null);

  // One instance per mount; the model is only ever shown once.
  const model = useMemo(() => scene.clone(true), [scene]);

  const { ctx, texture } = useMemo(() => {
    const element = createScreenCanvas();
    const context = element.getContext('2d')!;
    const map = new THREE.CanvasTexture(element);
    map.colorSpace = THREE.SRGBColorSpace;
    map.minFilter = THREE.LinearFilter;
    map.generateMipmaps = false;
    return { ctx: context, texture: map };
  }, []);

  useEffect(() => () => texture.dispose(), [texture]);

  const screenGeometry = useMemo(
    () => createCurvedScreenGeometry(SCREEN_WIDTH, SCREEN_HEIGHT, SCREEN_BULGE),
    []
  );

  useEffect(() => () => screenGeometry.dispose(), [screenGeometry]);

  // Hide the baked-in screen so only our overlay shows through the bezel.
  useEffect(() => {
    model.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh) return;

      const material = mesh.material as THREE.Material | THREE.Material[];
      const names = Array.isArray(material)
        ? material.map((m) => m.name)
        : [material.name];

      if (names.some((name) => SCREEN_MATERIALS.includes(name))) {
        mesh.visible = false;
        return;
      }

      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });
  }, [model]);

  const lastDrawn = useRef(-Infinity);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime() - bootStart;
    if (elapsed < 0) return;

    // The screen is the room's main light source, so let it flicker as it
    // warms up. Cheap, so it runs every frame.
    if (glowRef.current) {
      const warmup = Math.min(1, elapsed / 1.6);
      glowRef.current.intensity = warmup * (1.5 + Math.sin(elapsed * 11) * 0.12);
    }

    if (elapsed - lastDrawn.current < 1 / SCREEN_REFRESH_HZ) return;
    lastDrawn.current = elapsed;

    drawScreenFrame(ctx, elapsed, { hovered });
    texture.needsUpdate = true;
  });

  const overlayPosition: [number, number, number] = [
    SCREEN_CENTER[0] + SCREEN_NORMAL[0] * SCREEN_OFFSET,
    SCREEN_CENTER[1] + SCREEN_NORMAL[1] * SCREEN_OFFSET,
    SCREEN_CENTER[2] + SCREEN_NORMAL[2] * SCREEN_OFFSET
  ];

  return (
    <group>
      <primitive object={model} scale={MODEL_SCALE} />

      <mesh
        position={overlayPosition}
        rotation={[SCREEN_TILT, 0, 0]}
        onClick={(event: ThreeEvent<MouseEvent>) => {
          event.stopPropagation();
          if (!interactive || !event.uv) return;
          onActivate(hitTestScreen(event.uv.x, event.uv.y));
        }}
        onPointerMove={(event: ThreeEvent<PointerEvent>) => {
          if (!interactive || !event.uv) return;
          setHovered(hitTestScreen(event.uv.x, event.uv.y));
        }}
        onPointerOver={() => {
          if (interactive) document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
          setHovered(null);
        }}
        geometry={screenGeometry}
      >
        {/* Unlit and untonemapped so the phosphor keeps its own brightness
            and reads as an emitter for the bloom pass. */}
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>

      {/* Spill from the screen onto the beige case. */}
      <pointLight
        ref={glowRef}
        position={[SCREEN_CENTER[0], SCREEN_CENTER[1], SCREEN_CENTER[2] + 0.35]}
        color="#9fd8ff"
        intensity={0}
        distance={3}
        decay={2}
      />
    </group>
  );
};

useGLTF.preload(MODEL_URL);

export default Computer;
