import { createAsyncThunk } from '@reduxjs/toolkit';
import { workbenchController } from '../../controllers/workbench-controller';

export const fetchComponent = createAsyncThunk('workbench/loadComponent', async (purl: string) => {
  const response = await workbenchController.getComponent(purl);
  return response;
});

export const fetchComponents = createAsyncThunk('workbench/loadComponents', async () => {
  const response = await workbenchController.getComponents();
  return response;
});
