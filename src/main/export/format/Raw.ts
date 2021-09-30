/* eslint-disable no-restricted-syntax */
import { Format } from '../Format';

export class Raw extends Format {

  constructor(){
    super();
    this.extension = '.json';
  }

 // @override   
  public async generate() {
    const data = this.export.getRawData();
    const out = {};
    for (const [key, obj] of Object.entries(data)) {
      let vKey = key;
      if (key.charAt(0) === '/') vKey = key.substring(1);
      out[vKey] = obj;
    }
    return JSON.stringify(out, undefined, 2);
  }
}
