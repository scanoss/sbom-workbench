import { ipcMain } from 'electron';
import { IpcEvents } from '../ipc-events';
import { defaultProject } from './workspace/ProjectTree';
import { Response } from './Response';
import { reportService } from './services/ReportService';
import { workspace } from './workspace/workspace';
import { Export } from './export/Export';
import { FormatVersion } from './export/Format';

const crypto = require('crypto');

ipcMain.handle(IpcEvents.EXPORT_SPDX, async (event, path: string) => {
  let success: boolean;
  try {
    const data: any = await reportService.getReportSummary();
    const complete = Math.floor(((data?.identifiedFiles + data?.ignoredFiles) * 100) / data.detectedFiles) < 100;
    Export.setFormat(FormatVersion.SPDX20);
    success = await Export.save(path, complete);
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
    const complete = Math.floor(((data?.identifiedFiles + data?.ignoredFiles) * 100) / data.detectedFiles) < 100;
    Export.setFormat(FormatVersion.CSV);
    success = await Export.save(path, complete);
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
    Export.setFormat(FormatVersion.WFP);
    success = await Export.save(path);
    // await defaultProject.scans_db.formats.wfp(`${path}`, `${defaultProject.work_root}/winnowing.wfp`);
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
    Export.setFormat(FormatVersion.RAW);
    success = await Export.save(path);
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
    //  Export.save();

    Export.setFormat(FormatVersion.SPDX20);
    const data = await Export.generate();
    const fileBuffer = data;
    const hashSum = crypto.createHash(type);
    hashSum.update(fileBuffer);
    const hex = hashSum.digest('hex');

    return Response.ok({ message: 'Notarize hash successfully created', data: hex });
  } catch (e: any) {
    console.log('Catch an error: ', e);
    return Response.fail({ message: e.message });
  }
});
