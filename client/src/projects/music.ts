import { Project, ProjectCategory } from '../lib/types';

export const musicProjects: Project[] = [
  {
    id: 'music-1',
    title: 'Ambient Piano Composition',
    description: 'A minimalist piano piece exploring themes of space and silence.',
    category: ProjectCategory.MUSIC,
    date: 'May 2023',
    details: 'This composition utilizes extended piano techniques and subtle electronic processing to create an immersive sonic environment. Inspired by neoclassical composers and ambient music pioneers.',
    projectUrl: 'https://soundcloud.com/example/ambient-piano'
  },
  {
    id: 'music-2',
    title: 'Electronic EP: "Digital Dreams"',
    description: 'A four-track EP blending electronic beats with organic instrumental samples.',
    category: ProjectCategory.MUSIC,
    date: 'October 2022',
    details: 'Produced using Ableton Live with a combination of hardware synthesizers and field recordings. The EP explores the intersection of natural and digital soundscapes.',
    projectUrl: 'https://bandcamp.com/example'
  },
  {
    id: 'music-3',
    title: 'Orchestral Film Score',
    description: 'Original score composed for an independent short film.',
    category: ProjectCategory.MUSIC,
    date: 'January 2023',
    details: 'This orchestral composition was written for string ensemble and percussion, with additional electronic elements to enhance the narrative arc of the film.',
    projectUrl: 'https://vimeo.com/example'
  },
  {
    id: 'music-4',
    title: 'Sound Design Project',
    description: 'Experimental sound design exploring textural and timbral possibilities.',
    category: ProjectCategory.MUSIC,
    date: 'March 2023',
    details: 'Created using granular synthesis and advanced signal processing techniques. This project pushes the boundaries between musical composition and pure sound art.',
    projectUrl: 'https://example.com/sound-design'
  }
];
