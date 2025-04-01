/* eslint-disable no-async-promise-executor */

import { Format } from '../Format';
import { ExportStatusCode } from '../../../../api/types';

export class Wfp extends Format {
  constructor() {
    super();
    this.extension = '.wfp';
  }

  public async generate() {
    const data = await this.export.getWfpData();
    return {
      report: data,
      status: {
        code: ExportStatusCode.SUCCESS,
        info: {
          invalidPurls: [],
        },
      },
    };
  }
}
