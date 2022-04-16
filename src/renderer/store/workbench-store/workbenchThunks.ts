import { createAsyncThunk } from '@reduxjs/toolkit';
import { reportService } from '@api/services/report.service';
import { workbenchController } from '../../controllers/workbench-controller';
import { fetchComponents } from '../component-store/componentThunks';
import { setProgress } from './workbenchSlice';
import { setComponent } from '../component-store/componentSlice';
import { RootState } from '../rootReducer';

export const loadProject = createAsyncThunk('workbench/loadProject', async (path: string, { dispatch }) => {
  const response = await workbenchController.loadScan(path);
  dispatch(update());
  return response;
});

export const update = createAsyncThunk('workbench/update', async (_arg, { getState, dispatch }) => {
  const state = getState() as RootState;
  if (state.component.component) {
    const comp = await workbenchController.getComponent(state.component.component.purl);
    dispatch(setComponent(comp));
  }

  dispatch(fetchComponents());

  const summary = await reportService.getSummary();
  dispatch(setProgress(summary));

  return true;
});
