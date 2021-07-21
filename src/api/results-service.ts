import { IpcEvents } from '../ipc-events';
const { ipcRenderer } = require('electron');

class ResultService {
  public async ignored(args: string[]): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.IGNORED_FILES, args);
    return response;
  }

  public async unignored(args: string[]): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.UNIGNORED_FILES, args);
    return response;
  }
}



export const resultService = new ResultService();
