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
      if (document.pointerLockElement) {
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
    
    const handleMouseDown = () => {
      if (!document.pointerLockElement) {
        document.body.requestPointerLock();
      }
    };
    
    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    
    // Remove event listeners on cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [isInteracting, position, updateCameraLookAt]);
  
  // Handle autonomous path following
  const followPath = (delta: number) => {
    if (!path.active || path.points.length === 0) return false;
    
    const currentPos = new THREE.Vector3(...position);
    const targetPos = new THREE.Vector3(...path.points[path.currentPoint]);
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
    const newPos = new THREE.Vector3(...position).add(movement);
    updateCameraPosition([newPos.x, newPos.y, newPos.z]);
    
    // Update camera look direction to face movement direction
    const lookAtPoint = new THREE.Vector3(...targetPos);
    updateCameraLookAt([lookAtPoint.x, lookAtPoint.y, lookAtPoint.z]);
    
    return true;
  };

  // Main update loop
  useFrame((_, delta) => {
    // If we're following a path, prioritize that movement
    if (followPath(delta)) return;
    
    // Otherwise, handle manual keyboard controls
    if (isInteracting) return; // Disable movement during interactions
    
    const { forward, backward, left, right } = getKeyboardState();
    
    if (!(forward || backward || left || right)) {
      setCameraMoving(false);
      return;
    }
    
    setCameraMoving(true);
    
    // Calculate movement direction
    const moveZ = Number(forward) - Number(backward);
    const moveX = Number(right) - Number(left);
    
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
      const currentPos = new THREE.Vector3(...position);
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
