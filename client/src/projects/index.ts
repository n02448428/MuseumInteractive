import { Exhibit, Project, ProjectCategory } from '../lib/types';

// Define the gallery exhibits in 3D space - arranged in a semicircle for better visibility
export const exhibits: Exhibit[] = [
  // Music exhibit - Boombox (left end of arc)
  {
    id: 'music-exhibit',
    category: ProjectCategory.MUSIC,
    position: [-8, 1, -10],
    rotation: [0, Math.PI / 5, 0],
    scale: [1.2, 1.2, 1.2],
    title: 'Music Projects',
    description: 'Explore musical compositions and audio productions.'
  },
  
  // Poetry exhibit - Parchment & Quill (left-center)
  {
    id: 'poetry-exhibit',
    category: ProjectCategory.POETRY,
    position: [-4, 1, -11],
    rotation: [0, Math.PI / 10, 0],
    scale: [1.2, 1.2, 1.2],
    title: 'Poetry Works',
    description: 'A collection of poetic expressions and written art.'
  },
  
  // Art exhibit - Sketchpad (center)
  {
    id: 'art-exhibit',
    category: ProjectCategory.ART,
    position: [0, 1, -12],
    rotation: [0, 0, 0],
    scale: [1.2, 1.2, 1.2],
    title: 'Visual Art',
    description: 'A showcase of visual artistry and creative designs.'
  },
  
  // Tech exhibit - Computer setup (right-center)
  {
    id: 'tech-exhibit',
    category: ProjectCategory.TECH,
    position: [4, 1, -11],
    rotation: [0, -Math.PI / 10, 0],
    scale: [1.2, 1.2, 1.2],
    title: 'Tech & Apps',
    description: 'Software projects, games, and technical applications.'
  },
  
  // Social exhibit - Wireframe head (right end of arc)
  {
    id: 'social-exhibit',
    category: ProjectCategory.SOCIAL,
    position: [8, 1, -10],
    rotation: [0, -Math.PI / 5, 0],
    scale: [1.2, 1.2, 1.2],
    title: 'Social Media',
    description: 'Connect through various social platforms and channels.'
  }
];

// Initial projects array (fallback data)
export const projects: Project[] = [
  // This is just placeholder data
  // The real data will come from the text files
];

// Export a function to filter projects by category
export const getProjectsByCategory = (category: ProjectCategory) => 
  projects.filter(p => p.category === category);