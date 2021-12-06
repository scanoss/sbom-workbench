import { projectService } from '../api/project-service';
import { INewProject } from '../api/types';
import { workspaceService } from '../api/workspace-service';
import { IpcEvents } from '../ipc-events';
import { workspace } from '../main/workspace/Workspace';
import path from 'path';

const { ipcRenderer } = require('electron');

export const scan = (dir: string) => {

  const pInfo: INewProject = {
    name: path.basename(dir),
    scan_root: dir,
    default_license: null,
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
