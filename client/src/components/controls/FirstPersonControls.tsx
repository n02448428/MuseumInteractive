import { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePortfolio } from '../../lib/stores/usePortfolio';
import { Controls } from '../../App';

const MOVE_SPEED = 0.15;
const LOOK_SPEED = 2;
const COLLISION_DISTANCE = 0.5;

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
  
  // Handle mouse movements for looking around
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (isInteracting) return; // Disable camera rotation during interactions
      
      // Only update camera direction if right mouse button is pressed
      if (event.buttons === 2) {
        rotationY.current -= event.movementX * 0.002 * LOOK_SPEED;
        
        // Update camera direction based on mouse movement
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationY.current);
        
        const target = new THREE.Vector3().addVectors(
          new THREE.Vector3(...position),
          forward
        );
        
        updateCameraLookAt([target.x, target.y, target.z]);
      }
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
  }, [isInteracting, position, updateCameraLookAt]);
  
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

  // Set up keyboard listeners for manual key handling
  useEffect(() => {
    // Log current keyState periodically but less often
    const logKeyState = () => {
      console.log("Current keyboard state:", keyState);
    };
    const interval = setInterval(logKeyState, 5000);
    
    // Define keyDown handler with direct movement implementation
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't prevent default for all keys to allow browser navigation
      
      console.log("Key pressed:", e.code);
      
      // Handle directional keys
      if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        e.preventDefault();
        setKeyState(state => ({ ...state, forward: true }));
        
        // Apply direct movement to show immediate feedback
        if (!isInteracting) {
          const forward = new THREE.Vector3(0, 0, -1);
          forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationY.current);
          forward.normalize().multiplyScalar(0.1);
          
          // 1. Update our position in state
          const newPos = new THREE.Vector3(position[0], position[1], position[2]).add(forward);
          updateCameraPosition([newPos.x, position[1], newPos.z]);
          
          // 2. Directly move the actual Three.js camera
          camera.position.x += forward.x;
          camera.position.z += forward.z;
          
          console.log("Direct camera move: forward");
        }
      }
      
      if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        e.preventDefault();
        setKeyState(state => ({ ...state, backward: true }));
        
        // Apply direct movement
        if (!isInteracting) {
          const backward = new THREE.Vector3(0, 0, 1);
          backward.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationY.current);
          backward.normalize().multiplyScalar(0.1);
          
          // 1. Update state
          const newPos = new THREE.Vector3(position[0], position[1], position[2]).add(backward);
          updateCameraPosition([newPos.x, position[1], newPos.z]);
          
          // 2. Directly move the actual Three.js camera
          camera.position.x += backward.x;
          camera.position.z += backward.z;
          
          console.log("Direct camera move: backward");
        }
      }
      
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        e.preventDefault();
        setKeyState(state => ({ ...state, left: true }));
        
        // Apply direct movement
        if (!isInteracting) {
          const left = new THREE.Vector3(-1, 0, 0);
          left.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationY.current);
          left.normalize().multiplyScalar(0.1);
          
          // 1. Update state
          const newPos = new THREE.Vector3(position[0], position[1], position[2]).add(left);
          updateCameraPosition([newPos.x, position[1], newPos.z]);
          
          // 2. Directly move the actual Three.js camera
          camera.position.x += left.x;
          camera.position.z += left.z;
          
          console.log("Direct camera move: left");
        }
      }
      
      if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        e.preventDefault();
        setKeyState(state => ({ ...state, right: true }));
        
        // Apply direct movement
        if (!isInteracting) {
          const right = new THREE.Vector3(1, 0, 0);
          right.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationY.current);
          right.normalize().multiplyScalar(0.1);
          
          // 1. Update state
          const newPos = new THREE.Vector3(position[0], position[1], position[2]).add(right);
          updateCameraPosition([newPos.x, position[1], newPos.z]);
          
          // 2. Directly move the actual Three.js camera
          camera.position.x += right.x;
          camera.position.z += right.z;
          
          console.log("Direct camera move: right");
        }
      }
      
      if (e.code === 'KeyE') {
        e.preventDefault();
        setKeyState(state => ({ ...state, interact: true }));
      }
      
      if (e.code === 'Space') {
        e.preventDefault();
        setKeyState(state => ({ ...state, jump: true }));
      }
    };
    
    // Define keyUp handler
    const handleKeyUp = (e: KeyboardEvent) => {
      // Only prevent default for the keys we care about
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyE', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      
      console.log("Key released:", e.code);
      
      // Update key state based on released key
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          setKeyState(state => ({ ...state, forward: false }));
          break;
        case 'KeyS':
        case 'ArrowDown':
          setKeyState(state => ({ ...state, backward: false }));
          break;
        case 'KeyA':
        case 'ArrowLeft':
          setKeyState(state => ({ ...state, left: false }));
          break;
        case 'KeyD':
        case 'ArrowRight':
          setKeyState(state => ({ ...state, right: false }));
          break;
        case 'KeyE':
          setKeyState(state => ({ ...state, interact: false }));
          break;
        case 'Space':
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
  }, [isInteracting, position, rotationY, updateCameraPosition]);
  
  // Main update loop - much more direct implementation
  useFrame(() => {
    // If we're following a path, prioritize that movement
    if (path.active) {
      followPath();
      return;
    }
    
    // Otherwise, handle manual keyboard controls
    if (isInteracting) return; // Disable movement during interactions
    
    // Use our custom keyState for simplified direct movement
    const moveForward = keyState.forward;
    const moveBackward = keyState.backward;
    const moveLeft = keyState.left;
    const moveRight = keyState.right;
    
    if (!(moveForward || moveBackward || moveLeft || moveRight)) {
      return;
    }
    
    // Direct camera movement
    if (moveForward) {
      const forward = new THREE.Vector3(0, 0, -1);
      forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationY.current);
      forward.normalize().multiplyScalar(MOVE_SPEED);
      
      // Move camera directly
      camera.position.x += forward.x;
      camera.position.z += forward.z;
      
      // Keep store in sync with camera
      updateCameraPosition([camera.position.x, camera.position.y, camera.position.z]);
    }
    
    if (moveBackward) {
      const backward = new THREE.Vector3(0, 0, 1);
      backward.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationY.current);
      backward.normalize().multiplyScalar(MOVE_SPEED);
      
      // Move camera directly
      camera.position.x += backward.x;
      camera.position.z += backward.z;
      
      // Keep store in sync with camera
      updateCameraPosition([camera.position.x, camera.position.y, camera.position.z]);
    }
    
    if (moveLeft) {
      const left = new THREE.Vector3(-1, 0, 0);
      left.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationY.current);
      left.normalize().multiplyScalar(MOVE_SPEED);
      
      // Move camera directly
      camera.position.x += left.x;
      camera.position.z += left.z;
      
      // Keep store in sync with camera
      updateCameraPosition([camera.position.x, camera.position.y, camera.position.z]);
    }
    
    if (moveRight) {
      const right = new THREE.Vector3(1, 0, 0);
      right.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationY.current);
      right.normalize().multiplyScalar(MOVE_SPEED);
      
      // Move camera directly
      camera.position.x += right.x;
      camera.position.z += right.z;
      
      // Keep store in sync with camera
      updateCameraPosition([camera.position.x, camera.position.y, camera.position.z]);
    }
    
    // Basic collision detection with gallery bounds
    const minX = -25, maxX = 25;
    const minZ = -25, maxZ = 25;
    
    // Clamp position within bounds
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, minX, maxX);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, minZ, maxZ);
    
    // Ensure store is in sync with camera's final position after clamping
    updateCameraPosition([camera.position.x, camera.position.y, camera.position.z]);
  });

  return null;
}
