import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import * as THREE from 'three';
import { usePortfolio } from '../../lib/stores/usePortfolio';
import { ProjectCategory } from '../../lib/types';

// Note: This component renders in HTML DOM, not in THREE.js scene

// Category colors (matching ExhibitObject)
const CATEGORY_COLORS = {
  [ProjectCategory.MUSIC]: '#ff6b6b',
  [ProjectCategory.POETRY]: '#f4a261', 
  [ProjectCategory.ART]: '#48cae4',
  [ProjectCategory.TECH]: '#4361ee',
  [ProjectCategory.SOCIAL]: '#9d4edd',
};

// Category icons (simple text emoji representations)
const CATEGORY_ICONS = {
  [ProjectCategory.MUSIC]: '♫',
  [ProjectCategory.POETRY]: '✒️',
  [ProjectCategory.ART]: '🎨',
  [ProjectCategory.TECH]: '💻',
  [ProjectCategory.SOCIAL]: '👥',
};

export default function ProjectDetails() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  
  const { 
    interaction: { currentExhibit, selectedProject },
    getProjectsByCategory,
    showProjectDetails,
    setShowProjectDetails,
    selectProject,
    selectExhibit,
    setInteracting, // To disable camera movement
    setNavigationPath,
    setTargetPosition,
    camera, // Use camera from usePortfolio instead
  } = usePortfolio();
  
  // Get projects for the current category
  const projects = currentExhibit 
    ? getProjectsByCategory(currentExhibit.category) 
    : [];
  
  // Create a portal container for our details panel
  useEffect(() => {
    // Create container if it doesn't exist
    if (!document.getElementById('project-details-portal')) {
      const container = document.createElement('div');
      container.id = 'project-details-portal';
      document.body.appendChild(container);
      setPortalContainer(container);
    } else {
      setPortalContainer(document.getElementById('project-details-portal'));
    }
    
    // Cleanup function
    return () => {
      const container = document.getElementById('project-details-portal');
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };
  }, []);
  
  // Disable camera movement when showing project details
  useEffect(() => {
    if (showProjectDetails) {
      setInteracting(true);
    }
    
    // Enable camera movement when component unmounts or details are hidden
    return () => {
      setInteracting(false);
    };
  }, [showProjectDetails, setInteracting]);
  
  // Update current index when selected project changes
  useEffect(() => {
    if (selectedProject) {
      const index = projects.findIndex(p => p.id === selectedProject.id);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [selectedProject, projects]);
  
  // Navigation between projects
  const goToNextProject = () => {
    const nextIndex = (currentIndex + 1) % projects.length;
    selectProject(projects[nextIndex]);
  };
  
  const goToPrevProject = () => {
    const prevIndex = (currentIndex - 1 + projects.length) % projects.length;
    selectProject(projects[prevIndex]);
  };
  
  // Close the details panel
  const handleClose = () => {
    setShowProjectDetails(false);
    
    // If user hasn't moved since viewing the exhibit, return to starting position
    const startPosition = new THREE.Vector3(0, 1.8, 0);
    // Convert Vec3 array to THREE.Vector3
    const cameraPos = camera.position;
    const currentPosition = new THREE.Vector3(cameraPos[0], cameraPos[1], cameraPos[2]);
    
    // Get distance from the starting position
    const distanceFromExhibit = currentPosition.distanceTo(startPosition);
    
    // If we're not at starting position and we've viewed the exhibit without moving much
    if (distanceFromExhibit > 5) {
      // Generate a path back to the start
      const returnPath = [
        [currentPosition.x, currentPosition.y, currentPosition.z] as [number, number, number],
        [0, 1.8, 0] as [number, number, number]
      ];
      
      // Set the navigation path back to start
      setNavigationPath(returnPath);
      setTargetPosition(null);
      selectExhibit(null);
    }
  };
  
  // If no exhibit is selected or details shouldn't be shown, don't render anything
  if (!currentExhibit || !showProjectDetails || !portalContainer) return null;
  
  // Get display data
  const categoryColor = CATEGORY_COLORS[currentExhibit.category];
  const categoryIcon = CATEGORY_ICONS[currentExhibit.category];
  
  // Use React Portal to render outside of Three.js scene
  return createPortal(
    <div className="project-details-container">
      <AnimatePresence>
        <motion.div 
          className="project-details-panel"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          key="project-panel"
        >
          {/* Minimal header with just close button */}
          <div className="project-details-header-minimal">
            <button className="close-button" onClick={handleClose}>×</button>
          </div>
          
          {/* Simplified project content - minimal UI */}
          <div className="project-details-content">
            {selectedProject ? (
              <>
                {/* Show just the title and project details (or description if no details) */}
                <h3>{selectedProject.title}</h3>
                
                <div className="project-text-content">
                  {selectedProject.details ? (
                    <p>{selectedProject.details}</p>
                  ) : (
                    <p>{selectedProject.description}</p>
                  )}
                  
                  {/* Always show link for project if available */}
                  {selectedProject.projectUrl && (
                    <a 
                      href={selectedProject.projectUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {selectedProject.projectUrl}
                    </a>
                  )}
                </div>
              </>
            ) : (
              <p>No content available.</p>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>,
    portalContainer
  );
}
