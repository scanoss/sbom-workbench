import log from 'electron-log';
import {
  CryptographyService,
} from 'scanoss';
import fs from 'fs';
import { ITask } from '../Task';
import { modelProvider } from '../../services/ModelProvider';
import { ICryptographyTask } from './ICryptographyTask';

export class AddCryptographyTask implements ITask<ICryptographyTask, void> {
  async run(params: ICryptographyTask): Promise<void> {
    try {
      const reqData = {
        purlsList: params.components.map((purl) => ({ purl })),
      };

      const crypto = new CryptographyService(params.token);
      const response: any = await crypto.getAlgorithms(reqData);

      // Convert response into Cryptography entity
      const cryptographies: Array< { purl: string, version: string, algorithms: string } > = [];
      response.purlsList.forEach((crypto) => {
        if (crypto.algorithmsList.length > 0) { // avoids empty crypto from response
          const [purl, version] = crypto.purl.split('@');
          const cryptography = { purl, version, algorithms: JSON.stringify(crypto.algorithmsList) };
          cryptographies.push(cryptography);
        }
      });

      // Import Crypto into Database
      await modelProvider.model.cryptography.insertAll(cryptographies);
    } catch (e) {
      log.error(e);
    }
  }
}
