import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { usePortfolio } from '../../lib/stores/usePortfolio';

// This component renders exhibit information at the bottom left of the screen
export default function ExhibitDescription() {
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const { interaction: { currentExhibit, isInteracting } } = usePortfolio();

  // Create a portal container for the description
  useEffect(() => {
    // Create container if it doesn't exist
    if (!document.getElementById('exhibit-description-portal')) {
      const container = document.createElement('div');
      container.id = 'exhibit-description-portal';
      document.body.appendChild(container);
      setPortalContainer(container);
    } else {
      setPortalContainer(document.getElementById('exhibit-description-portal'));
    }
    
    // Cleanup function
    return () => {
      const container = document.getElementById('exhibit-description-portal');
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };
  }, []);

  // If no exhibit is selected or not interacting, don't render anything
  if (!currentExhibit || !portalContainer) return null;
  
  // Use React Portal to render outside of Three.js scene
  return createPortal(
    <AnimatePresence>
      {currentExhibit && !isInteracting && (
        <motion.div 
          className="exhibit-description"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <h3>{currentExhibit.title}</h3>
          <p>{currentExhibit.description}</p>
          <p style={{ marginTop: '8px', fontSize: '14px', opacity: 0.8 }}>
            Press E to interact
          </p>
        </motion.div>
      )}
    </AnimatePresence>,
    portalContainer
  );
}