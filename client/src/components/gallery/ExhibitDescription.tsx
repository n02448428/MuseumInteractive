import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolio } from '../../lib/stores/usePortfolio';

export default function ExhibitDescription() {
  const { interaction } = usePortfolio();
  const { currentExhibit } = interaction;
  const [visible, setVisible] = useState(false);
  
  // Show exhibit description when an exhibit is selected
  useEffect(() => {
    if (!currentExhibit) {
      setVisible(false);
      return;
    }
    
    // Always show exhibit description when selected, regardless of distance
    setVisible(true);
    
    // Clean up when component unmounts
    return () => {
      setVisible(false);
    };
  }, [currentExhibit]);

  if (!currentExhibit || !visible) {
    return null;
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div 
          className="exhibit-description"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <h3>{currentExhibit.title}</h3>
          <p>{currentExhibit.description}</p>
          <p className="interact-hint">Click to explore</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}