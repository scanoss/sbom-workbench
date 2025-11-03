import { ExportComponentData } from 'main/model/interfaces/report/ExportComponentData';
import { CycloneDX } from './CycloneDX';
import { isValidPurl } from '../../helpers/exportHelper';
import { ReportData } from '../../ReportData';
import { ComponentVulnerability } from '../../../../model/entity/ComponentVulnerability';

/**
 * CycloneDX exporter for identified components.
 *
 * This class generates a CycloneDX SBOM containing components that have been manually identified
 * or confirmed. Identified components represent the final, curated set of software dependencies
 * after review and validation by users.
 *
 * Unlike CycloneDXDetected, this exporter includes concluded licenses that have been manually
 * assigned or confirmed during the identification process.
 *
 * @extends CycloneDX
 *
 * @example
 * // Basic usage with default repository:
 * const exporter = new CycloneDXIdentified(project);
 *
 * @example
 * // Include vulnerabilities with default repository:
 * const exporter = new CycloneDXIdentified(project, undefined, true);
 */
export class CycloneDXIdentified extends CycloneDX {

  protected async getComponents(): Promise<Array<ExportComponentData>> {
    return this.repository.getIdentifiedData();
  }

  protected async getVulnerabilities(): Promise<Array<ComponentVulnerability>> {
    return this.repository.getIdentifiedVulnerability();
  }

  protected getUniqueComponents(data: ExportComponentData[]): ReportData<ExportComponentData[]> {
    const uniqueComponents = new Map<string, ExportComponentData>();
    const invalidPurls: Array<string> = [];
    data.forEach((comp) => {
      if (isValidPurl(comp.purl)) {
        const version = comp.version ? comp.version : 'unknown';
        const key = `${comp.purl}@${version}`;
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
