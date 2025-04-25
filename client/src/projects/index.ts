import { Exhibit, ProjectCategory } from '../lib/types';

// Define the gallery exhibits in 3D space
export const exhibits: Exhibit[] = [
  // Music exhibit - Boombox
  {
    id: 'music-exhibit',
    category: ProjectCategory.MUSIC,
    position: [-8, 1, -8],
    rotation: [0, Math.PI / 4, 0],
    scale: [1, 1, 1],
    title: 'Music Projects',
    description: 'Explore musical compositions and audio productions.'
  },
  
  // Poetry exhibit - Parchment & Quill
  {
    id: 'poetry-exhibit',
    category: ProjectCategory.POETRY,
    position: [8, 1, -8],
    rotation: [0, -Math.PI / 4, 0],
    scale: [1, 1, 1],
    title: 'Poetry Works',
    description: 'A collection of poetic expressions and written art.'
  },
  
  // Art exhibit - Sketchpad
  {
    id: 'art-exhibit',
    category: ProjectCategory.ART,
    position: [0, 1, -12],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    title: 'Visual Art',
    description: 'A showcase of visual artistry and creative designs.'
  },
  
  // Tech exhibit - Computer setup
  {
    id: 'tech-exhibit',
    category: ProjectCategory.TECH,
    position: [-8, 1, 8],
    rotation: [0, -Math.PI / 4, 0],
    scale: [1, 1, 1],
    title: 'Tech & Apps',
    description: 'Software projects, games, and technical applications.'
  },
  
  // Social exhibit - Wireframe head
  {
    id: 'social-exhibit',
    category: ProjectCategory.SOCIAL,
    position: [8, 1, 8],
    rotation: [0, Math.PI / 4, 0],
    scale: [1, 1, 1],
    title: 'Social Media',
    description: 'Connect through various social platforms and channels.'
  }
];
