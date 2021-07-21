import { IpcEvents } from '../ipc-events';

const { ipcRenderer } = require('electron');

class FileService {
  public async getFileContent(args: string): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.FILE_GET_CONTENT, args);
    return response;
  }

  public async get(args: string): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.FILE_GET, args);
    return response;
  }
}
export const fileService = new FileService();
