import log from 'electron-log';
import {
  CryptographyService, PurlRequest, HintsResponse,
} from 'scanoss';
import { ITask } from '../Task';
import { modelProvider } from '../../services/ModelProvider';
import { ICryptographyTask } from './ICryptographyTask';
import { normalizeCryptoAlgorithms } from '../../../shared/adapters/crypto.adapter';
import { userSettingService } from '../../services/UserSettingService';
import { AppConfigDefault } from '../../../config/AppConfigDefault';
import { Algorithms, Hint } from '../../model/entity/Cryptography';

export class AddCryptographyTask implements ITask<ICryptographyTask, void> {
  async run(params: ICryptographyTask): Promise<void> {
    const { GRPC_PROXY } = userSettingService.get();
    process.env.grpc_proxy = GRPC_PROXY || '';

    try {
      // Algorithms
      const algorithms = await this.getAlgorithms(params.components, params.token);
      const cryptoAlgorithms = this.adaptToCryptographyEntity(algorithms);

      // hints
      const hintsResponse = await this.getHints(params.components, params.token);
      const cryptoHints = hintsResponse.pipe((r) => {
        return this.convertHintsToCryptoEntity(r);
      });

      // Creates unique map with crypto algorithms and hints
      const crypto = new Map<string, { purl: string, version: string, algorithms: Algorithms[], hints: Hint[] }>();
      cryptoAlgorithms.forEach((c) => crypto.set(`${c.purl}@${c.version}`, { purl: c.purl, version: c.version, algorithms: [], hints: [] }));
      cryptoHints.forEach((h) => crypto.set(`${h.purl}@${h.version}`, { purl: h.purl, version: h.version, algorithms: [], hints: [] }));
      cryptoAlgorithms.forEach((c) => {
        crypto.get(`${c.purl}@${c.version}`).algorithms = c.algorithms;
      });
      cryptoHints.forEach((h) => {
        crypto.get(`${h.purl}@${h.version}`).hints = h.hints;
      });

      // Delete all cryptography if force flag is setted
      if (params.force) await modelProvider.model.cryptography.deleteAll();
      // Import Crypto into Database
      await modelProvider.model.cryptography.createBatch(Array.from(crypto.values()));
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

  private adaptToCryptographyEntity(response: any): Array< { purl: string, version: string, algorithms: Algorithms[], hints: Hint[] } > {
    // Convert response into Cryptography entity
    const cryptographies: Array< { purl: string, version: string, algorithms: Algorithms[], hints: Hint[] } > = [];
    response.purlsList.forEach((crypto) => {
      if (crypto.algorithmsList.length > 0) { // avoids empty crypto from response
        const [purl, version] = crypto.purl.split('@');
        const cryptography = { purl, version, algorithms: normalizeCryptoAlgorithms(crypto.algorithmsList), hints: [] };
        cryptographies.push(cryptography);
      }
    });
    return cryptographies;
  }

  private convertHintsToCryptoEntity(results: Array<HintsResponse>) {
    return results.flatMap((result: any) => result.purlsList
      .filter((ec: any) => ec.versionsList.length > 0)
      .map((ec: any) => ({
        purl: ec.purl,
        version: ec.versionsList[0],
        hints: ec.hintsList,
      })));
  }

  private generateRequests(reqData: Array<string>): Array<PurlRequest> {
    const chunks = [];
    for (let i = 0; i < reqData.length; i += AppConfigDefault.DEFAULT_SERVICE_CHUNK_LIMIT) {
      chunks.push(reqData.slice(i, i + 10));
    }
    const requests = [];
    chunks.forEach((components: Array<string>) => {
      requests.push({
        purlsList: components.map((purl) => {
          const splitPurl = purl.split('@');
          return {
            purl: splitPurl[0],
            requirement: splitPurl[1],
          };
        }),
      });
    });
    return requests;
  }

  private async getHints(components: Array<string>, token: string) {
    const cryptoService = new CryptographyService(token);
    const requests = this.generateRequests(components);

    const promises = requests.map(async (req: any) => {
      try {
        return await cryptoService.getEncryptionHints(req);
      } catch (err) {
        log.error('Error:', err);
        return null;
      }
    });
    const results = await Promise.all(promises);
    return Object.assign(results, {
      pipe<R>(transform: (data: typeof results) => R): R {
        return transform(results);
      },
    });
  }
}
