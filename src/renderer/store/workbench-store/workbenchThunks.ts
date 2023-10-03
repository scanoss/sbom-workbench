import { createAsyncThunk } from '@reduxjs/toolkit';
import { convertTreeToNode } from '@shared/utils/filetree-utils';
import { RootState } from '@store/rootReducer';
import { setLoading } from '@store/navigation-store/navigationSlice';
import { workbenchController } from '../../controllers/workbench-controller';

const prom = (tree, old): Promise<any> => {
  return new Promise<any>((resolve, reject) => {
    const nTree = convertTreeToNode(tree, old);
    resolve(nTree);
  });
};

export const loadProject = createAsyncThunk('workbench/loadProject', async (path: string, { dispatch }) => {
  const response = await workbenchController.loadScan(path);
  return response;
});

export const loadProjectSettings = createAsyncThunk('workbench/loadProjectSettings', async () => {
  const response = await workbenchController.loadSettings();
  return response;
});

export const setTree = createAsyncThunk('workbench/setTree', async (tree: any, thunkAPI) => {
  const state = thunkAPI.getState() as RootState;
  const nTree = await prom(tree, state.workbench.tree);
  setTimeout(() => thunkAPI.dispatch(setLoading(false)), 10);

  return nTree;
});
