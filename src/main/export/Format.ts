import fs from 'fs';
import { ExportModel } from './Model/ExportModel';

const pathLib = require('path');

export enum FormatVersion {
  SPDX20 = 'SPDX20',
  SPDXLITE = 'SPDXLITE',
  CSV = 'CSV',
  RAW = 'RAW',
  WFP = 'WFP',
}

export abstract class Format {
  protected export: ExportModel;

  constructor() {
    this.export = new ExportModel();
  }

  public abstract generate();

  public async save(path: string, complete?: boolean) {
    const file = await this.generate();
    const auxPath = complete ? `${pathLib.dirname(path)}/uncompleted_${pathLib.basename(path)}` : path;
    return new Promise<boolean>((resolve, reject) => {
      try {
        fs.writeFile(auxPath, file, () => {
          resolve(true);
        });
      } catch (error) {
        reject(new Error('Unable to generate spdx file'));
      }
    });
  }
}
