import { IpcEvents } from '../ipc-events';
import { BaseService } from './base-service';
import { INewProject, IProject, License } from './types';

const { ipcRenderer } = require('electron');

class WorkspaceService extends BaseService {
  public async getAllProjects(): Promise<IProject[]> {
    const response = await ipcRenderer.invoke(IpcEvents.WORKSPACE_PROJECT_LIST);
    return this.response(response);
  }

  public async deleteProject(args): Promise<void> {
    const response = await ipcRenderer.invoke(IpcEvents.WORKSPACE_DELETE_PROJECT, args);
    return this.response(response);
  }

  public async getProjectDTO(): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.UTILS_GET_PROJECT_DTO);
    return this.response(response);
  }

  public async getLicenses(): Promise<Array<License>> {
    const response = await ipcRenderer.invoke(IpcEvents.GET_LICENSES);
    return this.response(response);
  }

  public async createProject(project: INewProject): Promise<void> {
    const response = await ipcRenderer.invoke(IpcEvents.WORKSPACE_CREATE_PROJECT, project);
    return this.response(response);
  }

  public async importProject(projectZipPath: string): Promise<IProject> {
    const response = await ipcRenderer.invoke(IpcEvents.WORKSPACE_IMPORT_PROJECT, projectZipPath);
    return this.response(response);
  }
}

export const workspaceService = new WorkspaceService();

document.ws = workspaceService;
