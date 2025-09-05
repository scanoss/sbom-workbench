import log from 'electron-log';
import { CryptographyScanner, CryptoCfg } from 'scanoss';
import { ITask } from '../Task';
import { modelProvider } from '../../services/ModelProvider';
import { ICryptographyTask } from './ICryptographyTask';
import { AppConfigDefault } from '../../../config/AppConfigDefault';
import { workspace } from '../../workspace/Workspace';
import { userSettingService } from '../../services/UserSettingService';
import { ScannerFactory } from '../scanner/ScannerFactory';

export class AddCryptographyTask implements ITask<ICryptographyTask, void> {

  private generateRequests(reqData: Array<string>): Array<any> {
    const chunks = [];
    for (let i = 0; i < reqData.length; i += AppConfigDefault.DEFAULT_SERVICE_CHUNK_LIMIT) {
      chunks.push(reqData.slice(i, i + AppConfigDefault.DEFAULT_SERVICE_CHUNK_LIMIT));
    }
    const requests = [];
    chunks.forEach((components: Array<string>) => {
        const req = components.map((purl) => {
          const splitPurl = purl.split('@');
          return {
            purl: splitPurl[0],
            requirement: splitPurl[1],
          };
        });
        requests.push(req);
    });
    return requests;
  }

  private async getCryptography(components: Array<string>) {
    const cryptoScanner = ScannerFactory.createScanner(CryptoCfg, CryptographyScanner);
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
      const cryptography = await this.getCryptography(params.components);
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
