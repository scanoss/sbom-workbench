import { IpcEvents } from '../ipc-events';
import { BaseService } from './base-service';

const { ipcRenderer } = require('electron');

class DepencyService extends BaseService {
  public async getAll(params: any): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.DEPENDENCY_GET_ALL, params);
    return this.response(response);
  }
}

export const dependencyService = new DepencyService();

document.dep = dependencyService;