import { PackageURL } from 'packageurl-js';
import { ComponentVulnerability } from '../../../model/entity/ComponentVulnerability';
import { AffectedComponent, VulnerabilityExportData } from '../../../model/interfaces/report/VulnerabilityExportData';
import { licenseHelper } from '../../../helpers/LicenseHelper';
import { ExportComponentData } from '../../../model/interfaces/report/ExportComponentData';

export function toVulnerabilityExportData(componentVulnerabilities: Array<ComponentVulnerability>): Array<VulnerabilityExportData> {
  const vulnerabilityMapper = new Map<string, VulnerabilityExportData & {
    components: Map<string, AffectedComponent>
  }>();
  componentVulnerabilities.forEach((cv) => {
    let { cve, source, summary, published, severity, modified } = cv.vulnerability;
    const { purl, version, rejectAt } = cv;
    if (!vulnerabilityMapper.has(cve)) {
      const componentMapper = new Map<string, { purl: string, versions: Array<string> }>();
      componentMapper.set(purl, { purl, versions: [version] });

      // WORKAROUND: OSV has a bug in the severity mapping
      if (severity && severity === 'MODERATE')
        severity = 'MEDIUM';

      vulnerabilityMapper.set(cve, {
        cve,
        source,
        summary,
        published,
        severity,
        rejectAt,
        modified,
        affectedComponents: undefined,
        components: componentMapper,
      });
      // vulnerability already exists in Map. Just check the purl and version
    } else {
      const vulnerability = vulnerabilityMapper.get(cve)!;
      const { components } = vulnerability;
      components.set(purl, components.has(purl)
        ? { purl, versions: [...components.get(purl)!.versions, version] }
        : { purl, versions: [version] });
    }
  });
  return Array.from(vulnerabilityMapper.values()).flatMap(((v) => {
    const vulnerability = { ...v, affectedComponents: Array.from(v.components.values()) as Array<AffectedComponent> };
    delete vulnerability.components;
    return vulnerability;
  }));
}

export function removeRepeatedLicenses(licenses: string): string {
  const licenseSet = new Set(licenseHelper.splitLicensesByOperator(licenses, / AND /g));
  const uniqueLicenses = Array.from(licenseSet.values());
  return uniqueLicenses.join(' AND ');
}

export function getSPDXLicenseInfos(licenses: string, uniqueLicenseInfos: Set<string>): Array<ExtractedLicenseInfo> {
  const lic = licenseHelper.splitLicensesByOperator(licenses, / (?:WITH|AND) /g);
  const licenseInfos = [];
  lic.forEach((license) => {
    const match = license.match(/^LicenseRef-(scancode-|scanoss-|)(\S+)$/i);

    let source = '';
    let name = license;

    if (match) {
      const [, sourceMatch, nameMatch] = match;
      source = sourceMatch.replace(/-/g, '');
      name = nameMatch;

      const sourceText = source ? ` by ${source}.` : '.';
      if (!uniqueLicenseInfos.has(license)) {
        uniqueLicenseInfos.add(license);
        licenseInfos.push({
          licenseId: license,
          name: name.replace(/-/g, ' '),
          extractedText: 'Detected license, please review component source code.',
          comment: `Detected license ${sourceText}`,
        });
      }
    }
  });
  return licenseInfos;
}

export function getSupplier(component: ExportComponentData) {
  if (component.vendor) return component.vendor;
  try {
    return PackageURL.fromString(component.purl).namespace || 'NOASSERTION';
  } catch (e) {
    return 'NOASSERTION';
  }
}

export function isValidPurl(purl: string): boolean {
  try {
    PackageURL.fromString(purl);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Adds a version to a PURL and returns the full PURL string.
 *
 * @param purl - The base PURL without a version (e.g., "pkg:github/owner/repo")
 * @param version - The version to add
 * @returns The full PURL with encoded version, or null if the base PURL is invalid
 */
export function purlAddVersion(purl: string, version: string | null): string | null {
  try {
    const parsed = PackageURL.fromString(purl);
    // Direct assignment is safe, constructor only validates version is string|null
    // See: https://github.com/package-url/packageurl-js/blob/v1.2.1/src/package-url.js#L47-L53
    parsed.version = version;
    return parsed.toString();
  } catch (e) {
    return null;
  }
}

export function resolveVulnerabilityURL(source: string, cve:string): string {
  return source.toUpperCase() === 'NVD' ? `https://nvd.nist.gov/vuln/detail/${cve}` : `https://osv.dev/vulnerability/${cve}`;
}
