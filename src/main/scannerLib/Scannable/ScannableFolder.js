import path from 'path';
import { readFile } from 'fs/promises';
import fs from 'fs';

import { AbstractScannable } from './AbstractScannable.js';
import { ScannableItem } from './ScannableItem.js';

export class ScannableFolder extends AbstractScannable {
  // Private properties
  #folderPath;

  #generator;

  #genHasNext;

  constructor(folderPath) {
    super();
    this.#folderPath = folderPath;
  }

  async *#walk(dir) {
    for await (const d of await fs.promises.opendir(dir)) {
      const entry = path.join(dir, d.name);
      // const stats = fs.lstatSync(filepath);
      if (d.isDirectory() && !d.isSymbolicLink()) yield* this.#walk(entry);
      else if (d.isFile() && !d.isSymbolicLink()) {
        const fileContent = await readFile(entry);
        yield new ScannableItem(entry, fileContent);
      }
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

  prepare() {
    this.#generator = this.#walk(this.#folderPath);
  }
}
