import { IpcEvents } from '../ipc-events';
import { BaseService } from './base.service';
import { ExportFormat } from '../types';
import { ExportDTO } from '../../main/task/export/ExportDTO';

const { ipcRenderer } = require('electron');

class Export extends BaseService {
  public async export(path: string, ext: ExportFormat): Promise<ExportDTO> {
    const response = await ipcRenderer.invoke(IpcEvents.EXPORT, path, ext);
    return this.response(response);
  }

  public async notarizeSBOM(args: string | null = null): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.EXPORT_NOTARIZE_SBOM, args);
    return this.response(response);
  }
}

export const exportFormat = new Export();
