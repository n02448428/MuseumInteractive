import { useQuery } from '@tanstack/react-query';
import { Project, ProjectCategory } from '../lib/types';

// Define the structure of the JSON data from the project files
interface ProjectFileData {
  projects: Project[];
}

// Function to fetch project data from a JSON file
const fetchProjectData = async (category: ProjectCategory): Promise<Project[]> => {
  try {
    const response = await fetch(`/content/${category}/projects.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${category} projects`);
    }
    const data: ProjectFileData = await response.json();
    return data.projects;
  } catch (error) {
    console.error(`Error fetching ${category} projects:`, error);
    return [];
  }
};

// Hook to get project data for a specific category
export function useProjectData(category: ProjectCategory) {
  return useQuery<Project[], Error>({
    queryKey: ['projects', category],
    queryFn: () => fetchProjectData(category),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to get all project data at once
export function useAllProjectData() {
  const musicQuery = useProjectData(ProjectCategory.MUSIC);
  const poetryQuery = useProjectData(ProjectCategory.POETRY);
  const artQuery = useProjectData(ProjectCategory.ART);
  const techQuery = useProjectData(ProjectCategory.TECH);
  const socialQuery = useProjectData(ProjectCategory.SOCIAL);
  
  const isLoading = 
    musicQuery.isLoading || 
    poetryQuery.isLoading || 
    artQuery.isLoading || 
    techQuery.isLoading || 
    socialQuery.isLoading;
    
  const error = 
    musicQuery.error || 
    poetryQuery.error || 
    artQuery.error || 
    techQuery.error || 
    socialQuery.error;
    
  const data = {
    [ProjectCategory.MUSIC]: musicQuery.data || [],
    [ProjectCategory.POETRY]: poetryQuery.data || [],
    [ProjectCategory.ART]: artQuery.data || [],
    [ProjectCategory.TECH]: techQuery.data || [],
    [ProjectCategory.SOCIAL]: socialQuery.data || [],
  };
  
  return { isLoading, error, data };
}