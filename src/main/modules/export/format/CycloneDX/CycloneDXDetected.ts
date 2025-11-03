import { ExportComponentData } from 'main/model/interfaces/report/ExportComponentData';
import { CycloneDX } from './CycloneDX';
import { isValidPurl } from '../../helpers/exportHelper';
import { ReportData } from '../../ReportData';
import { ComponentVulnerability } from '../../../../model/entity/ComponentVulnerability';

/**
 * CycloneDX exporter for detected components.
 *
 * This class generates a CycloneDX SBOM containing components that were automatically detected
 * during scanning. Detected components represent the software dependencies found in the project
 * before any manual identification or confirmation.
 *
 * @extends CycloneDX
 *
 * @example
 * // Basic usage with default repository:
 * const exporter = new CycloneDXDetected(project);
 *
 * @example
 * // Include vulnerabilities with default repository:
 * const exporter = new CycloneDXDetected(project, undefined, true);
 */
export class CycloneDXDetected extends CycloneDX {
  protected async getComponents(): Promise<Array<ExportComponentData>> {
    return this.repository.getDetectedData();
  }

  protected async getVulnerabilities(): Promise<Array<ComponentVulnerability>> {
    return this.repository.getDetectedVulnerability();
  }

  protected getUniqueComponents(data: ExportComponentData[]): ReportData<ExportComponentData[]> {
    const uniqueComponents = new Map<string, ExportComponentData>();
    const invalidPurls: Array<string> = [];
    data.forEach((comp) => {
      const version = comp.version ? comp.version : 'unknown';
      if (isValidPurl(comp.purl)) {
        const key = `${comp.purl}@${version}`;
        uniqueComponents.set(key, {
          ...comp,
          unique_detected_licenses: comp.detected_licenses ? comp.detected_licenses?.split(' AND ') : [],
          unique_concluded_licenses: [],
        });
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
