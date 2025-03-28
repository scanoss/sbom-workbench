import { createAsyncThunk } from '@reduxjs/toolkit';
import { workspaceService } from '@api/services/workspace.service';
import { userSettingService } from '@api/services/userSetting.service';
import { IWorkspaceCfg, WorkspaceData } from '@api/types';
import { RootState } from '@store/rootReducer';

export const init = createAsyncThunk('workspace/init', async (payload, thunkAPI) => {
  const app = await window.app.getInfo();
  const settings = await userSettingService.get();
  return { app, settings };
});

export const setSettings = createAsyncThunk('workspace/setSettings', async (payload: Partial<IWorkspaceCfg>, thunkAPI) => {
  const newSettings = await userSettingService.set(payload);
  return newSettings;
});

export const removeWorkspace = createAsyncThunk(
  'workspace/removeWorkspace',
  async (workspace: WorkspaceData, { dispatch, getState }) => {
    const state = getState() as RootState;
    const { settings } = state.workspace;

    const currentWorkspace = settings.WORKSPACES[settings.DEFAULT_WORKSPACE_INDEX];
    const workspaces = settings.WORKSPACES.filter((item) => item !== workspace);
    const currentWorkspaceIndex = workspaces.findIndex(
      (ws) => ws.PATH === currentWorkspace.PATH,
    );

    const updatedSettings = {
      ...settings,
      WORKSPACES: workspaces,
      DEFAULT_WORKSPACE_INDEX: currentWorkspaceIndex,
    };
    // Call the existing setSettings thunk which already makes the API call
    // setSettings will call userSettingService.set() with the updatedSettings
    return await dispatch(setSettings(updatedSettings)).unwrap();
  },
);


export const fetchProjects = createAsyncThunk('workspace/fetchProjects', async (payload, thunkAPI) => {
  const projects = await workspaceService.getAllProjects();
  return projects;
});
