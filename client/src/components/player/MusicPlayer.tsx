import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Music } from 'lucide-react';
import { useAudio } from '../../lib/stores/useAudio';

export default function MusicPlayer() {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const { 
    backgroundMusic, 
    isMuted, 
    toggleMute 
  } = useAudio();
  
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Setup audio player
  useEffect(() => {
    if (backgroundMusic) {
      backgroundMusic.addEventListener('canplaythrough', () => {
        setLoading(false);
      });
      
      backgroundMusic.addEventListener('play', () => {
        setIsPlaying(true);
      });
      
      backgroundMusic.addEventListener('pause', () => {
        setIsPlaying(false);
      });
      
      // Initialize volume based on mute state
      backgroundMusic.muted = isMuted;
      
      return () => {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
        
        // Clean up event listeners
        backgroundMusic.removeEventListener('canplaythrough', () => {});
        backgroundMusic.removeEventListener('play', () => {});
        backgroundMusic.removeEventListener('pause', () => {});
      };
    }
  }, [backgroundMusic, isMuted]);
  
  // Handle play/pause
  const togglePlayback = () => {
    if (!backgroundMusic) return;
    
    if (isPlaying) {
      backgroundMusic.pause();
    } else {
      backgroundMusic.play().catch(error => {
        console.log("Autoplay prevented:", error);
      });
    }
  };
  
  // Handle mute/unmute
  const handleToggleMute = () => {
    if (backgroundMusic) {
      backgroundMusic.muted = !isMuted;
    }
    toggleMute();
  };
  
  // Toggle player expansion
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  return (
    <div className="music-player-container">
      <motion.div 
        className="music-player"
        initial={{ x: expanded ? 0 : "calc(100% - 56px)" }}
        animate={{ x: expanded ? 0 : "calc(100% - 56px)" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Toggle button */}
        <button 
          className="music-player-toggle"
          onClick={toggleExpanded}
          aria-label={expanded ? "Collapse music player" : "Expand music player"}
        >
          <Music size={20} />
        </button>
        
        {/* Player controls */}
        <div className="music-player-controls">
          <button 
            className="music-player-button"
            onClick={togglePlayback}
            disabled={loading}
            aria-label={isPlaying ? "Pause music" : "Play music"}
          >
            {loading ? (
              <div className="loading-spinner" />
            ) : isPlaying ? (
              <Pause size={20} />
            ) : (
              <Play size={20} />
            )}
          </button>
          
          <button
            className="music-player-button"
            onClick={handleToggleMute}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          
          <div className="music-player-info">
            <div className="music-player-title">
              Ambient Gallery Music
            </div>
            <div className="music-player-artist">
              Background Soundtrack
            </div>
          </div>
        </div>
      </motion.div>
      
    </div>
  );
}

// CSS styles moved to client/src/index.css since we can't use JSX style tags directly
