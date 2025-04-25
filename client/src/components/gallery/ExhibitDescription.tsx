import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolio } from '../../lib/stores/usePortfolio';

export default function ExhibitDescription() {
  const { interaction } = usePortfolio();
  const { currentExhibit } = interaction;
  const [visible, setVisible] = useState(false);
  
  // Control visibility with a slight delay for smoother transitions
  useEffect(() => {
    if (currentExhibit) {
      // Short delay before showing to prevent flickering when walking past exhibits
      const timer = setTimeout(() => {
        setVisible(true);
      }, 200);
      
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
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