import { ReportData, ReportSummary } from '@api/types';
import { IpcChannels } from '../ipc-channels';
import { BaseService } from './base.service';

class ReportService extends BaseService {
  public async getSummary(args: string | null = null): Promise<ReportSummary> {
    const response = await window.electron.ipcRenderer.invoke(IpcChannels.REPORT_SUMMARY, args);
    return this.response(response);
  }

  public async detected(args: string | null = null): Promise<ReportData> {
    const response = await window.electron.ipcRenderer.invoke(IpcChannels.REPORT_DETECTED, args);
    return this.response(response);
  }

  public async identified(): Promise<ReportData> {
    const response = await window.electron.ipcRenderer.invoke(IpcChannels.REPORT_IDENTIFIED);
    return this.response(response);
  }
}

export const reportService = new ReportService();
