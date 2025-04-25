import { useEffect } from 'react';
import { useAllProjectData } from '../../hooks/use-project-data';
import { usePortfolio } from '../../lib/stores/usePortfolio';
import { ProjectCategory } from '../../lib/types';

// This component loads project data and updates the portfolio store
export default function ProjectLoader() {
  const { data, isLoading, error } = useAllProjectData();
  const { updateProjects } = usePortfolio();
  
  // Update the portfolio store with the loaded data
  useEffect(() => {
    if (!isLoading && !error) {
      // Update projects for each category
      Object.keys(data).forEach((category) => {
        const typedCategory = category as ProjectCategory;
        updateProjects(typedCategory, data[typedCategory]);
      });
      
      console.log('Project data loaded and store updated');
    }
  }, [data, isLoading, error, updateProjects]);
  
  // Log any errors
  useEffect(() => {
    if (error) {
      console.error('Error loading project data:', error);
    }
  }, [error]);
  
  // This component doesn't render anything
  return null;
}