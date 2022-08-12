import { workspace } from '../workspace/Workspace';
import { modelProvider } from './ModelProvider';

interface LicenseEntry {
  label: string;
  components: any[];
  value: number;
  incompatibles: string[];
  has_incompatibles: string[];
  copyleft: boolean;
  patent_hints: boolean;
}
interface CryptoEntry {
  label: string;
  value: number;
  files: any[];
}

interface InventoryProgress {
  totalFiles: number;
  scannedFiles: number;
  excludedFiles: number;
  detectedComponents: number;
  acceptedComponents: number;
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
    const licenses = [];
    data.forEach((element) => {
      const aux: any = {};
      const index = licenses.findIndex((obj) => obj.label === element.spdxid);
      if (index >= 0) {
        licenses[index].components.push({
          name: element.comp_name,
          vendor: element.vendor,
          url: element.url,
          purl: element.purl,
          version: element.version,
        });
        licenses[index].value += 1;
      } else {
        aux.components = [];
        aux.components.push({
          name: element.comp_name,
          vendor: element.vendor,
          url: element.url,
          purl: element.purl,
          version: element.version,
        });
        aux.value = 1;
        aux.label = element.spdxid;
        licenses.push(aux);
      }
    });

    // TODO: get vulnerabilities
    const vulnerabilities = { critical: 0, high: 0, low: 0, moderate: 0 };

    return { licenses, vulnerabilities };
  }

  public async getDetected() {
    try {
    const results = await modelProvider.model.result.getDetectedReport();
    let licenses = this.getLicenseReportFromResults(results);
    const crypto = await this.getCryptoFromResults();

      const vulnerabilities =
        await modelProvider.model.vulnerability.getDetectedReport();
      const vulnerabilityReport = {
        critical: 0,
        high: 0,
        low: 0,
        moderate: 0,
        ...this.getVulnerabilitiesReport(vulnerabilities),
      };

      const dependencies = await modelProvider.model.dependency.getAll(null);
      licenses = this.mergeLicenseData(licenses, dependencies);
      if (licenses) this.checkForIncompatibilities(licenses);

      return { licenses, crypto, vulnerabilities: vulnerabilityReport };
    } catch (e) {
      console.log('Catch an error: ', e);
      return { status: 'fail' };
    }
  }

  private async getCryptoFromResults(){
    const crypto: CryptoEntry[] = [{ label: 'None', files: [], value: 0 }];
    const a = await workspace.getOpenedProjects()[0].getResults();
    for (const [key, results] of Object.entries<any[]>(a)) {
      for (const result of results) {
        if (result.id !== 'none') {
          // Crypto
          if (
            result.cryptography !== undefined &&
            result.cryptography[0] !== undefined
          ) {
            if (
              !crypto.some(
                (l) => l.label === result.cryptography[0].algorithm
              )
            ) {
              const newCrypto = {label: '', files: [], value: 1};
              newCrypto.label = result.cryptography[0].algorithm;
              newCrypto.files.push(result.file);
              crypto.push(newCrypto);
            } else {
              const index = crypto.findIndex(
                (l) => l.label === result.cryptography[0].algorithm
              );
              if (index >= 0) {
                crypto[index].files.push(result.file);
                crypto[index].value = crypto[index].files.length;
              }
            }
          } else {
            const index = crypto.findIndex((l) => l.label === 'None');
            crypto[index].files.push(result.file);

            crypto[index].value = crypto[index].files.length;
          }
        }
      }
    }
  }

  private getLicenseReportFromResults(results: any): Array<LicenseEntry> {
    const licenses: Record<string,LicenseEntry> = results.reduce((acc, curr) => {
      const key = curr.spdxid;
      if (!acc[key]) {
        acc[key] = {
          label: key,
          value: 0,
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
            },
          ],
        };
      } else {
        const componentIndex = acc[key].components.findIndex(
          (c) => c.purl === curr.purl && c.version === curr.version
        );
        if (componentIndex < 0)
          acc[key].components.push({
            name: curr.name,
            vendor: curr.vendor,
            version: curr.version,
            purl: curr.purl,
          });
      }
      return acc;
    },{});
    Object.entries(licenses).forEach(([key, value]) => { value.value =  value.components.length });
    return Object.values(licenses);
  }

  private getVulnerabilitiesReport(vulnerabilities: any) {
    const vulnerabilityReportMapper: Record<string, number> =
      vulnerabilities.reduce((acc, curr) => {
        if (!acc[curr.severity.toLowerCase()])
          acc[curr.severity.toLowerCase()] = curr.count;
        return acc;
      }, {});
    return vulnerabilityReportMapper;
  }

  private checkForIncompatibilities(licenses: LicenseEntry[]) {
    for (let l = 0; l < licenses.length; l += 1) {
      const license = licenses[l];
      if (license.incompatibles !== undefined)
        for (let i = 0; i < license.incompatibles.length; i += 1) {
          if (licenses.some((lic) => lic.label === license.incompatibles[i]))
            license.has_incompatibles.push(license.incompatibles[i]);
        }
    }
  }

  private mergeLicenseData(
    licenses: LicenseEntry[],
    dependencies: Array<any>
  ): Array<LicenseEntry> {
    const licenseMapper = licenses.reduce((acc, curr) => {
      if (!acc[curr.label]) acc[curr.label] = curr;
      return acc;
    }, {} as any);

    dependencies.forEach((dep) => {
      if (!dep.originalLicense) {
        if (dep.version || dep.purl || dep.component !== '') {
          if (!licenseMapper.unknown) {
            licenseMapper.unknown = {
              components: [
                {
                  name: dep.component !== '' ? dep.component : dep.purl,
                  vendor: null,
                  version: dep.version,
                  purl: dep.purl,
                },
              ],
              label: 'unknown',
              value: 1,
              incompatibles: [],
              has_incompatibles: [],
              patent_hints: false,
              copyleft: false,
            };
          } else
            licenseMapper.unknown.components.push({
              name: dep.component !== '' ? dep.component : dep.purl,
              vendor: null,
              version: dep.version,
              purl: dep.purl,
            });
        }
      } else {
        dep.originalLicense?.forEach((l) => {
          if (licenseMapper[l]) {
            const componentIndex = licenseMapper[l].components.findIndex(
              (c) => c.purl === dep.purl && c.version === dep.version
            );
            if (componentIndex < 0) {
              licenseMapper[l].components.push({
                name: dep.componentName,
                vendor: null,
                version: dep.version,
                purl: dep.purl,
              });
            } else {
              licenseMapper[l].components.push({
                name: dep.componentName,
                vendor: null,
                version: dep.version,
                purl: dep.purl,
              });
            }
          } else {
            licenseMapper[l] = {
              components: [
                {
                  name: dep.componentName,
                  vendor: null,
                  version: dep.version,
                  purl: dep.purl,
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
}

export const reportService = new ReportService();
