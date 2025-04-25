import { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePortfolio } from '../../lib/stores/usePortfolio';
import { Controls } from '../../App';

// Movement settings
const MOVE_SPEED = 0.15; // Increased for faster movement
const ROTATION_SPEED = 0.01; // Further reduced for more controlled turning
const LOOK_SPEED = 2.0;

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
    interaction: { isInteracting },
    camera: { position, moving }
  } = usePortfolio();
  
  // Handle mouse movements for looking around - completely simplified for stability
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Only track rotation if we're not interacting with UI and right mouse button is pressed
      if (isInteracting || event.buttons !== 2) return;
      
      // Update our rotation tracking variable 
      rotationY.current -= event.movementX * ROTATION_SPEED;
      
      // Update the camera's rotation directly
      const forward = new THREE.Vector3(0, 0, -1);
      forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationY.current);
      forward.normalize();
      
      // Calculate new look-at point (1 unit in front of camera)
      const currentPos = camera.position.clone();
      const targetPos = currentPos.clone().add(forward);
      
      // Update both the camera and our state
      camera.lookAt(targetPos);
      updateCameraLookAt([targetPos.x, targetPos.y, targetPos.z]);
      
      console.log("Camera rotated: ", rotationY.current);
    };
    
    // Prevent context menu on right-click
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };
    
    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('contextmenu', handleContextMenu);
    
    // Remove event listeners on cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isInteracting, camera, updateCameraLookAt]);
  
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
    const direction = new THREE.Vector3()
      .subVectors(targetPos, currentPos)
      .normalize();
    
    // Move directly towards target at a constant speed
    const movement = direction.multiplyScalar(MOVE_SPEED);
    
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
  
  // Main update loop - simplified for stability with turning functionality
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
    const turnLeft = keyState.left;  // Now used for rotation
    const turnRight = keyState.right; // Now used for rotation
    
    // First handle turning/rotation with left and right keys
    if (turnLeft || turnRight) {
      // Calculate rotation amount - using a higher multiplier for keyboard turning
      const rotationAmount = ROTATION_SPEED * 3; // Increased multiplier for keyboard turning
      
      // Update rotation based on key press
      if (turnLeft) {
        rotationY.current += rotationAmount;
        console.log("Turning left, rotation:", rotationY.current);
      }
      if (turnRight) {
        rotationY.current -= rotationAmount;
        console.log("Turning right, rotation:", rotationY.current);
      }
      
      // Update forward vector after rotation
      const forward = new THREE.Vector3(0, 0, -1);
      forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationY.current);
      
      // Update camera look direction
      const currentPos = camera.position.clone();
      const targetPos = currentPos.clone().add(forward);
      
      // Update camera directly
      camera.lookAt(targetPos);
      updateCameraLookAt([targetPos.x, targetPos.y, targetPos.z]);
    }
    
    // Then handle forward/backward movement
    if (moveForward || moveBackward) {
      // Calculate the movement direction vector
      const moveDir = new THREE.Vector3(0, 0, 0);
      
      // Calculate the forward vector based on camera rotation
      const forward = new THREE.Vector3(0, 0, -1);
      forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationY.current);
      
      // Add movement in forward/backward direction
      if (moveForward) moveDir.add(forward);
      if (moveBackward) moveDir.sub(forward);
      
      // Normalize and apply speed if we have movement
      if (moveDir.length() > 0) {
        moveDir.normalize().multiplyScalar(MOVE_SPEED);
        
        // Move camera directly (only X and Z, keeping Y constant)
        camera.position.x += moveDir.x;
        camera.position.z += moveDir.z;
        
        // Log what's happening
        console.log("Moving camera:", moveDir);
      }
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
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationY.current);
    const lookTarget = camera.position.clone().add(forward);
    camera.lookAt(lookTarget);
  });

  return null;
}
