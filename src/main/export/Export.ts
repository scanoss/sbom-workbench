/* eslint-disable no-async-promise-executor */

import { Format } from './Format';

import { Spdxv20 } from './format/Spdxv20';

import { SpdxLite } from './format/SpdxLite';

import { Csv } from './format/Csv';
import { Raw } from './format/Raw';
import { Wfp } from './format/Wfp';
import { FormatVersion } from '../../api/types';
import { SpdxLiteJson } from './format/SpdxLiteJson';

export class Export {
  private static format: Format;

  public static async save(path: string) {
    try {
      return await Export.format.save(path);
    } catch (error) {
      return error;
    }
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
        Export.format = new Spdxv20();
        break;
      case FormatVersion.SPDXLITE:
        Export.format = new SpdxLite();
        break;
      case FormatVersion.CSV:
        Export.format = new Csv();
        break;
      case FormatVersion.RAW:
        Export.format = new Raw();
        break;
      case FormatVersion.WFP:
        Export.format = new Wfp();
        break;
      case FormatVersion.SPDXLITEJSON:
        Export.format = new SpdxLiteJson();
        break;
      default:
    
    }
  }
}
