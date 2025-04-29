import log from 'electron-log';
import api from '../api';
import { cryptographyService } from '../../main/services/CryptographyService';
import { IpcChannels } from '../ipc-channels';
import { Response } from '../Response';
import { CryptographyGetAllDTO } from '../dto';

api.handle(IpcChannels.CRYPTOGRAPHY_UPDATE, async (event) => {
  try {
    await cryptographyService.update();
    return Response.ok({ message: 'Cryptography updated successfully'});
  } catch (error: any) {
    log.error('[Cryptography Update]: ', error);
    return Response.fail({ message: error.message });
  }
});

api.handle(IpcChannels.CRYPTOGRAPHY_GET_ALL, async (event, { type }: CryptographyGetAllDTO) => {
  try {
    const data = await cryptographyService.getAll(type);
    return Response.ok({ message: 'Cryptography retrieved successfully', data });
  } catch (error: any) {
    log.error('[Cryptography Get All]: ', error);
    return Response.fail({ message: error.message });
  }
});
