import log from 'electron-log';
import fs from 'fs';

import { ExportRepositorySqliteImp } from './Repository/ExportRepositorySqliteImp';
import { IExportResult } from './IExportResult';
import { ExportRepository } from './Repository/ExportRepository';
import { ExportResultsInfo, ExportStatusCode } from '../../../api/types';

export interface ExportResult {
  report: string;
  status: {
    code: ExportStatusCode;
    info: ExportResultsInfo;
  }
}

export abstract class Format {
  protected export: ExportRepository;

  protected extension: string;

  constructor(exportModel: ExportRepository = new ExportRepositorySqliteImp()) {
    this.export = exportModel;
  }

  public abstract generate(): Promise<ExportResult>;

  public async save(path: string): Promise<IExportResult> {
    const { report, status } = await this.generate();
    log.info('[ Report ]: Status: ', status);
    try {
      await fs.promises.writeFile(path, report);
      return {
        success: true,
        message: 'Export successful',
        extension: this.extension,
        file: path,
        statusCode: status.code,
        info: status.info,
      };
    } catch (error) {
      log.error(error);
      return {
        success: false,
        message: 'Export not successful',
        extension: this.extension,
        file: path,
        statusCode: ExportStatusCode.FAILED,
        info: {
          invalidPurls: [],
        },
      };
    }
  }
}
