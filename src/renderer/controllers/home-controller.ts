import { projectService } from '../../api/services/project.service';
import { workspaceService } from '../../api/services/workspace.service';
import { INewProject } from '../../api/types';

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

