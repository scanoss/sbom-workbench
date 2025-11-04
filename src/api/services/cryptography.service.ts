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

  public async getKeyWords(keys: Array<string>): Promise<Array<string>> {
    const response = await window.electron.ipcRenderer.invoke(IpcChannels.CRYPTOGRAPHY_GET_KEYWORDS, keys);
    return this.response(response);
  }

  public async search(crypto: Array<string>): Promise<{ files:Array<string>, crypto: Array<string> }> {
    const response = await window.electron.ipcRenderer.invoke(IpcChannels.CRYPTOGRAPHY_SEARCH, crypto);
    return this.response(response);
  }

  public async getDetectedKeys(): Promise<Array<string>> {
    const response = await window.electron.ipcRenderer.invoke(IpcChannels.CRYPTOGRAPHY_GET_DETECTED_KEYS);
    return this.response(response);
  }

  public async getKeywordCryptoMap(): Promise<Map<string,Array<string>>> {
    const response = await window.electron.ipcRenderer.invoke(IpcChannels.CRYPTOGRAPHY_GET_KEYWORD_CRYPTO_MAP);
    return this.response(response);
  }
}

export const cryptographyService = new CryptographyService();

