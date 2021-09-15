import { IpcEvents } from '../ipc-events';
import { BaseService } from './base-service';

const { ipcRenderer } = require('electron');

class ReportService extends BaseService {
  public async getSummary(args: string | null = null): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.REPORT_SUMMARY, args);
    return this.response(response);
  }

  public async detected(args: string | null = null): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.REPORT_DETECTED, args);
    return this.response(response);
  }

  public async getInventoryProgress(args: string | null = null): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.REPORT_INVENTORY_PROGRESS, args);
    return response;
  }

  public async idetified(): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.REPORT_IDENTIFIED);
    return this.response(response);
  }
}



export const reportService = new ReportService();
