import { createAsyncThunk } from '@reduxjs/toolkit';
import { workspaceService } from '@api/services/workspace.service';

export const init = createAsyncThunk('workspace/init', async (payload, thunkAPI) => {
  const info = await window.app.getInfo();
  return info;
});

export const fetchProjects = createAsyncThunk('workspace/fetchProjects', async (payload, thunkAPI) => {
  const projects = await workspaceService.getAllProjects();
  return projects;
});
