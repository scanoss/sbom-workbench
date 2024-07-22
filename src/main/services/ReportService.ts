import { modelProvider } from './ModelProvider';
import { Cryptography } from '../model/entity/Cryptography';
import { dependencies } from 'webpack';

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
  fileCount: number;
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

export interface IReportData {
  licenses: LicenseEntry[];
  vulnerabilities: {
    critical: number;
    high: number;
    low: number;
    medium: number;
  };
  cryptographies: {
    sbom: number;
    local: number;
  }
  dependencies: {
    files: any; // FIX TYPE
    total: number;
  }
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

  public async getIdentified(): Promise<IReportData> {
    let data: any = [];
    data = await modelProvider.model.component.getIdentifiedForReport();

    const componentFileCountSummary = await this.getIdentifiedComponentFileSummary();


    const licenseMapper = new Map<string, LicenseEntry>();
    data.forEach((element) => {
      const { name, vendor, url, purl, version, source, spdxid } = element;
      if (licenseMapper.has(spdxid)) {
        const license = licenseMapper.get(spdxid);       
        license.components.push({ name, vendor, url, purl, version, source, cryptography: [], fileCount: componentFileCountSummary.get(`${spdxid}${purl}${version}`) });
        license.value += 1;    
      } else {
        const newLicense = {
          components: [{ name, vendor, url, purl, version, source, cryptography: [], fileCount:componentFileCountSummary.get(`${spdxid}${purl}${version}`) }],
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

    // Get Crypto stats
    const sbomAlgorithms = await modelProvider.model.cryptography.getAllIdentifiedAlgorithms();

    const localAlgorithms = await modelProvider.model.localCryptography.getAllAlgorithms();
    const cryptographies = {
      sbom: sbomAlgorithms.length,
      local: localAlgorithms.length,
    };

    // Dependencies
    const dependenciesSummary = await modelProvider.model.dependency.getIdentifiedSummary();

    // Add Manifest files
    await this.addManifestFileToComponents(licenses);

    return { licenses, vulnerabilities: vulnerabilityReport, cryptographies, dependencies: dependenciesSummary };
  }

  public async getDetected(): Promise<IReportData> {
    const results = await modelProvider.model.result.getDetectedReport();
    let licenses = await this.getLicenseReportFromResults(results);

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

    // Get Crypto stats
    const detectedCrypto = await modelProvider.model.cryptography.findAllDetected();
    const sbomAlgorithms = new Set();

    detectedCrypto.forEach((c) => {
      c.algorithms.forEach((a) => {
        sbomAlgorithms.add(a.algorithm);
      });
    });
    const localAlgorithms = await modelProvider.model.localCryptography.getAllAlgorithms();

    const cryptographies = {
      sbom: Array.from(sbomAlgorithms.values()).length,
      local: localAlgorithms.length,
    };

   return {
      licenses, cryptographies, vulnerabilities: vulnerabilityReport, dependencies: dependenciesSummary,
    };
  }

  private async getLicenseReportFromResults(results: any): Promise<Array<LicenseEntry>> {
    // key map = {spdxid}{purl}{version}
    const componentFileCountMapper =  await this.getDetectedComponentFileSummary();
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
                fileCount: componentFileCountMapper.get(`${key}${curr.purl}${curr.version}`)
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
              fileCount: componentFileCountMapper.get(`${key}${curr.purl}${curr.version}`)
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


    const createComponent = (dep: any) => ({
      name: dep.component !== '' ? dep.component : dep.purl,
      vendor: null,
      version: dep.version,
      purl: dep.purl,
      cryptography: [],
      source: 'declared',
      manifestFile: dep.path,
      fileCount: 1,
    });

    dependencies.forEach((dep) => {
      const { component, purl, version, path } = dep;
      // We don't know what is the license
      if (!dep.originalLicense) {
        if (!licenseMapper.unknown) {
          licenseMapper.unknown = {
            components: [createComponent(dep)],
            label: 'unknown',
            value: 1,
            incompatibles: [],
            has_incompatibles: [],
            patent_hints: false,
            copyleft: false,
          };
        } else {

          const componentIndex = licenseMapper.unknown.components.findIndex(
            (c) => c.purl === dep.purl && c.version === dep.version && dep.source === 'declared',
          );

          if(componentIndex<0){
            licenseMapper.unknown.components.push(createComponent(dep))
            licenseMapper.unknown.value += 1;
          }else{
            licenseMapper.unknown.components[componentIndex].fileCount += 1; 
          }         
        }
      } else {
        dep.originalLicense?.forEach((l) => {
          // if license already exists in the license mapper
          if (licenseMapper[l]) {
            const componentIndex = licenseMapper[l].components.findIndex(
              (c) => c.purl === dep.purl && c.version === dep.version && dep.source === 'declared',
            );
            // check if the component already exists in the component array
            if (componentIndex < 0) {
              licenseMapper[l].components.push(createComponent(dep));
              licenseMapper[l].value += 1;
            }else{
              licenseMapper[l].components[componentIndex].fileCount += 1;
            }

          } else { // The license not exists in license mapper
            licenseMapper[l] = {
              components: [createComponent(dep)],
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
      const key = `${d.purl}@${d.version}`;
      mapper.set(key, d.path);
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
          c.fileCount = 1;
        }
      });
    });
  }

  /**
   * @brief Gets detected component file summary and convert to a map. Key of map is {spdxid}{purl}{version}
   *
   * */

  private async getDetectedComponentFileSummary():Promise<Map<string,number>>{
    const componentSummary = await modelProvider.model.result.getDetectedComponentFileSummary();
    const detectedComponentFileMapper = new Map<string, number>();
    componentSummary.forEach((cs)=>{
      detectedComponentFileMapper.set(`${cs.spdxid}${cs.purl}${cs.version}`,cs.fileCount);
    });

    return detectedComponentFileMapper;

  }

  private async getIdentifiedComponentFileSummary():Promise<Map<string,number>>{
    const componentSummary = await modelProvider.model.component.getIdentifiedComponentFileSummary();
    const detectedComponentFileMapper = new Map<string, number>();
    componentSummary.forEach((cs)=>{
      detectedComponentFileMapper.set(`${cs.spdxid}${cs.purl}${cs.version}`,cs.fileCount);
    });

    return detectedComponentFileMapper;

  }
}

export const reportService = new ReportService();
