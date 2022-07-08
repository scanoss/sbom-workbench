import { IpcChannels } from '../ipc-channels';
import { BaseService } from './base.service';

class ResultService extends BaseService {
  public async get(path: string): Promise<any> {
    const response = await window.electron.ipcRenderer.invoke(IpcChannels.RESULTS_GET, path);
    return this.response(response);
  }
}

export const resultService = new ResultService();
