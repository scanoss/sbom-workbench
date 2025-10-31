import { ExportComponentData } from 'main/model/interfaces/report/ExportComponentData';
import { LicenseType, SpdxLite } from './SpdxLite';
import { isValidPurl, removeRepeatedLicenses } from '../../helpers/exportHelper';
import { Project } from '../../../../workspace/Project';
import { ExportRepository } from '../../Repository/ExportRepository';
import { ExportSource } from '../../../../../api/types';
import { ReportData } from '../../ReportData';
import { ExportRepositorySqliteImp } from '../../Repository/ExportRepositorySqliteImp';

/**
 * Exports detected component data in SPDX Lite format.
 *
 * This class generates SPDX Lite 2.2 compliant JSON reports containing detected component information.
 * Unlike identified exports, detected exports use only detected licenses and do not include concluded
 * licenses. Components are deduplicated based on PURL and version, with PURL validation applied.
 */
export class SpdxLiteDetected extends SpdxLite {
  /**
   * Creates an instance of SpdxLiteDetected.
   *
   * @param project - The project instance containing project metadata for the SPDX document
   * @param repository - The repository instance for accessing component data (defaults to ExportRepositorySqliteImp)
   */
  constructor(project: Project, repository: ExportRepository = new ExportRepositorySqliteImp()) {
    super(ExportSource.DETECTED, project,repository);
  }

  /**
   * Retrieves the copyright text for a component based on detected licenses.
   *
   * For custom (non-SPDX) licenses, returns the license fulltext encoded in base64.
   * For official SPDX licenses or when no custom license is found, returns 'NOASSERTION'.
   *
   * @param component - The component data containing detected license information
   * @returns Base64-encoded license fulltext for custom licenses, or 'NOASSERTION'
   * @override
   */
  protected getLicenseCopyRight(component: ExportComponentData) {
    const lic = this.licenseMapper.get(component.detected_licenses);
    if (lic && lic.official === LicenseType.CUSTOM) {
      return this.fulltextToBase64(lic.fulltext);
    }
    return 'NOASSERTION';
  }

  /**
   * Deduplicates and validates component data for detected exports.
   *
   * Components are deduplicated based on a unique key combining PURL and version.
   * Only components with valid PURLs are included in the result. For detected exports,
   * concluded licenses are always set to 'NOASSERTION', and detected licenses are cleaned
   * to remove duplicates. Invalid PURLs are collected for warning purposes.
   *
   * @param data - Array of component data to process and deduplicate
   * @returns ReportData object containing unique valid components and a list of invalid PURLs
   * @override
   */
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
