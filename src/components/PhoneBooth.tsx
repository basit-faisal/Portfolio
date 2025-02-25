import { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

useGLTF.preload('/Portfolio/models/phone-booth/scene.gltf');

export function PhoneBooth() {
  const modelRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/Portfolio/models/phone-booth/scene.gltf');

  // Clone the scene to avoid mutations
  const clonedScene = scene.clone();

  // Enhance materials for better visibility
  clonedScene.traverse((node: THREE.Object3D) => {
    if ((node as THREE.Mesh).isMesh) {
      const mesh = node as THREE.Mesh;
      if (mesh.material) {
        const material = (mesh.material as THREE.MeshStandardMaterial);
        
        // Make glass materials slightly transparent
        if (material.name?.includes('glass') || material.name?.includes('window')) {
          material.transparent = true;
          material.opacity = 0.8;
          material.roughness = 0.1;
          material.metalness = 0.9;
        } else {
          material.roughness = 0.5;
          material.metalness = 0.5;
        }
        
        material.envMapIntensity = 1;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    }
  });

  return (
    <>
      {/* Add yellow point light */}
      <pointLight
        position={[0, 2, 0]}
        intensity={2}
        color="#ffbb00"
        distance={3}
        decay={2}
      />
      <primitive 
        object={clonedScene} 
        ref={modelRef}
        scale={2}
        position={[0, 0, 0]}
        rotation={[0, Math.PI / 4, 0]}
      />
    </>
  );
} 