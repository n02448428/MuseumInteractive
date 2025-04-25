import { Project, ProjectCategory } from '../lib/types';

export const projects: Project[] = [
  // Art Projects
  {
    id: 'art-1',
    title: 'Abstract Series: "Fragments"',
    description: 'A series of abstract paintings exploring form, color, and texture.',
    category: ProjectCategory.ART,
    date: 'July 2023',
    details: 'This collection of acrylic paintings on canvas investigates the relationship between structured geometric forms and organic, fluid elements.',
    projectUrl: 'https://example.com/fragments'
  },
  // Add other projects here
];

export const getProjectsByCategory = (category: ProjectCategory) => 
  projects.filter(p => p.category === category);