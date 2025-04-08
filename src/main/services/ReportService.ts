import { ComponentReportResponse, ReportSummary } from '../../api/types';
import { modelProvider } from './ModelProvider';
import { ComponentReportVisitor } from '../modules/report/components/ComponentReportVisitor';
import { ReportComponentIdentified } from '../modules/report/components/ReportComponentIndentified';
import { ReportComponentDetected } from '../modules/report/components/ReportComponentDetected';
import { ExportControl } from '../model/entity/ExportControl';


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

export interface ExportControlReport {
  data: Array<ExportControl>;
  categorySummary: Record<string, number>;
  totalCategories: number;
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
  exportControl: ExportControlReport;
}

class ReportService {

  private getExportControlReport(exportControl: Array<ExportControl>): ExportControlReport {
    const categoryMap = new Map<string,number>();
    exportControl.flatMap(ec => ec.hints)
      .filter(hint => hint.category)
      .forEach(hint => {
        const currentCount = categoryMap.get(hint.category) || 0;
        categoryMap.set(hint.category, currentCount + 1);
      });
    return {
      data: exportControl,
      categorySummary: Object.fromEntries(categoryMap),
      totalCategories: categoryMap.size
    }
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

  /**
 *@brief Retrieves a summary of identified data, including licenses, vulnerabilities, cryptographic algorithms, and dependencies.
 *
 * This method fetches various types of identified information from the database and compiles a summary report.
 * It includes identified license components, vulnerability counts categorized by severity, identified cryptographic algorithms,
 * and identified dependencies.
 *
 * @returns {Promise<IReportData>} - A promise that resolves to an object containing:
 *   - `licenses` (IdentifiedLicenseComponentSummary): Summary of identified license components.
 *   - `cryptographies` (Object): An object with two properties:
 *     - `sbom` (number): The number of cryptographic algorithms identified in SBOM.
 *     - `local` (number): The number of cryptographic algorithms identified locally.
 *   - `vulnerabilities` (Object): An object with counts of identified vulnerabilities categorized by severity:
 *     - `critical` (number): Number of critical vulnerabilities.
 *     - `high` (number): Number of high vulnerabilities.
 *     - `medium` (number): Number of medium vulnerabilities.
 *     - `low` (number): Number of low vulnerabilities.
 *   - `dependencies` (IdentifiedDependenciesSummary): Summary of identified dependencies.
 *
 * @throws {Error} - Throws an error if any of the data fetching or processing operations fail.
 */
  public async getIdentified(): Promise<IReportData> {

    // License components summary
    const identifiedLicenseSummary = await modelProvider.model.report.identifedLicenseComponentSummary();

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

    return {
      licenses: identifiedLicenseSummary,
      vulnerabilities: vulnerabilityReport,
      cryptographies,
      dependencies: dependenciesSummary,
      exportControl: null,
    }
  }

/**
 * @brief Retrieves a summary of detected data, including licenses, vulnerabilities, dependencies, and cryptographic algorithms.
 * This method gathers various types of detected information from the database and compiles a summary report.
 * It includes detected license components, vulnerability counts categorized by severity, detected dependencies,
 * and cryptographic algorithms both from SBOM (Software Bill of Materials) and local sources.
 *
 * @returns {Promise<IReportData>} - A promise that resolves to an object containing:
 *   - `licenses` (DetectedLicenseComponentSummary): Summary of detected license components.
 *   - `cryptographies` (Object): An object with two properties:
 *     - `sbom` (number): The number of unique cryptographic algorithms found in SBOM.
 *     - `local` (number): The number of cryptographic algorithms found locally.
 *   - `vulnerabilities` (Object): An object with counts of detected vulnerabilities categorized by severity:
 *     - `critical` (number): Number of critical vulnerabilities.
 *     - `high` (number): Number of high vulnerabilities.
 *     - `medium` (number): Number of medium vulnerabilities.
 *     - `low` (number): Number of low vulnerabilities.
 *   - `dependencies` (DetectedDependenciesSummary): Summary of detected dependencies.
 *
 * @throws {Error} - Throws an error if any of the data fetching or processing operations fail.
 */
  public async getDetected(): Promise<IReportData> {

    // License components summary
    const detectedlicensesSummary = await modelProvider.model.report.detectedLicenseComponentSummary();

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

    // Export control
    const exportControl = await modelProvider.model.exportControlModel.findAll();
    const exportControlReport = this.getExportControlReport(exportControl);

    return {
      licenses: detectedlicensesSummary,
      cryptographies,
      vulnerabilities: vulnerabilityReport,
      dependencies: dependenciesSummary,
      exportControl: exportControlReport,
    };
  }

  /**
 *@brief Retrieves a list of detected components and declared components with their associated file counts.
 * This method fetches the count of files detected for each component and declared dependency.
 * It then combines this data with details of detected and declared components, and optionally
 * filters the results by a specified license.
 *
 * @param {string} [license] - The license to filter components by. If provided, only components
 *                             matching this license will be included in the results.
 * @returns {Promise<ComponentReportResponse>}
 * @throws {Error} - Throws an error if any of the data fetching or processing operations fail.
 */
  public async getDetectedComponents(license?: string): Promise<ComponentReportResponse> {
    const componentReportVisitor = new ComponentReportVisitor();
    const reportComponentDetected  = new ReportComponentDetected(license);
    return reportComponentDetected.generate(componentReportVisitor);
  }

/**
 *@brief Retrieves identified components with their associated file counts, optionally filtering by license.
 * This method fetches identified components from the database and adds file count data
 * for each component based on its source ('detected' or 'declared'). It then filters the results
 * by a specified license if provided.
 *
 * @param {string} [license] - The license to filter components by. If provided, only components
 *                             matching this license will be included in the results.
 * @returns {Promise<ComponentReportResponse>}
 * @throws {Error} - Throws an error if any of the data fetching or processing operations fail.
 */
  public async getIdentifiedComponents(license?: string): Promise<ComponentReportResponse> {
      const componentReportVisitor = new ComponentReportVisitor();
      const identifiedComponents = new ReportComponentIdentified(license);
      return await identifiedComponents.generate(componentReportVisitor);

   }
}

export const reportService = new ReportService();
