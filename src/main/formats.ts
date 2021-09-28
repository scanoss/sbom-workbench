import { ipcMain } from 'electron';
import { IpcEvents } from '../ipc-events';
import { Project } from './workspace/Project';
import { workspace } from './workspace/workspace';
import { Response } from './Response';
import { reportService } from './services/ReportService';

ipcMain.handle(IpcEvents.EXPORT_SPDX, async (event, path: string) => {
  let success: boolean;
  try {
    const data: any = await reportService.getReportSummary();
    const percentage = Math.floor(((data?.identifiedFiles + data?.ignoredFiles) * 100) / data.detectedFiles);
    success = await workspace.getOpenedProjects()[0].scans_db.formats.spdx(path, percentage);
    if (success) {
      return { status: 'ok', message: 'SPDX exported successfully', data: success };
    }
    return { status: 'ok', message: 'Unable to export SPDX', data: success };
  } catch (e) {
    console.log('Catch an error: ', e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcEvents.EXPORT_CSV, async (event, path: string) => {
  let success: boolean;
  try {
    const data: any = await reportService.getReportSummary();
    const percentage = Math.floor(((data?.identifiedFiles + data?.ignoredFiles) * 100) / data.detectedFiles);
    success = await workspace.getOpenedProjects()[0].scans_db.formats.csv(path, percentage);
    if (success) {
      return { status: 'ok', message: 'CSV exported successfully', data: success };
    }
    return { status: 'ok', message: 'Unable to export CSV', data: success };
  } catch (e) {
    console.log('Catch an error: ', e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcEvents.EXPORT_WFP, async (event, path: string) => {
  let success: boolean;
  try {
    const p: Project = workspace.getOpenedProjects()[0];
    success = await p.scans_db.formats.wfp(`${path}`, `${p.getMyPath()}/winnowing.wfp`);
    if (success) {
      return { status: 'ok', message: 'WFP exported successfully', data: success };
    }
    return { status: 'ok', message: 'Unable to export WFP', data: success };
  } catch (e) {
    console.log('Catch an error: ', e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcEvents.EXPORT_RAW, async (event, path: string) => {
  let success: boolean;
  try {
    const p: Project = workspace.getOpenedProjects()[0];
    success = await p.scans_db.formats.raw(`${path}`, p.getResults());
    if (success) {
      return { status: 'ok', message: 'RAW exported successfully', data: success };
    }
    return { status: 'ok', message: 'Unable to export RAW', data: success };
  } catch (e) {
    console.log('Catch an error: ', e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcEvents.EXPORT_NOTARIZE_SBOM, async (event, type: string) => {
  try {
    const hash = await workspace.getOpenedProjects()[0].scans_db.formats.notarizeSBOM(type);
    return Response.ok({ message: 'Notarize hash successfully created', data: hash });
  } catch (e: any) {
    console.log('Catch an error: ', e);
    return Response.fail({ message: e.message });
  }
});
