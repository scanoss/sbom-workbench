import { ComponentReportResponse } from '@api/types';
import { modelProvider } from './ModelProvider';


export interface ReportComponent {
  name: string,
  url: string,
  vendor: string,
  purl: string,
  version: string,
  source: string,
  cryptography: Array<CryptographyAlgorithms> | [],
  manifestFiles?: Array<string>;
  licenses: Array<string>,
  fileCount?: number;
}

export interface CryptographyAlgorithms {
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

export interface  LicenseReport {
  label: string,
  value: number;
}

export interface IReportData {
  licenses: Array<LicenseReport>;
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


  private filterComponentsByLicense(license: string, components: Array<ReportComponent>): Array<ReportComponent> {
    const licenseToLower = license.toLowerCase();
    const filteredComponents = components.filter((c)=> {
      return c.licenses.some((l)=> l.toLowerCase()===licenseToLower); 
    });
    return filteredComponents;
   }

  private getVulnerabilitiesReport(vulnerabilities: any) {
    const vulnerabilityReportMapper: Record<string, number> = vulnerabilities.reduce((acc, curr) => {
      if (!acc[curr.severity.toLowerCase()]) acc[curr.severity.toLowerCase()] = curr.count;
      return acc;
    }, {});
    return vulnerabilityReportMapper;
  }

  private getFileCountComponentMapper(input : Array<{ purl: string, version: string, fileCount: number, source: string}>): Map<string, { componentFileCount: number, declaredComponentFileCount: number }> {
    const componentFileCountMapper = new Map<string, { componentFileCount: number, declaredComponentFileCount: number }>();

    // Adds files detected for each component (divided in 'detected' and 'declared')
    input.forEach((c) => { 
      const key = `${c.purl}@${c.version}`;
      const existingEntry = componentFileCountMapper.get(key);    
      if (existingEntry) {
        if (c.source === 'declared') {
          existingEntry.declaredComponentFileCount = c.fileCount;
        } else {
          existingEntry.componentFileCount = c.fileCount;
        }
      } else {
        const fileCount = {
          componentFileCount: c.source === 'declared' ? 0 : c.fileCount,
          declaredComponentFileCount: c.source === 'declared' ? c.fileCount : 0,
        };
        componentFileCountMapper.set(key, fileCount);
      }
    });
    return componentFileCountMapper;
  }


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
    
    // License components summary
    const identifiedLicenseSummary = await modelProvider.model.license.getIdentifedLicenseComponentSummary();

    // Vulnerabilities
    const vulnerabilities = await modelProvider.model.vulnerability.getIdentifiedReport();
    const vulnerabilityReport = {
      critical: 0,
      high: 0,
      low: 0,
      medium: 0,
      ...this.getVulnerabilitiesReport(vulnerabilities),
    };

    // Crypto
    const sbomAlgorithms = await modelProvider.model.cryptography.getAllIdentifiedAlgorithms();
    const localAlgorithms = await modelProvider.model.localCryptography.getAllAlgorithms();
    const cryptographies = {
      sbom: sbomAlgorithms.length,
      local: localAlgorithms.length,
    };

    // Dependencies
    const dependenciesSummary = await modelProvider.model.dependency.getIdentifiedSummary();

    return { licenses: identifiedLicenseSummary,
       vulnerabilities: vulnerabilityReport,
       cryptographies,
       dependencies: dependenciesSummary,
       };
  }

  public async getDetected(): Promise<IReportData> {
    
    // License components summary
    const detectedlicensesSummary = await modelProvider.model.license.getDetectedLicenseComponentSummary();

    // Vulnerabilities
    const vulnerabilities = await modelProvider.model.vulnerability.getDetectedReport();
    const vulnerabilityReport = {
      critical: 0,
      high: 0,
      low: 0,
      medium: 0,
      ...this.getVulnerabilitiesReport(vulnerabilities),
    };

    // Dependencies
    const dependenciesSummary = await modelProvider.model.dependency.getDetectedSummary();

    // Crypto
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
      licenses: detectedlicensesSummary,
      cryptographies,
      vulnerabilities: vulnerabilityReport,
      dependencies: dependenciesSummary,
    };
  }

  public async getDetectedComponents(license?: string): Promise<ComponentReportResponse> {  
    const componentFileCount = await modelProvider.model.component.getDetectedComponentFileCount();
    const componentFileCountMapper = this.getFileCountComponentMapper(componentFileCount);    

    // Adds file count detected for each detected component  
    let components = await modelProvider.model.component.findAllDetectedComponents();
    components.forEach((c)=> { c.fileCount = componentFileCountMapper.get(`${c.purl}@${c.version}`).componentFileCount });

    // Adds file count detected for each declared detected component
    let declaredComponents = await modelProvider.model.dependency.findAllDeclaredComponents();
    declaredComponents.forEach((c)=> { c.fileCount = componentFileCountMapper.get(`${c.purl}@${c.version}`).declaredComponentFileCount });

    // Filter by license
    if(license) {
      components = this.filterComponentsByLicense(license, components); 
      declaredComponents = this.filterComponentsByLicense(license, declaredComponents);        
    }    


    return { 
      components,
      declaredComponents
    }
  }


  public async getIdentifiedComponents(license?: string): Promise<ComponentReportResponse> {
      let indentifiedComponents = await modelProvider.model.component.getIdentifiedComponents();
      if(license){
        indentifiedComponents = this.filterComponentsByLicense(license, indentifiedComponents);
      }

      const components: ReportComponent[] = [];
      const declaredComponents: ReportComponent[] = [];
      //Get components and declared components

      const componentFileCount = await modelProvider.model.component.getIdentifiedComponentFileCount();
      const componentFileCountMapper = this.getFileCountComponentMapper(componentFileCount);
      indentifiedComponents.forEach((c)=>{
        const component = componentFileCountMapper.get(`${c.purl}@${c.version}`);
        if(c.source === 'detected') {        
          c.fileCount = component.componentFileCount;
          components.push(c);
        } 
        else{
          c.fileCount = component.declaredComponentFileCount;
          declaredComponents.push(c);
        } 
      });

      return{
        components,
        declaredComponents
      }
   }
 
}

export const reportService = new ReportService();
