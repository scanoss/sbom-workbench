import log from 'electron-log';
import { ipcMain } from 'electron';
import { type } from 'os';
import { cryptographyService } from '../../main/services/CryptographyService';
import { IpcChannels } from '../ipc-channels';
import { Response } from '../Response';

ipcMain.handle(IpcChannels.CRYPTOGRAPHY_UPDATE, async (event) => {
  try {
    const data = await cryptographyService.update();
    return Response.ok({ message: 'Cryptography updated successfully', data });
  } catch (error: any) {
    log.error('[Vulnerability Update]: ', error);
    return Response.fail({ message: error.message });
  }
});
