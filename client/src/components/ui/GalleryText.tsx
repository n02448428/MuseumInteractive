import { useEffect, useState, useRef } from 'react';
import { Text, Html } from '@react-three/drei';
import { usePortfolio } from '../../lib/stores/usePortfolio';
import { useFrame, useThree } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

export default function GalleryText() {
  const { 
    interaction: { isInteracting },
    showProjectDetails,
  } = usePortfolio();
  
  // Get the camera from R3F
  const { camera } = useThree();
  
  const [lastMoveTime, setLastMoveTime] = useState(Date.now());
  const [isActive, setIsActive] = useState(false);
  const [lastPosition, setLastPosition] = useState<THREE.Vector3 | null>(null);
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null);
  const movementThreshold = 0.01; // Very small threshold to detect minor movement
  
  // Detect user activity/inactivity based on movement
  useFrame(() => {
    if (!camera || isInteracting || showProjectDetails) return;
    
    const currentTime = Date.now();
    
    // Check if camera has moved
    if (lastPosition) {
      const distance = camera.position.distanceTo(lastPosition);
      
      if (distance > movementThreshold) {
        // Movement detected - reset timer
        setLastMoveTime(currentTime);
        setIsActive(false);
        
        // Clear existing timer
        if (inactivityTimer) {
          clearTimeout(inactivityTimer);
        }
        
        // Set new timer
        const timer = setTimeout(() => {
          setIsActive(true);
        }, 3000); // Show text after 3 seconds of inactivity
        
        setInactivityTimer(timer as unknown as NodeJS.Timeout);
      }
    }
    
    // Update last position
    setLastPosition(camera.position.clone());
  });
  
  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
    };
  }, [inactivityTimer]);
  
  // Don't show when interacting with exhibits
  useEffect(() => {
    if (isInteracting || showProjectDetails) {
      setIsActive(false);
    }
  }, [isInteracting, showProjectDetails]);
  
  return (
    <>
      {/* Add 2D HTML overlay for header and footer text */}
      <Html
        fullscreen
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        <AnimatePresence>
          {isActive && (
            <>
              {/* Header text at top of screen */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                style={{
                  position: 'absolute',
                  top: '40px',
                  left: '0',
                  width: '100%',
                  textAlign: 'center',
                  color: 'black',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 'bold',
                  fontSize: '28px',
                  textShadow: '0 0 8px white, 0 0 12px white, 0 0 16px white',
                  pointerEvents: 'none',
                }}
              >
                Dmitry A. Markelov
              </motion.div>
              
              {/* Footer text at bottom of screen */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
                style={{
                  position: 'absolute',
                  bottom: '40px',
                  left: '0',
                  width: '100%',
                  textAlign: 'center',
                  color: 'black',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 'bold',
                  fontSize: '20px',
                  textShadow: '0 0 8px white, 0 0 12px white, 0 0 16px white',
                  pointerEvents: 'none',
                }}
              >
                Portfolio Gallery
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </Html>
    </>
  );
}