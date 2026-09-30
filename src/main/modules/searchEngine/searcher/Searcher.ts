import fs from 'fs';
import path from 'path';
import { ISearcher } from './ISearcher';
import { ISearchResult } from '../../../task/search/searchTask/ISearchResult';
import {
  getLegacySearchConfig,
  getSearchConfig,
  LEGACY_INDEX_VERSION,
  SEARCH_INDEX_VERSION_FILE,
} from '../../../../shared/utils/search-utils';

const { Index }  = require('flexsearch');

const INDEX_IDLE_CLOSE_MS = 60000;

/**
 * Verification progress of one query, kept so later pages continue where the previous one stopped.
 */
export interface VerifiedSearch {
  terms: string;
  candidates: number[];
  cursor: number;
  verified: ISearchResult[];
}

/**
 * Returns the version of the dictionary stored at the given path. Missing dictionaries or version files read as legacy.
 */
export const readIndexVersion = (pathToDictionary: string): number => {
  try {
    const raw = fs.readFileSync(path.join(pathToDictionary, SEARCH_INDEX_VERSION_FILE), 'utf8');
    return JSON.parse(raw).version ?? LEGACY_INDEX_VERSION;
  } catch (e) {
    return LEGACY_INDEX_VERSION;
  }
};

class Searcher {
  private index: any;

  private version: number;

  private closeTimer: NodeJS.Timeout | null;

  private verifiedSearch: VerifiedSearch | null;

  constructor() {
    this.index = null;
    this.version = LEGACY_INDEX_VERSION;
    this.closeTimer = null;
    this.verifiedSearch = null;
  }

  public search(params: ISearcher): number[] {
    if (this.index) {
      // flexsearch returns undefined when the offset is past the last hit.
      return this.index.search(params.query, params.params ? params.params : null) ?? [];
    }
    return [];
  }

  public getVersion(): number {
    return this.version;
  }

  /**
   * Returns the cached verification of a query. It lives as long as the loaded index.
   */
  public getVerifiedSearch(terms: string): VerifiedSearch | null {
    return this.verifiedSearch?.terms === terms ? this.verifiedSearch : null;
  }

  public setVerifiedSearch(verifiedSearch: VerifiedSearch) {
    this.verifiedSearch = verifiedSearch;
  }

  public loadIndex(pathToDictionary: string) {
    if (!this.index) {
      if (fs.existsSync(pathToDictionary)) {
        this.version = readIndexVersion(pathToDictionary);
        // @ts-ignore
        const index = new Index(this.version === LEGACY_INDEX_VERSION ? getLegacySearchConfig() : getSearchConfig());
        fs.readdirSync(pathToDictionary)
          .filter((file) => file !== SEARCH_INDEX_VERSION_FILE)
          .forEach((file) => {
            const filepath = path.join(pathToDictionary, file);
            const filename = path.parse(file).name;
            const data: any = fs.readFileSync(filepath, 'utf8');
            index.import(filename, data ?? null);
          });
        this.index = index;
        this.closeTimer = setTimeout(() => this.closeIndex(), INDEX_IDLE_CLOSE_MS);
      }
    }
  }

  public closeIndex() {
    if (this.closeTimer) clearTimeout(this.closeTimer);
    this.closeTimer = null;
    this.index = null;
    this.version = LEGACY_INDEX_VERSION;
    this.verifiedSearch = null;
  }
}

export const searcher = new Searcher();
