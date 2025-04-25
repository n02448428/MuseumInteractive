import { Project, ProjectCategory } from '../lib/types';

export const poetryProjects: Project[] = [
  {
    id: 'poetry-1',
    title: 'Urban Whispers',
    description: 'A collection of haiku and short-form poetry inspired by city life.',
    category: ProjectCategory.POETRY,
    date: 'April 2023',
    details: 'This collection examines the juxtaposition of natural imagery against urban landscapes, finding moments of tranquility within the chaos of metropolitan environments. Each poem is a self-contained meditation on modern existence.',
    projectUrl: 'https://example.com/urban-whispers'
  },
  {
    id: 'poetry-2',
    title: 'Reflections in Verse',
    description: 'A series of sonnets exploring themes of memory and time.',
    category: ProjectCategory.POETRY,
    date: 'November 2022',
    details: 'Drawing inspiration from traditional sonnet forms while introducing contemporary themes and language. This collection follows a narrative arc through personal and collective memories.',
    projectUrl: 'https://example.com/reflections'
  },
  {
    id: 'poetry-3',
    title: 'Digital Elegies',
    description: 'Experimental poetry exploring the relationship between technology and human emotion.',
    category: ProjectCategory.POETRY,
    date: 'February 2023',
    details: 'This work experiments with form and structure, incorporating elements of code and digital artifacts into traditional poetic expressions. The collection examines how digital mediation affects our emotional landscape.',
    projectUrl: 'https://example.com/digital-elegies'
  },
  {
    id: 'poetry-4',
    title: 'Spoken Word Performance',
    description: 'A recorded live performance of original spoken word poetry.',
    category: ProjectCategory.POETRY,
    date: 'June 2023',
    details: 'This performance combines elements of traditional poetry recitation with musical accompaniment and theatrical delivery. Themes explore personal identity, cultural heritage, and social commentary.',
    projectUrl: 'https://youtube.com/example'
  }
];
