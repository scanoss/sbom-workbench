import { Searcher } from '../../../modules/searchEngine/searcher/Searcher';
import { workspace } from '../../../workspace/Workspace';
import { ITask } from '../../Task';
import { modelProvider } from '../../../services/ModelProvider';
import { ISearchTask } from './ISearchTask';
import { QueryBuilderCreator } from '../../../model/queryBuilder/QueryBuilderCreator';
import { AppConfigDefault } from '../../../../config/AppConfigDefault';

export class SearchTask implements ITask<ISearchTask, ISearchTask> {
  private searcher: Searcher;

  constructor() {
    this.searcher = new Searcher();
    this.searcher.loadIndex(`${workspace.getOpenProject().getMyPath()}/dictionary/`);
  }

  public async run(params: ISearchTask): Promise<ISearchTask> {
    if (!params.params?.limit || !params.params) {
      const limit = AppConfigDefault.SEARCH_ENGINE_DEFAULT_LIMIT;
      params.params = { limit };
    }
    console.log(params.params);
    const fileIds = this.searcher.search(params);
    const results = (await modelProvider.model.file.getAll(
      QueryBuilderCreator.create({ fileId: fileIds })
    )) as unknown as ISearchTask;
    return results;
  }
}
