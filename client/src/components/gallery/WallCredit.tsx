import { Text, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

export default function WallCredit() {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [scale, setScale] = useState(1);
  const [showDescription, setShowDescription] = useState(false);
  
  // Position on opposite wall (front wall)
  const position: [number, number, number] = [0, 2.5, 24.9];
  
  // Handle hover state with a slight delay
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (hovered) {
      timer = setTimeout(() => {
        setShowDescription(true);
      }, 100);
    } else {
      setShowDescription(false);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [hovered]);
  
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
    <>
      {/* Website link description (shown at bottom left when hovering) */}
      {showDescription && (
        <Html fullscreen style={{ pointerEvents: 'none' }}>
          <motion.div 
            className="exhibit-description"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            style={{ 
              position: 'fixed', 
              bottom: '30px', 
              left: '30px', 
              maxWidth: '350px',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              padding: '15px',
              borderRadius: '8px',
              fontSize: '16px',
              zIndex: 900
            }}
          >
            <h3>VisionaryMinds.Solutions</h3>
            <p>Go to website</p>
          </motion.div>
        </Html>
      )}
      
      <group position={position} rotation={[0, Math.PI, 0]}>
        {/* Background panel for better visibility */}
        <mesh position={[0, 0, -0.01]} scale={[13, 1.2, 0.1]}>
          <planeGeometry />
          <meshBasicMaterial color="#ffffff" opacity={0.85} transparent={true} />
        </mesh>
        
        {/* Enhanced glow effect behind text */}
        <mesh position={[0, 0, -0.005]} scale={[12, 1, 0.01]}>
          <planeGeometry />
          <meshBasicMaterial 
            color="#e0f2ff" 
            opacity={0.6} 
            transparent={true}
          />
        </mesh>
        
        {/* Credit text */}
        <Text
          position={[0, 0, 0]}
          fontSize={0.6}
          color="#0066cc"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.025}  // Increased outline for better legibility
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
    </>
  );
}