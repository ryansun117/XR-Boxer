import React, { useMemo, useRef } from 'react';
import { Vector3, Group } from 'three';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { COLORS } from '../constants';

interface TargetProps {
  position: Vector3;
}

export const Target: React.FC<TargetProps> = ({ position }) => {
  const groupRef = useRef<Group>(null);
  
  const rotation = useMemo(() => {
    // Slight random rotation for visual variety
    return [Math.PI / 2, 0, (Math.random() - 0.5) * 0.5];
  }, []);

  useFrame(() => {
    if (groupRef.current) {
      // Sync visual position with the mutable Vector3 passed from GameManager logic
      groupRef.current.position.copy(position);
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation as any}>
      {/* Main Cylinder Body */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.2, 32]} />
        <meshStandardMaterial color={COLORS.TARGET_BODY} roughness={0.2} metalness={0.6} />
      </mesh>
      
      {/* Front Face Ring */}
      <mesh position={[0, 0.11, 0]}>
        <ringGeometry args={[0.18, 0.22, 32]} />
        <meshBasicMaterial color={COLORS.TARGET_RIM} />
      </mesh>

      {/* Center Bullseye */}
      <mesh position={[0, 0.11, 0]}>
         <circleGeometry args={[0.08, 32]} />
         <meshBasicMaterial color={COLORS.TARGET_RIM} />
      </mesh>

      {/* Logo Text */}
      <Text
        position={[0, 0.12, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.08}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        XRBOXER
      </Text>
    </group>
  );
};