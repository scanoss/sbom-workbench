/* eslint-disable no-async-promise-executor */

import { Format } from './Format';

import { Spdxv20 } from './format/Spdxv20';

import { SpdxLite } from './format/SpdxLite';

import { Csv } from './format/Csv';
import { Raw } from './format/Raw';
import { Wfp } from './format/Wfp';
import { FormatVersion } from '../../api/types';

enum Extensions {
  SPDX = 'spdx',
  CSV = 'csv',
  RAW = 'json',
  WFP = 'wfp',
}

export class Export {
  private static format: Format;

  public static async save(path: string) {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        await Export.format.save(path);
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
        this.format.setExtension(Extensions.SPDX);
        break;
      case FormatVersion.SPDXLITE:
        this.format = new SpdxLite();
        this.format.setExtension(Extensions.SPDX);
        break;
      case FormatVersion.CSV:
        this.format = new Csv();
        this.format.setExtension(Extensions.CSV);
        break;
      case FormatVersion.RAW:
        this.format = new Raw();
        this.format.setExtension(Extensions.RAW);
        break;
      case FormatVersion.WFP:
        this.format = new Wfp();
        this.format.setExtension(Extensions.WFP);
        break;

      default:
      // code block
    }
  }
}
