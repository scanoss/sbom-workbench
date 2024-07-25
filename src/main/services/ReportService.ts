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
  manifestFile?: string;
  licenses: Array<string>,
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
    let components = await modelProvider.model.component.findAllDetectedComponents();
    let declaredComponents = await modelProvider.model.dependency.findAllDeclaredComponents();
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
      let indentifiedComponents = await modelProvider.model.component.getIDentifiedComponents();
      if(license){
        indentifiedComponents = this.filterComponentsByLicense(license, indentifiedComponents);
      }

      const components: ReportComponent[] = [];
      const declaredComponents: ReportComponent[] = [];
      //Get components and declared components

      indentifiedComponents.forEach((c)=>{
        if(c.source === 'detected') components.push(c);
        else declaredComponents.push(c);
      });

      return{
        components,
        declaredComponents
      }
   }
 
}

export const reportService = new ReportService();
