import { ipcMain } from 'electron';
import log from 'electron-log';
import { NewExportDTO } from 'api/dto';
import { IpcChannels } from '../ipc-channels';
import { Response } from '../Response';
import { Export } from '../../main/task/export/Export';
import { Spdxv20 } from '../../main/modules/export/format/Spdxv20';

const pathLib = require('path');

const crypto = require('crypto');

ipcMain.handle(IpcChannels.EXPORT, async (_event, params: NewExportDTO) => {
  try {
    const exportTask = new Export();
    exportTask.setFormat(params);
    const success = await exportTask.run(params.path);
    return Response.ok({ message: 'File exported successfully', data: success });
  } catch (e: any) {
    log.error('Catch an error: ', e);
    return Response.fail({ message: e.message });
  }
});

ipcMain.handle(IpcChannels.EXPORT_NOTARIZE_SBOM, async (event, type: string) => {
  try {
    const SPDXV20 = new Spdxv20();
    const data = SPDXV20.generate();
    const fileBuffer = data;
    const hashSum = crypto.createHash(type);
    hashSum.update(fileBuffer);
    const hex = hashSum.digest('hex');
    return Response.ok({ message: 'Notarize hash successfully created', data: hex });
  } catch (e: any) {
    log.error('Catch an error: ', e);
    return Response.fail({ message: e.message });
  }
});
