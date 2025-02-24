import { IComponentLicense } from '../model/interfaces/component/IComponentLicense';
import { licenseHelper } from '../helpers/LicenseHelper';

export class ComponentAdapter {
  /**
   * Checks if a license identifier is valid
   * @param {string} license - License identifier to check
   * @param {Set<string>} defaultSPDXLicenses - Set of valid SPDX license identifiers
   * @returns {boolean} - Whether the license is valid
   */
  private isValidSPDXLicense = (license, defaultSPDXLicenses) => {
    return defaultSPDXLicenses.has(license)
      || license.toLowerCase().startsWith('licenseref')
      || (license.includes('WITH') && license.toLowerCase().includes('exception'))
      || license.includes('OR');
  };

  public componentLicenses(data:any, defaultSPDXLicenses: Set<string>): Array<IComponentLicense> {
    const LICENSE_SPLIT_PATTERN = / AND /g;

    const response = data.reduce((accumulator, currentItem) => {
      const licenses = licenseHelper.splitLicensesByOperator(currentItem.spdxid, LICENSE_SPLIT_PATTERN);
      // Process each license for the current item
      const processedLicenses = licenses.map((license) => {
        // Skip license exception if it is not preceded by WITH
        if (license.includes('exception')) {
          if (!license.match(/(?=.*exception)WITH\s+\S+/)) {
            return accumulator;
          }
        }

        if (this.isValidSPDXLicense(license, defaultSPDXLicenses)) {
          return license;
        }
        return licenseHelper.licenseNameToSPDXID(license);
      });

      // Add new component and attach license
      if (!accumulator[currentItem.id]) {
        accumulator[currentItem.id] = {
          id: currentItem.id,
          license: processedLicenses,
        };
        return accumulator;
      }

      // Attach a new license to an existing component
      accumulator[currentItem.id].license.push(...processedLicenses);

      return accumulator;
    }, {});
    return Object.values(response);
  }

  public componentFileAdapter(data:any) {
    const response = data.reduce((acc, curr) => {
      if (!acc[curr.id]) {
        const aux = {
          id: curr.id,
          type: curr.type,
          path: curr.path,
          lines: curr.lines,
          oss_lines: curr.oss_lines,
          matched: curr.matched,
          inventoryid: curr.inventoryid,
          file: curr.file,
          file_url: curr.file_url,
          url: curr.url,
          componentName: curr.componentName,
          md5_file: curr.md5_file,
          url_hash: curr.url_hash,
          purl: curr.purl,
          version: curr.version,
          latest: curr.latest,
          identified: curr.identified,
          ignored: curr.ignored,
          license: [],
        };
        aux.license.push(curr.spdxid);
        acc[curr.id] = aux;
      } else {
        acc[curr.id].license.push(curr.spdxid);
      } return acc;
    }, {});

    return Object.values(response);
  }
}
