import fs from 'fs';

import { AbstractScannable } from './AbstractScannable.js';
import { ScannableItem } from './ScannableItem.js';

export class ScannableJson extends AbstractScannable {
  // Private properties
  #jsonlist;

  #fileList;

  #generator;

  #genHasNext;

  #scanRoot;

  constructor(list) {
    super();
    this.#jsonlist = list;
  }


  async *#createGenerator() {
    for (const filePath of this.#jsonlist) {
      const fileContent = await fs.promises.readFile(filePath);
      yield new ScannableItem(filePath.replace(this.#scanRoot, ''), fileContent);
    }
  }

  async getNextScannableItem() {
    const obj = await this.#generator.next();
    this.#genHasNext = !obj.done;
    return obj.value;
  }

  hasNextScannableItem() {
    return this.#genHasNext;
  }

  setScanRoot(scanRoot) {
    this.#scanRoot = scanRoot;
  }

  async prepare() {
    this.#fileList = [];
    this.#generator = this.#createGenerator();
    this.#genHasNext = true;
    return this.#fileList.length;
  }
}
