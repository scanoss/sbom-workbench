import { IpcEvents } from '../ipc-events';
import { BaseService } from './base.service';
import { DependencyDTO } from '../types';

const { ipcRenderer } = require('electron');

class DepencyService extends BaseService {
  public async getAll(params: any): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.DEPENDENCY_GET_ALL, params);
    return this.response(response);
  }

  public async accept(params: Partial<DependencyDTO>): Promise<DependencyDTO> {
    const response = await ipcRenderer.invoke(IpcEvents.DEPENDENCY_ACCEPT, params);
    return this.response(response);
  }

  public async reject(dependencyId: number): Promise<DependencyDTO> {
    const response = await ipcRenderer.invoke(IpcEvents.DEPENDENCY_REJECT, dependencyId);
    return this.response(response);
  }
}

export const dependencyService = new DepencyService();

document.dep = dependencyService;
