import { IpcChannels } from '../ipc-channels';
import { BaseService } from './base.service';
import { FileDTO, GetFileDTO } from "../dto";



class FileService extends BaseService {
  public async getFileContent(args: string): Promise<any> {
    const response = await window.electron.ipcRenderer.invoke(IpcChannels.FILE_GET_CONTENT, args);
    return response;
  }

  public async get(params: GetFileDTO): Promise<FileDTO> {
    const response = await window.electron.ipcRenderer.invoke(IpcChannels.FILE_GET, params);
    return this.response(response);
  }

  public async ignored(files: number[]): Promise<boolean> {
    const response = await window.electron.ipcRenderer.invoke(IpcChannels.IGNORED_FILES, files);
    return this.response(response);
  }

  public async getRemoteFileContent(fileHash: string): Promise<string> {
    const response = await window.electron.ipcRenderer.invoke(IpcChannels.FILE_GET_REMOTE_CONTENT, fileHash);
    return this.response(response);
  }

  public async showItemInFolder(filePath: string): Promise<void> {
    const response = await window.electron.ipcRenderer.invoke(IpcChannels.SHELL_SHOW_ITEM_IN_FOLDER, filePath);
    return this.response(response);
  }

  public async getFilePath(filePath: string): Promise<string> {
    const response = await window.electron.ipcRenderer.invoke(IpcChannels.SHELL_GET_FILE_PATH, filePath);
    return this.response(response);
  }
}
export const fileService = new FileService();
