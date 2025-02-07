import { ComponentVulnerability } from '../../../model/entity/ComponentVulnerability';
import { AffectedComponent, VulnerabilityExportData } from '../../../model/interfaces/report/VulnerabilityExportData';

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
