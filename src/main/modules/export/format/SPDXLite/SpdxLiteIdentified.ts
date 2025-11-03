import { ExportComponentData } from 'main/model/interfaces/report/ExportComponentData';
import log from 'electron-log';
import { LicenseType, SpdxLite } from './SpdxLite';
import { isValidPurl, removeRepeatedLicenses } from '../../helpers/exportHelper';
import { Project } from '../../../../workspace/Project';
import { ExportRepository } from '../../Repository/ExportRepository';
import { ExportSource } from '../../../../../api/types';
import { ReportData } from '../../ReportData';
import { ExportRepositorySqliteImp } from '../../Repository/ExportRepositorySqliteImp';

/**
 * Exports identified component data in SPDX Lite format.
 *
 * This class generates SPDX Lite 2.2 compliant JSON reports containing identified component information.
 * Unlike detected exports, identified exports include both detected and concluded licenses. When multiple
 * instances of the same component (same PURL and version) are found, their concluded licenses are merged
 * using the AND operator. Components are deduplicated and validated with PURL validation applied.
 */
export class SpdxLiteIdentified extends SpdxLite {
  /**
   * Creates an instance of SpdxLiteIdentified.
   *
   * @param project - The project instance containing project metadata for the SPDX document
   * @param repository - The repository instance for accessing component data (defaults to ExportRepositorySqliteImp)
   */
  constructor(project: Project, repository: ExportRepository = new ExportRepositorySqliteImp()) {
    super(ExportSource.IDENTIFIED, project, repository);
  }

  /**
   * Retrieves the copyright text for a component based on concluded licenses.
   *
   * For custom (non-SPDX) licenses, returns the license fulltext encoded in base64.
   * For official SPDX licenses or when no custom license is found, returns 'NOASSERTION'.
   * Uses concluded licenses instead of detected licenses for identified exports.
   *
   * @param component - The component data containing concluded license information
   * @returns Base64-encoded license fulltext for custom licenses, or 'NOASSERTION'
   * @override
   */
  protected getLicenseCopyRight(component: ExportComponentData) {
    const lic = this.licenseMapper.get(component.concluded_licenses);
    if (lic && lic.official === LicenseType.CUSTOM) {
      return this.fulltextToBase64(lic.fulltext);
    }
    return 'NOASSERTION';
  }

  /**
   * Deduplicates and validates component data for identified exports.
   *
   * Components are deduplicated based on a unique key combining PURL and version.
   * Only components with valid PURLs are included in the result. For identified exports,
   * when the same component appears multiple times, their concluded licenses are merged
   * using the AND operator, with duplicates removed. Detected licenses are cleaned to
   * remove duplicates. Invalid PURLs are collected for warning purposes.
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
        if (uniqueComponents.has(key)) {
          let licenses = uniqueComponents.get(key).concluded_licenses;
          // Adds the new concluded license
          licenses = `${licenses} AND ${comp.concluded_licenses}`;
          uniqueComponents.get(key).concluded_licenses = removeRepeatedLicenses(licenses);
        } else {
          const detectedLicenses = comp.detected_licenses ? removeRepeatedLicenses(comp.detected_licenses) : 'NOASSERTION';
          uniqueComponents.set(key, { ...comp, detected_licenses: detectedLicenses });
        }
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
