import { createAsyncThunk } from '@reduxjs/toolkit';
import { workbenchController } from '../../controllers/workbench-controller';

export const fetchComponents = createAsyncThunk('workbench/loadComponents', async () => {
  const response = await workbenchController.getComponents();
  return response;
});
