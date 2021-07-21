import { IpcEvents } from '../ipc-events';
import { File } from './types';

const { ipcRenderer } = require('electron');

class FileService {
  public async getFileContent(args: string): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.FILE_GET_CONTENT, args);
    return response;
  }

  public async get(args: Partial<File>): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.FILE_GET, args);
    return response;
  }
}
export const fileService = new FileService();
