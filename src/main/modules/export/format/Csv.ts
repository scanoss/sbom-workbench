/* eslint-disable no-restricted-syntax */
import { CsvAdapter } from '../../../task/export/format/formatAdapter/CsvAdapter';
import { Format } from '../Format';
import { ExportSource } from '../../../../api/types';

export class Csv extends Format {
  private source: string;

  constructor(source: string) {
    super();
    this.source = source;
    this.extension = '.csv';
  }

  private csvCreate(data: any) {
    let csv = `inventory_id,path,detected_usage,detected_component,detected_license,detected_version,detected_latest,detected_purl\n`;
    for (let i = 0; i < data.length; i += 1) {
      const inventoryId = i + 1;
      const row = `${inventoryId},${data[i].path},${data[i].usage || 'n/a'},${
        data[i].detected_component ? data[i].detected_component : 'n/a'
      },${data[i].detected_license.length > 0 ? data[i].detected_license.join(';') : 'n/a'},${
        data[i].version ? data[i].version : 'n/a'
      },${data[i].latest_version ? data[i].latest_version : 'n/a'},${data[i].purl}\r\n`;
      csv += row;
    }
    return csv;
  }

  // @override
  public async generate() {
    const data =
      this.source === ExportSource.IDENTIFIED
        ? await this.export.getIdentifiedData()
        : await this.export.getDetectedData();
    const csvData = new CsvAdapter().adapt(data);
    const csv = this.csvCreate(csvData);
    return csv;
  }
}
