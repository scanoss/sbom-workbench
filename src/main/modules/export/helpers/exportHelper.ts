import { ComponentVulnerability } from '../../../model/entity/ComponentVulnerability';
import { AffectedComponent, VulnerabilityExportData } from '../../../model/interfaces/report/VulnerabilityExportData';
import { licenseHelper } from '../../../helpers/LicenseHelper';

export function toVulnerabilityExportData(componentVulnerabilities: Array<ComponentVulnerability>): Array<VulnerabilityExportData> {
  const vulnerabilityMapper = new Map<string, VulnerabilityExportData & {
    components: Map<string, AffectedComponent>
  }>();
  componentVulnerabilities.forEach((cv) => {
    const { cve, source, summary, published, severity, modified } = cv.vulnerability;
    const { purl, version, rejectAt } = cv;
    if (!vulnerabilityMapper.has(cve)) {
      const componentMapper = new Map<string, { purl: string, versions: Array<string> }>();
      componentMapper.set(purl, { purl, versions: [version] });
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
