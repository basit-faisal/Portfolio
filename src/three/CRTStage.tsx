/**
 * The 3D landing scene: a Gateway 2000 on a dark desk, lit mostly by its own
 * screen. Lazy-loaded so the three.js bundle never blocks the DOM portfolio.
 */
import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, PerformanceMonitor } from '@react-three/drei';
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import Computer from './Computer';
import CameraRig, { type CameraPhase } from './CameraRig';
import { CAMERA_FOV, IDLE_CAMERA } from './sceneConstants';
import { BOOT_DURATION } from './bootScreen';
import type { SectionId } from '../data/sections';

type CRTStageProps = {
  phase: CameraPhase;
  onActivate: (section: SectionId | null) => void;
  onArrive: () => void;
  onReturn: () => void;
  reducedMotion: boolean;
  /** Skip the BIOS POST, for when the user powers back out to the scene. */
  skipBoot: boolean;
};

const CRTStage = ({
  phase,
  onActivate,
  onArrive,
  onReturn,
  reducedMotion,
  skipBoot
}: CRTStageProps) => {
  // The r3f clock starts with the canvas, so the boot animation is already
  // aligned to when the scene appears. Offsetting it backwards starts the
  // screen past the POST, on the desktop.
  const bootStart = skipBoot ? -(BOOT_DURATION + 0.6) : 0;

  // Adjusted at runtime by PerformanceMonitor; starts conservative so weaker
  // devices (including phones, where we still show the full scene) never open
  // at a resolution they cannot sustain.
  const [dpr, setDpr] = useState(1.25);

  return (
    <Canvas
      shadows
      dpr={dpr}
      camera={{ position: IDLE_CAMERA, fov: CAMERA_FOV, near: 0.05, far: 100 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#0b0b11']} />
      <fog attach="fog" args={['#0b0b11', 4, 12]} />

      <PerformanceMonitor
        onIncline={() => setDpr(Math.min(2, window.devicePixelRatio))}
        onDecline={() => setDpr(1)}
      />

      {/* Dim room: the screen itself does most of the lighting. */}
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[3, 5, 4]}
        intensity={0.8}
        color="#ffe9c8"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-4, 2, -3]} intensity={0.25} color="#8fb4ff" />

      <Suspense fallback={null}>
        <Computer
          bootStart={bootStart}
          onActivate={onActivate}
          interactive={phase === 'idle'}
        />

        {/* Desk surface, kept plain so the beige case stays the focus. */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]} receiveShadow>
          <planeGeometry args={[40, 40]} />
          <meshStandardMaterial color="#241c16" roughness={0.9} metalness={0} />
        </mesh>

        <ContactShadows
          position={[0, 0.001, 0]}
          opacity={0.55}
          scale={6}
          blur={2.4}
          far={2}
          resolution={512}
        />
      </Suspense>

      <CameraRig
        phase={phase}
        onArrive={onArrive}
        onReturn={onReturn}
        reducedMotion={reducedMotion}
      />

      {/* Scene-level grade only. The scanlines and tube vignette live in the
          screen texture, so they stay on the glass instead of the room. */}
      <EffectComposer>
        <Bloom
          intensity={0.55}
          luminanceThreshold={0.32}
          luminanceSmoothing={0.32}
          mipmapBlur
        />
        <Noise opacity={0.03} blendFunction={BlendFunction.OVERLAY} />
        <Vignette offset={0.28} darkness={0.62} />
      </EffectComposer>
    </Canvas>
  );
};

export default CRTStage;
