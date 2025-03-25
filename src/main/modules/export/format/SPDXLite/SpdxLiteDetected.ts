import { ExportComponentData } from 'main/model/interfaces/report/ExportComponentData';
import { LicenseType, SpdxLite } from './SpdxLite';
import { isValidPurl, removeRepeatedLicenses } from '../../helpers/exportHelper';
import { Project } from '../../../../workspace/Project';
import { ExportRepository } from '../../Repository/ExportRepository';
import { ExportSource } from '../../../../../api/types';
import { ReportData } from '../../ReportData';

export class SpdxLiteDetected extends SpdxLite {
  constructor(project: Project, exportModel: ExportRepository) {
    super(ExportSource.DETECTED, project, exportModel);
  }

  // @Override
  protected getLicenseCopyRight(component: ExportComponentData) {
    const lic = this.licenseMapper.get(component.detected_licenses);
    if (lic && lic.official === LicenseType.CUSTOM) {
      return this.fulltextToBase64(lic.fulltext);
    }
    return 'NOASSERTION';
  }

  // @Override
  protected getUniqueComponents(data: ExportComponentData[]): ReportData<ExportComponentData[]> {
    const uniqueComponents = new Map<string, ExportComponentData>();
    const invalidPurls: Array<string> = [];
    data.forEach((comp) => {
      if (isValidPurl(comp.purl)) {
        const key = `${comp.purl}@${comp.version}`;
        // Detected licenses already joined in query by 'AND'
        const licenses = comp.detected_licenses ? removeRepeatedLicenses(comp.detected_licenses) : 'NOASSERTION';
        uniqueComponents.set(key, { ...comp, detected_licenses: licenses, concluded_licenses: 'NOASSERTION' });
      } else {
        invalidPurls.push(comp.purl);
      }
    });
    return {
      components: Array.from(uniqueComponents.values()),
      invalidPurls,
    };
  }
}
