import log from 'electron-log';
import { CryptographyService, ExportControlResponse, PurlRequest } from 'scanoss';
import { AppConfigDefault } from '../../config/AppConfigDefault';
import { ExportControl } from '../model/entity/ExportControl';

class ExportControlService {

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

  private async getExportControl(token: string, components: Array<string>) {
    const cryptoService = new CryptographyService(token);
    const requests = this.generateRequests(components);
    const promises = requests.map(async (req: any) => {
      try {
        return await cryptoService.getExportControl(req);
      } catch (err) {
        log.error('[ Export Control Service ] Request failed for purls:', req.purlsList.map((item: any) => item.purl));
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

  private convertToExportControlEntity(results: Array<ExportControlResponse>) {
    return results.flatMap((result: any) => result.purlsList
      .filter((ec: any) => ec.versionsList.length > 0)
      .map((ec: any) => ({
        purl: ec.purl,
        version: ec.versionsList[0],
        hints: ec.hintsList,
      })));
  }

  public async find(token: string, components: any): Promise<ExportControl[]> {
    const results = await this.getExportControl(token, components);
    return results.pipe((r:Array<ExportControlResponse>) => {
      return this.convertToExportControlEntity(r);
    });
  }
}

export const exportControlService = new ExportControlService();
