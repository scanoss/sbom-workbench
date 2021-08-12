import { IpcEvents } from '../ipc-events';
import { Project } from './types';

const { ipcRenderer } = require('electron');

class ProjectService {
  public async get(args: Partial<Project>): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.INVENTORY_GET, args);
    return response;
  }

  public async create(project: Project): Promise<any> {
    const response = await ipcRenderer.invoke(
      IpcEvents.PROJECT_CREATE_SCAN,
      project
    );
    return response;
  }

  public async load(path: string): Promise<any> {
    const response = await ipcRenderer.invoke(
      IpcEvents.PROJECT_LOAD_SCAN,
      path
    );
    return response;
  }

  public async workspacePath(): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.UTILS_DEFAULT_PROJECT_PATH);
    return response;
  }

  public async getProjectName(): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.UTILS_PROJECT_NAME);
    return response;
  }
}

export const projectService = new ProjectService();
