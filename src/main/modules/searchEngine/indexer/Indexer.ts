import fs from 'fs';
import log from 'electron-log';
import { IIndexer } from './IIndexer';
import { IndexerAdapter } from './IndexerAdapter';

const path = require('path');
const { Index } = require('flexsearch');

export class Indexer {
  public index(files: Array<IIndexer>) {
    console.log('Indexing started');
    const index = new Index('memory');
    for (let i = 0; i < files.length; i += 1) {
      try {
        const fileContent = fs.readFileSync(files[i].path, 'utf-8');
        index.add(files[i].fileId, fileContent);
      } catch (e) {
        log.error(e);
      }
    }
    return index;
  }

  public async saveIndex(index: any, pathToDictionary: string) {
    fs.mkdirSync(pathToDictionary);
    await index.export((key: any, data: string | NodeJS.ArrayBufferView) => {
      fs.writeFile(`${pathToDictionary}${key}.json`, data !== undefined ? data : '', (err) => {
        if (err) console.log(err);
      });
    });
  }
}
