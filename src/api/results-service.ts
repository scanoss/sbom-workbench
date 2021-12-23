import { IpcEvents } from '../ipc-events';
import { BaseService } from './base-service';

const { ipcRenderer } = require('electron');

class ResultService extends BaseService {
  public async ignored(files: number[]): Promise<boolean> {
    const response = await ipcRenderer.invoke(IpcEvents.IGNORED_FILES, files);
    return this.response(response);
  }

  public async unignored(files: number[]): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.UNIGNORED_FILES, files);
    return this.response(response);
  }

  public async get(path: string): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.RESULTS_GET, path);
    return this.response(response);
  }

  public async getNoMatch(path: string): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.RESULTS_GET_NO_MATCH, path);
    return this.response(response);
  }

}

export const resultService = new ResultService();
