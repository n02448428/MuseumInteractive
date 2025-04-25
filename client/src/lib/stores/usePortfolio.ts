import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Exhibit, Project, ProjectCategory, InteractionState, CameraState, NavigationPath, Vec3 } from '../types';
import { exhibits } from '../../projects/index';
// We'll be loading project data from JSON files through API queries

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
  updateProjects: (category: ProjectCategory, projects: Project[]) => void;
  
  // UI States
  showProjectDetails: boolean;
  setShowProjectDetails: (show: boolean) => void;
  isMobile: boolean;
  setIsMobile: (isMobile: boolean) => void;
}

// Projects by category will be loaded dynamically from JSON files
// We'll be using empty arrays as initial values
const projectsByCategory: Record<ProjectCategory, Project[]> = {
  [ProjectCategory.MUSIC]: [],
  [ProjectCategory.POETRY]: [],
  [ProjectCategory.ART]: [],
  [ProjectCategory.TECH]: [],
  [ProjectCategory.SOCIAL]: [],
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
    updateProjects: (category, projects) => {
      projectsByCategory[category] = projects;
      console.log(`Updated ${category} projects:`, projects);
    },
    
    // UI States
    showProjectDetails: false,
    setShowProjectDetails: (show) => set({ showProjectDetails: show }),
    isMobile: false,
    setIsMobile: (isMobile) => set({ isMobile }),
  }))
);
