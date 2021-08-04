import { IpcEvents } from '../ipc-events';

const { ipcRenderer } = require('electron');

class ReportService {
  public async getLicensesUsage(args: string | null = null): Promise<any> {

    const response = await ipcRenderer.invoke(IpcEvents.REPORT_LICENSES, args);
       return response;
  }

  public async getCryptoUsage(args: string | null = null): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.REPORT_LICENSES, args);
    return response;
  }
}

export const report = new ReportService();
