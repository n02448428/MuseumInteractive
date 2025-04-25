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
  
  // Update text visibility based on movement and interaction state
  useFrame(() => {
    if (!camera) return;
    
    // Get camera position as THREE.Vector3
    const currentPosition = new THREE.Vector3();
    
    // First frame, initialize last position
    if (!lastPosition) {
      setLastPosition(currentPosition.clone());
      return;
    }
    
    // Calculate distance from starting position
    const distanceFromStart = currentPosition.distanceTo(startPosition);
    const isAtStartPoint = distanceFromStart < 0.5;
    
    // Check if camera is moving
    const movement = currentPosition.distanceTo(lastPosition);
    const isCurrentlyMoving = movement > movementThreshold;
    
    // Update last position
    setLastPosition(currentPosition.clone());
    
    // If moving, clear any existing timer and start a new one
    if (isCurrentlyMoving) {
      setIsMoving(true);
      if (movementTimer) clearTimeout(movementTimer);
      
      // Set timer to check if movement has stopped
      const timer = setTimeout(() => {
        setIsMoving(false);
      }, 1000); // Wait 1 second of no movement to consider player "stationary"
      
      setMovementTimer(timer as unknown as NodeJS.Timeout);
    }
    
    // Show text when at start point or not moving and not interacting
    const shouldBeVisible = (isAtStartPoint || !isMoving) && !isInteracting && !showProjectDetails;
    
    // Fade in/out effect
    if (shouldBeVisible && fadeOpacity < 1) {
      setFadeOpacity(Math.min(fadeOpacity + 0.05, 1));
    } else if (!shouldBeVisible && fadeOpacity > 0) {
      setFadeOpacity(Math.max(fadeOpacity - 0.05, 0));
    }
    
    setShouldShow(shouldBeVisible);
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
      {/* Header text */}
      <Text
        position={[0, 2.5, -4]}
        fontSize={0.3}
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
        position={[0, 0.5, -4]}
        fontSize={0.2}
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