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
      const response = await this.getAlgorithms(params.components, params.token);

      const cryptographies = this.adaptToCrypographyEntity(response);

      // Delete all cryptography if force flag is setted
      if (params.force) await modelProvider.model.cryptography.deleteAll();
      // Import Crypto into Database
      await modelProvider.model.cryptography.insertAll(cryptographies);
    } catch (e) {
      log.error(e);
    }
  }

  private async getAlgorithms(components: Array<string>, token: string) {
    const crypto = new CryptographyService(token);
    const reqData = {
      purlsList: components.map((purl) => ({ purl })),
    };
    const response: any = await crypto.getAlgorithms(reqData);
    return response;
  }

  private adaptToCrypographyEntity(response: any): Array< { purl: string, version: string, algorithms: string } > {
    // Convert response into Cryptography entity
    const cryptographies: Array< { purl: string, version: string, algorithms: string } > = [];
    response.purlsList.forEach((crypto) => {
      if (crypto.algorithmsList.length > 0) { // avoids empty crypto from response
        const [purl, version] = crypto.purl.split('@');
        const cryptography = { purl, version, algorithms: JSON.stringify(crypto.algorithmsList) };
        cryptographies.push(cryptography);
      }
    });
    return cryptographies;
  }
}
