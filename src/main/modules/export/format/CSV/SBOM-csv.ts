import { Format } from '../../Format';
import { ExportSource, ExportStatusCode } from '../../../../../api/types';
import { modelProvider } from '../../../../services/ModelProvider';
import { DataRecord } from '../../../../model/interfaces/report/DataRecord';
import { isValidPurl } from '../../helpers/exportHelper';
import { ReportData } from '../../ReportData';
import { ExportRepository } from '../../Repository/ExportRepository';
import { ExportRepositorySqliteImp } from '../../Repository/ExportRepositorySqliteImp';

export class SBOMCsv extends Format {
  private source: string;

  constructor(source: string, exportRepository: ExportRepository = new ExportRepositorySqliteImp()) {
    super(exportRepository);
    this.source = source;
    this.extension = '.csv';
  }


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

  // @override
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
