import { createAsyncThunk } from '@reduxjs/toolkit';
import { workspaceService } from '@api/services/workspace.service';
import { userSettingService } from '@api/services/userSetting.service';
import { IWorkspaceCfg } from '@api/types';

export const init = createAsyncThunk('workspace/init', async (payload, thunkAPI) => {
  const app = await window.app.getInfo();
  const settings = await userSettingService.get();
  return { app, settings };
});

export const setSettings = createAsyncThunk('workspace/setSettings', async (payload: Partial<IWorkspaceCfg>, thunkAPI) => {
  const newSettings = await userSettingService.set(payload);
  return newSettings;
});


export const fetchProjects = createAsyncThunk('workspace/fetchProjects', async (payload, thunkAPI) => {
  const projects = await workspaceService.getAllProjects();
  return projects;
});
