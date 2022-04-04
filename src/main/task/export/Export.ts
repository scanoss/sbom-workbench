/* eslint-disable no-async-promise-executor */

import { Format } from './Format';
import { Spdxv20 } from './format/Spdxv20';
import { SpdxLite } from './format/SpdxLite';
import { Csv } from './format/Csv';
import { Raw } from './format/Raw';
import { Wfp } from './format/Wfp';
import { HtmlSummary } from './format/HtmlSummary';
import { ExportFormat } from '../../../api/types';
import { SpdxLiteJson } from './format/SpdxLiteJson';
import { ITask } from '../Task';

export class Export implements ITask<any> {
  private format: Format;

  public async run(path: string) {
    try {
      return await this.format.save(path);
    } catch (error) {
      return error;
    }
  }

  public async generate() {
    try {
      const data = await this.format.generate();
      return data;
    } catch (e) {
      return e;
    }
  }

  public setFormat(format: string) {
    switch (format as ExportFormat) {
      case ExportFormat.SPDX20:
        this.format = new Spdxv20();
        break;
      case ExportFormat.SPDXLITE:
        this.format = new SpdxLite();
        break;
      case ExportFormat.CSV:
        this.format = new Csv();
        break;
      case ExportFormat.RAW:
        this.format = new Raw();
        break;
      case ExportFormat.WFP:
        this.format = new Wfp();
        break;
      case ExportFormat.SPDXLITEJSON:
        this.format = new SpdxLiteJson();
        break;
      case ExportFormat.HTMLSUMMARY:
        this.format = new HtmlSummary();
        break;
      default:
    }
  }
}
