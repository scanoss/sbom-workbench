import { createSlice, current, PayloadAction } from '@reduxjs/toolkit';
import { INewProject, IProject } from '@api/types';
import { fetchProjects, init, init } from '@store/workspace-store/workspaceThunks';
import { RootState } from '@store/rootReducer';
import { IScan } from '@context/types';
import { IAppInfo } from '@api/dto';

export interface WorkspaceState {
  appInfo: IAppInfo,
  loading: boolean;
  projects: IProject[];
  currentProject: IProject;
  newProject: INewProject;
  scanPath: IScan;
}

const initialState: WorkspaceState = {
  appInfo: null,
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
    },
    setCurrentProject: (state, action: PayloadAction<IProject>) => {
      state.currentProject = action.payload
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
    [init.fulfilled.type]: (state, action: PayloadAction<IAppInfo>) => ({
      ...state,
      appInfo: action.payload,
    }),

  },
});

// actions
export const { setNewProject, setScanPath, setCurrentProject } = workspaceSlice.actions;

// selectors
export const selectWorkspaceState = (state: RootState) => state.workspace;

export default workspaceSlice.reducer;
