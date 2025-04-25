import { Project, ProjectCategory } from '../lib/types';

export const techProjects: Project[] = [
  {
    id: 'tech-1',
    title: 'Interactive Data Visualization Tool',
    description: 'A web application for visualizing complex datasets through interactive charts and graphs.',
    category: ProjectCategory.TECH,
    date: 'August 2023',
    details: 'Built with React, D3.js, and TypeScript, this application transforms raw data into intuitive visual representations. Features include responsive design, customizable color schemes, and export capabilities.',
    projectUrl: 'https://github.com/example/data-viz'
  },
  {
    id: 'tech-2',
    title: 'Mobile Game: "Cosmic Puzzler"',
    description: 'A puzzle game for iOS and Android featuring innovative mechanics and procedurally generated levels.',
    category: ProjectCategory.TECH,
    date: 'December 2022',
    details: 'Developed using Unity engine with custom shaders and a unique gravitational physics system. The game includes over 100 levels, daily challenges, and online leaderboards.',
    projectUrl: 'https://example.com/cosmic-puzzler'
  },
  {
    id: 'tech-3',
    title: 'AI Music Composition Tool',
    description: 'An experimental application that uses machine learning to assist in music composition.',
    category: ProjectCategory.TECH,
    date: 'February 2023',
    details: 'This software utilizes a custom-trained neural network to analyze musical patterns and suggest harmonic and melodic variations. Built with Python, TensorFlow, and WebAudio API for browser-based interaction.',
    projectUrl: 'https://github.com/example/ai-composer'
  },
  {
    id: 'tech-4',
    title: 'Productivity Extension Suite',
    description: 'A collection of browser extensions designed to enhance workflow and reduce distractions.',
    category: ProjectCategory.TECH,
    date: 'April 2023',
    details: 'This suite includes tools for time management, website blocking, and automated task organization. Compatible with Chrome, Firefox, and Edge browsers with synchronized settings across devices.',
    projectUrl: 'https://chrome.google.com/webstore/example'
  }
];
