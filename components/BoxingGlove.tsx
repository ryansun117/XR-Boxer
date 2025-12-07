import React from 'react';
import { COLORS } from '../constants';

export const BoxingGlove: React.FC<{ handedness: 'left' | 'right' }> = ({ handedness }) => {
  const isLeft = handedness === 'left';
  
  return (
    <group rotation={[Math.PI / 4, 0, 0]}> 
      {/* Main Glove Body */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.08, 32, 32]} />
        <meshStandardMaterial color={COLORS.GLOVE} roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Extension/Wrist */}
      <mesh position={[0, -0.05, 0.02]} rotation={[Math.PI/4, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.05, 0.15, 32]} />
        <meshStandardMaterial color={COLORS.GLOVE} roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Laces / Detail Area */}
      <mesh position={[0, -0.05, 0.06]} rotation={[Math.PI/4, 0, 0]}>
        <boxGeometry args={[0.04, 0.1, 0.01]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Thumb (Opposed based on hand) */}
      <mesh position={[isLeft ? 0.06 : -0.06, -0.02, 0.04]} rotation={[0, 0, isLeft ? -0.5 : 0.5]}>
         <capsuleGeometry args={[0.035, 0.08, 4, 8]} />
         <meshStandardMaterial color={COLORS.GLOVE} roughness={0.3} />
      </mesh>

      <mesh position={[0, 0, 0]} scale={[1.05, 1.05, 1.05]}>
         <sphereGeometry args={[0.08, 16, 16]} />
         <meshBasicMaterial color="black" wireframe transparent opacity={0.05} />
      </mesh>
    </group>
  );
};
