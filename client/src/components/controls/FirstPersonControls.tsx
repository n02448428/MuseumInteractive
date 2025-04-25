import { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePortfolio } from '../../lib/stores/usePortfolio';
import { Controls } from '../../App';

// Movement settings
const MOVE_SPEED = 0.15; // Increased for faster movement
const ROTATION_SPEED = 0.01; // Further reduced for more controlled turning

// Define keyboard state interface
interface KeyState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  interact: boolean;
  jump: boolean;
}

export default function FirstPersonControls() {
  // Get direct access to the Three.js camera
  const { camera } = useThree();
  
  // Track if the right mouse button is being held
  const [rightMouseHeld, setRightMouseHeld] = useState(false);
  // Track temporary rotation while right mouse is pressed
  const tempRotationX = useRef(0);
  const tempRotationY = useRef(0);
  
  // Custom keyboard state implementation
  const [keyState, setKeyState] = useState<KeyState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    interact: false,
    jump: false,
  });
  
  // Refs for rotation and position tracking
  const rotationY = useRef(0);
  const movementVector = useRef(new THREE.Vector3());
  
  // Get camera state from our state management
  const { 
    updateCameraPosition, 
    updateCameraLookAt, 
    path, 
    updatePathProgress, 
    clearPath,
    setCameraMoving,
    setNavigationPath,
    setTargetPosition,
    interaction: { isInteracting },
    camera: { position, moving }
  } = usePortfolio();
  
  // Prevent context menu on right-click
  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };
    
    window.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);
  
  // Handle right mouse button for looking around
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 2) { // Right mouse button
        console.log("Right mouse button DOWN");
        setRightMouseHeld(true);
        // Reset temporary rotations
        tempRotationX.current = 0;
        tempRotationY.current = 0;
      }
    };
    
    const handleMouseUp = (event: MouseEvent) => {
      if (event.button === 2) { // Right mouse button released
        console.log("Right mouse button UP");
        setRightMouseHeld(false);
        
        // Update the main rotation with our temporary rotation
        rotationY.current += tempRotationY.current;
        
        // Reset temp rotations
        tempRotationX.current = 0;
        tempRotationY.current = 0;
        
        // Return to normal plane view (remove vertical rotation)
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationY.current);
        forward.normalize();
        
        const currentPos = camera.position.clone();
        const targetPos = currentPos.clone().add(forward);
        
        camera.lookAt(targetPos);
        updateCameraLookAt([targetPos.x, targetPos.y, targetPos.z]);
      }
    };
    
    const handleMouseMove = (event: MouseEvent) => {
      if (!rightMouseHeld || isInteracting) return;
      
      // Update the temporary rotation based on mouse movement
      tempRotationX.current -= event.movementY * ROTATION_SPEED * 0.7; // Vertical look (limited)
      tempRotationY.current -= event.movementX * ROTATION_SPEED * 1.5;  // Horizontal look
      
      // Limit vertical looking to prevent flipping
      tempRotationX.current = Math.max(-Math.PI/3, Math.min(Math.PI/3, tempRotationX.current));
      
      // Apply the rotation to the camera
      const forward = new THREE.Vector3(0, 0, -1);
      
      // First apply the total horizontal rotation (base + temp)
      forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationY.current + tempRotationY.current);
      
      // Then apply the vertical rotation
      const right = new THREE.Vector3(1, 0, 0);
      right.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationY.current + tempRotationY.current);
      forward.applyAxisAngle(right, tempRotationX.current);
      
      forward.normalize();
      
      // Update the camera look direction
      const currentPos = camera.position.clone();
      const targetPos = currentPos.clone().add(forward);
      
      camera.lookAt(targetPos);
      updateCameraLookAt([targetPos.x, targetPos.y, targetPos.z]);
    };
    
    // Add event listeners
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [camera, rightMouseHeld, isInteracting, updateCameraLookAt]);
  
  // Handle autonomous path following - simplified for direct camera control
  const followPath = () => {
    if (!path.active || path.points.length === 0) return false;
    
    const currentPos = new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z);
    const targetPoint = path.points[path.currentPoint];
    const targetPos = new THREE.Vector3(targetPoint[0], targetPoint[1], targetPoint[2]);
    const distance = currentPos.distanceTo(targetPos);
    
    if (distance < 0.2) {
      // Reached current point in path
      if (path.currentPoint === path.points.length - 1) {
        // Reached end of path
        clearPath();
        setCameraMoving(false);
        return false;
      } else {
        // Move to next point
        updatePathProgress(path.currentPoint + 1);
      }
    }
    
    // Calculate direction to target
    const directionVector = new THREE.Vector3()
      .subVectors(targetPos, currentPos)
      .normalize();
    
    // Move directly towards target at a constant speed
    const movement = directionVector.multiplyScalar(MOVE_SPEED);
    
    // Move camera directly
    camera.position.x += movement.x;
    camera.position.y += movement.y;
    camera.position.z += movement.z;
    
    // Make camera look at target
    camera.lookAt(targetPos);
    
    // Keep store in sync with camera
    updateCameraPosition([camera.position.x, camera.position.y, camera.position.z]);
    updateCameraLookAt([targetPos.x, targetPos.y, targetPos.z]);
    
    return true;
  };

  // Set up keyboard listeners - simplified to only update state, no direct movement
  useEffect(() => {
    // Log current keyState periodically but less often
    const logKeyState = () => {
      console.log("Current keyboard state:", keyState);
    };
    const interval = setInterval(logKeyState, 5000);
    
    // Simple keyDown handler that only updates state
    const handleKeyDown = (e: KeyboardEvent) => {
      // Process direction controls
      switch(e.code) {
        case 'KeyW':
        case 'ArrowUp':
          e.preventDefault();
          setKeyState(state => ({ ...state, forward: true }));
          console.log("Key set: forward = true");
          break;
          
        case 'KeyS':
        case 'ArrowDown':
          e.preventDefault();
          setKeyState(state => ({ ...state, backward: true }));
          console.log("Key set: backward = true");
          break;
          
        case 'KeyA':
        case 'ArrowLeft':
          e.preventDefault();
          setKeyState(state => ({ ...state, left: true }));
          console.log("Key set: left = true");
          break;
          
        case 'KeyD':
        case 'ArrowRight':
          e.preventDefault();
          setKeyState(state => ({ ...state, right: true }));
          console.log("Key set: right = true");
          break;
          
        case 'KeyE':
          e.preventDefault();
          setKeyState(state => ({ ...state, interact: true }));
          break;
          
        case 'Space':
          e.preventDefault();
          setKeyState(state => ({ ...state, jump: true }));
          break;
      }
    };
    
    // Simple keyUp handler
    const handleKeyUp = (e: KeyboardEvent) => {
      switch(e.code) {
        case 'KeyW':
        case 'ArrowUp':
          e.preventDefault();
          setKeyState(state => ({ ...state, forward: false }));
          console.log("Key set: forward = false");
          break;
          
        case 'KeyS':
        case 'ArrowDown':
          e.preventDefault();
          setKeyState(state => ({ ...state, backward: false }));
          console.log("Key set: backward = false");
          break;
          
        case 'KeyA':
        case 'ArrowLeft':
          e.preventDefault();
          setKeyState(state => ({ ...state, left: false }));
          console.log("Key set: left = false");
          break;
          
        case 'KeyD':
        case 'ArrowRight':
          e.preventDefault();
          setKeyState(state => ({ ...state, right: false }));
          console.log("Key set: right = false");
          break;
          
        case 'KeyE':
          e.preventDefault();
          setKeyState(state => ({ ...state, interact: false }));
          break;
          
        case 'Space':
          e.preventDefault();
          setKeyState(state => ({ ...state, jump: false }));
          break;
      }
    };
    
    // Focus on the canvas to ensure it receives keyboard events
    const focusCanvas = () => {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        canvas.focus();
        console.log("Canvas focused for keyboard input");
      }
    };
    
    // Add event listeners to the document
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('click', focusCanvas);
    
    // Focus the canvas initially
    setTimeout(focusCanvas, 100);
    
    // Remove event listeners on cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('click', focusCanvas);
      clearInterval(interval);
    };
  }, []);
  
  // Main update loop - enhanced with contextual movement behavior
  useFrame(() => {
    // If we're following a path, prioritize that movement
    if (path.active) {
      followPath();
      return;
    }
    
    // Otherwise, handle manual keyboard controls
    if (isInteracting) return; // Disable movement during interactions
    
    // Use our custom keyState for simplified movement
    const moveForward = keyState.forward;
    const moveBackward = keyState.backward;
    const leftKey = keyState.left;
    const rightKey = keyState.right;
    
    // Calculate the base vectors
    const forwardVector = new THREE.Vector3(0, 0, -1);
    forwardVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationY.current);
    forwardVector.normalize();
    
    // Calculate perpendicular right vector
    const rightVector = new THREE.Vector3(1, 0, 0);
    rightVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationY.current);
    rightVector.normalize();
    
    // Initialize movement direction vector
    const moveDir = new THREE.Vector3(0, 0, 0);
    
    // Movement behavior depends on right mouse button state
    if (rightMouseHeld) {
      // RIGHT MOUSE HELD: Left/right keys strafe instead of turn
      if (leftKey) {
        moveDir.sub(rightVector); // Strafe left
        console.log("Strafing left");
      }
      
      if (rightKey) {
        moveDir.add(rightVector); // Strafe right
        console.log("Strafing right");
      }
    } else {
      // NORMAL MODE: Left/right keys rotate camera
      if (leftKey || rightKey) {
        // Calculate rotation amount
        const rotationAmount = ROTATION_SPEED * 3;
        
        // Update rotation based on key press
        if (leftKey) {
          rotationY.current += rotationAmount;
          console.log("Turning left, rotation:", rotationY.current);
        }
        if (rightKey) {
          rotationY.current -= rotationAmount;
          console.log("Turning right, rotation:", rotationY.current);
        }
        
        // Update forward vector after rotation
        forwardVector.set(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationY.current);
        
        // Update camera look direction
        const currentPos = camera.position.clone();
        const targetPos = currentPos.clone().add(forwardVector);
        
        // Update camera directly
        camera.lookAt(targetPos);
        updateCameraLookAt([targetPos.x, targetPos.y, targetPos.z]);
      }
    }
    
    // Handle forward/backward movement (same in both modes)
    if (moveForward) moveDir.add(forwardVector);
    if (moveBackward) moveDir.sub(forwardVector);
    
    // Apply movement if we have any
    if (moveDir.length() > 0) {
      moveDir.normalize().multiplyScalar(MOVE_SPEED);
      
      // Move camera directly (only X and Z, keeping Y constant)
      camera.position.x += moveDir.x;
      camera.position.z += moveDir.z;
      
      // Log what's happening
      console.log("Moving camera:", moveDir);
    }
    
    // Basic collision detection with gallery bounds
    const minX = -25, maxX = 25;
    const minZ = -25, maxZ = 25;
    
    // Clamp position within bounds
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, minX, maxX);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, minZ, maxZ);
    
    // Keep store in sync with camera
    updateCameraPosition([camera.position.x, camera.position.y, camera.position.z]);
    
    // Always update the camera look direction to ensure it's consistent
    // But only if we're not in right-mouse-button mode which handles its own look updates
    if (!rightMouseHeld) {
      const lookTarget = camera.position.clone().add(forwardVector);
      camera.lookAt(lookTarget);
    }
  });

  return null;
}