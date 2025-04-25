import { useEffect, useState, useRef } from 'react';
import { Text, Html } from '@react-three/drei';
import { usePortfolio } from '../../lib/stores/usePortfolio';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function GalleryText() {
  const { 
    interaction: { isInteracting },
    showProjectDetails,
  } = usePortfolio();
  
  // Get the camera from R3F
  const { camera } = useThree();
  
  // Text will always be visible, no matter the camera position
  return (
    <>
      {/* Add 2D HTML overlay for header and footer text */}
      <Html
        fullscreen
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        {/* Header text at top of screen */}
        <div 
          style={{
            position: 'absolute',
            top: '40px',
            left: '0',
            width: '100%',
            textAlign: 'center',
            color: 'black',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 'bold',
            fontSize: '28px',
            textShadow: '0 0 5px white, 0 0 10px white',
            pointerEvents: 'none',
          }}
        >
          Dmitry A. Markelov
        </div>
        
        {/* Footer text at bottom of screen */}
        <div 
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '0',
            width: '100%',
            textAlign: 'center',
            color: 'black',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 'bold',
            fontSize: '20px',
            textShadow: '0 0 5px white, 0 0 10px white',
            pointerEvents: 'none',
          }}
        >
          Portfolio Gallery
        </div>
      </Html>
    </>
  );
}