import { createAsyncThunk } from '@reduxjs/toolkit';
import { convertTreeToNode } from '@shared/utils/filetree-utils';
import { RootState } from '@store/rootReducer';
import { setLoading } from '@store/navigation-store/navigationSlice';
import { workbenchController } from '../../controllers/workbench-controller';
import { ProjectAccessMode } from '@api/types';
import { reset } from './workbenchSlice';

const prom = (tree, old): Promise<any> => {
  return new Promise<any>((resolve, reject) => {
    const nTree = convertTreeToNode(tree, old);
    resolve(nTree);
  });
};

export const loadProject = createAsyncThunk('workbench/loadProject', async (payload: any, { dispatch }) => {
  const { path, mode } = payload;
  const response = await workbenchController.loadScan(path, mode);
  return response;
});

export const loadProjectSettings = createAsyncThunk(
  'workbench/loadProjectSettings',
  async () => {
    try{
      const response = await workbenchController.loadSettings();
      return response;
    } catch (e: any){
      return null;
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as RootState;
      return state.workbench.loaded;
    },
  }
);

export const setTree = createAsyncThunk('workbench/setTree', async (tree: any, thunkAPI) => {
  const state = thunkAPI.getState() as RootState;
  const nTree = await prom(tree, state.workbench.tree);
  setTimeout(() => thunkAPI.dispatch(setLoading(false)), 10);

  return nTree;
});

export const closeProject = createAsyncThunk('workbench/closeProject', async (_, thunkAPI) => {
  thunkAPI.dispatch(reset());
  try {
    await workbenchController.closeCurrentScan();
  } catch (e) {
    console.error(e);
  }
  return true;
});
