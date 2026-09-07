/**
 * Drives the camera through two states: a resting three-quarter view with a
 * little pointer parallax, and the fly-in that pushes the glass to fill the
 * viewport so the DOM layer can take over without a visible seam.
 */
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  IDLE_CAMERA,
  IDLE_TARGET,
  FLY_IN_TARGET,
  FLY_IN_DURATION,
  SCREEN_NORMAL,
  flyInDistanceFor,
  idleDistanceScaleFor
} from './sceneConstants';

/** 'in' flies toward the glass, 'out' reverses it back to the resting view. */
export type CameraPhase = 'idle' | 'in' | 'out';

type CameraRigProps = {
  phase: CameraPhase;
  onArrive: () => void;
  onReturn: () => void;
  reducedMotion: boolean;
};

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const CameraRig = ({ phase, onArrive, onReturn, reducedMotion }: CameraRigProps) => {
  const { camera, size } = useThree();

  /** 0 at the resting view, 1 at the glass. */
  const progress = useRef(0);
  const settled = useRef(false);
  const pointer = useRef({ x: 0, y: 0 });

  // Reused across frames to avoid allocating vectors in the render loop.
  const position = useRef(new THREE.Vector3());
  const target = useRef(new THREE.Vector3());

  const idlePosition = useRef(new THREE.Vector3(...IDLE_CAMERA));
  const idleTarget = useRef(new THREE.Vector3(...IDLE_TARGET));
  // Seeded with a valid endpoint so a first frame that lands before the
  // resize effect can never aim the camera at the origin.
  const flyPosition = useRef(
    new THREE.Vector3(
      FLY_IN_TARGET[0] + SCREEN_NORMAL[0] * flyInDistanceFor(16 / 9),
      FLY_IN_TARGET[1] + SCREEN_NORMAL[1] * flyInDistanceFor(16 / 9),
      FLY_IN_TARGET[2] + SCREEN_NORMAL[2] * flyInDistanceFor(16 / 9)
    )
  );
  const flyTarget = useRef(new THREE.Vector3(...FLY_IN_TARGET));

  // Both endpoints depend on the viewport shape, so recompute them on resize
  // and on orientation change rather than baking them in.
  const aspect = size.width / size.height;

  useEffect(() => {
    const scale = idleDistanceScaleFor(aspect);
    idlePosition.current.set(
      IDLE_TARGET[0] + (IDLE_CAMERA[0] - IDLE_TARGET[0]) * scale,
      IDLE_TARGET[1] + (IDLE_CAMERA[1] - IDLE_TARGET[1]) * scale,
      IDLE_TARGET[2] + (IDLE_CAMERA[2] - IDLE_TARGET[2]) * scale
    );

    const distance = flyInDistanceFor(aspect);
    flyPosition.current.set(
      FLY_IN_TARGET[0] + SCREEN_NORMAL[0] * distance,
      FLY_IN_TARGET[1] + SCREEN_NORMAL[1] * distance,
      FLY_IN_TARGET[2] + SCREEN_NORMAL[2] * distance
    );
  }, [aspect]);

  // A fly-out begins from the glass, so seed progress at the far end.
  useEffect(() => {
    settled.current = false;
    if (phase === 'out') progress.current = 1;
    if (phase === 'in') progress.current = 0;
  }, [phase]);

  useEffect(() => {
    if (reducedMotion) return;

    const onPointerMove = (event: PointerEvent) => {
      pointer.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: (event.clientY / window.innerHeight) * 2 - 1
      };
    };

    window.addEventListener('pointermove', onPointerMove);
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, [reducedMotion]);

  useFrame((state, delta) => {
    if (phase !== 'idle') {
      const step = delta / FLY_IN_DURATION;
      progress.current =
        phase === 'in'
          ? Math.min(1, progress.current + step)
          : Math.max(0, progress.current - step);

      const eased = easeInOutCubic(progress.current);
      position.current.lerpVectors(idlePosition.current, flyPosition.current, eased);
      target.current.lerpVectors(idleTarget.current, flyTarget.current, eased);

      camera.position.copy(position.current);
      camera.lookAt(target.current);

      const done = phase === 'in' ? progress.current >= 1 : progress.current <= 0;
      if (done && !settled.current) {
        settled.current = true;
        if (phase === 'in') onArrive();
        else onReturn();
      }
      return;
    }

    // Resting: drift with the pointer and breathe slightly.
    const time = state.clock.getElapsedTime();
    const sway = reducedMotion ? 0 : Math.sin(time * 0.35) * 0.04;
    const parallaxX = reducedMotion ? 0 : pointer.current.x * 0.28;
    const parallaxY = reducedMotion ? 0 : -pointer.current.y * 0.16;

    position.current.set(
      idlePosition.current.x + parallaxX + sway,
      idlePosition.current.y + parallaxY,
      idlePosition.current.z
    );

    // Damp toward the goal so the parallax feels weighted rather than glued.
    camera.position.lerp(position.current, 1 - Math.pow(0.001, delta));
    camera.lookAt(idleTarget.current);
  });

  return null;
};

export default CameraRig;
