/* eslint-disable no-async-promise-executor */

import { Format } from '../../modules/export/Format';
import { Spdxv20 } from '../../modules/export/format/Spdxv20';
import { SpdxLite } from '../../modules/export/format/SpdxLite';
import { Csv } from '../../modules/export/format/Csv';
import { Raw } from '../../modules/export/format/Raw';
import { Wfp } from '../../modules/export/format/Wfp';
import { HtmlSummary } from '../../modules/export/format/HtmlSummary';
import { SpdxLiteJson } from '../../modules/export/format/SpdxLiteJson';
import { ITask } from '../Task';
import { IExportResult } from "../../modules/export/IExportResult";
import { ExportFormat } from "../../../api/types";


export class Export implements ITask<string, IExportResult> {
  private format: Format;

  public async run(path: string): Promise<IExportResult> {
    try {
      const result = await this.format.save(path);
      return result;
    } catch (error: any) {
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
