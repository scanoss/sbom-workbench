import { Format } from '../../Format';
import { ExportSource, ExportStatusCode } from '../../../../../api/types';
import { modelProvider } from '../../../../services/ModelProvider';
import { DataRecord } from '../../../../model/interfaces/report/DataRecord';
import { isValidPurl } from '../../helpers/exportHelper';
import { ReportData } from '../../ReportData';
import { ExportRepository } from '../../Repository/ExportRepository';
import { ExportRepositorySqliteImp } from '../../Repository/ExportRepositorySqliteImp';

/**
 * Exports Software Bill of Materials (SBOM) data in CSV format.
 *
 * This class generates CSV reports containing component information including paths,
 * usage, detected and concluded components, PURLs, versions, URLs, licenses, and comments.
 * Supports both identified and detected component exports with PURL validation.
 */
export class SBOMCsv extends Format {
  private source: string;

  /**
   * Creates an instance of SBOMCsv.
   *
   * @param source - The export source type (ExportSource.IDENTIFIED or ExportSource.DETECTED)
   * @param exportRepository - The repository instance for accessing component data (defaults to ExportRepositorySqliteImp)
   */
  constructor(source: string, exportRepository: ExportRepository = new ExportRepositorySqliteImp()) {
    super(exportRepository);
    this.source = source;
    this.extension = '.csv';
  }

  /**
   * Converts component data records into CSV format.
   *
   * Creates a CSV string with headers and data rows containing component information
   * including paths, usage, detected/concluded components, PURLs, versions, URLs, licenses, and comments.
   *
   * @param data - Array of data records to convert to CSV format
   * @returns CSV-formatted string with CRLF line endings
   */
  private csvCreate(data: Array<DataRecord>) {
    const headers = ['path','usage','detected_component','concluded_component','detected_purl','concluded_purl','detected_version','concluded_version','detected_url','concluded_url','latest_version','detected_license','concluded_license','comment'];
    const lines = [headers.join(',')];
    for (const record of data) {
      lines.push([
        record.path,
        record.usage,
        record.detected_component,
        record.concluded_component,
        record.detected_purl,
        record.concluded_purl,
        record.detected_version,
        record.concluded_version,
        record.detected_url,
        record.concluded_url,
        record.latest_version,
        record.detected_license,
        record.concluded_license,
        record.comment
      ].join(','));
    }

    return lines.join('\r\n');
  }

  /**
   * Validates and filters component data records based on PURL validity.
   *
   * Processes the input data to identify and separate valid components from those with invalid PURLs.
   * For detected reports, only the detected PURL needs to be valid. For identified reports,
   * both detected and concluded PURLs must be valid.
   *
   * @param data - Array of raw data records to validate and filter
   * @returns ReportData object containing valid components and a list of invalid PURLs
   */
  private getReportData(data: Array<DataRecord>): ReportData<Array<DataRecord>> {
    const reportData: Array<DataRecord> = [];
    const invalidPurls: Set<string> = new Set();
    data.forEach((comp) => {
      const validDetectedPurl = isValidPurl(comp.detected_purl);
      const validConcludedPurl = isValidPurl(comp.concluded_purl);

      if (!validDetectedPurl && comp.detected_purl !== '') {
        invalidPurls.add(comp.detected_purl);
      }

      if (!validConcludedPurl && comp.concluded_purl !== '') {
        invalidPurls.add(comp.concluded_purl);
      }

      // Not evaluate validConcludedPurl condition on detected report
      if (validDetectedPurl && (validConcludedPurl || this.source === ExportSource.DETECTED)) {
        reportData.push(comp);
      }
    });
    return {
      components: reportData,
      invalidPurls: Array.from(invalidPurls),
    };
  }

  /**
   * Generates the SBOM CSV report.
   *
   * Retrieves component data from the repository based on the configured source (identified or detected),
   * validates PURLs, and creates a CSV report. Returns the report along with status information
   * indicating success or warnings if invalid PURLs were found.
   *
   * @returns Promise resolving to ExportResult containing the CSV report string and status information
   * @override
   */
  public async generate() {
    const data = this.source === ExportSource.IDENTIFIED
      ? await this.repository.getAllIdentifiedRecordFiles()
      : await this.repository.getAllDetectedRecordFiles();

    const { components, invalidPurls } = this.getReportData(data);
    const csv = this.csvCreate(components);
    return {
      report: csv,
      status: {
        code: invalidPurls.length > 0 ? ExportStatusCode.SUCCESS_WITH_WARNINGS : ExportStatusCode.SUCCESS,
        info: {
          invalidPurls,
        },
      },
    };
  }
}
