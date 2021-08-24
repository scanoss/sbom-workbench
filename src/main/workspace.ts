import { ipcMain } from 'electron';
import { IpcEvents } from '../ipc-events';
import { workspace } from './workspace/workspace';
import { Response } from './Response';

ipcMain.handle(IpcEvents.WORKSPACE_PROJECT_LIST, async (event) => {
  try {
    const projects = await workspace.listProjects();
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
    workspace.deleteProject(projectPath);
    return Response.ok();
  } catch (error) {
    console.error(error);
    return Response.fail({ message: error.message });
  }
});
