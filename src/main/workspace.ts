import { ipcMain } from 'electron';
import { IpcEvents } from '../ipc-events';
import { workspace } from '../main/workspace/workspace'

ipcMain.handle(IpcEvents.WORKSPACE_PROJECT_LIST, async (event) => {

  const projectList = workspace.listProjects();
  return { status: 'ok', message: 'project list', data: projectList };
});
