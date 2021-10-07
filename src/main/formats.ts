import { ipcMain } from 'electron';
import { IpcEvents } from '../ipc-events';
import { Response } from './Response';
import { reportService } from './services/ReportService';
import { Export } from './export/Export';
import { FormatVersion } from '../api/types';

const pathLib = require('path');

const crypto = require('crypto');

ipcMain.handle(IpcEvents.EXPORT, async (_event, path: string, format: FormatVersion) => {
  try {
    let auxPath = path;
    if (
      format === FormatVersion.CSV ||
      format === FormatVersion.SPDX20 ||
      format === FormatVersion.SPDXLITE ||
      format === FormatVersion.SPDXLITEJSON
    ) {
      const data: any = await reportService.getReportSummary();
      const complete = Math.floor(((data?.identifiedFiles + data?.ignoredFiles) * 100) / data.detectedFiles) < 100;
      auxPath = complete ? `${pathLib.dirname(path)}/uncompleted_${pathLib.basename(path)}` : path;
    }
    Export.setFormat(format);
    const success = await Export.save(auxPath);
    return Response.ok( { message: 'File exported successfully', data: success });
  } catch (e:any) {
    console.log('Catch an error: ', e);
    return Response.fail({ message: e.message });
  }
});

ipcMain.handle(IpcEvents.EXPORT_NOTARIZE_SBOM, async (event, type: string) => {
  try {
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
