import { IpcEvents } from '../ipc-events';
import { BaseService } from './base.service';


const { ipcRenderer } = require('electron');

class FileService extends BaseService {
  public async getFileContent(args: string): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.FILE_GET_CONTENT, args);
    return response;
  }

  public async get(args: Partial<File>): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.FILE_GET, args);
    return response;
  }

  public async getIdFromPath(args: string): Promise<number> {
    const response = await ipcRenderer.invoke(IpcEvents.FILE_GET_ID_FROM_PATH, args);
    return this.response(response);
  }

  public async ignored(files: number[]): Promise<boolean> {
    const response = await ipcRenderer.invoke(IpcEvents.IGNORED_FILES, files);
    return this.response(response);
  }
}
export const fileService = new FileService();
