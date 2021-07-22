import { IpcEvents } from '../ipc-events';

const { ipcRenderer } = require('electron');

class Export {
  public async spdx(args: string): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.EXPORT_SPDX, args);
    return response;
  }
}

export const ExportFormat = new Export();
