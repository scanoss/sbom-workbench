/* eslint-disable no-async-promise-executor */

import { Format } from '../Format';

export class Wfp extends Format {

  constructor(){
    super();
    this.extension = '.wfp';
  }

  public async generate() {
    const data = await this.export.getWfpData();
    return data;
  }
}
