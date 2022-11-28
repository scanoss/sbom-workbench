import { createSlice, current, PayloadAction } from '@reduxjs/toolkit';
import { INewProject, IProject } from '@api/types';
import { fetchProjects } from '@store/workspace-store/workspaceThunks';
import { RootState } from '@store/rootReducer';
import { IScan } from '@context/types';

export interface WorkspaceState {
  loading: boolean;
  projects: IProject[];
  currentProject: IProject;
  newProject: INewProject;
  scanPath: IScan;
}

const initialState: WorkspaceState = {
  loading: false,
  projects: null,
  currentProject: null,
  newProject: null,
  scanPath: null,
};

export const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setNewProject: (state, action: PayloadAction<INewProject>) => {
      state.newProject = action.payload;
    },
    setScanPath: (state, action: PayloadAction<IScan>) => {
      state.scanPath = action.payload;
      state.currentProject = current(state).projects.find((p) => p.work_root === action.payload.path);
    },
  },
  extraReducers: {
    [fetchProjects.pending.type]: (state) => ({ ...state, loading: true }),
    [fetchProjects.fulfilled.type]: (state, action: PayloadAction<IProject[]>) => ({
      ...state,
      loading: false,
      projects: action.payload,
    }),
    [fetchProjects.rejected.type]: (state) => ({ ...state, loading: false }),
  },
});

// actions
export const { setNewProject, setScanPath } = workspaceSlice.actions;

// selectors
export const selectWorkspaceState = (state: RootState) => state.workspace;

export default workspaceSlice.reducer;
