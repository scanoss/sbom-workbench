import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  collapseAll, convertTreeToNode, expandAll, expandToMatches,
} from '@shared/utils/filetree-utils';
import { ProjectAccessMode, ProjectSource } from '@api/types';
import { status } from '@grpc/grpc-js';
import { loadProject, loadProjectSettings, setTree } from './workbenchThunks';
import { RootState } from '../rootReducer';
import { ISummary } from '../../../main/services/ReportService';
import { Scanner } from '../../../main/task/scanner/types';

export interface WorkbenchState {
  path: string;
  name: string;
  imported: boolean;
  wfp: boolean;
  tree: any[]; // TODO: define type
  summary: ISummary;
  progress: number;
  projectScannerConfig: Scanner.ScannerConfig;
  dependencies: string[]; // TODO: move to dependency store
  projectSource: ProjectSource;
  file: string | null;
  history: {
    section: number;
  };
  loading: boolean;
  loaded: boolean;
  settings: {
    api_url: string;
    api_key: string;
    isApiKeySetted: boolean;
  };
  mode: ProjectAccessMode,
  lockedBy: string;
}

const initialState: WorkbenchState = {
  path: null,
  name: null,
  imported: false,
  wfp: false,
  tree: null,
  summary: null,
  progress: 0,
  projectScannerConfig: null,
  dependencies: [],
  file: null,
  loading: false,
  loaded: false,
  projectSource: null,
  history: {
    section: null,
  },
  settings: {
    api_url: null,
    api_key: null,
    isApiKeySetted: false,
  },
  mode: ProjectAccessMode.WRITE,
  lockedBy: null,
};

export const workbenchSlice = createSlice({
  name: 'workbench',
  initialState,
  reducers: {
    load: (state, action: PayloadAction<WorkbenchState>) => {},
    updateTree: (state, action: PayloadAction<any>) => {
      state.tree = action.payload;
    },
    expandTree: (state, action: PayloadAction<{ node: any; toMatch: boolean }>) => {
      const { node, toMatch } = action.payload;
      state.tree = !toMatch ? expandAll(state.tree, node) : expandToMatches(state.tree, node);
    },
    collapseTree: (state, action) => {
      state.tree = collapseAll(state.tree, action.payload);
    },
    setProgress: (state, action: PayloadAction<ISummary>) => {
      const summary = action.payload;

      const progress = summary.summary.matchFiles === 0
        ? 100
        : ((summary.identified.scan + summary.original) * 100) / summary.summary.matchFiles;

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
      const {
        name, imported, fileTree, dependencies, scanRoot, config, mode, lockedBy, projectSource
      } = action.payload;
      state.path = scanRoot;
      state.name = name;
      state.loading = false;
      state.loaded = true;
      state.imported = imported && !scanRoot;
      state.wfp = config.source === Scanner.ScannerSource.WFP;
      state.tree = convertTreeToNode(fileTree, [fileTree]);
      state.dependencies = dependencies;
      state.projectScannerConfig = config;
      state.mode = mode;
      state.projectSource = projectSource;
      state.lockedBy = lockedBy;
    });
    builder.addCase(setTree.fulfilled, (state, action) => {
      state.tree = action.payload;
    });
    builder.addCase(loadProjectSettings.fulfilled, (state, action) => {
      const { api_url, api_key } = action.payload;
      state.settings = {
        api_key,
        api_url,
        isApiKeySetted: !!api_key,
      };
    });
  },
});

// actions
export const {
  load, updateTree, collapseTree, expandTree, setHistory, reset, setProgress
} = workbenchSlice.actions;

// selectors
export const selectWorkbench = (state: RootState) => state.workbench;
export const selectIsReadOnly = (state: RootState) => state.workbench.mode === ProjectAccessMode.READ_ONLY;

export default workbenchSlice.reducer;
