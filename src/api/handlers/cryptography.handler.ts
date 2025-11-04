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

api.handle(IpcChannels.CRYPTOGRAPHY_GET_KEYWORDS, async (event, keys: Array<string>) => {
  try {
    const data = await cryptographyService.getKeywordsByKeys(keys);
    return Response.ok({ message: 'Keywords retrieved successfully', data });
  } catch (error: any) {
    log.error('[Cryptography Get keywords]: ', error);
    return Response.fail({ message: error.message });
  }
});

api.handle(IpcChannels.CRYPTOGRAPHY_SEARCH, async (event, crypto: Array<string>) => {
  try {
    const data = await cryptographyService.getFilesByCrypto(crypto);
    return Response.ok({ message: 'Cryptography files retrieved successfully', data });
  } catch (error: any) {
    log.error('[Cryptography Search]: ', error);
    return Response.fail({ message: error.message });
  }
});

api.handle(IpcChannels.CRYPTOGRAPHY_GET_DETECTED_KEYS, async (event) => {
  try {
    const data = await cryptographyService.getDetectedKeys();
    return Response.ok({ message: 'Keywords retrieved successfully', data });
  } catch (error: any) {
    log.error('[Cryptography get detected keys]: ', error);
    return Response.fail({ message: error.message });
  }
});

api.handle(IpcChannels.CRYPTOGRAPHY_GET_KEYWORD_CRYPTO_MAP, async (event) => {
  try {
    const data = await cryptographyService.getKeywordsCryptoMap();
    return Response.ok({ message: 'Cryptography keyword map retrieved successfully', data });
  } catch (error: any) {
    log.error('[Cryptography keyword map]: ', error);
    return Response.fail({ message: error.message });
  }
});
