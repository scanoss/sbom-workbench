import { IpcEvents } from '../ipc-events';
import { BaseService } from './base-service';

const { ipcRenderer } = require('electron');


class ResultService extends BaseService {
  public async ignored(files: number[]): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.IGNORED_FILES, files);
    return response;
  }

  public async unignored(files: number[]): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.UNIGNORED_FILES, files);
    return response;
  }

  public async get(path: string): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.RESULTS_GET, path);
    return response;
  }

  public async getNoMatch(path: string): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.RESULTS_GET_NO_MATCH, path);
    return response;
  }

  public async createFiltered(path: string): Promise<any> { 
    const response = await ipcRenderer.invoke(IpcEvents.RESULTS_ADD_FILTERED_FILE, path);
    return this.response(response);
  }

  public async updateNoMatchToFile(path: string): Promise<any> { 
    const response = await ipcRenderer.invoke(IpcEvents.RESULTS_FORCE_ATTACH, path);
    return this.response(response);
  }

}

export const resultService = new ResultService();
