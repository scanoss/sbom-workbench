import { BaseService } from '@api/services/base.service';
import { IpcChannels } from '@api/ipc-channels';
import { CryptographyResponseDTO } from '@api/types';
import { ExportControlGetAllDTO } from '@api/dto';

class ExportControlService extends BaseService {
  public async getAll(sourceType: ExportControlGetAllDTO): Promise<CryptographyResponseDTO> {
    const response = await window.electron.ipcRenderer.invoke(IpcChannels.EXPORT_CONTROL_GET_ALL, sourceType);
    return this.response(response);
  }
}
export const exportControlService = new ExportControlService();

document.ec = exportControlService;
