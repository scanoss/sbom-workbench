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
    let csv = `inventory_id,path,usage,detected_component,detected_license,detected_version,detected_latest,purl\r\n`;
    for (const d of data) {
      csv += `${d.inventoryId || 'n/a'},${d.path},${d.usage || 'n/a'},${
        d.detected_component ? d.detected_component : 'n/a'
      },${d.detected_license.length > 0 ? d.detected_license.join(' AND ') : 'n/a'},${d.version ? d.version : 'n/a'},${
        d.latest_version ? d.latest_version : 'n/a'
      },${d.purl}\r\n`;
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
