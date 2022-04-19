import { createAsyncThunk } from '@reduxjs/toolkit';
import { workbenchController } from '../../controllers/workbench-controller';

export const loadProject = createAsyncThunk('workbench/loadProject', async (path: string, { dispatch }) => {
  const response = await workbenchController.loadScan(path);
  return response;
});
