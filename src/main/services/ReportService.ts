import { modelProvider } from './ModelProvider';
import { Cryptography } from '../model/entity/Cryptography';

export interface LicenseEntry {
  label: string;
  components: Component[];
  value: number;
  incompatibles?: string[];
  has_incompatibles?: string[];
  copyleft?: boolean;
  patent_hints?: boolean;
}

export interface Component {
  name: string,
  url: string,
  vendor: string,
  purl: string,
  version: string,
  source: string,
  cryptography: Array<CryptographyAlgorithms> | [],
  manifestFile?: string;
}

interface CryptographyAlgorithms {
  algorithm: string,
  strength: string,
}

export interface ISummary {
  summary: {
    matchFiles: number;
    noMatchFiles: number;
    filterFiles: number;
    totalFiles: number;
  };
  identified: {
    scan: number;
    total: number;
  };
  pending: number;
  original: number;
}

class ReportService {
  public async getReportSummary(): Promise<ISummary> {
    const auxSummary = await modelProvider.model.file.getSummary();
    const summary: ISummary = {
      summary: {
        matchFiles: auxSummary.matchFiles,
        noMatchFiles: auxSummary.noMatchFiles,
        filterFiles: auxSummary.filterFiles,
        totalFiles: auxSummary.totalFiles,
      },
      identified: {
        scan: auxSummary.scannedIdentified,
        total: auxSummary.totalIdentified,
      },
      pending: auxSummary.pending,
      original: auxSummary.original,
    };
    return summary;
  }

  public async getIdentified() {
    let data: any = [];
    data = await modelProvider.model.component.getIdentifiedForReport();

    const licenseMapper = new Map<string, LicenseEntry>();
    data.forEach((element) => {
      const { name, vendor, url, purl, version, source, spdxid } = element;
      if (licenseMapper.has(spdxid)) {
        const license = licenseMapper.get(spdxid);
        license.components.push({ name, vendor, url, purl, version, source, cryptography: [] });
        license.value += 1;
      } else {
        const newLicense = {
          components: [{ name, vendor, url, purl, version, source, cryptography: [] }],
          value: 1,
          label: spdxid,
        };
        licenseMapper.set(spdxid, newLicense);
      }
    });

    const licenses = Array.from(licenseMapper.values()) as unknown as Array<LicenseEntry>;

    const vulnerabilities = await modelProvider.model.vulnerability.getIdentifiedReport();
    const vulnerabilityReport = {
      critical: 0,
      high: 0,
      low: 0,
      medium: 0,
      ...this.getVulnerabilitiesReport(vulnerabilities),
    };

    // Crypto
    const crypto = await modelProvider.model.cryptography.findAllIdentifiedMatched();
    this.addCryptoToComponent(licenses, crypto);

    // Dependencies
    const dependenciesSummary = await modelProvider.model.dependency.getIdentifiedSummary();

    // Add Manifest files
    await this.addManifestFileToComponents(licenses);

    return { licenses, vulnerabilities: vulnerabilityReport, crypto, dependencies: dependenciesSummary };
  }

  public async getDetected() {
    try {
      const results = await modelProvider.model.result.getDetectedReport();
      let licenses = this.getLicenseReportFromResults(results);

      const crypto = await modelProvider.model.cryptography.findAllDetected();

      const vulnerabilities = await modelProvider.model.vulnerability.getDetectedReport();
      const vulnerabilityReport = {
        critical: 0,
        high: 0,
        low: 0,
        medium: 0,
        ...this.getVulnerabilitiesReport(vulnerabilities),
      };

      const dependencies = await modelProvider.model.dependency.getAll(null);
      licenses = this.addDependencyComponentsToLicenseReport(licenses, dependencies);
      if (licenses) this.checkForIncompatibilities(licenses);

      // Dependencies
      const dependenciesSummary = await modelProvider.model.dependency.getDetectedSummary();

      this.addCryptoToComponent(licenses, crypto);

      // Add Manifest files
      await this.addManifestFileToComponents(licenses);

      return {
        licenses, crypto, vulnerabilities: vulnerabilityReport, dependencies: dependenciesSummary,
      };
    } catch (e) {
      return { status: 'fail' };
    }
  }

  private addCryptoToComponent(licenses: Array<LicenseEntry>, crypto: Array<Cryptography>) {
    const cryptoMapper = new Map<string, Cryptography>();
    crypto.forEach((c) => cryptoMapper.set(`${c.purl}@${c.version}`, c));

    licenses.forEach((l) => {
      l.components.forEach((c) => {
        if (cryptoMapper.has(`${c.purl}@${c.version}`)) {
          c.cryptography = cryptoMapper.get(`${c.purl}@${c.version}`).algorithms;
        }
      });
    });
  }

