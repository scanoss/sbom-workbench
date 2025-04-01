/* eslint-disable no-restricted-syntax */
import { Format } from '../Format';
import { ExportStatusCode } from '../../../../api/types';

export class Raw extends Format {
  constructor() {
    super();
    this.extension = '.json';
  }

  // @override
  public async generate() {
    const data = await this.export.getRawData();
    const out = {};
    for (const [key, obj] of Object.entries(data)) {
      let vKey = key;
      if (key.charAt(0) === '/') vKey = key.substring(1);
      out[vKey] = obj;
    }
    return {
      report: JSON.stringify(out, undefined, 2),
      status: {
        code: ExportStatusCode.SUCCESS,
        info: {
          invalidPurls: [],
        },
      },
    };
  }
}
