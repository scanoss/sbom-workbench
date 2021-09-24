import { IpcEvents } from '../ipc-events';
import { BaseService } from './base-service';

const { ipcRenderer } = require('electron');

class Export extends BaseService {
  public async spdx(path: string, state: boolean): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.EXPORT_SPDX, path, state);
    return response;
  }

  public async csv(args: string | null = null): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.EXPORT_CSV, args);
    return response;
  }

  public async wfp(args: string | null = null): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.EXPORT_WFP, args);
    return response;
  }

  public async raw(args: string | null = null): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.EXPORT_RAW, args);
    return response;
  }

  public async notarizeSBOM(args: string | null = null): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.EXPORT_NOTARIZE_SBOM, args);
    return this.response(response);
  }
}

export const ExportFormat = new Export();
