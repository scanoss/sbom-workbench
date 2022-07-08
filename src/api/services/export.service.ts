import { IpcChannels } from '../ipc-channels';
import { BaseService } from './base.service';
import { ExportFormat } from '../types';
import { ExportDTO } from '../../main/modules/export/ExportDTO';

class Export extends BaseService {
  public async export(path: string, ext: ExportFormat): Promise<ExportDTO> {
    const response = await window.electron.ipcRenderer.invoke(IpcChannels.EXPORT, path, ext);
    return this.response(response);
  }

  public async notarizeSBOM(args: string | null = null): Promise<any> {
    const response = await window.electron.ipcRenderer.invoke(IpcChannels.EXPORT_NOTARIZE_SBOM, args);
    return this.response(response);
  }
}

export const exportService = new Export();
