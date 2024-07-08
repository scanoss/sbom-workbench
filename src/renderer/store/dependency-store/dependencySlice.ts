import { Dependency, DependencyManifestFile } from '@api/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  accept,
  acceptAll,
  getAll,
  getAllManifestFiles,
  reject,
  rejectAll,
  restore,
  restoreAll,
} from '@store/dependency-store/dependencyThunks';
import { RootState } from '@store/rootReducer';

export interface DependencyState {
  dependencies: Dependency[];
  loading: boolean;
  batchRunning: boolean;
  scopes: Array<string>;
  files: Array<string>;
  dependencyManifestFiles: DependencyManifestFile[];
}

const initialState: DependencyState = {
  dependencies: [],
  dependencyManifestFiles: [],
  loading: false,
  batchRunning: false,
  scopes: [],
  files: [],
};

export const dependencySlice = createSlice({
  name: 'dependency',
  initialState,
  reducers: {
    reset: (state) => initialState,
  },
  extraReducers: {
    [getAllManifestFiles.fulfilled.type]: (state, action: PayloadAction<DependencyManifestFile[]>) => {
      state.dependencyManifestFiles = action.payload;
    },
    [getAll.pending.type]: (state) => {
      state.loading = true;
    },
    [getAll.fulfilled.type]: (state, action: PayloadAction<Dependency[]>) => {
      const files = new Set<string>();
      action.payload.forEach((d) => { files.add(d.path); });
      state.loading = false;
      state.dependencies = action.payload;
      state.scopes = getDependencyScopes(action.payload);
      state.files = Array.from(files.values());
    },
    [getAll.rejected.type]: (state) => {
      state.loading = false;
    },
    [accept.fulfilled.type]: (state, action: PayloadAction<Dependency>) => {
      state.dependencies = state.dependencies.map((dependency) => (dependency.dependencyId === action.payload.dependencyId ? action.payload : dependency));
    },
    [reject.fulfilled.type]: (state, action: PayloadAction<Dependency>) => {
      state.dependencies = state.dependencies.map((dependency) => (dependency.dependencyId === action.payload.dependencyId ? action.payload : dependency));
    },
    [restore.fulfilled.type]: (state, action: PayloadAction<Dependency>) => {
      state.dependencies = state.dependencies.map((dependency) => (dependency.dependencyId === action.payload.dependencyId ? action.payload : dependency));
    },
    [acceptAll.pending.type]: (state) => {
      state.batchRunning = true;
    },
    [acceptAll.fulfilled.type]: (state) => {
      state.batchRunning = false;
    },
    [acceptAll.rejected.type]: (state) => {
      state.batchRunning = false;
    },
    [rejectAll.pending.type]: (state) => {
      state.batchRunning = true;
    },
    [rejectAll.fulfilled.type]: (state) => {
      state.batchRunning = false;
    },
    [rejectAll.rejected.type]: (state) => {
      state.batchRunning = false;
    },
    [restoreAll.pending.type]: (state) => {
      state.batchRunning = true;
    },
    [restoreAll.fulfilled.type]: (state) => {
      state.batchRunning = false;
    },
    [restoreAll.rejected.type]: (state) => {
      state.batchRunning = false;
    },
  },
});

const getDependencyScopes = (dep: Array<Dependency>) => {
  const scopeMapper = new Set<string>();
  dep.forEach((d) => {
    if(d.scope){
       scopeMapper.add(d.scope);
    }

  });
  return Array.from(scopeMapper.values());
};

// actions
export const { reset } = dependencySlice.actions;

// selectors
export const selectDependencyState = (state: RootState) => state.dependency;

export default dependencySlice.reducer;
