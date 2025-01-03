import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface TranslationDisplayProps {
  translation: string;
}

const Model: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="cyan" />
    </mesh>
  );
};

const TranslationDisplay: React.FC<TranslationDisplayProps> = ({
  translation,
}) => {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Translation Result:</h2>
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <Canvas className="h-64 w-full">
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
          <Model />
          <OrbitControls />
        </Canvas>
        <p className="mt-4 text-gray-300">{translation}</p>
      </div>
    </div>
  );
};

export default TranslationDisplay;
