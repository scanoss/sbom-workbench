import log from 'electron-log';
import { CryptographyScanner, CryptoCfg } from 'scanoss';
import { ITask } from '../Task';
import { modelProvider } from '../../services/ModelProvider';
import { ICryptographyTask } from './ICryptographyTask';
import { AppConfigDefault } from '../../../config/AppConfigDefault';
import { workspace } from '../../workspace/Workspace';
import { userSettingService } from '../../services/UserSettingService';

export class AddCryptographyTask implements ITask<ICryptographyTask, void> {

 // TODO: Remove when REST be implemented on cryptography decoration service
  private  buildConfig() {
    const project = workspace.getOpenProject();
    const {
      DEFAULT_API_INDEX,
      APIS,
      HTTP_PROXY,
      HTTPS_PROXY,
      PAC_PROXY,
      CA_CERT,
      IGNORE_CERT_ERRORS,
      GRPC_PROXY
    } = userSettingService.get();

    const apiUrl = project.getApi() || APIS[DEFAULT_API_INDEX].URL;
    const apiKey = project.getApiKey() || APIS[DEFAULT_API_INDEX].API_KEY;
    const PAC_URL = PAC_PROXY ? `pac+${PAC_PROXY.trim()}` : null;

    return {
      API_URL: apiUrl,
      API_KEY: apiKey,
      HTTP_PROXY: PAC_URL || HTTP_PROXY || '',
      HTTPS_PROXY: PAC_URL || HTTPS_PROXY || '',
      IGNORE_CERT_ERRORS: IGNORE_CERT_ERRORS || false,
      CA_CERT: CA_CERT || null,
      GRPC_PROXY: GRPC_PROXY || '',
    };
  }

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
    // TODO: Remove when REST be implemented on cryptography decoration service
    const configData = this.buildConfig();
    const cryptographyCfg = new CryptoCfg();
    Object.assign(cryptographyCfg, configData);
    const cryptoScanner = new CryptographyScanner(cryptographyCfg);
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
