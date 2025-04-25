import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useState } from 'react';
import * as THREE from 'three';

export default function WallCredit() {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [scale, setScale] = useState(1);
  
  // Position on back wall behind starting position - centered and slightly higher
  const position: [number, number, number] = [0, 2.5, -24.9];
  
  // Enhanced pulse animation for the text
  useFrame(() => {
    if (hovered && !clicked) {
      // Do a subtle pulse animation when hovered
      setScale(1 + Math.sin(Date.now() * 0.005) * 0.05);
    } else if (scale !== 1) {
      // Reset scale when not hovered
      setScale(1);
    }
  });
  
  const handleClick = () => {
    // Open the link in a new tab
    window.open('https://VisionaryMinds.Solutions', '_blank');
    setClicked(true);
    
    // Reset clicked state after a short delay
    setTimeout(() => {
      setClicked(false);
    }, 300);
  };
  
  return (
    <group position={position}>
      {/* Background panel for better visibility */}
      <mesh position={[0, 0, -0.01]} scale={[13, 1.2, 0.1]}>
        <planeGeometry />
        <meshBasicMaterial color="#ffffff" opacity={0.7} transparent={true} />
      </mesh>
      
      {/* Credit text */}
      <Text
        position={[0, 0, 0]}
        fontSize={0.6}
        color="#0066cc"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#ffffff"
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        material-transparent={true}
        scale={[scale, scale, scale]}
      >
        Made by VisionaryMinds.Solutions
      </Text>
    </group>
  );
}