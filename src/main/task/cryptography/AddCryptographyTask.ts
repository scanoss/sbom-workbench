import log from 'electron-log';
import {
  PurlRequest, CryptographyScanner, CryptoCfg,
} from 'scanoss';
import { ITask } from '../Task';
import { modelProvider } from '../../services/ModelProvider';
import { ICryptographyTask } from './ICryptographyTask';
import { userSettingService } from '../../services/UserSettingService';
import { AppConfigDefault } from '../../../config/AppConfigDefault';

export class AddCryptographyTask implements ITask<ICryptographyTask, void> {

  private generateRequests(reqData: Array<string>): Array<PurlRequest> {
    const chunks = [];
    for (let i = 0; i < reqData.length; i += AppConfigDefault.DEFAULT_SERVICE_CHUNK_LIMIT) {
      chunks.push(reqData.slice(i, i + AppConfigDefault.DEFAULT_SERVICE_CHUNK_LIMIT));
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

  private async getCryptography(components: Array<string>, token: string, proxy: string) {
    const cryptoCfg = new CryptoCfg({
      apiKey: token,
      proxy,
    });
    const cryptoScanner = new CryptographyScanner(cryptoCfg);
    const requests = this.generateRequests(components);
    const promises = requests.map(async (req: any) => {
      try {
        const r = await cryptoScanner.scanComponents(req);
        return r;
      } catch (err: any) {
        log.warn('Warning:', err.message, req);
        return null;
      }
    });

    const results = await Promise.all(promises);
    return results.flat().filter(Boolean).map((c)=> c);
  }

  public async run(params: ICryptographyTask): Promise<void> {
    try {
      const { GRPC_PROXY } = userSettingService.get();
      const cryptography = await this.getCryptography(params.components, params.token, GRPC_PROXY);
      // Delete all cryptography if force flag is set
      if (params.force) await modelProvider.model.cryptography.deleteAll();
      // Import Crypto into Database
      await modelProvider.model.cryptography.createBatch(cryptography);
    } catch (e: any) {
      log.error(e);
      throw e;
    }
  }
}
