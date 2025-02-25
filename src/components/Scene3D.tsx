import { Canvas } from '@react-three/fiber';
import { OrbitControls, PresentationControls, Stage } from '@react-three/drei';
import { PhoneBooth } from './PhoneBooth';
import { Suspense } from 'react';

export function Scene3D() {
  return (
    <div className="h-[600px] w-full px-8">
      <Canvas
        camera={{ position: [5, 2, 5], fov: 45 }}
        style={{ background: 'transparent' }}
        shadows
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          
          <pointLight
            position={[0, 1, 0]}
            intensity={2}
            color="#ffbb00"
            distance={3}
            decay={2}
          />
          
          <directionalLight
            position={[5, 5, 5]}
            intensity={0.8}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />

          <PresentationControls
            global
            rotation={[0, -Math.PI / 4, 0]}
            polar={[0, 0]}
            azimuth={[-Math.PI / 4, Math.PI / 4]}
            config={{ mass: 2, tension: 400 }}
            snap={{ mass: 4, tension: 400 }}
          >
            <Stage
              environment="city"
              intensity={0.8}
              position={[0, -2, 0]}
              bounds={1.2}
              preset="rembrandt"
              shadows
            >
              <PhoneBooth />
            </Stage>
          </PresentationControls>
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 2}
            maxPolarAngle={Math.PI / 2}
            minAzimuthAngle={-Math.PI / 4}
            maxAzimuthAngle={Math.PI / 4}
          />
        </Suspense>
      </Canvas>
    </div>
  );
} 