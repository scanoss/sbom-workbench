import log from 'electron-log';
import {
  CryptographyService,
} from 'scanoss';
import { ITask } from '../Task';
import { modelProvider } from '../../services/ModelProvider';
import { ICryptographyTask } from './ICryptographyTask';

export class AddCryptographyTask implements ITask<ICryptographyTask, void> {
  async run(params: ICryptographyTask): Promise<void> {
    try {
      const reqData = {
        purlsList: params.components.map((item) => {
          const component = item.split('@');
          return { purl: component[0], requirement: component[1] ?? undefined };
        }),
      };

      const crypto = new CryptographyService(params.token);
      const response: any = await crypto.getAlgorithms(reqData);

      // Convert response into Cryptography entity
      const cryptography: Array< { purl: string, version: string, algorithms: string } > = [];
      response.purlsList.forEach((p) => {
        if (p.algorithmsList.length > 0) { // avoids empty crypto from response
          const crypto = { purl: p.purl, version: p.version, algorithms: JSON.stringify(p.algorithmsList) };
          cryptography.push(crypto);
        }
      });

      // Import Crypto into Database
      await modelProvider.model.cryptography.insertAll(cryptography);
    } catch (e) {
      log.error(e);
    }
  }
}
