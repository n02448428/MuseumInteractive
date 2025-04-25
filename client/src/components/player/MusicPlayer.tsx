import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Music } from 'lucide-react';
import { useAudio } from '../../lib/stores/useAudio';

export default function MusicPlayer() {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const { 
    backgroundMusic, 
    isMuted, 
    toggleMute 
  } = useAudio();
  
  // Setup audio player event listeners
  useEffect(() => {
    if (!backgroundMusic) return;
    
    const handleCanPlayThrough = () => setLoading(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    
    backgroundMusic.addEventListener('canplaythrough', handleCanPlayThrough);
    backgroundMusic.addEventListener('play', handlePlay);
    backgroundMusic.addEventListener('pause', handlePause);
    
    // Initialize volume based on mute state
    backgroundMusic.muted = isMuted;
    
    // Check initial play state
    if (!backgroundMusic.paused) {
      setIsPlaying(true);
    }
    
    return () => {
      // Clean up event listeners
      backgroundMusic.removeEventListener('canplaythrough', handleCanPlayThrough);
      backgroundMusic.removeEventListener('play', handlePlay);
      backgroundMusic.removeEventListener('pause', handlePause);
    };
  }, [backgroundMusic, isMuted]);
  
  // Handle play/pause toggle
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
  
  // Handle mute/unmute toggle
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
  
  // Only show player if music exists AND (is playing OR is expanded)
  if (!backgroundMusic || (!isPlaying && !expanded)) {
    return null;
  }
  
  // Main component render
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

// CSS styles are in client/src/index.css
