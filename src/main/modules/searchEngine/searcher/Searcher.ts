import fs from 'fs';
import path from 'path';
import { setInterval } from 'timers';
import { IndexerAdapter } from '../indexer/IndexerAdapter';
import { ISearcher } from './ISearcher';
import { getTokensFamily, getTerms } from '../../../../shared/utils/search-utils';

const { Index } = require('flexsearch');

class Searcher {
  private index: any;

  constructor() {
    this.index = null;
  }

  public search(params: ISearcher): number[] {
    if (this.index) {
      let results = this.index.search(params.query, params.params ? params.params : null);
      const querys = getTerms(params.query);
      for (let i = 0; i < querys.length; i += 1) {
        const resultTokenFamily = this.serchInTokensFamily(querys[i], params);
        if (resultTokenFamily.length > 0) results = results.concat(resultTokenFamily);
      }
      return results;
    }
    return [];
  }

  private serchInTokensFamily(token: string, params: ISearcher): number[] {
    let results = [];
    const tokensFamily = getTokensFamily(token);
    if (tokensFamily) {
      tokensFamily.forEach((tf) => {
        const filesMatched = this.index.search(tf, params.params ? params.params : null);
        if (filesMatched.length > 0) results = results.concat(filesMatched);
        results = results.concat(filesMatched);
      });
    }
    return results;
  }

  public loadIndex(pathToDictionary: string) {
    if (!this.index) {
      const index = new Index({ depth: 1, bidirectional: 0, resolution: 9, minlength: 2 });
      const indexerAdapter = new IndexerAdapter();
      if (fs.existsSync(pathToDictionary)) {
        fs.readdirSync(pathToDictionary).forEach((filename) => {
          const file = path.join(pathToDictionary, filename);
          const indexFile = indexerAdapter.getFileIndex(filename);
          const data: any = fs.readFileSync(file, 'utf8');
          index.import(indexFile, data ?? null);
        });
        this.index = index;
        setInterval(this.closeIndex, 60000); // Close index after 1 minute
      }
    }
  }

  public closeIndex() {
    this.index = null;
  }
}

export const searcher = new Searcher();
