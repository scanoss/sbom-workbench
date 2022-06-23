import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@store/rootReducer';
import { workbenchController } from '../../controllers/workbench-controller';

export const fetchComponent = createAsyncThunk('workbench/loadComponent', async (purl: string, thunkAPI) => {
  const response = await workbenchController.getComponent(purl);

  // TODO: remove this block after backend changes.
  if (!response) {
    const state = thunkAPI.getState() as RootState;
    return state.component.component;
  }

  return response;
});

export const fetchComponents = createAsyncThunk('workbench/loadComponents', async () => {
  const response = await workbenchController.getComponents();
  return response;
});

/*export const importGlobalComponent = createAsyncThunk('workbench/importGlobalComponent', async () => {


  /!* const response = await workbenchController.im
  console.log(response);*!/
  return response;
});*/


