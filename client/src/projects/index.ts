import { Exhibit, ProjectCategory } from '../lib/types';

// Define the gallery exhibits in 3D space - arranged in a wider, closer semicircle for better visibility on mobile
export const exhibits: Exhibit[] = [
  // Music exhibit - Boombox (left end of arc)
  {
    id: 'music-exhibit',
    category: ProjectCategory.MUSIC,
    position: [-6, 1.5, -8], // Moved closer and more visible
    rotation: [0, Math.PI / 5, 0],
    scale: [1.5, 1.5, 1.5], // Enlarged for better visibility
    title: 'Music Projects',
    description: 'Explore musical compositions and audio productions.'
  },
  
  // Poetry exhibit - Parchment & Quill (left-center)
  {
    id: 'poetry-exhibit',
    category: ProjectCategory.POETRY,
    position: [-3, 1.5, -7], // Moved closer and more visible
    rotation: [0, Math.PI / 10, 0],
    scale: [1.5, 1.5, 1.5], // Enlarged for better visibility
    title: 'Poetry Works',
    description: 'A collection of poetic expressions and written art.'
  },
  
  // Art exhibit - Sketchpad (center)
  {
    id: 'art-exhibit',
    category: ProjectCategory.ART,
    position: [0, 1.5, -6], // Moved closer and more visible
    rotation: [0, 0, 0],
    scale: [1.5, 1.5, 1.5], // Enlarged for better visibility
    title: 'Visual Art',
    description: 'A showcase of visual artistry and creative designs.'
  },
  
  // Tech exhibit - Computer setup (right-center)
  {
    id: 'tech-exhibit',
    category: ProjectCategory.TECH,
    position: [3, 1.5, -7], // Moved closer and more visible
    rotation: [0, -Math.PI / 10, 0],
    scale: [1.5, 1.5, 1.5], // Enlarged for better visibility
    title: 'Tech & Apps',
    description: 'Software projects, games, and technical applications.'
  },
  
  // Social exhibit - Wireframe head (right end of arc)
  {
    id: 'social-exhibit',
    category: ProjectCategory.SOCIAL,
    position: [6, 1.5, -8], // Moved closer and more visible
    rotation: [0, -Math.PI / 5, 0],
    scale: [1.2, 1.2, 1.2],
    title: 'Social Media',
    description: 'Connect through various social platforms and channels.'
  }
];
