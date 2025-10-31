import { Format } from '../../Format';
import { ExportSource, ExportStatusCode } from '../../../../../api/types';
import { CryptographicItem } from '../../../../model/entity/Cryptography';
import { ReportData } from '../../ReportData';
import { isValidPurl } from '../../helpers/exportHelper';
import { ExportRepository } from '../../Repository/ExportRepository';

export class CryptographyCsv extends Format {
  private source: string;

  constructor(source: string, repository: ExportRepository) {
    super(repository);
    this.source = source;
    this.extension = '.csv';
    this.repository = repository;
  }

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

  // @override
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
