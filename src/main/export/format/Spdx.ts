


import { Format } from '../Format';

import { ExportModel } from '../Model/ExportModel';

export abstract class Spdx extends Format {
  
  public async getData() {
    const data = await this.export.getSpdxData();
    return data;
  }
}
