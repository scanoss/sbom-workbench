import fs from 'fs';

import { AbstractScannable } from './AbstractScannable.js';
import { ScannableItem } from './ScannableItem.js';

export class ScannableTree extends AbstractScannable {
  // Private properties
  #fileTree;

  #fileList;

  #generator;

  #genHasNext;

  constructor(filetree) {
    super();
    this.#fileTree = filetree;
  }

  #flattenRecursively(fileTree) {
    // The fileTree is flatten and loaded into a list
    if (fileTree.type === 'file' && fileTree.action === 'scan') {
      // let fileName = path.basename(fileTree.path);
      this.#fileList.push(fileTree.path);
    }
    if (!fileTree.hasOwnProperty('children')) return;

    fileTree.children.forEach((e) => {
      this.#flattenRecursively(e);
    });
  }

  async *#createGenerator() {
    for (const filePath of this.#fileList) {
      const fileContent = await fs.promises.readFile(filePath);
      yield new ScannableItem(filePath, fileContent);
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

  async prepare() {
    this.#fileList = [];
    this.#flattenRecursively(this.#fileTree);
    this.#generator = this.#createGenerator();
    this.#genHasNext = true;
    return this.#fileList.length;
  }
}
