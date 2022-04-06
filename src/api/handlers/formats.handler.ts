import { ipcMain } from 'electron';
import { IpcEvents } from '../ipc-events';
import { Response } from '../Response';
import { reportService } from '../../main/services/ReportService';
import { Export } from '../../main/task/export/Export';
import { ExportFormat } from '../types';

const pathLib = require('path');

const crypto = require('crypto');

ipcMain.handle(IpcEvents.EXPORT, async (_event, path: string, format: ExportFormat) => {
  try {
    let auxPath = path;
    if (
      format === ExportFormat.CSV ||
      format === ExportFormat.SPDX20 ||
      format === ExportFormat.SPDXLITE ||
      format === ExportFormat.SPDXLITEJSON
    ) {
      const data: any = await reportService.getReportSummary();
      const complete = Math.floor(((data?.identifiedFiles + data?.ignoredFiles) * 100) / data.detectedFiles) < 100;
      auxPath = complete ? `${pathLib.dirname(path)}/uncompleted_${pathLib.basename(path)}` : path;
    }
    const exportTask = new Export();
    exportTask.setFormat(format);
    const success = await exportTask.run(auxPath); 
    return Response.ok( { message: 'File exported successfully', data: success });
  } catch (e:any) {
    console.log('Catch an error: ', e);
    return Response.fail({ message: e.message });
  }
});

ipcMain.handle(IpcEvents.EXPORT_NOTARIZE_SBOM, async (event, type: string) => {
  try {
    const exportTask = new Export();
    exportTask.setFormat(ExportFormat.SPDX20);
    const data = await exportTask.generate();
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
