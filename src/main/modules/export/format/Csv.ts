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
    let csv = `inventory_ID,usage,notes,identified_license,detected_license,identified_component,detected_component,path,purl,version\r\n`;
    for (const inventory of data) {
      csv += `${inventory.inventoryId || 'n/a'},${inventory.usage || 'n/a'},${inventory.notes || 'n/a'},${
        inventory.identified_license.length > 0 ? inventory.identified_license.join(' AND ') : 'n/a'
      },${inventory.detected_license.length > 0 ? inventory.detected_license.join(' AND ') : 'n/a'},${
        inventory.identified_component
      },${inventory.detected_component ? inventory.detected_component : 'n/a'},"${inventory.path}","${
        inventory.purl
      }",${inventory.version ? inventory.version : 'n/a'}\r\n`;
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
