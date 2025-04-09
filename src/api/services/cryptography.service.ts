import { IpcChannels } from '@api/ipc-channels';
import { CryptographyGetAllDTO } from '@api/dto';
import { CryptographyResponseDTO } from '@api/types';
import { BaseService } from './base.service';

class CryptographyService extends BaseService {
  public async update(): Promise<void> {
    const response = await window.electron.ipcRenderer.invoke(IpcChannels.CRYPTOGRAPHY_UPDATE);
    return this.response(response);
  }

  public async getAll(sourceType: CryptographyGetAllDTO): Promise<CryptographyResponseDTO> {
    const response = await window.electron.ipcRenderer.invoke(IpcChannels.CRYPTOGRAPHY_GET_ALL, sourceType);
    return this.response(response);
  }
}

export const cryptographyService = new CryptographyService();

