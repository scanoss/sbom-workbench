


import { Format } from '../Format';
// eslint-disable-next-line import/no-cycle
import { ExportModel } from '../Model/ExportModel';

export abstract class Spdx extends Format {
  private export: ExportModel;

  constructor() {
    super();
    this.export = new ExportModel();
  }

  public async getData() {
    const data = await this.export.getSpdxData();
    return data;
  }
}
