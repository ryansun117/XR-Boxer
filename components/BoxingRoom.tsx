import React from 'react';
import { COLORS } from '../constants';

export const BoxingRoom: React.FC = () => {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 40]} />
        <meshStandardMaterial color={COLORS.FLOOR} roughness={0.1} metalness={0.1} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 6, 0]}>
        <planeGeometry args={[20, 40]} />
        <meshStandardMaterial color={COLORS.FLOOR} />
      </mesh>

      {/* Back Wall (Red Accent) */}
      <mesh position={[0, 3, -15]}>
        <boxGeometry args={[20, 6, 1]} />
        <meshStandardMaterial color={COLORS.WALL_RED} roughness={0.2} />
      </mesh>

      {/* Front Wall (Behind Player) */}
      <mesh position={[0, 3, 10]}>
        <boxGeometry args={[20, 6, 1]} />
        <meshStandardMaterial color={COLORS.WALL_GREY} />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-10, 3, -2.5]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[45, 6, 1]} />
        <meshStandardMaterial color={COLORS.WALL_GREY} />
      </mesh>

      {/* Right Wall */}
      <mesh position={[10, 3, -2.5]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[45, 6, 1]} />
        <meshStandardMaterial color={COLORS.WALL_GREY} />
      </mesh>

      {/* Lights */}
      {/* RectAreaLights need a helper in standard three, but we can simulate the glow with emissive meshes + point lights for performance in XR */}
      
      {/* Light Panel 1 */}
      <mesh position={[0, 5.9, -5]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 8]} />
        <meshBasicMaterial color={COLORS.LIGHT} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 5, -5]} intensity={1.5} distance={15} decay={2} />

       {/* Light Panel 2 */}
       <mesh position={[0, 5.9, 5]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 8]} />
        <meshBasicMaterial color={COLORS.LIGHT} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 5, 5]} intensity={1} distance={15} decay={2} />

      <ambientLight intensity={0.4} />
    </group>
  );
};
