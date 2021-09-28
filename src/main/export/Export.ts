/* eslint-disable no-async-promise-executor */

import { Format, FormatVersion } from './Format';
import { Spdxv20 } from './format/Spdxv20';
import { SpdxLite } from './format/SpdxLite';

export class Export {
  private static format: Format;

  private file: string;

  public async generate() {
    const file = await Export.format.generate();
    this.file = file;
    return file;
  }

  public async save(path: string) {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        await Export.format.save(path);
        resolve(true);
      } catch (error) {
        reject(new Error('Unable to generate spdx file'));
      }
    });
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
        break;

      default:
      // code block
    }
  }
}
