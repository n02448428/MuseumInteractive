import { useEffect, useRef, Suspense } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Environment, useDetectGPU } from '@react-three/drei';
import FirstPersonControls from '../controls/FirstPersonControls';
import MobileControls from '../controls/MobileControls';
import ExhibitObject from './ExhibitObject';
import ProjectDetails from './ProjectDetails';
import ExhibitDescription from './ExhibitDescription';
import GalleryText from '../ui/GalleryText';
import WallCredit from './WallCredit';
import ProjectLoader from './ProjectLoader';
import { usePortfolio } from '../../lib/stores/usePortfolio';
import { useIsMobile } from '../../hooks/use-is-mobile';

export default function Gallery() {
  const isMobile = useIsMobile();
  const { setIsMobile } = usePortfolio();
  const { camera } = useThree();
  const floorGroup = useRef<THREE.Group>(null);
  const wallsGroup = useRef<THREE.Group>(null);
  const exhibits = usePortfolio((state) => state.exhibits);
  const gpu = useDetectGPU();
  
  // Set mobile state
  useEffect(() => {
    setIsMobile(isMobile);
    console.log("Device is mobile:", isMobile);
  }, [isMobile, setIsMobile]);
  
  // One-time camera initialization - all subsequent camera control is done in the FirstPersonControls component
  useEffect(() => {
    // Initial camera setup - positioned to view the semicircle of exhibits
    camera.position.set(0, 1.8, 0); // Positioned at the center of the gallery
    camera.rotation.set(0, 0, 0); // Looking toward the exhibits
    camera.lookAt(new THREE.Vector3(0, 1.8, -10)); // Look toward the exhibits
    
    console.log("Camera initialized at:", camera.position);
  }, [camera]);
  
  // Create gallery dimensions
  const GALLERY_WIDTH = 50;
  const GALLERY_LENGTH = 50;
  const WALL_HEIGHT = 5;
  
  // Calculate lighting with proper type
  const lightPositions: [number, number, number][] = [
    [-15, WALL_HEIGHT - 1, -15],
    [15, WALL_HEIGHT - 1, -15],
    [-15, WALL_HEIGHT - 1, 15],
    [15, WALL_HEIGHT - 1, 15],
    [0, WALL_HEIGHT - 1, 0],
  ];
  
  // Quality settings based on GPU performance
  const qualitySettings = {
    shadows: gpu?.tier ? gpu.tier > 1 : false,
    lightIntensity: gpu?.tier ? (gpu.tier > 1 ? 0.8 : 0.5) : 0.5,
    ambientIntensity: gpu?.tier ? (gpu.tier > 1 ? 0.4 : 0.6) : 0.6,
  };
  
  return (
    <>
      {/* World environment and lighting */}
      <Environment preset="apartment" background={false} />
      <ambientLight intensity={qualitySettings.ambientIntensity} />
      
      {/* Gallery lights */}
      {lightPositions.map((pos, i) => (
        <group key={`light-${i}`}>
          <pointLight 
            position={[pos[0], pos[1], pos[2]]} 
            intensity={qualitySettings.lightIntensity}
            castShadow={qualitySettings.shadows} 
            shadow-mapSize={[1024, 1024]}
            shadow-bias={-0.001}
          />
          <mesh position={[pos[0], pos[1] + 0.05, pos[2]]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshBasicMaterial color="#ffffe0" />
          </mesh>
        </group>
      ))}
      
      {/* Gallery floor */}
      <group ref={floorGroup}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[GALLERY_WIDTH, GALLERY_LENGTH]} />
          <meshStandardMaterial 
            color="#ffffff"
            roughness={0.7}
            metalness={0.2}
          />
        </mesh>
      </group>
      
      {/* Gallery walls */}
      <group ref={wallsGroup}>
        {/* Back wall */}
        <mesh position={[0, WALL_HEIGHT / 2, -GALLERY_LENGTH / 2]} receiveShadow>
          <boxGeometry args={[GALLERY_WIDTH, WALL_HEIGHT, 0.2]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        
        {/* Front wall */}
        <mesh position={[0, WALL_HEIGHT / 2, GALLERY_LENGTH / 2]} receiveShadow>
          <boxGeometry args={[GALLERY_WIDTH, WALL_HEIGHT, 0.2]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        
        {/* Left wall */}
        <mesh position={[-GALLERY_WIDTH / 2, WALL_HEIGHT / 2, 0]} receiveShadow>
          <boxGeometry args={[0.2, WALL_HEIGHT, GALLERY_LENGTH]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        
        {/* Right wall */}
        <mesh position={[GALLERY_WIDTH / 2, WALL_HEIGHT / 2, 0]} receiveShadow>
          <boxGeometry args={[0.2, WALL_HEIGHT, GALLERY_LENGTH]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        
        {/* Ceiling */}
        <mesh position={[0, WALL_HEIGHT, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[GALLERY_WIDTH, GALLERY_LENGTH]} />
          <meshStandardMaterial color="#ffffff" side={THREE.DoubleSide} />
        </mesh>
      </group>
      
      {/* Exhibit objects */}
      <Suspense fallback={null}>
        {exhibits.map((exhibit) => (
          <ExhibitObject key={exhibit.id} exhibit={exhibit} />
        ))}
        
        {/* Gallery title texts */}
        <GalleryText />
        
        {/* Wall credit with link */}
        <WallCredit />
      </Suspense>
      
      {/* Controls */}
      <FirstPersonControls />
      <MobileControls />
      
      {/* Load project data */}
      <ProjectLoader />
    </>
  );
}
