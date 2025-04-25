import { useState, useEffect } from 'react';
import { usePortfolio } from '../../lib/stores/usePortfolio';
import * as THREE from 'three';
import { cn } from '../../lib/utils';

interface TouchPosition {
  x: number;
  y: number;
}

export default function MobileControls() {
  const [showControls, setShowControls] = useState(true);
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickPos, setJoystickPos] = useState<TouchPosition>({ x: 0, y: 0 });
  const [moveVector, setMoveVector] = useState<TouchPosition>({ x: 0, y: 0 });
  const [lookActive, setLookActive] = useState(false);
  const [lookDelta, setLookDelta] = useState<TouchPosition>({ x: 0, y: 0 });
  const [startTouch, setStartTouch] = useState<TouchPosition>({ x: 0, y: 0 });
  
  const { 
    updateCameraPosition, 
    updateCameraLookAt,
    setCameraMoving,
    camera: { position, lookAt }, 
    interaction: { isInteracting },
    isMobile,
    path
  } = usePortfolio();
  
  // Effect for applying movement from joystick
  useEffect(() => {
    // Skip if we're not on mobile, joystick not active, or other conditions
    if (!isMobile || !joystickActive || isInteracting || path.active) return;
    
    // Only update at 60fps
    const interval = setInterval(() => {
      // Calculate direction vectors
      const forward = new THREE.Vector3(
        lookAt[0] - position[0],
        0,
        lookAt[2] - position[2]
      ).normalize();
      
      const right = new THREE.Vector3(forward.z, 0, -forward.x);
      
      // Apply movement
      const moveSpeed = 0.1;
      const movement = new THREE.Vector3();
      movement.addScaledVector(forward, -moveVector.y * moveSpeed);
      movement.addScaledVector(right, moveVector.x * moveSpeed);
      
      if (movement.length() > 0) {
        setCameraMoving(true);
        const newPos = new THREE.Vector3(...position).add(movement);
        
        // Constrain to gallery bounds
        const minX = -25, maxX = 25;
        const minZ = -25, maxZ = 25;
        newPos.x = THREE.MathUtils.clamp(newPos.x, minX, maxX);
        newPos.z = THREE.MathUtils.clamp(newPos.z, minZ, maxZ);
        
        updateCameraPosition([newPos.x, position[1], newPos.z]);
      } else {
        setCameraMoving(false);
      }
    }, 16); // ~60fps
    
    return () => clearInterval(interval);
  }, [isMobile, joystickActive, moveVector, position, lookAt, updateCameraPosition, isInteracting, path, setCameraMoving]);
  
  // Effect for applying rotation from look area
  useEffect(() => {
    // Skip if we're not on mobile or other conditions
    if (!isMobile || !lookActive || isInteracting) return;
    
    // Calculate new look direction
    const currentDir = new THREE.Vector3(
      lookAt[0] - position[0],
      0,
      lookAt[2] - position[2]
    );
    
    // Rotate direction based on touch movement
    const lookSpeed = 0.01;
    const angle = -lookDelta.x * lookSpeed;
    currentDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
    
    // Calculate new look target
    const newLookAt = new THREE.Vector3(...position).add(currentDir);
    updateCameraLookAt([newLookAt.x, lookAt[1], newLookAt.z]);
    
    // Reset look delta after applying
    setLookDelta({ x: 0, y: 0 });
  }, [isMobile, lookActive, lookDelta, position, lookAt, updateCameraLookAt, isInteracting]);
  
  // Handle touch events for the movement joystick
  const handleJoystickStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    setJoystickActive(true);
    setJoystickPos({ x: touch.clientX, y: touch.clientY });
    setStartTouch({ x: touch.clientX, y: touch.clientY });
  };
  
  const handleJoystickMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!joystickActive) return;
    
    const touch = e.touches[0];
    const maxDistance = 50; // Max joystick distance
    
    const deltaX = touch.clientX - startTouch.x;
    const deltaY = touch.clientY - startTouch.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance > maxDistance) {
      // Normalize the vector
      const ratio = maxDistance / distance;
      const normalizedX = deltaX * ratio;
      const normalizedY = deltaY * ratio;
      
      setMoveVector({
        x: normalizedX / maxDistance,
        y: normalizedY / maxDistance
      });
    } else {
      setMoveVector({
        x: deltaX / maxDistance,
        y: deltaY / maxDistance
      });
    }
  };
  
  const handleJoystickEnd = () => {
    setJoystickActive(false);
    setMoveVector({ x: 0, y: 0 });
    setCameraMoving(false);
  };
  
  // Handle touch events for the look area
  const handleLookStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    setLookActive(true);
    setStartTouch({ x: touch.clientX, y: touch.clientY });
  };
  
  const handleLookMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!lookActive) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - startTouch.x;
    const deltaY = touch.clientY - startTouch.y;
    
    setLookDelta({ x: deltaX, y: deltaY });
    setStartTouch({ x: touch.clientX, y: touch.clientY });
  };
  
  const handleLookEnd = () => {
    setLookActive(false);
    setLookDelta({ x: 0, y: 0 });
  };
  
  // Toggle controls visibility
  const toggleControls = () => {
    setShowControls(!showControls);
  };
  
  // Don't render anything if not on mobile
  if (!isMobile) {
    return null;
  }
  
  return (
    <div className="mobile-controls">
      {/* Control visibility toggle */}
      <button 
        className="mobile-controls-toggle"
        onClick={toggleControls}
        aria-label={showControls ? "Hide controls" : "Show controls"}
      >
        {showControls ? "Hide Controls" : "Show Controls"}
      </button>
      
      {showControls && (
        <>
          {/* Movement joystick */}
          <div 
            className="mobile-joystick-area"
            onTouchStart={handleJoystickStart}
            onTouchMove={handleJoystickMove}
            onTouchEnd={handleJoystickEnd}
            onTouchCancel={handleJoystickEnd}
          >
            <div className="mobile-joystick-base">
              <div 
                className={cn("mobile-joystick-handle", {
                  "active": joystickActive
                })}
                style={{
                  transform: `translate(${moveVector.x * 50}px, ${moveVector.y * 50}px)`
                }}
              />
            </div>
          </div>
          
          {/* Look area */}
          <div 
            className="mobile-look-area"
            onTouchStart={handleLookStart}
            onTouchMove={handleLookMove}
            onTouchEnd={handleLookEnd}
            onTouchCancel={handleLookEnd}
          >
            <div className="mobile-look-icon">
              Look
            </div>
          </div>
        </>
      )}
      
    </div>
  );
}

// CSS styles moved to client/src/index.css
