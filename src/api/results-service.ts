import { IpcEvents } from '../ipc-events';
import { BaseService } from './base-service';

const { ipcRenderer } = require('electron');

class ResultService extends BaseService {
  public async get(path: string): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.RESULTS_GET, path);
    return this.response(response);
  }
}

export const resultService = new ResultService();
