import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { usePortfolio } from '../../lib/stores/usePortfolio';
import { Controls } from '../../App';

const MOVE_SPEED = 5;
const LOOK_SPEED = 2;
const COLLISION_DISTANCE = 0.5;

export default function FirstPersonControls() {
  const { camera } = useThree();
  const [, getKeyboardState] = useKeyboardControls<Controls>();
  
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

  // Log key states for debugging
  useEffect(() => {
    const logKeyState = () => {
      const state = getKeyboardState();
      console.log("Keyboard state:", state);
    };
    
    // Log initial state and set up interval
    logKeyState();
    const interval = setInterval(logKeyState, 2000);
    
    // Cleanup
    return () => clearInterval(interval);
  }, [getKeyboardState]);
  
  // Set up keyboard listeners to supplement default controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log("Key pressed:", e.code);
      
      // Handle WASD and arrow keys directly
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          // Move forward
          break;
        case 'KeyS':
        case 'ArrowDown':
          // Move backward
          break;
        case 'KeyA':
        case 'ArrowLeft':
          // Move left
          break;
        case 'KeyD':
        case 'ArrowRight':
          // Move right
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  // Main update loop
  useFrame((_, delta) => {
    // If we're following a path, prioritize that movement
    if (followPath(delta)) return;
    
    // Otherwise, handle manual keyboard controls
    if (isInteracting) return; // Disable movement during interactions
    
    const state = getKeyboardState();
    console.log("Frame keyboard state:", state);
    
    const moveForward = state.forward;
    const moveBackward = state.backward;
    const moveLeft = state.left;
    const moveRight = state.right;
    
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
