import log from 'electron-log';
import { CryptographyService } from 'scanoss/build/module';
import { AppConfigDefault } from '../../config/AppConfigDefault';

class ExportControlService {
  public async getExportControl(token: string, components: any) {
    const cryptoService = new CryptographyService(token);
    const chunks = [];
    for (let i = 0; i < components.length; i += AppConfigDefault.DEFAULT_SERVICE_CHUNK_LIMIT) {
      chunks.push(components.slice(i, i + 10));
    }
    const promises = chunks.map(async (chunk) => {
      try {
        const reqData = {
          purls: chunk.map((purl) => {
            const splitPurl = purl.split('@');
            return {
              purl: splitPurl[0],
              requirement: splitPurl[1],
            };
          }),
        };
        return await cryptoService.getExportControl(reqData);
      } catch (err) {
        log.error('[ Export Control Service ] Request failed for purls:', chunk.map((item: any) => item.purl));
        log.error('Error:', err);
        return null;
      }
    });
    const results = await Promise.all(promises);
    return results.reduce((acc:any, curr:any) => {
      if (!curr) return acc;
      return {
        purls: [...(acc.purls || []), ...(curr.purls || [])],
        status: curr.status,
      };
    }, { purls: [], status: null });
  }
}

export const exportControlService = new ExportControlService();
