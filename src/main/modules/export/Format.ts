import log from 'electron-log';
import fs from 'fs';

import { ExportRepositorySqliteImp } from './Repository/ExportRepositorySqliteImp';
import { IExportResult } from './IExportResult';
import { ExportRepository } from './Repository/ExportRepository';

export interface ExportResult {
  report: string;
  invalidPurls: Array<string> | null;
}

export abstract class Format {
  protected export: ExportRepository;

  protected extension: string;

  constructor(exportModel: ExportRepository = new ExportRepositorySqliteImp()) {
    this.export = exportModel;
  }

  public abstract generate(): Promise<ExportResult>;

  public async save(path: string): Promise<IExportResult> {
    const { report, invalidPurls } = await this.generate();
    log.info('[ Report ]: Invalid report PURLS: ', invalidPurls);
    try {
      await fs.promises.writeFile(path, report);
      return {
        success: true,
        message: 'Export successful',
        extension: this.extension,
        file: path,
        invalidPurls,
      };
    } catch (error) {
      log.error(error);
      return {
        success: false,
        message: 'Export not successful',
        extension: this.extension,
        file: path,
        invalidPurls,
      };
    }
  }
}
