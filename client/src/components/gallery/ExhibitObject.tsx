import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Text, useGLTF, Html } from '@react-three/drei';
import { gsap } from 'gsap';
import { Exhibit, ProjectCategory } from '../../lib/types';
import { usePortfolio } from '../../lib/stores/usePortfolio';
import { useAudio } from '../../lib/stores/useAudio';

// Props interface
interface ExhibitObjectProps {
  exhibit: Exhibit;
}

// Floating animation parameters
const FLOAT_HEIGHT = 0.1;
const FLOAT_SPEED = 1;

// Object colors by category
const CATEGORY_COLORS = {
  [ProjectCategory.MUSIC]: '#ff6b6b',
  [ProjectCategory.POETRY]: '#f4a261',
  [ProjectCategory.ART]: '#48cae4',
  [ProjectCategory.TECH]: '#4361ee',
  [ProjectCategory.SOCIAL]: '#9d4edd',
};

export default function ExhibitObject({ exhibit }: ExhibitObjectProps) {
  const objectRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [hoveredOnce, setHoveredOnce] = useState(false);
  const { camera, scene } = useThree();
  const { playHit } = useAudio();
  
  // Portfolio state
  const { 
    selectExhibit, 
    selectProject, 
    setInteracting,
    setTargetPosition, 
    setNavigationPath,
    getProjectsByCategory,
    setShowProjectDetails,
    interaction: { currentExhibit },
  } = usePortfolio();
  
  // Get first project of this category to preview
  const projects = useMemo(
    () => getProjectsByCategory(exhibit.category),
    [exhibit.category, getProjectsByCategory]
  );
  
  // Create floating animation 
  useEffect(() => {
    if (objectRef.current) {
      const initialY = objectRef.current.position.y;
      
      // Create floating animation
      gsap.to(objectRef.current.position, {
        y: initialY + FLOAT_HEIGHT,
        duration: FLOAT_SPEED,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      
      // Add slight rotation
      gsap.to(objectRef.current.rotation, {
        y: objectRef.current.rotation.y + 0.2,
        duration: FLOAT_SPEED * 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }
  }, []);
  
  // Highlight effect when hovered
  useEffect(() => {
    if (objectRef.current) {
      gsap.to(objectRef.current.scale, {
        x: hovered ? 1.1 : 1,
        y: hovered ? 1.1 : 1,
        z: hovered ? 1.1 : 1,
        duration: 0.3,
        ease: "power2.out"
      });
    }
    
    // Play sound on first hover
    if (hovered && !hoveredOnce) {
      playHit();
      setHoveredOnce(true);
    }
  }, [hovered, hoveredOnce, playHit]);
  
  // Generate a set of points for the path to the object
  const generatePathToObject = () => {
    const startPos = [
      camera.position.x,
      camera.position.y,
      camera.position.z
    ] as [number, number, number];
    
    // Get direction to object
    const direction = new THREE.Vector3()
      .subVectors(
        new THREE.Vector3(exhibit.position[0], 0, exhibit.position[2]),
        new THREE.Vector3(startPos[0], 0, startPos[2])
      )
      .normalize();
    
    // Calculate path point 2 meters away from the object along the direction
    const viewDistance = 2;
    const targetPos = new THREE.Vector3(
      exhibit.position[0] - direction.x * viewDistance,
      camera.position.y,
      exhibit.position[2] - direction.z * viewDistance
    );
    
    // Use simple direct path with a midpoint to avoid direct straight line
    const midpoint = new THREE.Vector3()
      .addVectors(
        new THREE.Vector3(...startPos),
        targetPos
      )
      .multiplyScalar(0.5);
    
    // Add slight offset to midpoint for more natural path
    midpoint.x += (Math.random() - 0.5) * 2;
    midpoint.z += (Math.random() - 0.5) * 2;
    
    return [
      startPos,
      [midpoint.x, startPos[1], midpoint.z] as [number, number, number],
      [targetPos.x, startPos[1], targetPos.z] as [number, number, number],
    ];
  };
  
  // Handle click on exhibit
  const handleClick = () => {
    playHit();
    
    // Generate navigation path
    const path = generatePathToObject();
    setNavigationPath(path);
    
    // Update target position for camera to look at
    setTargetPosition(exhibit.position);
    
    // Select the exhibit and first project
    selectExhibit(exhibit);
    if (projects.length > 0) {
      selectProject(projects[0]);
    }
    
    // Show project details when we arrive
    setTimeout(() => {
      setShowProjectDetails(true);
    }, path.length * 1000); // Roughly estimate travel time
  };
  
  // Check distance to camera to show label
  useFrame(() => {
    if (objectRef.current && camera) {
      const distance = new THREE.Vector3()
        .copy(camera.position)
        .distanceTo(new THREE.Vector3(...exhibit.position));
      
      // Only show label when close enough
      setHovered(distance < 8);
    }
  });
  
  // Render the 3D object based on category
  const renderObject = () => {
    const color = CATEGORY_COLORS[exhibit.category];
    
    switch (exhibit.category) {
      case ProjectCategory.MUSIC:
        return (
          <group>
            {/* Boombox body */}
            <mesh castShadow>
              <boxGeometry args={[1.2, 0.8, 0.5]} />
              <meshStandardMaterial color={color} roughness={0.6} />
            </mesh>
            
            {/* Speakers */}
            <mesh position={[-0.4, 0, 0.26]} castShadow>
              <cylinderGeometry args={[0.2, 0.2, 0.1, 32]} />
              <meshStandardMaterial color="#333" />
            </mesh>
            <mesh position={[0.4, 0, 0.26]} castShadow>
              <cylinderGeometry args={[0.2, 0.2, 0.1, 32]} />
              <meshStandardMaterial color="#333" />
            </mesh>
            
            {/* Controls */}
            <mesh position={[0, 0.2, 0.26]} castShadow>
              <boxGeometry args={[0.6, 0.2, 0.05]} />
              <meshStandardMaterial color="#222" />
            </mesh>
            
            {/* Handle */}
            <mesh position={[0, 0.5, 0]} castShadow>
              <boxGeometry args={[0.8, 0.1, 0.1]} />
              <meshStandardMaterial color="#222" />
            </mesh>
          </group>
        );
        
      case ProjectCategory.POETRY:
        return (
          <group>
            {/* Parchment */}
            <mesh rotation={[-Math.PI / 12, 0, 0]} castShadow>
              <boxGeometry args={[0.8, 0.05, 1.2]} />
              <meshStandardMaterial color="#f9f4e0" roughness={0.9} />
            </mesh>
            
            {/* Quill */}
            <group position={[0.3, 0.1, -0.3]} rotation={[0, Math.PI / 4, 0]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.01, 0.01, 0.8, 8]} />
                <meshStandardMaterial color="#555" />
              </mesh>
              <mesh position={[0, 0.4, 0]} rotation={[0, 0, -Math.PI / 6]} castShadow>
                <coneGeometry args={[0.05, 0.4, 8]} />
                <meshStandardMaterial color={color} />
              </mesh>
            </group>
          </group>
        );
        
      case ProjectCategory.ART:
        return (
          <group>
            {/* Sketchpad */}
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
              <boxGeometry args={[1, 0.05, 1.2]} />
              <meshStandardMaterial color="#fff" />
            </mesh>
            
            {/* Pencil */}
            <group position={[0.3, 0.1, -0.3]} rotation={[0, Math.PI / 3, 0]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.03, 0.03, 0.6, 8]} />
                <meshStandardMaterial color={color} />
              </mesh>
              <mesh position={[0, 0.3, 0]} castShadow>
                <coneGeometry args={[0.03, 0.1, 8]} />
                <meshStandardMaterial color="#555" />
              </mesh>
            </group>
            
            {/* Brush */}
            <group position={[-0.3, 0.1, 0.3]} rotation={[0, -Math.PI / 4, 0]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
                <meshStandardMaterial color="#8B4513" />
              </mesh>
              <mesh position={[0, 0.3, 0]} castShadow>
                <sphereGeometry args={[0.04, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color="#222" />
              </mesh>
            </group>
          </group>
        );
        
      case ProjectCategory.TECH:
        return (
          <group>
            {/* Monitor */}
            <mesh position={[0, 0.3, 0]} castShadow>
              <boxGeometry args={[1, 0.6, 0.05]} />
              <meshStandardMaterial color="#222" />
            </mesh>
            <mesh position={[0, 0.3, -0.01]} castShadow>
              <boxGeometry args={[0.9, 0.5, 0.01]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
            </mesh>
            
            {/* Stand */}
            <mesh position={[0, -0.05, -0.1]} castShadow>
              <boxGeometry args={[0.1, 0.7, 0.1]} />
              <meshStandardMaterial color="#444" />
            </mesh>
            
            {/* Base */}
            <mesh position={[0, -0.4, 0]} castShadow>
              <boxGeometry args={[0.5, 0.05, 0.3]} />
              <meshStandardMaterial color="#222" />
            </mesh>
            
            {/* Keyboard */}
            <mesh position={[0, -0.4, 0.25]} castShadow>
              <boxGeometry args={[0.8, 0.05, 0.3]} />
              <meshStandardMaterial color="#555" />
            </mesh>
          </group>
        );
        
      case ProjectCategory.SOCIAL:
        return (
          <group>
            {/* Wireframe head base */}
            <mesh castShadow>
              <sphereGeometry args={[0.5, 12, 12]} />
              <meshStandardMaterial 
                color={color}
                wireframe={true} 
                emissive={color}
                emissiveIntensity={0.3}
              />
            </mesh>
            
            {/* Inner core */}
            <mesh>
              <sphereGeometry args={[0.35, 8, 8]} />
              <meshStandardMaterial 
                color={color} 
                opacity={0.3} 
                transparent={true}
                emissive={color}
                emissiveIntensity={0.2}
              />
            </mesh>
            
            {/* Connection nodes */}
            {Array(6).fill(0).map((_, i) => {
              const theta = (i / 6) * Math.PI * 2;
              const phi = Math.random() * Math.PI;
              const x = 0.4 * Math.sin(phi) * Math.cos(theta);
              const y = 0.4 * Math.sin(phi) * Math.sin(theta);
              const z = 0.4 * Math.cos(phi);
              
              return (
                <mesh key={i} position={[x, y, z]} castShadow>
                  <sphereGeometry args={[0.05, 8, 8]} />
                  <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.5} />
                </mesh>
              );
            })}
          </group>
        );
      
      default:
        return (
          <mesh castShadow>
            <boxGeometry />
            <meshStandardMaterial color={color} />
          </mesh>
        );
    }
  };
  
  return (
    <group 
      ref={objectRef}
      position={exhibit.position}
      rotation={exhibit.rotation}
      scale={exhibit.scale}
      onClick={handleClick}
    >
      {renderObject()}
      
      {/* Exhibit title */}
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.2}
        color="#000"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.005}
        outlineColor="#ffffff"
      >
        {exhibit.title}
      </Text>
      
      {/* Interaction prompt */}
      {hovered && (
        <Html position={[0, -1, 0]} center transform distanceFactor={10}>
          <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            fontSize: '14px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none'
          }}>
            <p>Click to explore {exhibit.title}</p>
          </div>
        </Html>
      )}
      
    </group>
  );
}

// Note: The style has been moved outside the component since we can't use JSX style tags
// directly in Three.js components. The styling is now applied via the Html component's style prop
