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
    const identifiedLicenseSummary = await modelProvider.model.license.getIdentifedLicenseComponentSummary();

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
   // await this.addManifestFileToComponents(licenses);

    return { licenses: identifiedLicenseSummary,
       vulnerabilities: vulnerabilityReport,
       cryptographies,
       dependencies: dependenciesSummary,
       };
  }

  public async getDetected(): Promise<IReportData> {

    const licenses = await modelProvider.model.license.getDetectedLicenseComponentSummary();


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

    // Add Manifest files
    // await this.addManifestFileToComponents(licenses);

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
      licenses,
      cryptographies,
      vulnerabilities: vulnerabilityReport,
      dependencies: dependenciesSummary,
    };
  }

  public async getDetectedComponents(license?: string): Promise<ComponentReportResponse> {    
    let components = await modelProvider.model.component.getDetectedComponents();
    let dependencyComponentRaw = await modelProvider.model.dependency.getDetectedDependencies();
    // Filter by license
    if(license) {
      const licenseToLower = license.toLocaleLowerCase();    
      components = components.filter((c)=>{ 
        return c.licenses.some((l)=> l.toLocaleLowerCase()===licenseToLower);       
      });   
      dependencyComponentRaw = dependencyComponentRaw.filter((d) => {
        // ignore those components without license except for when user search by 'unknown'
        if(!d.licenses && license === 'unknown') return true; 
        if(!d.licenses) return false;       
        const licenses = d.licenses.split(',');
        return licenses.some((l) => l.toLocaleLowerCase()===licenseToLower);       
      });       
    }

    // Group dependency components by purl and version
    const declaredComponentMapper = new Map<string, ReportComponent>();
    dependencyComponentRaw.forEach((d) => {
      const key = `${d.purl}@${d.version}`;
      const newLicenses = d.licenses ? d.licenses.split(',') : ['unknown'];  
      if(declaredComponentMapper.get(key)) {
        const licenses = declaredComponentMapper.get(key).licenses;    
        declaredComponentMapper.get(key).licenses = Array.from(new Set([...licenses, ...newLicenses]));       
      }else {
        declaredComponentMapper.set(key, { purl: d.purl, version: d.version, name:d.purl, url:'', cryptography: [], vendor:'', manifestFile:d.file, source:'declared', licenses:newLicenses})
      }          
    });
    
    return { 
      components,
      declaredComponents: Array.from(declaredComponentMapper.values()),
    }
  }

  private getVulnerabilitiesReport(vulnerabilities: any) {
    const vulnerabilityReportMapper: Record<string, number> = vulnerabilities.reduce((acc, curr) => {
      if (!acc[curr.severity.toLowerCase()]) acc[curr.severity.toLowerCase()] = curr.count;
      return acc;
    }, {});
    return vulnerabilityReportMapper;
  }
 
}

export const reportService = new ReportService();
