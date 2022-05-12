import fs from 'fs';
import path from 'path';
import { IndexerAdapter } from '../indexer/IndexerAdapter';
import { ISearcher } from "./ISearcher";

const { Index } = require('flexsearch');

export class Searcher {
  private index: any;

  public search(params: ISearcher): number[] {
    if(this.index) {
    return this.index.search(params.query,params.params? params.params : null);
    }
    return [];
  }

  public setIndex(index: any) {
    this.index = index;
  }

  public loadIndex(pathToDictionary: string) {
    let index = new Index('memory');
    const indexerAdapter = new IndexerAdapter();

    if (fs.existsSync(pathToDictionary)) {
      fs.readdirSync(pathToDictionary).forEach((filename) => {
        const file = path.join(pathToDictionary, filename);
        const indexFile = indexerAdapter.getFileIndex(filename);
        const data: any = fs.readFileSync(file, 'utf8');
        index.import(indexFile, data ?? null);
      });
    }else{
      index =null;
    }
   this.index = index;
  }
}

export const searcher = new Searcher();
