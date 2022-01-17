import { workspace } from '../workspace/Workspace';

interface licenseEntry {
  label: string;
  components: any[];
  value: number;
  incompatibles: string[];
  has_incompatibles: [];
  copyleft: boolean;
  patent_hints: boolean;
}
interface cryptoEntry {
  label: string;
  components: any[];
  value: number;
  strength: number;
}

interface inventoryProgress {
  totalFiles: number;
  scannedFiles: number;
  excludedFiles: number;
  detectedComponents: number;
  acceptedComponents: number;
}

class ReportService {
  public async getReportSummary() {
    try {
      let tempSummary: any = {};
      tempSummary = await workspace.getOpenedProjects()[0].store.inventory.getCurrentSummary();
      const projectSummary = await workspace.getOpenedProjects()[0].filesSummary;
      const summary = {
        totalFiles: 0,
        includedFiles: 0,
        filteredFiles: 0,
        scannedFiles: 0,
        pendingFiles: 0,
        identifiedFiles: 0,
        ignoredFiles: 0,
        detectedFiles: 0,
      };
      summary.totalFiles = projectSummary.total;
      summary.includedFiles = projectSummary.include;
      summary.filteredFiles = projectSummary.filter;
      summary.scannedFiles = tempSummary[0].identified + tempSummary[0].ignored + tempSummary[0].pending;
      summary.pendingFiles = tempSummary[0].pending;
      summary.identifiedFiles = tempSummary[0].identified;
      summary.ignoredFiles = tempSummary[0].ignored;
      summary.detectedFiles = tempSummary[0].detected;
      return summary;
    } catch (error) {
      return error;
    }
  }

  public async getReportIdentified() {
    try {
      let data: any = [];
      data = await workspace.getOpenedProjects()[0].store.component.getIdentifiedForReport();
      const licenses = [];
      data.forEach((element) => {
        const aux: any = {};
        const index = licenses.findIndex((obj) => obj.label === element.spdxid);
        if (index >= 0) {
          licenses[index].components.push({
            name: element.comp_name,
            vendor: element.comp_name,
            url: element.url,
            purl: element.purl,
            version: element.version,
          });
          licenses[index].value += 1;
        } else {
          aux.components = [];
          aux.components.push({
            name: element.comp_name,
            vendor: element.comp_name,
            url: element.url,
            purl: element.purl,
            version: element.version,
          });
          aux.value = 1;
          aux.label = element.spdxid;
          licenses.push(aux);
        }
      });
      return { licenses };
    } catch (error) {
      return error;
    }
  }

  public async getDetected() {
    const vulnerabilitiesLists = {
      critical: [],
      high: [],
      moderate: [],
      low: [],
    };
    let success: boolean;
    let licenses: licenseEntry[];
    let crypto: cryptoEntry[];
    let inventory: inventoryProgress;
    const vulnerabilities = { critical: 0, high: 0, low: 0, moderate: 0 };
    licenses = [];
    crypto = [{ label: 'None', files: [], value: 0 }];

    try {
      const a = await workspace.getOpenedProjects()[0].getResults();
      for (const [key, results] of Object.entries(a)) {
        for (const result of results) {
          if (result.id != 'none') {
            if (result.licenses != undefined && result.licenses[0] != undefined) {
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
            if (result.cryptography != undefined && result.cryptography[0] != undefined) {
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
              //  }
            }
            /* Vulnerabilities */
            if (result.vulnerabilities !== undefined) {
              let i = 0;
              for (i = 0; i < result.vulnerabilities.length; i++) {
                const v = result.vulnerabilities[i];

                if (v.severity === 'CRITICAL') {
                  if (!vulnerabilitiesLists.critical.some((vl) => vl.ID === v.ID))
                    vulnerabilitiesLists.critical.push(v);
                } else if (v.severity === 'HIGH') {
                  if (!vulnerabilitiesLists.high.some((vl) => vl.ID === v.ID)) vulnerabilitiesLists.high.push(v);
                } else if (v.severity === 'MODERATE') {
                  if (!vulnerabilitiesLists.moderate.some((vl) => vl.ID === v.ID))
                    vulnerabilitiesLists.moderate.push(v);
                } else if (v.severity === 'LOW') {
                  if (!vulnerabilitiesLists.low.some((vl) => vl.ID === v.ID)) vulnerabilitiesLists.low.push(v);
                }
              }
            }
          }
        }
      }
      vulnerabilities.critical = vulnerabilitiesLists.critical.length;
      vulnerabilities.high = vulnerabilitiesLists.high.length;
      vulnerabilities.moderate = vulnerabilitiesLists.moderate.length;
      vulnerabilities.low = vulnerabilitiesLists.low.length;

      if (licenses) this.checkForIncompatibilities(licenses);
      // un-comment next line to output report data
      // console.log(JSON.stringify({ licenses, crypto, summary }));

      return { licenses, crypto, vulnerabilities };
      
    } catch (e) {
      console.log('Catch an error: ', e);
      return { status: 'fail' };
    }
  }

  private checkForIncompatibilities(licenses: licenseEntry[]) {
    let l = 0;
    let i = 0;

    for (l = 0; l < licenses.length; l += 1) {
      const license = licenses[l];
      if (license.incompatibles !== undefined)
        for (i = 0; i < license.incompatibles.length; i += 1) {
          if (licenses.some((l) => l.label === license.incompatibles[i]))
            license.has_incompatibles.push(license.incompatibles[i]);
        }
    }
  }
}

export const reportService = new ReportService();
