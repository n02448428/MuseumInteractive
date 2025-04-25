import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useState } from 'react';
import * as THREE from 'three';

export default function WallCredit() {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  
  // Position behind starting position
  const position: [number, number, number] = [0, 1.8, -20];
  
  // Slight pulse animation for the text
  useFrame(() => {
    if (hovered && !clicked) {
      // Do a subtle pulse animation when hovered
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
    <Text
      position={position}
      fontSize={0.5}
      color="#0066cc"
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.02}
      outlineColor="#ffffff"
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      material-transparent={true}
    >
      Made by VisionaryMinds.Solutions
    </Text>
  );
}