import { ipcMain } from 'electron';
import { IpcEvents } from '../ipc-events';
import { Response } from '../Response';
import { reportService } from '../../main/services/ReportService';
import { Export } from '../../main/task/export/Export';
import { ExportFormat } from '../types';

const pathLib = require('path');

const crypto = require('crypto');

ipcMain.handle(IpcEvents.EXPORT, async (_event, path: string, format: ExportFormat) => { // NewExportDTO
  try {
    const exportTask = new Export();
    exportTask.setFormat(format);
    const success = await exportTask.run(path);
    return Response.ok({ message: 'File exported successfully', data: success });
  } catch (e: any) {
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
