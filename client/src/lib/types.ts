// Project categories
export enum ProjectCategory {
  MUSIC = "music",
  POETRY = "poetry",
  ART = "art",
  TECH = "tech",
  SOCIAL = "social"
}

// Project interface
export interface Project {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  thumbnailUrl?: string;
  projectUrl?: string;
  date: string;
  details?: string;
}

// Exhibit interface for 3D objects in the gallery
export interface Exhibit {
  id: string;
  category: ProjectCategory;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  modelPath?: string;
  title: string;
  description: string;
}

// Vector types for 3D positioning
export type Vec3 = [number, number, number];
export type Vec2 = [number, number];

// Interaction states
export interface InteractionState {
  isInteracting: boolean;
  targetPosition: Vec3 | null;
  currentExhibit: Exhibit | null;
  selectedProject: Project | null;
}

// Camera movement states
export interface CameraState {
  position: Vec3;
  lookAt: Vec3;
  moving: boolean;
}

// Navigation path for auto-navigation
export interface NavigationPath {
  points: Vec3[];
  currentPoint: number;
  active: boolean;
}
