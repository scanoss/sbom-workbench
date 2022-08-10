import { ipcMain } from 'electron';
import log from 'electron-log';
import { IpcChannels } from '../ipc-channels';
import { Response } from '../Response';
import { reportService } from '../../main/services/ReportService';

ipcMain.handle(IpcChannels.REPORT_SUMMARY, async () => {
  try {
    const summary = await reportService.getReportSummary();
    return Response.ok({ message: 'Summary retrieve successfully retrieved', data: summary });
  } catch (error: any) {
    log.error('[REPORT SUMMARY]: ', error);
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(IpcChannels.REPORT_IDENTIFIED, async () => {
  try {
    const identified = await reportService.getIdentified();
    return Response.ok({ message: 'Identified report successfully retrieved', data: identified });
  } catch (error: any) {
    log.error('[REPORT IDENTIFIED]: ', error);
    return Response.fail({ message: error.message });
  }
});
// TODO: refactor on report detected handle. We should use Response class
ipcMain.handle(IpcChannels.REPORT_DETECTED, async (event, arg: string) => {
  try {
    const data = await reportService.getDetected();
    return {
      status: 'ok',
      message: 'SPDX export successfully',
      data,
    };
  } catch (e) {
    log.error('[REPORT DETECTED]: ', e);
    return { status: 'fail' };
  }
});
