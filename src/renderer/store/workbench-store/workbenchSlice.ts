import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { collapseAll, convertTreeToNode, expandAll, expandToMatches } from '@shared/utils/filetree-utils';
import { loadProject, setTree } from './workbenchThunks';
import { RootState } from '../rootReducer';
import { ISummary } from "../../../main/services/ReportService";
import { Scanner } from '../../../main/task/scanner/types';

export interface WorkbenchState {
  path: string;
  name: string;
  imported: boolean;
  wfp: boolean;
  tree: any[]; // TODO: define type
  summary: ISummary; // TODO: define type
  progress: number;
  projectScannerConfig: Scanner.ScannerConfig;
  dependencies: string[]; // TODO: move to dependency store
  file: string | null;
  history: {
    section: number;
  };
  loading: boolean;
  loaded: boolean;
  settings: {
    isApiKeySetted: boolean;
  };
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
  history: {
    section: null,
  },
  settings: {
    isApiKeySetted: false,
  },
};

export const workbenchSlice = createSlice({
  name: 'workbench',
  initialState,
  reducers: {
    load: (state, action: PayloadAction<WorkbenchState>) => {},
   /* setTree: (state, action: PayloadAction<any>) => {
      const tree = action.payload;
      state.tree = convertTreeToNode(tree, state.tree);
    }, */
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

      console.log(summary);

      const progress =
        summary.summary.matchFiles === 0
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
      const { name, imported, fileTree, dependencies, scanRoot, config } = action.payload;

      state.path = scanRoot;
      state.name = name;
      state.loading = false;
      state.loaded = true;
      state.imported = imported;
      state.wfp = config.source === Scanner.ScannerSource.WFP
      state.tree = convertTreeToNode(fileTree, [fileTree]);
      state.dependencies = dependencies;
      state.projectScannerConfig = config;
    });
    builder.addCase(setTree.fulfilled, (state, action) => {
      state.tree = action.payload;
    });
  },
});

// actions
export const { load, updateTree, collapseTree, expandTree, setProgress, setHistory, reset } =
  workbenchSlice.actions;

// selectors
export const selectWorkbench = (state: RootState) => state.workbench;

export default workbenchSlice.reducer;
