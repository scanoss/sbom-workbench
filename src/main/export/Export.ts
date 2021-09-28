/* eslint-disable no-async-promise-executor */

import { Format, FormatVersion } from './Format';

import { Spdxv20 } from './format/Spdxv20';

import { SpdxLite } from './format/SpdxLite';

import { Csv } from './format/Csv';
import { Raw } from './format/Raw';
import { Wfp } from './format/Wfp';

export class Export {
  private static format: Format;

  public static async save(path: string, complete?: boolean) {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        await Export.format.save(path, complete);
        resolve(true);
      } catch (error) {
        reject(new Error('Unable to generate spdx file'));
      }
    });
  }

  public static async generate() {
    try {
      const data = await Export.format.generate();
      return data;
    } catch (e) {
      return e;
    }
  }

  public static setFormat(format: string) {
    switch (format as FormatVersion) {
      case FormatVersion.SPDX20:
        this.format = new Spdxv20();
        break;
      case FormatVersion.SPDXLITE:
        this.format = new SpdxLite();
        break;
      case FormatVersion.CSV:
        this.format = new Csv();
        break;
      case FormatVersion.RAW:
        this.format = new Raw();
        break;
      case FormatVersion.WFP:
        this.format = new Wfp();
        break;

      default:
      // code block
    }
  }
}
