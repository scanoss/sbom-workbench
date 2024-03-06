import log from 'electron-log';
import api from '../api';
import { type } from 'os';
import { cryptographyService } from '../../main/services/CryptographyService';
import { IpcChannels } from '../ipc-channels';
import { Response } from '../Response';

api.handle(IpcChannels.CRYPTOGRAPHY_UPDATE, async (event) => {
  try {
    const data = await cryptographyService.update();
    return Response.ok({ message: 'Cryptography updated successfully', data });
  } catch (error: any) {
    log.error('[Cryptography Update]: ', error);
    return Response.fail({ message: error.message });
  }
});
