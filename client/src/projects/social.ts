import { Project, ProjectCategory } from '../lib/types';

export const socialProjects: Project[] = [
  {
    id: 'social-1',
    title: 'Twitter',
    description: 'Follow for updates on latest projects, industry insights, and creative process.',
    category: ProjectCategory.SOCIAL,
    date: 'Active',
    details: 'Regularly sharing thoughts on design, technology, and creative practice. Join discussions and connect with a community of like-minded creators and innovators.',
    projectUrl: 'https://twitter.com/example'
  },
  {
    id: 'social-2',
    title: 'GitHub',
    description: 'Open source contributions and code repositories for various projects.',
    category: ProjectCategory.SOCIAL,
    date: 'Active',
    details: 'Browse through project repositories, contribute to open source initiatives, and explore technical documentation. Repository includes both professional work and personal explorations.',
    projectUrl: 'https://github.com/example'
  },
  {
    id: 'social-3',
    title: 'YouTube Channel',
    description: 'Video tutorials, process documentation, and creative experiments.',
    category: ProjectCategory.SOCIAL,
    date: 'Active',
    details: 'The channel features a mix of technical tutorials, behind-the-scenes looks at project development, and occasional live streams covering various creative topics.',
    projectUrl: 'https://youtube.com/example'
  },
  {
    id: 'social-4',
    title: 'LinkedIn',
    description: 'Professional network and career updates.',
    category: ProjectCategory.SOCIAL,
    date: 'Active',
    details: 'Connect professionally to stay updated on career milestones, industry events, and collaboration opportunities. Resume and portfolio highlights available.',
    projectUrl: 'https://linkedin.com/in/example'
  },
  {
    id: 'social-5',
    title: 'Instagram',
    description: 'Visual portfolio showcasing work in progress and finished projects.',
    category: ProjectCategory.SOCIAL,
    date: 'Active',
    details: 'A curated visual feed highlighting recent projects, inspiration sources, and behind-the-scenes glimpses into the creative process.',
    projectUrl: 'https://instagram.com/example'
  }
];
