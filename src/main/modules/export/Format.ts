import log from 'electron-log';
import fs from 'fs';

import { ExportModel } from './Model/ExportModel';
import { IExportResult } from "./IExportResult";

export abstract class Format {
  protected export: ExportModel;

  protected extension: string;

  constructor() {
    this.export = new ExportModel();
  }

  public abstract generate();

  public async save(path: string): Promise<IExportResult> {
    const file = await this.generate();
    try {
      await fs.promises.writeFile(`${path}${this.extension}`, file);
      return {
        success: true,
        message: 'Export successful',
        extension: this.extension,
        file: `${path}${this.extension}`,
      };
    } catch (error) {
      log.error(error);
      return {
        success: false,
        message: 'Export not successful',
        extension: this.extension,
        file: `${path}${this.extension}`,
      };
    }
  }
}
