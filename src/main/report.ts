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

ipcMain.handle(IpcEvents.REPORT_INVENTORY_PROGRESS, async (event, arg: string) => {
  let success: boolean;

  let inventory: inventoryProgress;
  try {
    const tempSummary = await workspace.getOpenedProjects()[0].scans_db.inventories.getCurrentSummary();
    const projectSummary = workspace.getOpenedProjects()[0].filesSummary;
    // total, filter, include
    const summary = {
      totalFiles: 0,
      includedFiles: 0,
      filteredFiles: 0,
      scannedFiles: 0,
      pendingFiles: 0,
      identifiedFiles: 0,
      ignoredFiles: 0,
    };
    summary.totalFiles = projectSummary.total;
    summary.includedFiles = projectSummary.include;
    summary.filteredFiles = projectSummary.filter;
    summary.scannedFiles = tempSummary[0].identified + tempSummary[0].ignored + tempSummary[0].pending;
    summary.pendingFiles = tempSummary[0].pending;
    summary.identifiedFiles = tempSummary[0].identified;
    summary.ignoredFiles = tempSummary[0].ignored;

    return {
      status: 'ok',
      message: 'SPDX export successfully',
      data: summary,
    };
  } catch (e) {
    console.log('Catch an error: ', e);
    return { status: 'fail' };
  }
});



