import { IpcEvents } from '../ipc-events';
import { Project } from './types';

const { ipcRenderer } = require('electron');

class ProjectService {
  public async get(id: number): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.INVENTORY_GET, id);
    return response;
  }

  public async create(project: Project): Promise<any> {
    const response = await ipcRenderer.invoke(
      IpcEvents.PROJECT_CREATE_SCAN,
      project
    );
    return response;
  }
}

export const projectService = new ProjectService();
