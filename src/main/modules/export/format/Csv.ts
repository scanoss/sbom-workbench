import { Format } from '../Format';
import { ExportSource } from '../../../../api/types';
import { modelProvider } from '../../../../main/services/ModelProvider';
import { CSVDataRecord } from '../../../../main/model/interfaces/report/CSVDataRecord';

export class Csv extends Format {
  private source: string;

  constructor(source: string) {
    super();
    this.source = source;
    this.extension = '.csv';
  }

  private csvCreate(data: Array<CSVDataRecord>) {
    let csv = `path, usage, detected_component, concluded_component, detected_purl, concluded_purl,detected_version, concluded_version, latest_version, detected_license, concluded_license\n`;
    for (let i = 0; i < data.length; i += 1) {
      const row =`${data[i].path},${data[i].usage},${data[i].detected_component},${data[i].concluded_component},${data[i].detected_purl},${data[i].concluded_purl},${data[i].detected_version},${data[i].concluded_version},${data[i].latest_version},${data[i].detected_license},${data[i].concluded_license}\r\n`;
      csv += row;
    };
    return csv;
  }

  // @override
  public async generate() {
    const data =
      this.source === ExportSource.IDENTIFIED
        ? await modelProvider.model.report.fetchAllIdentifiedCSVRecords()
        : await modelProvider.model.report.fetchAllDetectedCSVRecords()
    const csv = this.csvCreate(data);
    return csv;
  }
}





