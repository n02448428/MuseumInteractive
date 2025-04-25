import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Loader, Stats, KeyboardControls } from "@react-three/drei";
import { QueryClientProvider } from "@tanstack/react-query";

import Gallery from "./components/gallery/Gallery";
import MusicPlayer from "./components/player/MusicPlayer";
import ProjectDetails from "./components/gallery/ProjectDetails";
import { useAudio } from "./lib/stores/useAudio";
import { queryClient } from "./lib/queryClient";

// Define keyboard controls as an enum
export enum Controls {
  forward = 'forward',
  backward = 'backward',
  left = 'left',
  right = 'right',
  jump = 'jump',
  interact = 'interact',
}

function App() {
  const [ready, setReady] = useState(false);
  const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio();

  // Define key mappings
  const keyMap = [
    { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
    { name: Controls.backward, keys: ['ArrowDown', 'KeyS'] },
    { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
    { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
    { name: Controls.interact, keys: ['KeyE', 'Space'] },
    { name: Controls.jump, keys: ['Space'] },
  ];
  
  // Log to help debug key presses
  console.log("Keyboard controls initialized with: ", keyMap);

  // Load audio elements
  useEffect(() => {
    const bgMusic = new Audio('/sounds/background.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    
    const hitSound = new Audio('/sounds/hit.mp3');
    const successSound = new Audio('/sounds/success.mp3');
    
    setBackgroundMusic(bgMusic);
    setHitSound(hitSound);
    setSuccessSound(successSound);
    
    setReady(true);
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="portfolio-container">
        <KeyboardControls map={keyMap}>
          <Canvas
            shadows
            camera={{ position: [0, 1.8, 0], fov: 75, near: 0.1, far: 1000 }}
            gl={{ 
              antialias: true,
              logarithmicDepthBuffer: true,
              powerPreference: "high-performance"
            }}
            style={{ outline: 'none' }}
            tabIndex={0}
          >
            <color attach="background" args={["#f5f5f5"]} />
            <fog attach="fog" args={["#f5f5f5", 10, 50]} />
            
            <Suspense fallback={null}>
              {ready && <Gallery />}
            </Suspense>
          </Canvas>
        </KeyboardControls>
        
        <MusicPlayer />
        <ProjectDetails />
        <Loader />
        {import.meta.env.DEV && <Stats />}
      </div>
    </QueryClientProvider>
  );
}

export default App;
