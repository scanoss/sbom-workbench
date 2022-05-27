import { searcher } from '../../../modules/searchEngine/searcher/Searcher';
import { workspace } from '../../../workspace/Workspace';
import { ITask } from '../../Task';
import { modelProvider } from '../../../services/ModelProvider';
import { ISearchTask } from './ISearchTask';
import { QueryBuilderCreator } from '../../../model/queryBuilder/QueryBuilderCreator';
import { AppConfigDefault } from '../../../../config/AppConfigDefault';
import { ISearchResult } from './ISearchResult';

export class SearchTask implements ITask<ISearchTask, Array<ISearchResult>> {
  private search = searcher;

  private readonly DICTIONARY_FOLDER = '/dictionary/';

  private isFinished: boolean;

  constructor() {
    this.search.loadIndex(`${workspace.getOpenProject().getMyPath()}${this.DICTIONARY_FOLDER}`);
    this.isFinished = false;
  }

  public async run(params: ISearchTask): Promise<Array<ISearchResult>> {
    if (!params.params?.limit || !params.params) {
      const limit = AppConfigDefault.SEARCH_ENGINE_DEFAULT_LIMIT;
      params.params = { limit };
    }
    const fileIds = this.search.search(params);
    const results: any = (await modelProvider.model.file.getAll(
      QueryBuilderCreator.create({ fileId: fileIds })
    )) as unknown as ISearchResult;
    const files = results.reduce((acc, curr) => {
      if (!acc[curr.path]) acc[curr.path] = curr;
      return acc;
    }, {});
    if (!this.isFinished) {
      return Object.values(files) as Array<ISearchResult>;
    }
    throw new Error('SearchTask is finished');
  }

  public finish(): void {
    this.isFinished = true;
  }
}
