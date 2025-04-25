import { useState, useEffect } from 'react';
import { Html } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { AnimatePresence, motion } from 'framer-motion';
import { usePortfolio } from '../../lib/stores/usePortfolio';
import { ProjectCategory } from '../../lib/types';

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
  const { camera } = useThree();
  const [currentIndex, setCurrentIndex] = useState(0);
  
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
  if (!currentExhibit || !showProjectDetails) return null;
  
  // Get display data
  const categoryColor = CATEGORY_COLORS[currentExhibit.category];
  const categoryIcon = CATEGORY_ICONS[currentExhibit.category];
  // Get category name
  const categoryName = currentExhibit.category;
  
  return (
    <Html fullscreen>
      <div className="project-details-container">
        <AnimatePresence>
          <motion.div 
            className="project-details-panel"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
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
                <button onClick={goToPrevProject}>&larr; Previous</button>
                <div className="project-indicator">
                  {currentIndex + 1} of {projects.length}
                </div>
                <button onClick={goToNextProject}>Next &rarr;</button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Html>
  );
}

// CSS styles moved to client/src/index.css
