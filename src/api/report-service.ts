import { IpcEvents } from '../ipc-events';

const { ipcRenderer } = require('electron');

class ReportService {
  public async getSummary(args: string | null = null): Promise<any> {

    const response = await ipcRenderer.invoke(IpcEvents.REPORT_SUMMARY, args);
       return response;
  }

  public async getInventoryProgress(args: string | null = null): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.REPORT_INVENTORY_PROGRESS, args);
    return response;
  }
}

export const report = new ReportService();
