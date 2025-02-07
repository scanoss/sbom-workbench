import log from 'electron-log';
import {
  CryptographyService,
} from 'scanoss';
import { ITask } from '../Task';
import { modelProvider } from '../../services/ModelProvider';
import { ICryptographyTask } from './ICryptographyTask';
import { normalizeCryptoAlgorithms } from '../../../shared/adapters/crypto.adapter';
import { userSettingService } from '../../services/UserSettingService';
import { AppConfigDefault } from '../../../config/AppConfigDefault';

export class AddCryptographyTask implements ITask<ICryptographyTask, void> {
  async run(params: ICryptographyTask): Promise<void> {
    const { GRPC_PROXY } = userSettingService.get();
    process.env.grpc_proxy = GRPC_PROXY || '';

    try {
      const response = await this.getAlgorithms(params.components, params.token);

      const cryptographies = this.adaptToCrypographyEntity(response);

      // Delete all cryptography if force flag is setted
      if (params.force) await modelProvider.model.cryptography.deleteAll();
      // Import Crypto into Database
      await modelProvider.model.cryptography.insertAll(cryptographies);
    } catch (e: any) {
      log.error(e);
      throw new Error(e.message);
    }
  }

  private async getAlgorithms(components: Array<string>, token: string) {
    const crypto = new CryptographyService(token);
    const chunks = [];
    for (let i = 0; i < components.length; i += AppConfigDefault.DEFAULT_SERVICE_CHUNK_LIMIT) {
      chunks.push(components.slice(i, i + 10));
    }
    const promises = chunks.map(async (chunk) => {
      try {
        const reqData = {
          purlsList: chunk.map((purl) => ({ purl })),
        };
        return await crypto.getAlgorithms(reqData);
      } catch (err) {
        log.error('[ CryptographyTask ] Request failed for purls:', chunk.map((item: any) => item.purl));
        log.error('Error:', err);
        return null;
      }
    });
    const results = await Promise.all(promises);
    return results.reduce((acc:any, curr:any) => {
      if (!curr) return acc;
      return {
        purlsList: [...(acc.purlsList || []), ...(curr.purlsList || [])],
        status: curr.status,
      };
    }, { purlsList: [], status: null });
  }

  private adaptToCrypographyEntity(response: any): Array< { purl: string, version: string, algorithms: string } > {
    // Convert response into Cryptography entity
    const cryptographies: Array< { purl: string, version: string, algorithms: string } > = [];
    response.purlsList.forEach((crypto) => {
      if (crypto.algorithmsList.length > 0) { // avoids empty crypto from response
        const [purl, version] = crypto.purl.split('@');
        const cryptography = { purl, version, algorithms: JSON.stringify(normalizeCryptoAlgorithms(crypto.algorithmsList)) };
        cryptographies.push(cryptography);
      }
    });
    return cryptographies;
  }
}
