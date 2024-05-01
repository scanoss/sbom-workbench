import log from 'electron-log';
import api from '../api';
import { cryptographyService } from '../../main/services/CryptographyService';
import { IpcChannels } from '../ipc-channels';
import { Response } from '../Response';

// TODO: See response  with local crypto
api.handle(IpcChannels.CRYPTOGRAPHY_UPDATE, async (event) => {
  try {
    const data = await cryptographyService.update();
    await cryptographyService.updateLocal();
    return Response.ok({ message: 'Cryptography updated successfully', data });
  } catch (error: any) {
    log.error('[Cryptography Update]: ', error);
    return Response.fail({ message: error.message });
  }
});
