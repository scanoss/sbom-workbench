import { ipcMain } from 'electron';
import { IpcEvents } from '../ipc-events';
import { workspace } from './workspace/workspace';
import { Response } from './Response';
import { Project } from './workspace/Project';
import { WSA_E_CANCELLED } from 'constants';
import Workspace from '../renderer/features/workspace/Workspace';
import { Dashboard } from '@material-ui/icons';
ipcMain.handle(IpcEvents.WORKSPACE_PROJECT_LIST, async (event) => {

  try {
    const projects = await workspace.getProjectsDtos();
    return Response.ok({
      message: 'Projects list retrieved succesfully',
      data: projects,
    });
  } catch (error) {
    console.error(error);
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(IpcEvents.WORKSPACE_DELETE_PROJECT, async (event, projectPath: string) => {
  try {
    await workspace.removeProjectByPath(projectPath);
    return Response.ok();
  } catch (error) {
    console.error(error);
    return Response.fail({ message: error.message });
  }
});
