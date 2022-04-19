import { createAsyncThunk } from '@reduxjs/toolkit';
import { workspaceService } from '@api/services/workspace.service';

export const fetchProjects = createAsyncThunk('workspace/fetchProjects', async (payload, thunkAPI) => {
  const projects = await workspaceService.getAllProjects();
  return projects;
});
