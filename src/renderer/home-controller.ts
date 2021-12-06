import { projectService } from '../api/project-service';
import { INewProject } from '../api/types';
import { workspaceService } from '../api/workspace-service';
import { IpcEvents } from '../ipc-events';
import { workspace } from '../main/workspace/Workspace';

const { ipcRenderer } = require('electron');

export const scan = (path: string) => {

  const pInfo: INewProject = {
    name: 'myProject',
    scan_root: path,
    default_license: 'APACHE-2.0',
  };

  workspaceService.createProject(pInfo);

};

export const resume = async (path: string) => {
  const response = await projectService.resume(path);
};

export const rescan = async (path: string) => {
  await projectService.rescan(path);
};

export const open = async (path: string) => {
   const response = await projectService.load(path);
   return response;
};

export const defaultWorkspacePath = async () => {
  const response = await projectService.workspacePath();
  return response;
};
