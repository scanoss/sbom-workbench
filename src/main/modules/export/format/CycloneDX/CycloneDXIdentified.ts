import { ExportComponentData } from 'main/model/interfaces/report/ExportComponentData';
import { CycloneDX } from './CycloneDX';
import { isValidPurl } from '../../helpers/exportHelper';
import { ReportData } from '../../ReportData';

export class CycloneDXIdentified extends CycloneDX {
  protected getUniqueComponents(data: ExportComponentData[]): ReportData<ExportComponentData[]> {
    const uniqueComponents = new Map<string, ExportComponentData>();
    const invalidPurls: Array<string> = [];
    data.forEach((comp) => {
      if (isValidPurl(comp.purl)) {
        const key = `${comp.purl}@${comp.version}`;
        if (uniqueComponents.has(key)) {
          uniqueComponents.get(key).unique_concluded_licenses.push(comp.concluded_licenses);
        } else {
          uniqueComponents.set(key, {
            ...comp,
            unique_detected_licenses: comp.detected_licenses ? comp.detected_licenses?.split(' AND ') : [],
            unique_concluded_licenses: [comp.concluded_licenses],
          });
        }
      } else {
        invalidPurls.push(comp.purl);
      }
    });
    return {
      components: Array.from(uniqueComponents.values()) as ExportComponentData[],
      invalidPurls,
    };
  }
}
