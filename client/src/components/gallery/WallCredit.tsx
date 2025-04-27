import { Text } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useState, useRef, useEffect } from 'react';

export default function WallCredit() {
  const textRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  // Position on opposite wall - centered on back wall
  const position: [number, number, number] = [0, 1.8, 12];

  // Always look at center of room (0,0,0)
  useFrame(() => {
    if (textRef.current) {
      // Make text face toward center of room
      const direction = new THREE.Vector3();
      direction.subVectors(
        new THREE.Vector3(0, position[1], 0),
        new THREE.Vector3(...position)
      ).normalize();

      // Calculate rotation to face center
      const angle = Math.atan2(direction.x, direction.z);
      textRef.current.rotation.y = angle;
    }
  });

  return (
    <group position={position}>
      <Text
        ref={textRef}
        fontSize={0.4}
        color="#111111"
        anchorX="center"
        anchorY="middle"
        position={[0, 0, 0]}
        font="/fonts/inter.json"
        outlineWidth={0.02}
        outlineColor="#ffffff"
      >
        visionaryminds.solutions
      </Text>
    </group>
  );
}