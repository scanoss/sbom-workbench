import { searcher } from '../../../modules/searchEngine/searcher/Searcher';
import { workspace } from '../../../workspace/Workspace';
import { ITask } from '../../Task';
import { modelProvider } from '../../../services/ModelProvider';
import { ISearchTask } from './ISearchTask';
import { QueryBuilderCreator } from '../../../model/queryBuilder/QueryBuilderCreator';
import { AppConfigDefault } from '../../../../config/AppConfigDefault';
import { ISearchResult } from './ISearchResult';
import path from 'path';

export class SearchTask implements ITask<ISearchTask, Array<ISearchResult>> {
  private search = searcher;

  private readonly DICTIONARY_FOLDER = 'dictionary';

  private isFinished: boolean;

  constructor() {
    this.search.loadIndex(path.join(workspace.getOpenProject().getMyPath(), this.DICTIONARY_FOLDER));
    this.isFinished = false;
  }

  public async run(params: ISearchTask): Promise<Array<ISearchResult>> {
    if (!params.params?.limit || !params.params) {
      const limit = AppConfigDefault.SEARCH_ENGINE_DEFAULT_LIMIT;
      params.params = { limit };
    }
    const fileIds = this.search.search(params);
    const results: Array<ISearchResult> = await modelProvider.model.file.getAllBySearch(
      QueryBuilderCreator.create({ fileId: fileIds })
    );
    const files = results.reduce((acc, curr) => {
      if (!acc[curr.path]) acc[curr.path] = curr;
      return acc;
    }, {} as Record<string, ISearchResult>);
    if (!this.isFinished) {
      return Object.values(files);
    }
    throw new Error('SearchTask is finished');
  }

  public finish(): void {
    this.isFinished = true;
  }
}
