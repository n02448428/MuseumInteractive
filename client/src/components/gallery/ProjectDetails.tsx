import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
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
          {/* Header with category and navigation */}
          <div 
            className="project-details-header"
            style={{ backgroundColor: categoryColor }}
          >
            <h2>
              <span className="category-icon">{categoryIcon}</span>
              {currentExhibit.title}
            </h2>
            <button className="close-button" onClick={handleClose}>×</button>
          </div>
          
          {/* Project content */}
          <div className="project-details-content">
            {selectedProject ? (
              <>
                <h3>{selectedProject.title}</h3>
                <p className="project-date">{selectedProject.date}</p>
                <p className="project-description">{selectedProject.description}</p>
                
                {selectedProject.details && (
                  <div className="project-additional-details">
                    {selectedProject.details}
                  </div>
                )}
                
                {selectedProject.projectUrl && (
                  <div className="project-link">
                    <a 
                      href={selectedProject.projectUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ backgroundColor: categoryColor }}
                    >
                      View Project
                    </a>
                  </div>
                )}
              </>
            ) : (
              <p>No projects available in this category.</p>
            )}
          </div>
          
          {/* Navigation between projects */}
          {projects.length > 1 && (
            <div className="project-navigation">
              <button onClick={goToPrevProject} style={{ color: categoryColor }}>&larr; Previous</button>
              <div className="project-indicator">
                {currentIndex + 1} of {projects.length}
              </div>
              <button onClick={goToNextProject} style={{ color: categoryColor }}>Next &rarr;</button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>,
    portalContainer
  );
}
