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
    const vulnerabilitiesLists = {
      critical: [],
      high: [],
      moderate: [],
      low: [],
    };
    let licenses: LicenseEntry[] = [];
    const crypto: CryptoEntry[] = [{ label: 'None', files: [], value: 0 }];


    try {
      const a = await workspace.getOpenedProjects()[0].getResults();
      for (const [key, results] of Object.entries<any[]>(a)) {
        for (const result of results) {
          if (result.id !== 'none') {
            if (result.licenses !== undefined && result.licenses[0] !== undefined) {
              if (!licenses.some((l) => l.label === result.licenses[0].name)) {
                const newLicense = {
                  label: '',
                  components: [],
                  value: 1,
                  incompatibles: [],
                  has_incompatibles: [],
                  patent_hints: false,
                  copyleft: false,
                };
                newLicense.label = result.licenses[0].name;
                newLicense.patent_hints = result.licenses[0].patent_hints === 'yes';
                newLicense.copyleft = result.licenses[0].copyleft === 'yes';

                newLicense.components.push({
                  name: result.component,
                  vendor: result.vendor,
                  version: result.version,
                  purl: result.purl[0],
                });

                if (result.licenses[0].incompatible_with)
                  newLicense.incompatibles = result.licenses[0].incompatible_with.split(', ');
                licenses.push(newLicense);
              } else {
                const index = licenses.findIndex((l) => l.label === result.licenses[0].name);
                if (index >= 0) {
                  if (!licenses[index].components.some((c) => c.name && c.name === result.component))
                    licenses[index].components.push({
                      name: result.component,
                      vendor: result.vendor,
                      version: result.version,
                      purl: result.purl[0],
                    });
                  licenses[index].value = licenses[index].components.length;
                }
              }
            }
            // Crypto
            if (result.cryptography !== undefined && result.cryptography[0] !== undefined) {
              if (!crypto.some((l) => l.label === result.cryptography[0].algorithm)) {
                const newCrypto = { label: '', files: [], value: 1 };
                newCrypto.label = result.cryptography[0].algorithm;
                newCrypto.files.push(result.file);
                crypto.push(newCrypto);
              } else {
                const index = crypto.findIndex((l) => l.label === result.cryptography[0].algorithm);
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

      const vulnerabilities = await modelProvider.model.vulnerability.getDetectedReport();
      const vulnerabilityReport = { critical: 0, high: 0, low: 0, moderate: 0,...this.getVulnerabilitiesReport(vulnerabilities) };

      const dependencies = await modelProvider.model.dependency.getAll(null);
      licenses = await this.mergeLicenseData(licenses, dependencies);
      if (licenses) this.checkForIncompatibilities(licenses);

      return { licenses, crypto, vulnerabilities: vulnerabilityReport };
    } catch (e) {
      console.log('Catch an error: ', e);
      return { status: 'fail' };
    }
  }

  private getVulnerabilitiesReport(vulnerabilities: any){
    const vulnerabilityReportMapper : Record<string,number>  = vulnerabilities.reduce((acc, curr) => {
      if (!acc[curr.severity.toLowerCase()]) acc[curr.severity.toLowerCase()] = curr.count;
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

  private async mergeLicenseData(licenses: LicenseEntry[], dependencies: Array<any>): Promise<Array<LicenseEntry>> {
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
