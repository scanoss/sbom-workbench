import { Format } from '../../Format';
import { ExportSource, ExportStatusCode } from '../../../../../api/types';
import { modelProvider } from '../../../../services/ModelProvider';
import { DataRecord } from '../../../../model/interfaces/report/DataRecord';
import { isValidPurl } from '../../helpers/exportHelper';
import { ReportData } from '../../ReportData';

export class SBOMCsv extends Format {
  private source: string;

  constructor(source: string) {
    super();
    this.source = source;
    this.extension = '.csv';
  }

  private csvCreate(data: Array<DataRecord>) {
    let csv = 'path, usage, detected_component, concluded_component, detected_purl, concluded_purl,detected_version, concluded_version, latest_version, detected_license, concluded_license\n';
    for (let i = 0; i < data.length; i += 1) {
      const row = `${data[i].path},${data[i].usage},${data[i].detected_component},${data[i].concluded_component},${data[i].detected_purl},${data[i].concluded_purl},${data[i].detected_version},${data[i].concluded_version},${data[i].latest_version},${data[i].detected_license},${data[i].concluded_license}\r\n`;
      csv += row;
    }
    return csv;
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

      if (validDetectedPurl && validConcludedPurl) {
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
      ? await modelProvider.model.report.fetchAllIdentifiedRecordsFiles()
      : await modelProvider.model.report.fetchAllDetectedRecordsFiles();

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
