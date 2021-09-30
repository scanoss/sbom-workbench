/* eslint-disable no-restricted-syntax */
import { Format } from '../Format';

export class Csv extends Format {

  constructor(){
    super();
    this.extension = '.csv';
  }

  private csvCreate(data: any) {
    let csv = `inventory_ID,usage,notes,identified_license,detected_license,identified_component,detected_component,path,purl,version\r\n`;
    for (const inventory of data) {
      csv += `${inventory.inventoryId},${inventory.usage},${inventory.notes},${inventory.identified_license},${
        inventory.detected_license ? inventory.detected_license : 'n/a'
      },${inventory.identified_component},${inventory.detected_component ? inventory.detected_component : 'n/a'},"${
        inventory.path
      }","${inventory.purl}",${inventory.version}\r\n`;
    }
    return csv;
  }

  // @override
  public async generate() {
    const data = await this.export.getCsvData();
    const csv = this.csvCreate(data);
    return csv;
  }
}
