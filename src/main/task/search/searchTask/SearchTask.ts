import fs from 'fs';
import path from 'path';
import { searcher } from '../../../modules/searchEngine/searcher/Searcher';
import { workspace } from '../../../workspace/Workspace';
import { ITask } from '../../Task';
import { modelProvider } from '../../../services/ModelProvider';
import { projectService } from '../../../services/ProjectService';
import { ISearchTask } from './ISearchTask';
import { QueryBuilderCreator } from '../../../model/queryBuilder/QueryBuilderCreator';
import { AppConfigDefault } from '../../../../config/AppConfigDefault';
import { ISearchResult } from './ISearchResult';
import { readTextFile } from '../../../utils/utils';
import {
  containsAllTerms,
  getQueryTerms,
  isExactTrigramQuery,
  NGRAM_SIZE,
  SEARCH_INDEX_FOLDER,
  SEARCH_INDEX_VERSION,
} from '../../../../shared/utils/search-utils';

const VERIFY_CHUNK_SIZE = 1000;

// Files verified between yields to the event loop, so large searches don't freeze IPC.
const VERIFY_YIELD_EVERY = 50;

export class SearchTask implements ITask<ISearchTask, Array<ISearchResult>> {
  private search = searcher;

  private isFinished: boolean;

  constructor() {
    this.search.loadIndex(path.join(workspace.getOpenProject().getMyPath(), SEARCH_INDEX_FOLDER));
    this.isFinished = false;
  }

  public async run(params: ISearchTask): Promise<Array<ISearchResult>> {
    if (!params.params?.limit) {
      const limit = AppConfigDefault.SEARCH_ENGINE_DEFAULT_LIMIT;
      params.params = { ...params.params, limit };
    }
    const results = this.search.getVersion() >= SEARCH_INDEX_VERSION
      ? await this.searchVerified(params)
      : await this.searchLegacy(params);
    const files = results.reduce((acc, curr) => {
      if (!acc[curr.path]) acc[curr.path] = curr;
      return acc;
    }, {} as Record<string, ISearchResult>);
    if (!this.isFinished) {
      return Object.values(files);
    }
    throw new Error('SearchTask is finished');
  }

  private async searchLegacy(params: ISearchTask): Promise<Array<ISearchResult>> {
    const fileIds = this.search.search(params);
    return modelProvider.model.file.getAllBySearch(QueryBuilderCreator.create({ fileId: fileIds }));
  }

  private async searchVerified(params: ISearchTask): Promise<Array<ISearchResult>> {
    const terms = getQueryTerms(params.query ?? '');
    const indexTerms = terms.filter((t) => t.length >= NGRAM_SIZE);
    if (indexTerms.length === 0) return [];

    const offset = params.params.offset ?? 0;
    const end = offset + params.params.limit;
    const key = terms.join(' ');

    let state = offset === 0 ? null : this.search.getVerifiedSearch(key);
    if (!state) {
      const candidates = this.search.search({ query: indexTerms.join(' '), params: { limit: Number.MAX_SAFE_INTEGER } });
      state = { terms: key, candidates, cursor: 0, verified: [] };
      this.search.setVerifiedSearch(state);
    }

    const basePath = workspace.getOpenProject().getSourceCodePath() ? projectService.getSourceCodeBasePath() : null;
    const canVerify = !isExactTrigramQuery(terms) && basePath !== null && fs.existsSync(basePath);
    if (!canVerify) {
      return this.getFilesById(state.candidates.slice(offset, end));
    }

    while (state.verified.length < end && state.cursor < state.candidates.length) {
      const chunk = state.candidates.slice(state.cursor, state.cursor + VERIFY_CHUNK_SIZE);
      state.cursor += chunk.length;
      // eslint-disable-next-line no-await-in-loop
      const rows = await this.getFilesById(chunk);
      for (let i = 0; i < rows.length && !this.isFinished; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        if (i % VERIFY_YIELD_EVERY === 0) await new Promise((resolve) => { setImmediate(resolve); });
        try {
          const content = readTextFile(path.join(basePath, rows[i].path));
          if (content !== null && containsAllTerms(content, terms)) state.verified.push(rows[i]);
        } catch (e) {
          // File removed from disk since it was indexed.
        }
      }
      if (this.isFinished) break;
    }
    return state.verified.slice(offset, end);
  }

  private async getFilesById(fileIds: number[]): Promise<Array<ISearchResult>> {
    if (fileIds.length === 0) return [];
    const rows: Array<ISearchResult> = await modelProvider.model.file.getAllBySearch(
      QueryBuilderCreator.create({ fileId: fileIds }),
    );
    // A file joins one row per result; keep the first so pagination counts files.
    const byId = new Map<number, ISearchResult>();
    rows.forEach((row) => { if (!byId.has(row.id)) byId.set(row.id, row); });
    return fileIds.filter((id) => byId.has(id)).map((id) => byId.get(id));
  }

  public finish(): void {
    this.isFinished = true;
  }
}
