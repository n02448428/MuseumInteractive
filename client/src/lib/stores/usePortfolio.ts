import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Exhibit, Project, ProjectCategory, InteractionState, CameraState, NavigationPath, Vec3 } from '../types';
import { exhibits } from '../../projects/index';
import { musicProjects } from '../../projects/music';
import { poetryProjects } from '../../projects/poetry';
import { artProjects } from '../../projects/art';
import { techProjects } from '../../projects/tech';
import { socialProjects } from '../../projects/social';

interface PortfolioState {
  // Camera and player state
  camera: CameraState;
  updateCameraPosition: (position: Vec3) => void;
  updateCameraLookAt: (lookAt: Vec3) => void;
  setCameraMoving: (moving: boolean) => void;
  
  // Interaction state
  interaction: InteractionState;
  setInteracting: (isInteracting: boolean) => void;
  setTargetPosition: (position: Vec3 | null) => void;
  selectExhibit: (exhibit: Exhibit | null) => void;
  selectProject: (project: Project | null) => void;
  
  // Navigation path
  path: NavigationPath;
  setNavigationPath: (points: Vec3[]) => void;
  updatePathProgress: (pointIndex: number) => void;
  clearPath: () => void;
  
  // Project data
  exhibits: Exhibit[];
  getProjectsByCategory: (category: ProjectCategory) => Project[];
  
  // UI States
  showProjectDetails: boolean;
  setShowProjectDetails: (show: boolean) => void;
  isMobile: boolean;
  setIsMobile: (isMobile: boolean) => void;
}

// Projects by category cache to avoid recalculation
const projectsByCategory = {
  [ProjectCategory.MUSIC]: musicProjects,
  [ProjectCategory.POETRY]: poetryProjects,
  [ProjectCategory.ART]: artProjects,
  [ProjectCategory.TECH]: techProjects,
  [ProjectCategory.SOCIAL]: socialProjects,
};

export const usePortfolio = create<PortfolioState>()(
  subscribeWithSelector((set, get) => ({
    // Camera state
    camera: {
      position: [0, 1.6, 5] as Vec3,
      lookAt: [0, 1.6, 0] as Vec3,
      moving: false,
    },
    updateCameraPosition: (position) => 
      set((state) => ({ camera: { ...state.camera, position } })),
    updateCameraLookAt: (lookAt) => 
      set((state) => ({ camera: { ...state.camera, lookAt } })),
    setCameraMoving: (moving) => 
      set((state) => ({ camera: { ...state.camera, moving } })),
    
    // Interaction state
    interaction: {
      isInteracting: false,
      targetPosition: null,
      currentExhibit: null,
      selectedProject: null,
    },
    setInteracting: (isInteracting) => 
      set((state) => ({ 
        interaction: { ...state.interaction, isInteracting } 
      })),
    setTargetPosition: (targetPosition) => 
      set((state) => ({ 
        interaction: { ...state.interaction, targetPosition } 
      })),
    selectExhibit: (exhibit) => 
      set((state) => ({ 
        interaction: { ...state.interaction, currentExhibit: exhibit } 
      })),
    selectProject: (project) => 
      set((state) => ({ 
        interaction: { ...state.interaction, selectedProject: project } 
      })),
    
    // Navigation path
    path: {
      points: [],
      currentPoint: 0,
      active: false,
    },
    setNavigationPath: (points) => 
      set({ 
        path: { points, currentPoint: 0, active: true } 
      }),
    updatePathProgress: (pointIndex) => 
      set((state) => ({ 
        path: { ...state.path, currentPoint: pointIndex } 
      })),
    clearPath: () => 
      set({ 
        path: { points: [], currentPoint: 0, active: false } 
      }),
    
    // Project data
    exhibits,
    getProjectsByCategory: (category) => projectsByCategory[category] || [],
    
    // UI States
    showProjectDetails: false,
    setShowProjectDetails: (show) => set({ showProjectDetails: show }),
    isMobile: false,
    setIsMobile: (isMobile) => set({ isMobile }),
  }))
);
