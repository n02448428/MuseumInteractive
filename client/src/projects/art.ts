import { Project, ProjectCategory } from '../lib/types';

export const artProjects: Project[] = [
  {
    id: 'art-1',
    title: 'Abstract Series: "Fragments"',
    description: 'A series of abstract paintings exploring form, color, and texture.',
    category: ProjectCategory.ART,
    date: 'July 2023',
    details: 'This collection of acrylic paintings on canvas investigates the relationship between structured geometric forms and organic, fluid elements. Each piece represents a different emotional state or memory fragment.',
    projectUrl: 'https://example.com/fragments'
  },
  {
    id: 'art-2',
    title: 'Digital Illustration Portfolio',
    description: 'Character designs and concept art for an animated short film.',
    category: ProjectCategory.ART,
    date: 'September 2022',
    details: 'Created using Procreate and Adobe Photoshop, this collection demonstrates character development, environmental design, and visual storytelling techniques applied to an original narrative.',
    projectUrl: 'https://behance.net/example'
  },
  {
    id: 'art-3',
    title: 'Mixed Media Installation',
    description: 'An interactive gallery installation combining physical and digital elements.',
    category: ProjectCategory.ART,
    date: 'March 2023',
    details: 'This site-specific installation incorporates found objects, projected imagery, and sensor-based interactivity to create an immersive environment that responds to visitor presence and movement.',
    projectUrl: 'https://example.com/installation'
  },
  {
    id: 'art-4',
    title: 'Photography Series: "Urban Nature"',
    description: 'Black and white photography documenting the interaction between nature and urban environments.',
    category: ProjectCategory.ART,
    date: 'May 2023',
    details: 'Shot on medium format film and processed using traditional darkroom techniques, this series examines how plant life persists and adapts within urban infrastructure.',
    projectUrl: 'https://instagram.com/example'
  }
];
