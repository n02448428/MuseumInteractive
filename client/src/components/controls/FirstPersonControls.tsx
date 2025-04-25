import { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePortfolio } from '../../lib/stores/usePortfolio';
import { Controls } from '../../App';

const MOVE_SPEED = 5;
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
  
  // Handle autonomous path following
  const followPath = (delta: number) => {
    if (!path.active || path.points.length === 0) return false;
    
    const currentPos = new THREE.Vector3(position[0], position[1], position[2]);
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
    
    // Move towards target
    const stepSize = MOVE_SPEED * delta;
    const movement = direction.multiplyScalar(Math.min(stepSize, distance));
    
    // Update camera position
    const newPos = new THREE.Vector3(position[0], position[1], position[2]).add(movement);
    updateCameraPosition([newPos.x, newPos.y, newPos.z]);
    
    // Update camera look direction to face movement direction
    const lookAt: [number, number, number] = [targetPos.x, targetPos.y, targetPos.z];
    updateCameraLookAt(lookAt);
    
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
          
          const newPos = new THREE.Vector3(position[0], position[1], position[2]).add(forward);
          updateCameraPosition([newPos.x, position[1], newPos.z]);
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
          
          const newPos = new THREE.Vector3(position[0], position[1], position[2]).add(backward);
          updateCameraPosition([newPos.x, position[1], newPos.z]);
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
          
          const newPos = new THREE.Vector3(position[0], position[1], position[2]).add(left);
          updateCameraPosition([newPos.x, position[1], newPos.z]);
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
          
          const newPos = new THREE.Vector3(position[0], position[1], position[2]).add(right);
          updateCameraPosition([newPos.x, position[1], newPos.z]);
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
  
  // Main update loop
  useFrame((_, delta) => {
    // If we're following a path, prioritize that movement
    if (followPath(delta)) return;
    
    // Otherwise, handle manual keyboard controls
    if (isInteracting) return; // Disable movement during interactions
    
    // Use our custom keyState instead of the drei keyboard controls
    
    const moveForward = keyState.forward;
    const moveBackward = keyState.backward;
    const moveLeft = keyState.left;
    const moveRight = keyState.right;
    
    if (!(moveForward || moveBackward || moveLeft || moveRight)) {
      setCameraMoving(false);
      return;
    }
    
    setCameraMoving(true);
    
    // Calculate movement direction
    const moveZ = Number(moveForward) - Number(moveBackward);
    const moveX = Number(moveRight) - Number(moveLeft);
    
    // Get forward and right vectors from camera
    const forward3 = new THREE.Vector3(0, 0, -1);
    forward3.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationY.current);
    
    const right3 = new THREE.Vector3(1, 0, 0);
    right3.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationY.current);
    
    // Calculate movement vector
    movementVector.current.set(0, 0, 0);
    
    if (moveZ) {
      movementVector.current.addScaledVector(forward3, moveZ);
    }
    
    if (moveX) {
      movementVector.current.addScaledVector(right3, moveX);
    }
    
    // Normalize and apply speed
    if (movementVector.current.length() > 0) {
      movementVector.current.normalize().multiplyScalar(MOVE_SPEED * delta);
      
      // Apply movement
      const currentPos = new THREE.Vector3(position[0], position[1], position[2]);
      currentPos.add(movementVector.current);
      
      // Basic collision detection with walls and bounds
      const minX = -25, maxX = 25;
      const minZ = -25, maxZ = 25;
      
      // Clamp position within bounds
      currentPos.x = THREE.MathUtils.clamp(currentPos.x, minX, maxX);
      currentPos.z = THREE.MathUtils.clamp(currentPos.z, minZ, maxZ);
      
      // Update position in store
      updateCameraPosition([currentPos.x, position[1], currentPos.z]);
    }
  });

  return null;
}
