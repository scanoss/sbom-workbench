import { ExportComponentData } from 'main/model/interfaces/report/ExportComponentData';
import { LicenseType, SpdxLite } from './SpdxLite';
import { removeRepeatedLicenses } from '../../helpers/exportHelper';
import { Project } from '../../../../workspace/Project';
import { ExportRepository } from '../../Repository/ExportRepository';
import { ExportSource } from '../../../../../api/types';

export class SpdxLiteIdentified extends SpdxLite {
  constructor(project: Project, exportModel: ExportRepository) {
    super(ExportSource.IDENTIFIED, project, exportModel);
  }

  // @Override
  protected getLicenseCopyRight(component: ExportComponentData) {
    const lic = this.licenseMapper.get(component.concluded_licenses);
    if (lic && lic.official === LicenseType.CUSTOM) {
      return this.fulltextToBase64(lic.fulltext);
    }
    return 'NOASSERTION';
  }

  // @Override
  protected getUniqueComponents(data: ExportComponentData[]): ExportComponentData[] {
    const uniqueComponents = new Map<string, ExportComponentData>();
    data.forEach((comp) => {
      const key = `${comp.purl}@${comp.version}`;
      if (uniqueComponents.has(key)) {
        let licenses = uniqueComponents.get(key).concluded_licenses;
        // Adds the new concluded license
        licenses = `${licenses} AND ${comp.concluded_licenses}`;
        uniqueComponents.get(key).concluded_licenses = removeRepeatedLicenses(licenses);
      } else {
        const detectedLicenses = comp.detected_licenses ? removeRepeatedLicenses(comp.detected_licenses) : 'NOASSERTION';
        uniqueComponents.set(key, { ...comp, detected_licenses: detectedLicenses });
      }
    });

    return Array.from(uniqueComponents.values());
  }
}
