import { ipcMain } from 'electron';
import { IpcEvents } from '../ipc-events';
import { Response } from './Response';
import { reportService } from './services/ReportService';
import { workspace } from './workspace/Workspace';

ipcMain.handle(IpcEvents.REPORT_SUMMARY, async () => {
  try {
    const summary = await reportService.getReportSummary();
    return Response.ok({ message: 'Summary retrieve successfully retrieved', data: summary });
  } catch (error: any) {
    console.log('Catch an error: ', error);
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(IpcEvents.REPORT_IDENTIFIED, async () => {
  try {
    const identified = await reportService.getReportIdentified();
    return Response.ok({ message: 'Identified report successfully retrieved', data: identified });
  } catch (error: any) {
    console.log('Catch an error: ', error);
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(IpcEvents.REPORT_DETECTED, async (event, arg: string) => {
  try {
    const data = await reportService.getDetected();
    return {
      status: 'ok',
      message: 'SPDX export successfully',
      data,
    };
  } catch (e) {
    console.log('Catch an error: ', e);
    return { status: 'fail' };
  }
});
