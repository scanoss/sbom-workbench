import { IpcEvents } from '../ipc-events';

const { ipcRenderer } = require('electron');

class ResultService {
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
}



export const resultService = new ResultService();
