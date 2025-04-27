import { Text } from '@react-three/drei';
import { useState } from 'react';

export default function WallCredit() {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={[-15, 1.5, 20]} rotation={[0, Math.PI, 0]}>
      <Text
        color={hovered ? "#4361ee" : "#333333"}
        anchorX="center"
        anchorY="middle"
        fontSize={0.6}
        maxWidth={10}
        lineHeight={1.5}
        font="/fonts/inter.json"
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => window.open('https://visionaryminds.solutions', '_blank')}
      >
        visionaryminds.solutions
      </Text>
    </group>
  );
}