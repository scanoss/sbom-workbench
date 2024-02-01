import { createAsyncThunk } from '@reduxjs/toolkit';
import { workspaceService } from '@api/services/workspace.service';
import { userSettingService } from '@api/services/userSetting.service';

export const init = createAsyncThunk('workspace/init', async (payload, thunkAPI) => {
  const app = await window.app.getInfo();
  const settings = await userSettingService.get();
  return { app, settings };
});

export const fetchProjects = createAsyncThunk('workspace/fetchProjects', async (payload, thunkAPI) => {
  const projects = await workspaceService.getAllProjects();
  return projects;
});
