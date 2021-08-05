import { ipcMain } from 'electron';
import { IpcEvents } from '../ipc-events';
import { workspace } from '../main/workspace/workspace'


ipcMain.handle(IpcEvents.WORKSPACE_PROJECT_LIST, async (event) => {
  const projectList = await workspace.listProjects();
  return { status: 'ok', message: 'project list', data: projectList };
});

ipcMain.handle(IpcEvents.WORKSPACE_DELETE_PROJECT, async (event, projectPath: string) => {
  const status = await workspace.deleteProject(projectPath);
  if (status) return { status: 'ok', message: 'project deleted', data: projectPath };
  return { status: 'fail', message: 'cannot delete project', data: projectPath };
});
