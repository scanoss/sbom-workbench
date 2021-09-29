import { IpcEvents } from '../ipc-events';
import { BaseService } from './base-service';
import { FormatVersion } from './types';

const { ipcRenderer } = require('electron');

class Export extends BaseService {
  public async export(path: string, ext: FormatVersion): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.EXPORT, path, ext);
    return response;
  }

  public async notarizeSBOM(args: string | null = null): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.EXPORT_NOTARIZE_SBOM, args);
    return this.response(response);
  }
}

export const ExportFormat = new Export();