  private getLicenseReportFromResults(results: any): Array<LicenseEntry> {
    const licenses: Record<string, LicenseEntry> = results.reduce(
      (acc, curr) => {
        const key = curr.spdxid ? curr.spdxid : 'unknown';
        if (!acc[key]) {
          acc[key] = {
            label: key,
            value: 1,
            incompatibles: curr?.incompatible_with
              ? curr.incompatible_with.split(',')
              : [],
            has_incompatibles: [],
            patent_hints: curr?.patent_hints ? curr.patent_hints : false,
            copyleft: curr?.copyleft ? curr.copyleft : false,
            components: [
              {
                name: curr.name,
                vendor: curr.vendor,
                version: curr.version,
                purl: curr.purl,
                cryptography: [],
                source: 'detected',
              },
            ],
          };
        } else {
          const componentIndex = acc[key].components.findIndex(
            (c) => c.purl === curr.purl && c.version === curr.version,
          );
          if (componentIndex < 0) {
            acc[key].value += 1;
            acc[key].components.push({
              name: curr.name,
              vendor: curr.vendor,
              version: curr.version,
              purl: curr.purl,
              cryptography: [],
              source: 'detected',
            });
          }
        }
        return acc;
      },
      {},
    );
    Object.entries(licenses).forEach(([key, value]) => {
      value.value = value.components.length;
    });
    return Object.values(licenses);
  }

  private getVulnerabilitiesReport(vulnerabilities: any) {
    const vulnerabilityReportMapper: Record<string, number> = vulnerabilities.reduce((acc, curr) => {
      if (!acc[curr.severity.toLowerCase()]) acc[curr.severity.toLowerCase()] = curr.count;
      return acc;
    }, {});
    return vulnerabilityReportMapper;
  }

  private checkForIncompatibilities(licenses: LicenseEntry[]) {
    for (let l = 0; l < licenses.length; l += 1) {
      const license = licenses[l];
      if (license.incompatibles !== undefined) {
        for (let i = 0; i < license.incompatibles.length; i += 1) {
          if (licenses.some((lic) => lic.label === license.incompatibles[i])) license.has_incompatibles.push(license.incompatibles[i]);
        }
      }
    }
  }

  /**
  * @description An array of LicenseEntry objects representing detected licenses with matched components.
  * @param licenses Array of all detected licenses
  * @param dependencies Array of all licenses
  * @returns LicenseEntry[] Licenses with all the components
  * */

  private addDependencyComponentsToLicenseReport(
    licenses: LicenseEntry[],
    dependencies: Array<any>,
  ): Array<LicenseEntry> {
    const licenseMapper = licenses.reduce((acc, curr) => {
      if (!acc[curr.label]) acc[curr.label] = curr;
      return acc;
    }, {} as any);

    dependencies.forEach((dep) => {
      const { component, purl, version } = dep;
      // We don't know what is the license
      if (!dep.originalLicense) {
        if (!licenseMapper.unknown) {
          licenseMapper.unknown = {
            components: [
              {
                name: component !== '' ? component : purl,
                vendor: null,
                version,
                purl,
                cryptography: [],
                source: 'declared',
              },
            ],
            label: 'unknown',
            value: 1,
            incompatibles: [],
            has_incompatibles: [],
            patent_hints: false,
            copyleft: false,
          };
        } else {
          licenseMapper.unknown.components.push({
            name: component !== '' ? component : purl,
            vendor: null,
            version: dep.version,
            purl: dep.purl,
            cryptography: [],
            source: 'declared',
          });
          licenseMapper.unknown.value += 1;
        }
      } else {
        dep.originalLicense?.forEach((l) => {
          // if license already exists in the license mapper
          if (licenseMapper[l]) {
            const componentIndex = licenseMapper[l].components.findIndex(
              (c) => c.purl === dep.purl && c.version === dep.version && dep.source === 'dependency',
            );
            // check if the component already exists in the component array
            if (componentIndex < 0) {
              licenseMapper[l].components.push({
                name: dep.componentName,
                vendor: null,
                version,
                purl,
                cryptography: [],
                source: 'declared',
              });
              licenseMapper[l].value += 1;
            }
          } else { // The license not exists in license mapper
            licenseMapper[l] = {
              components: [
                {
                  name: dep.componentName,
                  vendor: null,
                  version,
                  purl,
                  cryptography: [],
                  source: 'declared',
                },
              ],
              label: l,
              value: 1,
              incompatibles: [],
              has_incompatibles: [],
              patent_hints: false,
              copyleft: false,
            };
          }
        });
      }
    });
    // Used to position the unknown license element to the end of the array
    const licenseArray = Object.values(licenseMapper) as Array<LicenseEntry>;
    if (licenseMapper.unknown) {
      const index = licenseArray.findIndex((l) => l.label === 'unknown');
      const aux = licenseArray[index];
      licenseArray.splice(index, 1);
      licenseArray.push(aux);
    }
    return licenseArray as Array<LicenseEntry>;
  }

  private async getManifestFileMapper(): Promise<Map<string, string>> {
    const dependencyData = await modelProvider.model.dependency.getAll(null);
    const mapper = new Map<string, string>(); // Ei. pkg:golang/go.opentelemetry.io/otel@v1.17.0 -> /go.sum
    dependencyData.forEach((d) => {
      mapper.set(`${d.purl}@${d.version}`, d.path);
    });
    return mapper;
  }

  private async addManifestFileToComponents(data: Array<LicenseEntry>): Promise<void> {
    const manifestMapper = await this.getManifestFileMapper();
    data.forEach((l) => {
      l.components.forEach((c) => {
        const key = `${c.purl}@${c.version}`;
        if (manifestMapper.has(key) && c.source === 'declared') {
          c.manifestFile = manifestMapper.get(key);
        }
      });
    });
  }
}

export const reportService = new ReportService();
