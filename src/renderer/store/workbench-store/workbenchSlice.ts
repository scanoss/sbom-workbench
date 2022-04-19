import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { convertTreeToNode } from '@shared/utils/filetree-utils';
import { IWorkbenchFilter, Node } from '@api/types';
import { loadProject } from './workbenchThunks';
import { RootState } from '../rootReducer';

export interface WorkbenchState {
  path: string;
  name: string;
  imported: boolean;
  tree: any; // TODO: define type
  summary: any; // TODO: define type
  progress: number;
  dependencies: string[]; // TODO: move to dependency store
  file: string | null;
  history: {
    section: number;
  };
  loading: boolean;
  loaded: boolean;
}

const initialState: WorkbenchState = {
  path: null,
  name: null,
  imported: false,
  tree: null,
  summary: null,
  progress: 0,
  dependencies: [],
  file: null,
  loading: false,
  loaded: false,
  history: {
    section: null,
  },
};

export const workbenchSlice = createSlice({
  name: 'workbench',
  initialState,
  reducers: {
    load: (state, action: PayloadAction<WorkbenchState>) => {},
    updateTree: (state, action: PayloadAction<any>) => {
      const tree = action.payload;
      const nodes = convertTreeToNode(tree, []);
      state.tree = nodes;
    },
    setProgress: (state, action: PayloadAction<any>) => {
      const summary = action.payload;

      const progress =
        summary?.detectedFiles === 0
          ? 100
          : ((summary?.detectedIdentifiedFiles + summary?.ignoredFiles) * 100) / summary?.detectedFiles;

      state.progress = progress;
      state.summary = summary;
    },
    setHistory: (state, action: PayloadAction<any>) => {
      state.history = { ...state.history, ...action.payload };
    },
    reset: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(loadProject.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(loadProject.fulfilled, (state, action) => {
      const { name, imported, fileTree, dependencies, scanRoot } = action.payload;

      state.path = scanRoot;
      state.name = name;
      state.loading = false;
      state.loaded = true;
      state.imported = imported;
      state.tree = convertTreeToNode(fileTree, [fileTree]);
      state.dependencies = Array.from(dependencies);
    });
  },
});

// actions
export const { load, updateTree, setProgress, setHistory, reset } = workbenchSlice.actions;

// selectors
export const selectWorkbench = (state: RootState) => state.workbench;

export default workbenchSlice.reducer;
