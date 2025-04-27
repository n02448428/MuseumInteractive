import { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { usePortfolio } from '../../lib/stores/usePortfolio';

interface TouchPosition {
  identifier: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

interface MobileControlsProps {
  moveSpeed?: number;
  lookSpeed?: number;
}

export default function MobileControls({ 
  moveSpeed = 0.1, // Increased speed for better responsiveness
  lookSpeed = 0.15, // Increased look sensitivity
}: MobileControlsProps) {
  const { camera } = useThree();
  const { interaction: { isInteracting } } = usePortfolio();
  const moveJoystickRef = useRef<HTMLDivElement>(null);
  const lookJoystickRef = useRef<HTMLDivElement>(null);
  const [moveTouch, setMoveTouch] = useState<TouchPosition | null>(null);
  const [lookTouch, setLookTouch] = useState<TouchPosition | null>(null);

  // Camera rotation control
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  // Track if controls are initialized
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize rotation state from camera on first render
  useEffect(() => {
    if (!isInitialized && camera) {
      setRotation({
        x: camera.rotation.x,
        y: camera.rotation.y
      });
      setIsInitialized(true);
    }
  }, [camera, isInitialized]);

  // Handle touch events for movement joystick
  useEffect(() => {
    const moveJoystick = moveJoystickRef.current;
    if (!moveJoystick) return;

    const handleMoveStart = (e: TouchEvent) => {
      // Prevent default to avoid scrolling while touching the joystick
      e.preventDefault();

      const touch = e.touches[0];
      setMoveTouch({
        identifier: touch.identifier,
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY
      });
    };

    const handleMoveMove = (e: TouchEvent) => {
      if (!moveTouch) return;

      // Find the touch with the same identifier
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === moveTouch.identifier) {
          const touch = e.touches[i];
          setMoveTouch({
            ...moveTouch,
            currentX: touch.clientX,
            currentY: touch.clientY
          });
          break;
        }
      }
    };

    const handleMoveEnd = () => {
      setMoveTouch(null);
    };

    moveJoystick.addEventListener('touchstart', handleMoveStart, { passive: false });
    document.addEventListener('touchmove', handleMoveMove, { passive: true });
    document.addEventListener('touchend', handleMoveEnd);

    return () => {
      moveJoystick.removeEventListener('touchstart', handleMoveStart);
      document.removeEventListener('touchmove', handleMoveMove);
      document.removeEventListener('touchend', handleMoveEnd);
    };
  }, [moveTouch]);

  // Handle touch events for look joystick
  useEffect(() => {
    const lookJoystick = lookJoystickRef.current;
    if (!lookJoystick) return;

    const handleLookStart = (e: TouchEvent) => {
      // Prevent default to avoid scrolling while touching the joystick
      e.preventDefault();

      const touch = e.touches[0];
      setLookTouch({
        identifier: touch.identifier,
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY
      });
    };

    const handleLookMove = (e: TouchEvent) => {
      if (!lookTouch) return;

      // Find the touch with the same identifier
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === lookTouch.identifier) {
          const touch = e.touches[i];
          setLookTouch({
            ...lookTouch,
            currentX: touch.clientX,
            currentY: touch.clientY
          });
          break;
        }
      }
    };

    const handleLookEnd = () => {
      setLookTouch(null);
    };

    lookJoystick.addEventListener('touchstart', handleLookStart, { passive: false });
    document.addEventListener('touchmove', handleLookMove, { passive: true });
    document.addEventListener('touchend', handleLookEnd);

    return () => {
      lookJoystick.removeEventListener('touchstart', handleLookStart);
      document.removeEventListener('touchmove', handleLookMove);
      document.removeEventListener('touchend', handleLookEnd);
    };
  }, [lookTouch]);

  // Move camera based on movement joystick
  useEffect(() => {
    if (!moveTouch || isInteracting) return;

    const dx = moveTouch.currentX - moveTouch.startX;
    const dy = moveTouch.currentY - moveTouch.startY;

    // Calculate the direction vector
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);

    // Remove vertical component to keep movement on the xz plane
    forward.y = 0;
    right.y = 0;

    // Normalize to maintain consistent speed regardless of camera angle
    forward.normalize();
    right.normalize();

    // Scale by joystick displacement with added sensitivity for small movements
    const moveAmount = new THREE.Vector3()
      .addScaledVector(forward, -dy * moveSpeed)
      .addScaledVector(right, dx * moveSpeed);

    // Apply a minimum threshold for small movements
    if (moveAmount.length() > 0.001) {
      // Update camera position
      camera.position.add(moveAmount);
    }

  }, [moveTouch, camera, moveSpeed, isInteracting]);

  // Rotate camera based on look joystick
  useEffect(() => {
    if (!lookTouch || isInteracting) return;

    const dx = (lookTouch.currentX - lookTouch.startX) * lookSpeed;
    const dy = (lookTouch.currentY - lookTouch.startY) * lookSpeed;

    // Only update if there's a significant change
    if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
      // Update rotation state
      setRotation(prev => ({
        x: prev.x - dy * 0.01,
        y: prev.y - dx * 0.01
      }));
    }

  }, [lookTouch, lookSpeed, isInteracting]);

  // Apply rotation to camera
  useEffect(() => {
    if (isInteracting) return;

    // Apply rotation to camera with clamped values
    camera.rotation.x = THREE.MathUtils.clamp(
      rotation.x,
      -Math.PI / 2.5,  // Limit looking up (increased range)
      Math.PI / 2.5    // Limit looking down (increased range)
    );
    camera.rotation.y = rotation.y;

  }, [rotation, camera, isInteracting]);

  return (
    <>
      {/* Movement joystick - left bottom */}
      <div 
        ref={moveJoystickRef}
        className="mobile-joystick-area"
        style={{
          position: 'absolute',
          bottom: '40px',
          left: '40px',
          width: '140px', // Larger touch area
          height: '140px', // Larger touch area
          backgroundColor: 'rgba(0, 0, 0, 0.4)', // Slightly darker for better visibility
          borderRadius: '50%',
          border: '2px solid rgba(255, 255, 255, 0.5)', // More visible border
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          pointerEvents: 'auto',
          touchAction: 'none',
          zIndex: 1000 // Ensure controls are on top
        }}
      >
        <div 
          style={{
            color: 'white',
            fontSize: '24px', // Larger icon
            userSelect: 'none'
          }}
        >
          ⇄
        </div>
      </div>

      {/* Look joystick - right bottom */}
      <div 
        ref={lookJoystickRef}
        className="mobile-look-area"
        style={{
          position: 'absolute',
          bottom: '40px',
          right: '40px',
          width: '140px', // Larger touch area
          height: '140px', // Larger touch area
          backgroundColor: 'rgba(0, 0, 0, 0.4)', // Slightly darker for better visibility
          borderRadius: '50%',
          border: '2px solid rgba(255, 255, 255, 0.5)', // More visible border
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          pointerEvents: 'auto',
          touchAction: 'none',
          zIndex: 1000 // Ensure controls are on top
        }}
      >
        <div 
          style={{
            color: 'white',
            fontSize: '24px', // Larger icon
            userSelect: 'none'
          }}
        >
          👀
        </div>
      </div>
    </>
  );
}