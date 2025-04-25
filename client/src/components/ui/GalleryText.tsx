import { useEffect, useState } from 'react';
import { Text } from '@react-three/drei';
import { usePortfolio } from '../../lib/stores/usePortfolio';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function GalleryText() {
  const { 
    interaction: { isInteracting },
    showProjectDetails,
  } = usePortfolio();
  
  // Get the camera from R3F
  const { camera } = useThree();
  
  const [shouldShow, setShouldShow] = useState(true);
  const [fadeOpacity, setFadeOpacity] = useState(1);
  const [lastPosition, setLastPosition] = useState<THREE.Vector3 | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [movementTimer, setMovementTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Initial position to check if user is at starting point
  const startPosition = new THREE.Vector3(0, 1.8, 0);
  const movementThreshold = 0.05; // How much movement is considered "moving"
  
  // Update text visibility based on movement
  useFrame(() => {
    if (!camera) return;
    
    // Check if camera is moving
    if (lastPosition) {
      const distance = camera.position.distanceTo(lastPosition);
      
      if (distance > movementThreshold) {
        // Camera is moving
        setIsMoving(true);
        
        // Clear any existing timer
        if (movementTimer) clearTimeout(movementTimer);
        
        // Set new timer to check when movement stops
        const timer = setTimeout(() => {
          setIsMoving(false);
        }, 3000); // 3 seconds after movement stops
        
        setMovementTimer(timer as unknown as NodeJS.Timeout);
        
        // Fade out text while moving
        if (fadeOpacity > 0) {
          setFadeOpacity(Math.max(fadeOpacity - 0.05, 0));
        }
      } else if (isMoving === false) {
        // Fade in text when not moving
        if (fadeOpacity < 1) {
          setFadeOpacity(Math.min(fadeOpacity + 0.02, 1)); // Slower fade in
        }
      }
    }
    
    // Update last position for next frame
    setLastPosition(camera.position.clone());
    
    // Always hide when interacting with exhibits
    if (isInteracting || showProjectDetails) {
      if (fadeOpacity > 0) {
        setFadeOpacity(Math.max(fadeOpacity - 0.05, 0));
      }
    }
  });
  
  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (movementTimer) clearTimeout(movementTimer);
    };
  }, [movementTimer]);
  
  if (fadeOpacity <= 0) return null;
  
  return (
    <>
      {/* Header text - positioned higher */}
      <Text
        position={[0, 3.5, -4]}
        fontSize={0.4}
        color="black"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#ffffff"
        material-transparent={true}
        material-opacity={fadeOpacity}
      >
        Dmitry A. Markelov
      </Text>
      
      {/* Footer text */}
      <Text
        position={[0, 3.0, -4]}
        fontSize={0.25}
        color="black"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.008}
        outlineColor="#ffffff"
        material-transparent={true}
        material-opacity={fadeOpacity}
      >
        Portfolio Gallery
      </Text>
    </>
  );
}