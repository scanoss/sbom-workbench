import { ExportComponentData } from 'main/model/interfaces/report/ExportComponentData';
import { CycloneDX } from './CycloneDX';
import { isValidPurl } from '../../helpers/exportHelper';
import log from 'electron-log';

export class CycloneDXDetected extends CycloneDX {
  protected getUniqueComponents(data: ExportComponentData[]) {
    const uniqueComponents = new Map<string, ExportComponentData>();
    data.forEach((comp) => {
      if (isValidPurl(comp.purl)) {
        const key = `${comp.purl}@${comp.version}`;
        uniqueComponents.set(key, {
          ...comp,
          unique_detected_licenses: comp.detected_licenses ? comp.detected_licenses?.split(' AND ') : [],
          unique_concluded_licenses: [],
        });
      } else {
        log.error(`Invalid purl: ${comp.purl}. Skipping...`);
      }
    });

    return Array.from(uniqueComponents.values());
  }
}
