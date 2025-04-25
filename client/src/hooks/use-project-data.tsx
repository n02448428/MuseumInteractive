import { useQuery } from '@tanstack/react-query';
import { Project, ProjectCategory } from '../lib/types';

// Utility function to parse text files into projects
const parseTextToProjects = (text: string, category: ProjectCategory): Project[] => {
  // Split the text by project delimiter (3 or more dashes)
  const projectSections = text.split(/\n---+\n/);
  
  return projectSections.map((section, index) => {
    // Split each project section into lines
    const lines = section.trim().split('\n');
    
    // First line is the title
    const title = lines[0]?.trim() || `${category} Project ${index + 1}`;
    
    // Try to extract a date from any line starting with "Date:"
    let date = new Date().toISOString().split('T')[0]; // Default to today
    const dateLine = lines.find(line => line.startsWith('Date:'));
    if (dateLine) {
      const extractedDate = dateLine.substring(5).trim();
      if (extractedDate) date = extractedDate;
    }
    
    // Try to extract URL if present
    let projectUrl = '';
    const urlLine = lines.find(line => 
      line.startsWith('URL:') || 
      line.startsWith('Link:') || 
      line.startsWith('Website:')
    );
    if (urlLine) {
      const parts = urlLine.split(':');
      if (parts.length > 1) {
        projectUrl = parts.slice(1).join(':').trim();
      }
    }
    
    // Everything else becomes the description (excluding special lines)
    const description = lines
      .filter(line => !line.startsWith('Date:') && !line.startsWith('URL:') && 
                    !line.startsWith('Link:') && !line.startsWith('Website:') &&
                    line !== title)
      .join('\n')
      .trim();
    
    // Return a project object
    return {
      id: `${category}-${index + 1}`,
      title,
      description,
      date,
      category,
      projectUrl: projectUrl || undefined,
      details: description // Store full text as details
    };
  });
};

// Function to fetch project data from a text file
const fetchProjectData = async (category: ProjectCategory): Promise<Project[]> => {
  try {
    // Try to fetch the text file
    const response = await fetch(`/content/${category}/projects.txt`);
    
    // If the text file doesn't exist, fall back to JSON for backward compatibility
    if (!response.ok) {
      console.log(`Text file for ${category} not found, trying JSON...`);
      const jsonResponse = await fetch(`/content/${category}/projects.json`);
      
      if (!jsonResponse.ok) {
        throw new Error(`Failed to fetch ${category} projects`);
      }
      
      const data = await jsonResponse.json();
      return data.projects;
    }
    
    // Parse the text content into projects
    const textContent = await response.text();
    return parseTextToProjects(textContent, category);
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
