import { useState, useEffect } from 'react';
import { usePortfolio } from '../../lib/stores/usePortfolio';
import * as THREE from 'three';
import { cn } from '../../lib/utils';

interface TouchPosition {
  x: number;
  y: number;
}

export default function MobileControls() {
  const { 
    updateCameraPosition, 
    updateCameraLookAt,
    setCameraMoving,
    camera: { position, lookAt }, 
    interaction: { isInteracting },
    isMobile,
    path
  } = usePortfolio();

  const [showControls, setShowControls] = useState(true);
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickPos, setJoystickPos] = useState<TouchPosition>({ x: 0, y: 0 });
  const [moveVector, setMoveVector] = useState<TouchPosition>({ x: 0, y: 0 });
  const [lookActive, setLookActive] = useState(false);
  const [lookDelta, setLookDelta] = useState<TouchPosition>({ x: 0, y: 0 });
  const [startTouch, setStartTouch] = useState<TouchPosition>({ x: 0, y: 0 });


  // Skip rendering if not on mobile
  if (!isMobile) return null;

  // Effect for applying movement from joystick
  useEffect(() => {
    let interval;
    if (joystickActive && !isInteracting && !path.active) {
      interval = setInterval(() => {
        const forward = new THREE.Vector3(
          lookAt[0] - position[0],
          0,
          lookAt[2] - position[2]
        ).normalize();
        const right = new THREE.Vector3(forward.z, 0, -forward.x);
        const moveSpeed = 0.1;
        const movement = new THREE.Vector3();
        movement.addScaledVector(forward, -moveVector.y * moveSpeed);
        movement.addScaledVector(right, moveVector.x * moveSpeed);

        if (movement.length() > 0) {
          setCameraMoving(true);
          const newPos = new THREE.Vector3(...position).add(movement);
          const minX = -25, maxX = 25;
          const minZ = -25, maxZ = 25;
          newPos.x = THREE.MathUtils.clamp(newPos.x, minX, maxX);
          newPos.z = THREE.MathUtils.clamp(newPos.z, minZ, maxZ);
          updateCameraPosition([newPos.x, position[1], newPos.z]);
        } else {
          setCameraMoving(false);
        }
      }, 16); 
    }
    return () => clearInterval(interval);
  }, [joystickActive, moveVector, position, lookAt, updateCameraPosition, isInteracting, path.active]);

  // Effect for applying rotation from look area
  useEffect(() => {
    if (lookActive && !isInteracting) {
      const currentDir = new THREE.Vector3(
        lookAt[0] - position[0],
        0,
        lookAt[2] - position[2]
      );
      const lookSpeed = 0.01;
      const angle = -lookDelta.x * lookSpeed;
      currentDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
      const newLookAt = new THREE.Vector3(...position).add(currentDir);
      updateCameraLookAt([newLookAt.x, lookAt[1], newLookAt.z]);
      setLookDelta({ x: 0, y: 0 });
    }
  }, [lookActive, lookDelta, position, lookAt, updateCameraLookAt, isInteracting]);

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
    const maxDistance = 50; 
    const deltaX = touch.clientX - startTouch.x;
    const deltaY = touch.clientY - startTouch.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    let normalizedX = deltaX;
    let normalizedY = deltaY;

    if (distance > maxDistance) {
      const ratio = maxDistance / distance;
      normalizedX *= ratio;
      normalizedY *= ratio;
    }

    setMoveVector({
      x: normalizedX / maxDistance,
      y: normalizedY / maxDistance
    });
  };

  const handleJoystickEnd = () => {
    setJoystickActive(false);
    setMoveVector({ x: 0, y: 0 });
    setCameraMoving(false);
  };

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

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  return (
    <div className="mobile-controls">
      <button 
        className="mobile-controls-toggle"
        onClick={toggleControls}
        aria-label={showControls ? "Hide controls" : "Show controls"}
      >
        {showControls ? "Hide Controls" : "Show Controls"}
      </button>

      {showControls && (
        <>
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