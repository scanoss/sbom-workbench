import { IpcChannels } from '@api/ipc-channels';
import { BaseService } from './base.service';

class CryptographyService extends BaseService {
  public async update(): Promise<void> {
    const response = await window.electron.ipcRenderer.invoke(IpcChannels.CRYPTOGRAPHY_UPDATE);
    return this.response(response);
  }
}

export const cryptographyService = new CryptographyService();
