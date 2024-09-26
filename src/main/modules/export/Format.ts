import log from 'electron-log';
import fs from 'fs';

import { ExportRepositorySqliteImp } from './Repository/ExportRepositorySqliteImp';
import { IExportResult } from './IExportResult';
import { ExportRepository } from './Repository/ExportRepository';

export abstract class Format {
  protected export: ExportRepository;

  protected extension: string;

  constructor(exportModel: ExportRepository = new ExportRepositorySqliteImp()) {
    this.export = exportModel;
  }

  public abstract generate();

  public async save(path: string): Promise<IExportResult> {
    const file = await this.generate();
    try {
      await fs.promises.writeFile(path, file);
      return {
        success: true,
        message: 'Export successful',
        extension: this.extension,
        file: path,
      };
    } catch (error) {
      log.error(error);
      return {
        success: false,
        message: 'Export not successful',
        extension: this.extension,
        file: path,
      };
    }
  }
}
