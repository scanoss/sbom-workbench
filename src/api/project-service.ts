import { IpcEvents } from '../ipc-events';
import { IProject } from './types';
import { BaseService } from './base-service';

const { ipcRenderer } = require('electron');

class ProjectService extends BaseService {
  public async get(args: Partial<IProject>): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.INVENTORY_GET, args);
    return response;
  }

  public async resume(path: string): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.PROJECT_RESUME_SCAN, path);
    return response;
  }

  public async stop(): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.PROJECT_STOP_SCAN);
    return response;
  }

  public async create(project: IProject): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.PROJECT_CREATE_SCAN, project);
    return response;
  }

  public async rescan(path: string): Promise<void> {
    const response = await ipcRenderer.invoke(IpcEvents.PROJECT_RESCAN, path);
    return this.response(response);
  }

  public async load(path: string): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.PROJECT_OPEN_SCAN, path);
    return response;
  }

  public async getProjectName(): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.UTILS_PROJECT_NAME);
    return response;
  }

  public async getNodeFromPath(path: string): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.UTILS_GET_NODE_FROM_PATH, path);
    return this.response(response);
  }

  public async getToken(): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.GET_TOKEN);
    return this.response(response);
  }

  public async getTree(): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.PROJECT_READ_TREE);
    return this.response(response);
  }
}

export const projectService = new ProjectService();

document.ps = projectService;
