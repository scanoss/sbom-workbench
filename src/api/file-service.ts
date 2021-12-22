import { IpcEvents } from '../ipc-events';
import { BaseService } from './base-service';


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

  public async getIdFromPath(args: string): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.FILE_GET_ID_FROM_PATH, args);
    return this.response(response);
  }
}
export const fileService = new FileService();
