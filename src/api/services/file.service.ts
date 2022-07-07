import { IpcEvents } from '../ipc-events';
import { BaseService } from './base.service';
import { FileDTO, GetFileDTO } from "../dto";



class FileService extends BaseService {
  public async getFileContent(args: string): Promise<any> {
    const response = await window.electron.ipcRenderer.invoke(IpcEvents.FILE_GET_CONTENT, args);
    return response;
  }

  public async get(params: GetFileDTO): Promise<FileDTO> {
    const response = await window.electron.ipcRenderer.invoke(IpcEvents.FILE_GET, params);
    return this.response(response);
  }

  public async ignored(files: number[]): Promise<boolean> {
    const response = await window.electron.ipcRenderer.invoke(IpcEvents.IGNORED_FILES, files);
    return this.response(response);
  }
}
export const fileService = new FileService();
