import { Format } from '../../Format';
import { ExportSource, ExportStatusCode } from '../../../../../api/types';
import { CryptographicItem } from '../../../../model/entity/Cryptography';
import { ReportData } from '../../ReportData';
import { isValidPurl } from '../../helpers/exportHelper';
import { ExportRepository } from '../../Repository/ExportRepository';
import { ExportRepositorySqliteImp } from '../../Repository/ExportRepositorySqliteImp';

/**
 * Exports Cryptography Bill of Materials (CBOM) data in CSV format.
 *
 * This class generates CSV reports containing cryptographic items found in both
 * local files and external components. The report includes the source (file path or PURL),
 * cryptographic type (e.g., algorithm), and values. Supports both identified and detected
 * cryptographic exports with PURL validation for component-level cryptography.
 */
export class CryptographyCsv extends Format {
  private source: string;

  /**
   * Creates an instance of CryptographyCsv.
   *
   * @param source - The export source type (ExportSource.IDENTIFIED or ExportSource.DETECTED)
   * @param repository - The repository instance for accessing cryptography data (defaults to ExportRepositorySqliteImp)
   */
  constructor(source: string, repository: ExportRepository = new ExportRepositorySqliteImp()) {
    super(repository);
    this.source = source;
    this.extension = '.csv';
    this.repository = repository;
  }

  /**
   * Converts cryptographic data into CSV format.
   *
   * Creates a CSV string combining both local and component-level cryptography data.
   * Each row contains the source (file path or PURL), cryptographic type, and value.
   * Multiple values for a single cryptographic item result in multiple rows.
   *
   * @param localCrypto - Array of cryptographic items found in local files
   * @param componentCrypto - Array of cryptographic items from external components
   * @returns CSV-formatted string with CRLF line endings
   */
  private csvCreate(localCrypto: Array<CryptographicItem>, componentCrypto: Array<CryptographicItem>): string {
    let csv = 'source,type,value\n';

    // Local Crypto
    localCrypto.forEach((c) => {
      c.values.forEach((value) => {
        const row = `${c.name},${c.type},${value}\r\n`;
        csv += row;
      });
    });

    componentCrypto.forEach((c) => {
      c.values.forEach((value) => {
        const row = `${c.name},${c.type},${value}\r\n`;
        csv += row;
      });
    });

    return csv;
  }

  /**
   * Validates and filters component cryptography data based on PURL validity.
   *
   * Processes component-level cryptographic items to separate those with valid PURLs
   * from those with invalid ones. Invalid PURLs are collected for warning purposes.
   *
   * @param data - Array of cryptographic items from components to validate
   * @returns ReportData object containing valid components and a list of invalid PURLs
   */
  private sanitizePackages(data: Array<CryptographicItem>): ReportData<Array<CryptographicItem>> {
    const components: Array<CryptographicItem> = [];
    const invalidPurls: Array<string> = [];

    // Remove invalid purls
    data.forEach((c) => {
      if (isValidPurl(c.name)) {
        components.push(c);
      } else {
        invalidPurls.push(c.name);
      }
    });

    return {
      components,
      invalidPurls,
    };
  }

  /**
   * Generates the cryptography CSV report.
   *
   * Retrieves CBOM data from the repository based on the configured source (identified or detected),
   * validates component PURLs, and creates a CSV report combining both local and component cryptography.
   * Returns the report along with status information indicating success or warnings if invalid PURLs were found.
   *
   * @returns Promise resolving to ExportResult containing the CSV report string and status information
   * @override
   */
  public async generate() {
    const data = this.source === ExportSource.IDENTIFIED
      ? await this.repository.getCBOMIdentifiedData()
      : await this.repository.getCBOMDetectedData();

    // Sanitize packages and remove them to the exported data
    const { components, invalidPurls } = this.sanitizePackages(data.componentCryptography);

    const csv = this.csvCreate(data.localCryptography, components);
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
