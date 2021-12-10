import { projectService } from '../api/project-service';
import { INewProject } from '../api/types';
import { workspaceService } from '../api/workspace-service';

const { ipcRenderer } = require('electron');

export const scan = (project: INewProject) => {
  workspaceService.createProject(project);
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
