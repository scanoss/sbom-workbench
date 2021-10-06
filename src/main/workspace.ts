import { ipcMain } from 'electron';
import { IpcEvents } from '../ipc-events';
import { workspace } from './workspace/Workspace';
import { Response } from './Response';
import { Project } from './workspace/Project';
import { WSA_E_CANCELLED } from 'constants';
import Workspace from '../renderer/features/workspace/Workspace';
import { Dashboard } from '@material-ui/icons';
import { IProject, IWorkspaceCfg } from '../api/types';
ipcMain.handle(IpcEvents.WORKSPACE_PROJECT_LIST, async (event) => {
  try {
    const projects = await workspace.getProjectsDtos();
    return Response.ok({
      message: 'Projects list retrieved succesfully',
      data: projects,
    });
  } catch (error: any) {
    console.error(error);
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(IpcEvents.WORKSPACE_DELETE_PROJECT, async (event, projectPath: string) => {
  try {
    await workspace.removeProjectByPath(projectPath);
    return Response.ok();
  } catch (error :any) {
    console.error(error );
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(IpcEvents.UTILS_GET_PROJECT_DTO, async (event) => {
  try {
    const path: IProject = workspace.getOpenedProjects()[0].getDto();
    return Response.ok({ message: 'Project path succesfully retrieved', data: path });
  } catch (e: any) {
    console.log('Catch an error: ', e);
    return Response.fail({ message: e.message });
  }
});

ipcMain.handle(IpcEvents.WORKSPACE_GET_WS_CONFIG, async (event)=> {
  try {    
    const config: IWorkspaceCfg = await workspace.getWSConfig();
    return Response.ok({ message: 'Project path succesfully retrieved', data: config });
  } catch (e: any) {
    console.log('Catch an error: ', e);
    return Response.fail({ message: e.message });
  }
});

ipcMain.handle(IpcEvents.WORKSPACE_SET_WS_CONFIG, async (event, conf: Partial<IWorkspaceCfg>) => {
  try {
    await workspace.setWSConfig(conf);
    return Response.ok({ message: 'Project config save successfully' });
  } catch (e: any) {
    console.log('Catch an error: ', e);
    return Response.fail({ message: e.message });
  }
});
